from typing import TypedDict, ClassVar
from datetime import datetime
from pydantic import BaseModel

CHAT_HISTORY_KEY: str = "chat:{chat_id}:history"


class ChatHistoryMessageObject(BaseModel):
    message_id: str
    message: str
    role: str


class ChatStreamToken(BaseModel):
    KEY: ClassVar[str] = "chat:{chat_id}:stream"
    chat_id: str
    event: str = "token_yielded"
    token: str
    sequence: int

    @classmethod
    def build_key(cls, chat_id: str) -> str:
        return cls.KEY.format(chat_id=chat_id)


class WorkflowStatus(TypedDict):
    chat_id: str
    step: str
    status: str
    progress: int
    message: str
    timestamp: datetime


class ConversationSummary(BaseModel):
    KEY: ClassVar[str] = "chat:{chat_id}:summary:{number}"
    # Using ClassVar don't include it as a field.

    summary: str
    n: int
    start_message: str
    end_message: str

    @classmethod
    def build_key(cls, chat_id: str, summary_no: int) -> str:
        return cls.KEY.format(chat_id=chat_id, number=summary_no)
