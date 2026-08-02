from src.lib.weviate_db.types import YoutubeInfoCollectionObject
from src.models.redis import ChatHistoryMessageObject, ConversationSummary


def format_message_history(messages: list[ChatHistoryMessageObject]) -> str:
    if not messages:
        return "No prior conversation history available."

    lines: list[str] = []
    for index, message in enumerate(messages, start=1):
        role = str(message.role).upper()
        content = str(message.message).strip()
        lines.append(f"{index}. [{role}] {content}")

    return "\n".join(lines)


def format_conversation_summaries(
    summaries: list[ConversationSummary],
) -> str:
    if not summaries:
        return "No conversation summaries available."

    lines: list[str] = []
    for index, summary in enumerate(summaries, start=1):
        lines.append(f"{index}. [SUMMARY] {str(summary.summary).strip()}")

    return "\n".join(lines)


# The timestamps are probably in seconds. We have to format it accordingly.
def format_video_context(context: list[YoutubeInfoCollectionObject]) -> str:
    if not context:
        return "No video context available."

    lines: list[str] = []
    for index, chunk in enumerate(context, start=1):
        text = str(chunk.get("text") or chunk.get("content") or "").strip()
        start = str(chunk.get("start") or chunk.get("start_time") or "").strip()
        end = str(chunk.get("end") or chunk.get("end_time") or "").strip()
        label = f"TIMESTAMP [{start} - {end}]"
        lines.append(f"{index}. {label} {text}")

    return "\n".join(lines)
