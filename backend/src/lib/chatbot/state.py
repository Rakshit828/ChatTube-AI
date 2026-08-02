from pydantic import BaseModel, Field
from typing import Optional
from src.lib.weviate_db.types import YoutubeInfoCollectionObject
from src.models.redis import ChatHistoryMessageObject, ConversationSummary

class RoutingState(BaseModel):
    requires_past_history: bool
    requires_video_chunks_retrieval: bool
    requires_video_chapters: bool

    start_time: Optional[str] = Field(
        description="The video start time requested in the query in the format: Hour:Minute:Second."
    )
    end_time: Optional[str] = Field(
        description="The video end time requested in the query in the format: Hour:Minute:Second."
    )


class AgentState(RoutingState):
    raw_user_query: str
    prompt: str
    video_chunks: list[YoutubeInfoCollectionObject]
    message_history: list[ChatHistoryMessageObject]
    summaries: list[ConversationSummary]
