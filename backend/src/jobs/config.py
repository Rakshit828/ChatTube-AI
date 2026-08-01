from typing import TypedDict
from enum import Enum


class InngestEventsEnum(str, Enum):
    CHAT_CREATED = "chat:created"
    CHATBOT_QUERY = "chat:query"
    CONVERSATION_SUMMARY = "chat:conversation-summary"


class ChatCreatedEventInputData(TypedDict):
    video_id: str
    chat_id: str
    yt_video_id: str


class ChatbotQueryEventInputData(TypedDict):
    user_query: str
    chat_id: str
