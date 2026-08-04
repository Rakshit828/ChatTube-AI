import inngest

from src.db.postgres.schemas import MessageRoleEnum
from src.jobs.steps.chatbot.steps import (
    create_new_message_record,
    store_conversation_summary,
    summarize_conversation_history,
    update_memory_history,
)
from src.jobs.steps.chatbot.types import (
    CreateNewMessageRecordInput,
    UpdateMemoryHistoryInput,
)
from src.lib.session_memory.service import ChatMemoryService
from src.services.inngest_client import inngest_client

from ..config import InngestEventsEnum


@inngest_client.create_function(
    fn_id="chat-message-persistence-workflow",
    trigger=inngest.TriggerEvent(event=InngestEventsEnum.CHATBOT_QUERY),
    idempotency="event.data.chat_id",
)
async def chat_message_persistence_workflow(ctx: inngest.Context) -> None:
    step = ctx.step
    chat_id = str(ctx.event.data["chat_id"])
    user_query = str(ctx.event.data["user_query"])

    save_message_output = await step.run(
        step_id="save-user-message-record",
        handler=lambda: create_new_message_record(
            inputs=CreateNewMessageRecordInput(
                chat_id=chat_id,
                content=user_query,
                role=MessageRoleEnum.USER,
                tokens=len(user_query.split()),
                should_commit=True,
            )
        ),
    )

    await step.run(
        step_id="update-user-memory-history",
        handler=lambda: update_memory_history(
            inputs=UpdateMemoryHistoryInput(
                chat_id=chat_id,
                message_id=save_message_output["message_id"],
                message=user_query,
                role=MessageRoleEnum.USER.value,
            )
        ),
    )

    return None


@inngest_client.create_function(
    fn_id="conversation-summary-workflow",
    trigger=inngest.TriggerEvent(event=InngestEventsEnum.CONVERSATION_SUMMARY),
    idempotency="event.data.chat_id",
)
async def conversation_summary_workflow(ctx: inngest.Context) -> None:
    # logger = ctx.logger
    step = ctx.step
    chat_id = str(ctx.event.data["chat_id"])

    memory_service = await ChatMemoryService.create()
    history = await memory_service.retrieve_history(chat_id)

    if len(history) <= 2:
        return None

    summary_payload = await step.run(
        step_id="summarize-conversation",
        handler=lambda: summarize_conversation_history(
            inputs={
                "chat_id": chat_id,
                "history": [
                    {"id": item.id, "role": item.role, "message": item.message}
                    for item in history
                ],
            }
        ),
    )

    summary_text = summary_payload["summary"].strip()
    if not summary_text:
        return None

    start_message_id: str = history[0].message_id
    last_message_id: str = history[-1].message_id

    stored_summary = await step.run(
        step_id="store-conversation-summary",
        handler=lambda: store_conversation_summary(
            inputs={
                "chat_id": chat_id,
                "summary": summary_text,
                "start_message_id": start_message_id,
                "last_message_id": last_message_id,
                "n_summarized": len(history),
            }
        ),
    )

    return None
