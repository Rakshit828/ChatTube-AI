from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio.session import AsyncSession
from src.domains.auth.dependencies import AccessTokenBearer
from typing import Dict, Any
from .types import (
    CreateNewChatRecordModel,
    CreateNewChatResponseModel,
    TriggerChatbotQueryModel,
)
from .service import ChatsService
from src.db.postgres.setup import get_session
from src.db.postgres.schemas import VideoProcessingStatusEnum
from src.app_responses import SuccessResponse
from src.jobs.config import InngestEventsEnum
from src.services.inngest_client import inngest_client
from src.db.redis_db import get_redis
from src.models.redis import ChatStreamToken


import inngest
import asyncio
import json
import redis.asyncio as aioredis

chats_router = APIRouter()


@chats_router.post("/", response_model=SuccessResponse[CreateNewChatResponseModel])
async def create_new_chat_record(
    payload: CreateNewChatRecordModel,
    decoded_token: Dict[str, Any] = Depends(AccessTokenBearer().check),
    chats_service: ChatsService = Depends(ChatsService),
    session: AsyncSession = Depends(get_session),
) -> SuccessResponse[CreateNewChatResponseModel]:
    user_id = decoded_token["sub"]
    video, chat = await chats_service.create_new_video_and_chat(
        session=session,
        video_id=payload.video_id,
        user_id=user_id,
        chat_title=payload.chat_title,
    )
    data = CreateNewChatResponseModel(
        video_id=str(video.id),
        chat_id=str(chat.id),
        video_processing_status=video.processing_status,
        chat_title=chat.title,
    )

    if (
        video.processing_status == VideoProcessingStatusEnum.COMPLETED
        or video.processing_status == VideoProcessingStatusEnum.PENDING
    ):
        return SuccessResponse[CreateNewChatResponseModel](
            message="Chat and video created successfully.",
            data=data,
        )

    event_data = {
        "chat_id": str(chat.id),
        "video_id": str(video.id),
        "yt_video_id": str(video.yt_video_id),
    }
    await inngest_client.send(
        events=inngest.Event(name=InngestEventsEnum.CHAT_CREATED, data=event_data)
    )

    data.video_processing_status = VideoProcessingStatusEnum.PENDING

    return SuccessResponse[CreateNewChatResponseModel](
        message="Chat and video created successfully.",
        data=data,
    )


@chats_router.post("/query")
async def trigger_chatbot_query(
    payload: TriggerChatbotQueryModel,
    decoded_token: Dict[str, Any] = Depends(AccessTokenBearer().check),
    chats_service: ChatsService = Depends(ChatsService),
    session: AsyncSession = Depends(get_session),
) -> SuccessResponse[dict[str, str]]:
    """Queue an existing chat for the chatbot workflow."""
    del decoded_token

    chat = await chats_service.get_chat_by_id(session=session, chat_id=payload.chat_id)
    if chat is None:
        raise HTTPException(status_code=404, detail="Chat not found.")

    video_id = payload.video_id or str(chat.yt_video_id)

    await inngest_client.send(
        events=[
            inngest.Event(
                name=InngestEventsEnum.CHATBOT_QUERY,
                data={
                    "chat_id": str(payload.chat_id),
                    "video_id": str(video_id),
                    "user_query": payload.user_query,
                },
            )
        ]
    )

    return SuccessResponse[
        dict[str, str]
    ](
        message="Chatbot workflow triggered successfully.",
        data={
            "chat_id": str(payload.chat_id),
            "video_id": str(video_id),
            "status": "queued",
        },
    )


@chats_router.get("/status/{chat_id}")
async def stream_workflow_status(chat_id: str, request: Request):
    """SSE endpoint — streams real-time workflow progress for *chat_id*."""

    async def _event_generator():
        redis: aioredis.Redis = get_redis()
        pubsub = redis.pubsub()  # type: ignore

        channel = f"workflow:{chat_id}"

        await pubsub.subscribe(channel)
        try:
            while True:
                if await request.is_disconnected():
                    break

                message = await pubsub.get_message(
                    ignore_subscribe_messages=True, timeout=1.0
                )

                if message is not None and message["type"] == "message":
                    data = message["data"]
                    yield f"data: {data}\n\n"

                    try:
                        payload = json.loads(data)
                        if (
                            payload.get("progress") == 100
                            or payload.get("status") == "failed"
                        ):
                            break
                    except json.JSONDecodeError:
                        pass
                else:
                    await asyncio.sleep(0.5)
        finally:
            await pubsub.unsubscribe(channel)
            await pubsub.close()

    return StreamingResponse(
        _event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@chats_router.get("/stream/{chat_id}")
async def stream_chat_tokens(chat_id: str, request: Request):
    """SSE endpoint — streams Redis pub/sub tokens for a chat response."""

    async def _event_generator():
        redis: aioredis.Redis = get_redis()
        pubsub = redis.pubsub()  # type: ignore
        channel = ChatStreamToken.build_key(chat_id)

        await pubsub.subscribe(channel)
        try:
            while True:
                if await request.is_disconnected():
                    break

                message = await pubsub.get_message(
                    ignore_subscribe_messages=True, timeout=1.0
                )

                if message is not None and message["type"] == "message":
                    data = message["data"]
                    try:
                        payload = json.loads(data)
                        yield f"data: {json.dumps(payload)}\n\n"
                    except json.JSONDecodeError:
                        yield f"data: {data}\n\n"
                else:
                    await asyncio.sleep(0.5)
        finally:
            await pubsub.unsubscribe(channel)
            await pubsub.close()

    return StreamingResponse(
        _event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
