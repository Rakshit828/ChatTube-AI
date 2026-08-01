import json
from typing import cast

import inngest
from weaviate.classes.query import Filter

from src.config import CONFIG
from src.db.postgres.schemas import Messages
from src.domains.chats.repository import MessagesRepository
from src.lib.chatbot.prompts import ROUTING_LLM_TEMPLATE
from src.lib.chatbot.state import RoutingState
from src.lib.llm.provider import GroqProvider
from src.lib.llm.service import LLMService
from src.lib.weviate_db.client import WeaviateClient
from src.lib.weviate_db.service import WeaviateService
from src.lib.weviate_db.types import WeaviateQueryOptions, YoutubeInfoCollectionObject
from src.utils import wrap_in_session
from src.lib.session_memory.service import ChatMemoryService

from .types import (
    CreateNewMessageRecordInput,
    CreateNewMessageRecordOutput,
    GetVideoContextFromVdbInput,
    GetVideoContextFromVdbOutput,
    RoutingLLMInput,
    RoutingLLMOutput,
    RoutingStateData,
    StoreConversationSummaryInput,
    StoreConversationSummaryOutput,
    SummarizeConversationInput,
    SummarizeConversationOutput,
)
from src.domains.chats.repository import ConversationMemoryRepository


async def routing_llm(inputs: RoutingLLMInput) -> RoutingLLMOutput:
    prompt = ROUTING_LLM_TEMPLATE.render(
        user_query=inputs["user_query"],
        video_length=inputs["video_length"],
    )

    provider = GroqProvider(
        api_key=CONFIG.GROQ_API_KEY, model="llama-3.3-70b-versatile"
    )
    llm_service = LLMService(provider=provider)

    try:
        response = await llm_service.chat(
            messages=[{"role": "user", "content": prompt}],
            temperature=0,
        )
    finally:
        await llm_service.close()

    content = (response.content or "").strip()
    if content.startswith("```"):
        content = content.strip("`").strip()
        if content.lower().startswith("json"):
            content = content[4:].strip()

    try:
        payload = json.loads(content)
    except json.JSONDecodeError as exc:
        raise inngest.NonRetriableError(message=f"Error occurred: {exc}")

    state = RoutingState.model_validate(payload)
    state_dict = cast(RoutingStateData, state.model_dump())

    return RoutingLLMOutput(
        state=state_dict,
        prompt=prompt,
    )


async def summarize_conversation_history(
    inputs: SummarizeConversationInput,
) -> SummarizeConversationOutput:
    history = inputs["history"]
    prompt = (
        "You are summarizing a chat conversation for a video assistant. "
        "Keep the summary concise, preserve key facts, user intents, and notable decisions. "
        "Return only the summary text, without markdown or JSON.\n\n"
        f"CHAT_ID: {inputs['chat_id']}\n"
        "CONVERSATION:\n" + json.dumps(history, ensure_ascii=False)
    )

    provider = GroqProvider(
        api_key=CONFIG.GROQ_API_KEY, model="llama-3.3-70b-versatile"
    )
    llm_service = LLMService(provider=provider)

    try:
        response = await llm_service.chat(
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2,
            max_tokens=400,
        )
    finally:
        await llm_service.close()

    summary = (response.content or "").strip()
    if summary.startswith("```"):
        summary = summary.strip("`").strip()
        if summary.lower().startswith("json"):
            summary = summary[4:].strip()

    return SummarizeConversationOutput(summary=summary)


# Further things like application level ranking filter. Score filter.
# Will be done withing this funciton only, for now it is simple returning fixed number of
# objects inclding all properties


async def get_video_context_from_vdb(
    inputs: GetVideoContextFromVdbInput,
) -> GetVideoContextFromVdbOutput:
    weaviate_client = await WeaviateClient.create()
    weaviate_service = WeaviateService(weaviate_client)
    query = WeaviateQueryOptions(
        field=inputs["field"],
        value=inputs["query"],
        search_type=inputs["search_type"],
        limit=inputs["limit"],
        filters=Filter.by_property("video_id").equal(inputs["video_id"]),
    )
    try:
        result = await weaviate_service.retrieve(query_options=query)
        data = [cast(YoutubeInfoCollectionObject, obj.properties) for obj in result]

    except Exception as exc:
        raise inngest.NonRetriableError(message=f"Error occurred: {exc}")

    return GetVideoContextFromVdbOutput(data=data)


async def store_conversation_summary(
    inputs: StoreConversationSummaryInput,
) -> StoreConversationSummaryOutput:

    repository = ConversationMemoryRepository()
    summary = await wrap_in_session(
        repository.insert_summary,
        session=None,
        chat_id=inputs["chat_id"],
        summary=inputs["summary"],
        start_message_id=inputs["start_message_id"],
        last_message_id=inputs["last_message_id"],
        n_summarized=inputs["n_summarized"],
        should_commit=True,
    )

    if summary is None:
        raise inngest.NonRetriableError(message="Failed to store conversation summary.")

    memory = await ChatMemoryService.create()

    await memory.save_summary(
        chat_id=inputs["chat_id"],
        summary=summary.summary,
        start_message_id=inputs["start_message_id"],
        last_message_id=inputs["last_message_id"],
    )

    return StoreConversationSummaryOutput(
        chat_id=str(summary.id),
        summary=summary.summary,
        summary_id=str(summary.id),
        n_summarized=summary.n_summarized,
    )


async def create_new_message_record(
    inputs: CreateNewMessageRecordInput,
) -> CreateNewMessageRecordOutput:
    repository = MessagesRepository()

    message: Messages | None = await wrap_in_session(
        repository.create_new_message_record,
        session=None,
        chat_id=inputs["chat_id"],
        role=inputs["role"],
        content=inputs["content"],
        tokens=inputs["tokens"],
        should_commit=inputs["should_commit"],
    )

    if message is None:
        raise inngest.NonRetriableError(message="Failed to create message record.")

    return CreateNewMessageRecordOutput(
        message_id=str(message.id),
        chat_id=str(message.chat_id),
        content=message.content,
        tokens=message.tokens,
        role=message.role,
        created_at=message.created_at,
    )
