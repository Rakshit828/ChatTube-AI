import json
from datetime import datetime, timezone
from typing import Any

import redis.asyncio as aioredis
from src.config import CONFIG
from src.models.redis import ChatStreamToken

_redis_client: aioredis.Redis | None = None


def get_redis() -> aioredis.Redis:
    """Return a shared async Redis connection (lazy-initialised)."""
    global _redis_client
    if _redis_client is None:
        _redis_client = aioredis.from_url(
            CONFIG.REDIS_URL,
            decode_responses=True,
        )
    return _redis_client


async def publish_chat_stream_token(
    chat_id: str,
    token: str,
    sequence: int,
) -> None:
    """Publish a streamed LLM token to the Redis pub/sub channel for the chat."""
    r = get_redis()
    payload = ChatStreamToken(
        chat_id=chat_id,
        token=token,
        sequence=sequence,
    ).model_dump(mode="json")

    await r.publish(ChatStreamToken.build_key(chat_id), json.dumps(payload))


async def publish_workflow_status(
    chat_id: str,
    step: str,
    status: str,
    progress: int,
    message: str,
) -> None:
    """Publish a workflow status payload to the Redis channel ``workflow:{chat_id}``."""
    r = get_redis()
    payload: dict[str, Any] = {
        "chat_id": chat_id,
        "step": step,
        "status": status,
        "progress": progress,
        "message": message,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }

    await r.publish(f"workflow:{chat_id}", json.dumps(payload))
