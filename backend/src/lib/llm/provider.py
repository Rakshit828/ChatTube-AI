from enum import Enum
from dataclasses import dataclass
from typing import Sequence, Optional
from .errors import ProviderConfigError


class ProviderName(str, Enum):
    GROQ = "groq"
    DEEPSEEK = "deepseek"
    GEMINI = "gemini"
    OPENAI = "openai"


@dataclass(frozen=True)
class ProviderConfig:
    """
    Describes an OpenAI-API-compatible provider.

    Construct these via the helper factory functions below (GroqProvider,
    DeepseekProvider, GeminiProvider, OpenAIProvider) rather than directly,
    unless you're wiring up a custom/self-hosted OpenAI-compatible endpoint.
    """

    name: ProviderName
    base_url: str
    supported_models: Sequence[str]
    api_key: str
    default_model: str

    def __post_init__(self) -> None:
        if not self.api_key:
            raise ProviderConfigError(f"An API key is required for provider '{self.name.value}'")
        if not self.base_url:
            raise ProviderConfigError(f"A base_url is required for provider '{self.name.value}'")
        if not self.supported_models:
            raise ProviderConfigError(f"supported_models must be non-empty for provider '{self.name.value}'")
        if self.default_model and self.default_model not in self.supported_models:
            raise ProviderConfigError(
                f"default_model '{self.default_model}' is not in supported_models for '{self.name.value}'"
            )

    def validate_model(self, model: str) -> None:
        if model not in self.supported_models:
            raise ProviderConfigError(
                f"Model '{model}' is not supported by provider '{self.name.value}'. "
                f"Supported models: {list(self.supported_models)}"
            )


def GroqProvider(api_key: str, model: Optional[str] = None) -> ProviderConfig:
    """Groq (https://console.groq.com) -- OpenAI-compatible endpoint."""
    models = [
        "openai-gpt-oss-120b",
        "llama-3.3-70b-versatile",
        "llama-3.1-8b-instant",
        "mixtral-8x7b-32768",
        "gemma2-9b-it",
    ]
    return ProviderConfig(
        name=ProviderName.GROQ,
        base_url="https://api.groq.com/openai/v1",
        supported_models=models,
        api_key=api_key,
        default_model=model or models[0],
    )


def DeepseekProvider(api_key: str, model: Optional[str] = None) -> ProviderConfig:
    """Deepseek (https://platform.deepseek.com) -- OpenAI-compatible endpoint."""
    models = ["deepseek-chat", "deepseek-reasoner"]
    return ProviderConfig(
        name=ProviderName.DEEPSEEK,
        base_url="https://api.deepseek.com/v1",
        supported_models=models,
        api_key=api_key,
        default_model=model or models[0],
    )


def GeminiProvider(api_key: str, model: Optional[str] = None) -> ProviderConfig:
    """Google Gemini -- via its OpenAI-compatibility endpoint."""
    models = [
        "gemini-2.0-flash",
        "gemini-2.0-flash-lite",
        "gemini-1.5-pro",
        "gemini-1.5-flash",
    ]
    return ProviderConfig(
        name=ProviderName.GEMINI,
        base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
        supported_models=models,
        api_key=api_key,
        default_model=model or models[0],
    )


def OpenAIProvider(api_key: str, model: Optional[str] = None) -> ProviderConfig:
    """Plain OpenAI."""
    models = ["gpt-4o", "gpt-4o-mini", "gpt-4.1", "o3-mini"]
    return ProviderConfig(
        name=ProviderName.OPENAI,
        base_url="https://api.openai.com/v1",
        supported_models=models,
        api_key=api_key,
        default_model=model or models[0],
    )


def CustomProvider(
    *, name: str, base_url: str, supported_models: Sequence[str], api_key: str, model: Optional[str] = None
) -> ProviderConfig:
    """Escape hatch for any other OpenAI-compatible endpoint not listed above."""
    return ProviderConfig(
        name=ProviderName.OPENAI,  # generic bucket; `name` kept for display via base_url/model only
        base_url=base_url,
        supported_models=supported_models,
        api_key=api_key,
        default_model=model or supported_models[0],
    )

