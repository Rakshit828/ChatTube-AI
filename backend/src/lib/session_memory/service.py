import json
from typing import Any

import inngest
from redis.asyncio import Redis

from src.db.redis_db import get_redis
from src.jobs.config import InngestEventsEnum
from src.models.redis import (
    CHAT_HISTORY_KEY,
    ChatHistoryMessageObject,
    ConversationSummary,
)
from src.services.inngest_client import inngest_client


class ChatMemoryService:
    def __init__(self, redis: Redis, max_message_pair: int = 10) -> None:
        self._redis_client = redis
        self.max_message_pair = max_message_pair
        self.max_total_message = max_message_pair * 2

    @classmethod
    async def create(cls) -> "ChatMemoryService":
        redis = get_redis()
        return cls(redis)

    @staticmethod
    def build_key(chat_id: str) -> str:
        return CHAT_HISTORY_KEY.format(chat_id=chat_id)

    @staticmethod
    def _get_json_str(message_data: ChatHistoryMessageObject | dict[str, Any]) -> str:
        return json.dumps(message_data)

    @staticmethod
    def _get_json_str_to_obj(data_str: str) -> ChatHistoryMessageObject:
        return ChatHistoryMessageObject.model_validate(json.loads(data_str))

    async def _trigger_summary(self, chat_id: str, current_length: int) -> None:
        if current_length <= self.max_total_message:
            return

        await inngest_client.send(
            events=[
                inngest.Event(
                    name=InngestEventsEnum.CONVERSATION_SUMMARY,
                    data={
                        "chat_id": str(chat_id),
                        "message_count": current_length,
                    },
                )
            ]
        )

    async def save(
        self, chat_id: str, message_data: ChatHistoryMessageObject | dict[str, Any]
    ):
        key: str = self.build_key(chat_id=chat_id)
        serialized = self._get_json_str(message_data)
        length: int = await self._redis_client.lpush(key, serialized)

        if length > self.max_total_message:
            await self._trigger_summary(chat_id=chat_id, current_length=length)
            await self._redis_client.ltrim(key, 0, self.max_total_message - 1)

    async def remove_history(self, chat_id: str) -> None:
        key: str = self.build_key(chat_id=chat_id)
        await self._redis_client.delete(key)

    async def retrieve_history(self, chat_id: str) -> list[ChatHistoryMessageObject]:
        key: str = self.build_key(chat_id=chat_id)
        messages = await self._redis_client.lrange(key, 0, -1)
        return [self._get_json_str_to_obj(str(message_str)) for message_str in messages]

    @staticmethod
    def build_summary_key(chat_id: str, summary_no: int) -> str:
        return ConversationSummary.build_key(
            chat_id=chat_id,
            summary_no=summary_no,
        )

    @staticmethod
    def build_summary_key_search_pattern(chat_id: str) -> str:
        key = ConversationSummary.build_key(chat_id=chat_id, summary_no=0)
        return key.replace("0", "*")

    async def search_keys(self, pattern: str) -> list[str]:
        keys = await self._redis_client.keys(pattern)
        keys_str = [str(key) for key in keys]
        return list(sorted(keys_str, key=lambda key: int(key.split(":")[-1])))

    async def save_summary(
        self,
        chat_id: str,
        summary: str,
        *,
        start_message_id: str,
        last_message_id: str,
    ) -> str:
        pattern = self.build_summary_key_search_pattern(chat_id=chat_id)
        sorted_keys = await self.search_keys(pattern=pattern)
        key = sorted_keys[-1]
        n = int(key.split(":")[-1]) + 1

        key = self.build_summary_key(chat_id=chat_id, summary_no=n)
        payload = ConversationSummary(
            summary=summary,
            start_message=start_message_id,
            n=n,
            end_message=last_message_id,
        )
        await self._redis_client.set(key, payload.model_dump_json())
        return key

    async def get_all_summaries(self, chat_id: str) -> list[ConversationSummary]:
        pattern = self.build_summary_key_search_pattern(chat_id=chat_id)
        keys = await self.search_keys(pattern.format(chat_id=chat_id))
        if not keys:
            return []

        raw_values = await self._redis_client.mget(keys)
        summaries: list[ConversationSummary] = []

        for raw in raw_values:
            if raw is None:
                continue
            summaries.append(ConversationSummary.model_validate_json(raw))

        return sorted(summaries, key=lambda item: item.n)

    async def delete_all_summaries(self, chat_id: str) -> None:
        pattern = self.build_summary_key_search_pattern(chat_id=chat_id)
        keys = await self.search_keys(pattern=pattern)
        if not keys:
            return
        await self._redis_client.delete(*keys)
