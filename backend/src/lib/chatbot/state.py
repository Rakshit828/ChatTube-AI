from pydantic import BaseModel, Field
from typing import Optional


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
    message_history: list[str]
    summaries: list[str]
