import inngest

from src.services.inngest_client import inngest_client

from ..config import InngestEventsEnum
from src.jobs.steps.chatbot.steps import (
    routing_llm,
    get_video_context_from_vdb,
    gather_memory_context,
)
from src.jobs.steps.chatbot.types import (
    RoutingLLMInput,
    RoutingLLMOutput,
    GetVideoContextFromVdbInput,
    GetVideoContextFromVdbOutput,
    GatherMemoryContextInput,
    GatherMemoryContextOutput,
)

from src.lib.chatbot.state import RoutingState, AgentState
from src.models.redis import ChatHistoryMessageObject, ConversationSummary
from src.db.redis_db import publish_workflow_status
from src.jobs.utils import SPLITTER
from src.lib.weviate_db.types import SearchTypeEnum


@inngest_client.create_function(
    fn_id="chatbot-workflow",
    trigger=inngest.TriggerEvent(event=InngestEventsEnum.CHATBOT_QUERY),
    idempotency="event.data.chat_id",
)
async def chatbot_workflow(ctx: inngest.Context) -> None:
    logger = ctx.logger
    logger.info("Event is : %s", ctx.event)
    step = ctx.step

    chat_id = str(ctx.event.data["chat_id"])
    video_id = str(ctx.event.data["video_id"])
    user_query = str(ctx.event.data["user_query"])

    agent_state: AgentState = AgentState(
        requires_past_history=False,
        requires_video_chapters=False,
        requires_video_chunks_retrieval=False,
        end_time=None,
        start_time=None,
        raw_user_query=str(user_query),
        prompt="",
        message_history=[],
        summaries=[],
        video_chunks=[],
    )

    try:

        await publish_workflow_status(
            chat_id=str(chat_id),
            step="inititalizing",
            status="started",
            progress=0,
            message="Initializing Chatbot",
        )

        routing_response: RoutingLLMOutput = await step.run(
            step_id="routing-llm",
            handler=lambda: routing_llm(
                inputs=RoutingLLMInput(user_query=str(user_query), video_length=None)
            ),
        )
        routing_state = RoutingState.model_validate(routing_response)

        if routing_state.requires_video_chunks_retrieval:
            retrieval_output: GetVideoContextFromVdbOutput = await step.run(
                step_id="get-video-context-from-vdb",
                handler=lambda: get_video_context_from_vdb(
                    inputs=GetVideoContextFromVdbInput(
                        query=user_query,
                        video_id=video_id,
                        search_type=SearchTypeEnum.HYBRID,
                        field="chunk",
                        limit=10,
                    )
                ),
            )
            data = retrieval_output["data"]
            agent_state.video_chunks = data

        if routing_state.requires_past_history:
            memory_context: GatherMemoryContextOutput = await step.run(
                step_id="gather-memory-context",
                handler=lambda: gather_memory_context(
                    inputs=GatherMemoryContextInput(chat_id=chat_id)
                ),
            )
            agent_state.message_history = [
                ChatHistoryMessageObject.model_validate(message)
                for message in memory_context["history"]
            ]
            agent_state.summaries = [
                ConversationSummary.model_validate(summary)
                for summary in memory_context["summaries"]
            ]

    except inngest.NonRetriableError as e:
        logger.error("StepError occurred. Details are : %s", e.message)
        message: str = e.message

        message_dict: dict[str, str] = {}
        key_values = message.split(SPLITTER)
        for key_val in key_values:
            unit = key_val.split("=")
            message_dict[unit[0]] = unit[1]

        logger.error("Error occurred: %s", message_dict)

        await publish_workflow_status(
            chat_id=str(chat_id),
            step=message_dict.get("step", "not defined"),
            status="failed",
            progress=-1,
            message=message_dict.get("message", "not defined"),
        )

    except Exception as e:
        logger.error(
            "UnexpedtedError occurred. Details are : [ERROR]: %s, [MSG]: %s",
            e.__class__.__name__,
            str(e),
        )
        await publish_workflow_status(
            chat_id=str(chat_id),
            step="not defined",
            status="failed",
            progress=-1,
            message="",
        )

    return None
