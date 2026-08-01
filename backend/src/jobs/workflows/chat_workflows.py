import inngest

from src.jobs.steps.chatbot.steps import (
    store_conversation_summary,
    summarize_conversation_history,
)
from src.lib.session_memory.service import ChatMemoryService
from src.services.inngest_client import inngest_client

from ..config import InngestEventsEnum


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

    start_message_id: str = history[0].id
    last_message_id: str = history[-1].id

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
