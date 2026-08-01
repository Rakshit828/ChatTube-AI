from __future__ import annotations

from dataclasses import dataclass
from string import Formatter
from typing import Any, Generic, TypeVar

T = TypeVar("T")


@dataclass(frozen=True)
class Variable(Generic[T]):
    name: str
    type_: type[T]
    description: str | None = None


class PromptTemplate:
    def __init__(
        self,
        template: str,
        variables: list[Variable[Any]] | None = None,
    ):
        self.template = template
        self.variables = {v.name: v for v in (variables or [])}

        fields = {
            field for _, field, _, _ in Formatter().parse(template) if field is not None
        }

        # If no variables are declared, infer them from the template.
        if not variables:
            self.variables = {name: Variable(name, object) for name in fields}
            return

        declared = set(self.variables)

        undeclared = fields - declared
        if undeclared:
            raise ValueError(f"Variables used but not declared: {sorted(undeclared)}")

        unused = declared - fields
        if unused:
            raise ValueError(f"Variables declared but unused: {sorted(unused)}")

    def render(self, **kwargs: Any) -> str:
        missing = set(self.variables) - kwargs.keys()
        if missing:
            raise ValueError(f"Missing variables: {sorted(missing)}")

        extra = kwargs.keys() - self.variables.keys()
        if extra:
            raise ValueError(f"Unexpected variables: {sorted(extra)}")

        for name, variable in self.variables.items():
            if variable.type_ is object:
                continue

            if not isinstance(kwargs[name], variable.type_):
                raise TypeError(
                    f"'{name}' must be "
                    f"{variable.type_.__name__}, "
                    f"got {type(kwargs[name]).__name__}"
                )

        return self.template.format(**kwargs)


ROUTING_LLM_TEMPLATE = PromptTemplate(
    template=""""
    You are a routing LLM who is responsible for making the following decision in the 
    youtube video chatbot application where user queries for a specific video.

    requires_past_history: bool
    requires_video_chunks_retrieval: bool
    requires_video_chapters: bool
    start_time: Optional[str] = The start time of the video queried by user
    end_time: Optional[str] = The end time of the video queried by the user

    The format for the start_time and end_time is HH:MM:SS as a string.
    Examples:
        1. Around 5 minute = 05:00
        2. Around 1 hour 30 minutes = 01:30:00
        3. Around second hour = 02:00:00
        4. Around half an hour = 30:00 (since it means thirty minutes)
    If user asks something like, around the middle of video, around the end. Give response in above
    format considering video_length if it is provided.


    # Output Format 
    A json containing the above decisions like:
    {{
        requires_past_history: true
        requires_video_chunks_retrieval: true
        requires_video_chapters: true
        start_time: Optional[str] = None 
        end_time: Optional[str] = "30:00"
    }}

    Strictly return json only. No extra text. No markdown format. Just Json.
    
    QUERY: {user_query}
    VIDEO_LENGTH: {video_length}
    """,
    variables=[Variable("user_query", str), Variable("video_length", str)],
)
