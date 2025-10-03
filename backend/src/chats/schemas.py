from pydantic import BaseModel, Field, field_validator
import re
from uuid import UUID
from typing import Optional, Any, List
from .exceptions import InvalidYoutubeURLError

class CreateChatSchema(BaseModel):
    title: str
    youtube_video_url: str = Field(alias="youtubeVideoUrl")

    @field_validator("youtube_video_url")
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
    youtube_video_url: Optional[str] = Field(default=None, alias="youtubeVideoUrl")

    @field_validator("youtube_video_url")
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
    youtube_video_url: str 

    class Config:
        orm_mode = True


class CreateQASchema(BaseModel):
    query: str
    answer: str
    chat_uid: UUID 


class ResponseQASchema(BaseModel):
    query: str
    answer: str
    chat_uid: UUID


class ResponseCurrentChatSchema(BaseModel):
    selected_chat_id: str
    youtube_video_url: str
    is_transcript_generated: bool = False
    questions_answers: List[ResponseQASchema]