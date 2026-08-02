from typing import Any

def format_message_history(messages: list[dict[str, str]] | list[str]) -> str:
    if not messages:
        return "No prior conversation history available."

    lines: list[str] = []
    for index, message in enumerate(messages, start=1):
        if isinstance(message, dict):
            role = str(message.get("role", "USER")).upper()
            content = str(message.get("message") or message.get("content") or "")
        else:
            role = "MESSAGE"
            content = str(message)

        lines.append(f"{index}. [{role}] {content.strip()}")

    return "\n".join(lines)


def format_conversation_summaries(summaries: list[dict[str, str | int]] | list[str]) -> str:
    if not summaries:
        return "No conversation summaries available."

    lines: list[str] = []
    for index, item in enumerate(summaries, start=1):
        if isinstance(item, dict):
            content = str(item.get("summary") or item.get("content") or "")
            lines.append(f"{index}. [SUMMARY] {content.strip()}")
        else:
            lines.append(f"{index}. [SUMMARY] {str(item).strip()}")

    return "\n".join(lines)


def format_video_context(context: list[dict[str, Any]] | list[str]) -> str:
    if not context:
        return "No video context available."

    lines: list[str] = []
    for index, chunk in enumerate(context, start=1):
        if isinstance(chunk, dict):
            content = str(chunk.get("text") or chunk.get("content") or "")
            start = chunk.get("start") or chunk.get("start_time") or ""
            end = chunk.get("end") or chunk.get("end_time") or ""
            label = f"[{start} - {end}]" if start or end else "[VIDEO CONTEXT]"
            lines.append(f"{index}. {label} {content.strip()}")
        else:
            lines.append(f"{index}. [VIDEO CONTEXT] {str(chunk).strip()}")

    return "\n".join(lines)
