from src.db.redis_db import get_redis
from redis.asyncio import Redis
import json
from typing import cast

from src.models.redis import ChatHistoryMessageObject, CHAT_HISTORY_KEY


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
    def _get_json_str(message_data: ChatHistoryMessageObject) -> str:
        return json.dumps(message_data)

    @staticmethod
    def _get_json_str_to_obj(data_str: str) -> ChatHistoryMessageObject:
        return json.loads(data_str)

    async def save(self, chat_id: str, message_data: ChatHistoryMessageObject):
        key: str = self.build_key(chat_id=chat_id)
        length: int = await self._redis_client.lpush(
            key, self._get_json_str(message_data)
        )

        if length > self.max_total_message:
            await self._redis_client.ltrim(key, 2, -1)

    async def remove_history(self, chat_id: str) -> None:
        key: str = self.build_key(chat_id=chat_id)
        await self._redis_client.delete(key)

    async def retrieve_history(self, chat_id: str) -> list[ChatHistoryMessageObject]:
        key: str = self.build_key(chat_id=chat_id)
        messages = self._redis_client.get(key)
        messages = cast(list[str], messages)
        return [self._get_json_str_to_obj(message_str) for message_str in messages]
