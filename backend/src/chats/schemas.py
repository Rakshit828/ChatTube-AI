from pydantic import BaseModel, Field, field_validator
import re
from uuid import UUID
from typing import Optional, Any
from .exceptions import InvalidYoutubeURLError

class CreateChatSchema(BaseModel):
    title: str
    youtube_video: str = Field(alias="youtubeVideo")

    @field_validator("youtube_video")
    @classmethod
    def validate_url(cls, value: Any):
        """
        Validates a standard YouTube watch URL.
        Example: https://www.youtube.com/watch?v=vTLpK5JNoWA
        """
        pattern = r'^https:\/\/(www\.)?youtube\.com\/watch\?v=[\w-]{11}$'
        if (re.match(pattern, value)):
            return value
        raise InvalidYoutubeURLError()


class UpdateChatSchema(BaseModel):
    title: Optional[str] = None
    youtube_video: Optional[str] = Field(default=None, alias="youtubeVideo")

    @field_validator("youtube_video")
    @classmethod
    def validate_url(cls, value: Any):
        """
        Validates a standard YouTube watch URL.
        Example: https://www.youtube.com/watch?v=vTLpK5JNoWA
        """
        pattern = r'^https:\/\/(www\.)?youtube\.com\/watch\?v=[\w-]{11}$'
        if (re.match(pattern, value)):
            return value
        raise InvalidYoutubeURLError()


class ResponseChatSchema(BaseModel):
    uuid: UUID
    title: str
    youtubeVideo: str = Field(alias="youtube_video")

    class Config:
        orm_mode = True


class CreateQASchema(BaseModel):
    query: str
    answer: str
    chat_uid: UUID = Field(alias="chatUID")


class ResponseQASchema(BaseModel):
    query: str
    answer: str
    chatUID: UUID = Field(alias="chat_uid")


