from typing import TypedDict
from src.lib.weviate_db.types import SearchTypeEnum, YoutubeInfoCollectionObject
from src.db.postgres.schemas import MessageRoleEnum
from datetime import datetime


class RoutingStateData(TypedDict):
    requires_past_history: bool
    requires_video_chunks_retrieval: bool
    requires_video_chapters: bool
    start_time: str | None
    end_time: str | None


class RoutingLLMInput(TypedDict):
    user_query: str
    video_length: str


class RoutingLLMOutput(TypedDict):
    state: RoutingStateData
    prompt: str


class GetVideoContextFromVdbInput(TypedDict):
    video_id: str
    field: str
    search_type: SearchTypeEnum
    query: str
    limit: int


class GetVideoContextFromVdbOutput(TypedDict):
    data: list[YoutubeInfoCollectionObject]


class CreateNewMessageRecordInput(TypedDict):
    chat_id: str
    role: MessageRoleEnum
    content: str
    tokens: int
    should_commit: bool


class CreateNewMessageRecordOutput(TypedDict):
    message_id: str
    chat_id: str
    content: str
    tokens: int
    role: MessageRoleEnum
    created_at: datetime
