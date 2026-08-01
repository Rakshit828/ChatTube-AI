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

from .types import (
    CreateNewMessageRecordInput,
    CreateNewMessageRecordOutput,
    GetVideoContextFromVdbInput,
    GetVideoContextFromVdbOutput,
    RoutingLLMInput,
    RoutingLLMOutput,
    RoutingStateData,
)


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
