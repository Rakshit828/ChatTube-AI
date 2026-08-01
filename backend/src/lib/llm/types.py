from dataclasses import dataclass, field
from typing import Optional, Dict, Any


@dataclass
class ChatResponse:
    """Result of a non-streaming chat completion."""

    content: str
    model: str
    finish_reason: Optional[str]
    usage: Optional[Dict[str, Any]]
    raw: Any = field(repr=False, default=None)


@dataclass
class ChatChunk:
    """A single chunk from a streaming chat completion."""

    delta: str
    finish_reason: Optional[str]
    raw: Any = field(repr=False, default=None)
