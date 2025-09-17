from pydantic import BaseModel, Field
from uuid import UUID
from typing import Optional


class CreateChatSchema(BaseModel):
    title: str
    youtube_video: str = Field(alias="youtubeVideo")


class ResponseChatSchema(BaseModel):
    uuid: UUID
    title: str
    youtubeVideo: str = Field(alias="youtube_video")

    class Config:
        orm_mode = True


class UpdateChatSchema(BaseModel):
    title: Optional[str] = None
    youtube_video: Optional[str] = None


class CreateQASchema(BaseModel):
    query: str
    answer: str
    chat_uid: UUID = Field(alias="chatUID")


class ResponseQASchema(BaseModel):
    query: str
    answer: str
    chatUID: UUID = Field(alias="chat_uid")
