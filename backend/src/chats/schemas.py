from pydantic import BaseModel, Field
from uuid import UUID


class ChatSchema(BaseModel):
    title: str
    youtube_video: str


class CreateQASchema(BaseModel):
    query: str
    answer: str
    chat_uid: UUID


class ResponseQASchema(BaseModel):
    query: str
    answer: str
    chat_uid: UUID
