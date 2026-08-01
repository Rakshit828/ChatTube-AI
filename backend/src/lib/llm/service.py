from __future__ import annotations

import asyncio
from typing import Any, Optional, Sequence

from openai import AsyncOpenAI
from openai.types.chat import ChatCompletionMessageParam
from .provider import ProviderConfig
from .types import ChatResponse
from .streaming import StreamHandle
from .errors import SDK_EXCEPTIONS, translate_error


class LLMService:
    """
    Async client for chat completions against any OpenAI-compatible provider.

    Example:
        provider = GroqProvider(api_key="...", model="llama-3.3-70b-versatile")
        client = LLMService
    (provider)
        response = await client.chat([{"role": "user", "content": "Hi"}])
        await client.close()
    """

    def __init__(
        self,
        provider: ProviderConfig,
        *,
        model: Optional[str] = None,
        timeout: float = 60.0,
    ):
        """
        Args:
            provider: A ProviderConfig (see GroqProvider/DeepseekProvider/etc.).
            model: Overrides provider.default_model if given. Must be one of
                provider.supported_models.
            timeout: Per-request timeout in seconds, passed straight to the
                underlying httpx client.
        """
        self.provider = provider
        self._model = model or provider.default_model

        provider.validate_model(self._model)

        self._client = AsyncOpenAI(
            api_key=provider.api_key,
            base_url=provider.base_url,
            timeout=timeout
        )

    @property
    def model(self) -> str:
        return self._model

    def _resolve_model(self, model: Optional[str]) -> str:
        resolved = model or self._model
        self.provider.validate_model(resolved)
        return resolved

    async def close(self) -> None:
        """Release the underlying HTTP client. Call this when done with the client."""
        await self._client.close()

    async def __aenter__(self) -> "LLMService":
        return self

    async def __aexit__(self, *exc_info: Any) -> None:
        await self.close()

    async def chat(
        self,
        messages: Sequence[ChatCompletionMessageParam],
        *,
        model: Optional[str] = None,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
        **kwargs: Any,
    ) -> ChatResponse:
        """
        Non-streaming chat completion. Raises on failure -- no retries.

        Raises:
            ProviderConfigError: bad model name for this provider.
            LLMAuthenticationError, LLMRateLimitError, LLMTimeoutError,
            LLMBadRequestError, LLMConnectionError, LLMRequestError: on
                request failure, mapped from the underlying openai SDK error.
        """
        resolved_model = self._resolve_model(model)
        try:
            completion = await self._client.chat.completions.create(
                model=resolved_model,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens,
                stream=False,
                **kwargs,
            )
        except asyncio.CancelledError:
            raise
        except SDK_EXCEPTIONS as exc:
            raise translate_error(exc, self.provider.name.value) from exc

        choice = completion.choices[0]
        usage = completion.usage.model_dump() if completion.usage else None
        return ChatResponse(
            content=choice.message.content or "",
            model=completion.model,
            finish_reason=choice.finish_reason,
            usage=usage,
            raw=completion,
        )

    async def chat_stream(
        self,
        messages: Sequence[ChatCompletionMessageParam],
        *,
        model: Optional[str] = None,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
        **kwargs: Any,
    ) -> StreamHandle:
        """
        Streaming chat completion.

        Returns a `StreamHandle` you can `async for` over to get `ChatChunk`s,
        and cancel mid-flight with `await handle.cancel()`.

        Raises the same exception types as `chat()` -- but note that for
        streaming, connection-time errors are raised on this initial call,
        while errors that occur mid-stream are raised from `__anext__`
        (i.e. from inside your `async for` loop).
        """
        resolved_model = self._resolve_model(model)
        try:
            raw_stream = await self._client.chat.completions.create(
                model=resolved_model,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens,
                stream=True,
                **kwargs,
            )
        except asyncio.CancelledError:
            raise
        except SDK_EXCEPTIONS as exc:
            raise translate_error(exc, self.provider.name.value) from exc
        
        return StreamHandle(raw_stream, self.provider.name.value)

