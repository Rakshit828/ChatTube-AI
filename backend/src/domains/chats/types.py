from pydantic import BaseModel
from src.db.postgres.schemas import VideoProcessingStatusEnum


class CreateNewChatRecordModel(BaseModel):
    video_id: str
    chat_title: str


class TriggerChatbotQueryModel(BaseModel):
    chat_id: str
    user_query: str
    video_id: str | None = None


class CreateNewChatResponseModel(BaseModel):
    video_id: str 
    chat_id: str 
    video_processing_status: VideoProcessingStatusEnum
    chat_title: str 