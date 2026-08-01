from openai import (
    APIConnectionError,
    APIError,
    APIStatusError,
    APITimeoutError,
    AuthenticationError,
    BadRequestError,
    RateLimitError,
)
from typing import Optional


class LLMClientError(Exception):
    """Base exception for all errors raised by this module."""


class ProviderConfigError(LLMClientError):
    """Invalid provider configuration (missing key, unsupported model, etc.)."""


class LLMRequestError(LLMClientError):
    """A request to the provider failed."""

    def __init__(
        self, message: str, *, provider: str, original: Optional[Exception] = None
    ):
        super().__init__(message)
        self.provider = provider
        self.original = original


class LLMAuthenticationError(LLMRequestError):
    """Authentication with the provider failed (bad/expired API key)."""


class LLMRateLimitError(LLMRequestError):
    """The provider rate-limited this request."""


class LLMTimeoutError(LLMRequestError):
    """The request timed out."""


class LLMBadRequestError(LLMRequestError):
    """The request was malformed (bad params, unknown model, etc.)."""


class LLMConnectionError(LLMRequestError):
    """A network-level connection error occurred."""


def translate_error(exc: Exception, provider: str) -> LLMRequestError:
    """Map an openai-sdk exception onto one of our typed exceptions."""
    if isinstance(exc, AuthenticationError):
        return LLMAuthenticationError(
            f"Authentication failed for provider '{provider}': {exc}",
            provider=provider,
            original=exc,
        )
    if isinstance(exc, RateLimitError):
        return LLMRateLimitError(
            f"Rate limit exceeded for provider '{provider}': {exc}",
            provider=provider,
            original=exc,
        )
    if isinstance(exc, APITimeoutError):
        return LLMTimeoutError(
            f"Request to provider '{provider}' timed out: {exc}",
            provider=provider,
            original=exc,
        )
    if isinstance(exc, BadRequestError):
        return LLMBadRequestError(
            f"Bad request to provider '{provider}': {exc}",
            provider=provider,
            original=exc,
        )
    if isinstance(exc, APIConnectionError):
        return LLMConnectionError(
            f"Connection error while calling provider '{provider}': {exc}",
            provider=provider,
            original=exc,
        )
    if isinstance(exc, APIStatusError):
        return LLMRequestError(
            f"Provider '{provider}' returned an error status ({exc.status_code}): {exc}",
            provider=provider,
            original=exc,
        )
    if isinstance(exc, APIError):
        return LLMRequestError(
            f"Provider '{provider}' returned an API error: {exc}",
            provider=provider,
            original=exc,
        )
    return LLMRequestError(
        f"Unexpected error calling provider '{provider}': {exc}",
        provider=provider,
        original=exc,
    )

SDK_EXCEPTIONS = (
    AuthenticationError,
    RateLimitError,
    APITimeoutError,
    BadRequestError,
    APIConnectionError,
    APIStatusError,
    APIError,
)
