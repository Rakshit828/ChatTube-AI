import asyncio
from typing import Any
from .types import ChatChunk
from .errors import SDK_EXCEPTIONS, translate_error


class StreamHandle:
    """
    Wraps an in-flight streaming chat completion.

    Supports:
      * `async for chunk in handle: ...`               -- normal consumption
      * `await handle.cancel()`                        -- stop early, closes
                                                            the underlying HTTP
                                                            connection immediately
      * Standard `asyncio.Task.cancel()` on a task that
        is awaiting `__anext__` also works, and this class
        propagates `asyncio.CancelledError` correctly while
        still releasing the underlying connection.
    """

    def __init__(self, raw_stream: Any, provider_name: str):
        self._raw_stream = raw_stream
        self._provider_name = provider_name
        self._cancelled = False
        self._closed = False

    def __aiter__(self) -> "StreamHandle":
        return self

    async def __anext__(self) -> ChatChunk:
        if self._cancelled:
            raise StopAsyncIteration

        try:
            chunk = await self._raw_stream.__anext__()
        except StopAsyncIteration:
            await self._close()
            raise
        except asyncio.CancelledError:
            # Someone cancelled the task awaiting this -- release the
            # connection, then let the cancellation propagate normally.
            await self._close()
            raise
        except SDK_EXCEPTIONS as exc:
            await self._close()
            raise translate_error(exc, self._provider_name) from exc

        if self._cancelled:
            raise StopAsyncIteration

        choice = chunk.choices[0] if chunk.choices else None
        delta_content = ""
        finish_reason = None
        if choice is not None:
            if choice.delta is not None and choice.delta.content:
                delta_content = choice.delta.content
            finish_reason = choice.finish_reason

        return ChatChunk(delta=delta_content, finish_reason=finish_reason, raw=chunk)

    async def cancel(self) -> None:
        """Stop consuming the stream and close the underlying connection now."""
        self._cancelled = True
        await self._close()

    async def _close(self) -> None:
        if self._closed:
            return
        self._closed = True
        close = getattr(self._raw_stream, "close", None)
        if close is not None:
            result = close()
            if asyncio.iscoroutine(result):
                await result

    # Allow `async with client.chat_stream(...) as handle:` usage too.
    async def __aenter__(self) -> "StreamHandle":
        return self

    async def __aexit__(self, *exc_info: Any) -> None:
        await self._close()

