import types

import pytest

from src.jobs.steps.chatbot.steps import routing_llm


class DummyLLM:
    async def chat(self, messages, **kwargs):
        assert messages[0]["role"] == "user"
        assert "QUERY: summarize the end of the video" in messages[0]["content"]
        return types.SimpleNamespace(
            content='''{
                "requires_past_history": false,
                "requires_video_chunks_retrieval": true,
                "requires_video_chapters": false,
                "start_time": "00:08:00",
                "end_time": "00:10:00"
            }'''
        )


@pytest.mark.asyncio
async def test_routing_llm_returns_serialized_state(monkeypatch):
    monkeypatch.setattr(
        "src.jobs.steps.chatbot.steps.CONFIG.GROQ_API_KEY",
        "fake-key",
        raising=False,
    )
    monkeypatch.setattr(
        "src.jobs.steps.chatbot.steps.GroqProvider",
        lambda api_key, model=None: object(),
    )
    monkeypatch.setattr(
        "src.jobs.steps.chatbot.steps.LLMService",
        lambda provider, **kwargs: DummyLLM(),
    )

    output = await routing_llm(
        {
            "user_query": "summarize the end of the video",
            "video_length": "00:10:00",
            "message_history": ["hi there"],
        }
    )

    assert output["state"]["requires_video_chunks_retrieval"] is True
    assert output["state"]["start_time"] == "00:08:00"
    assert output["state"]["end_time"] == "00:10:00"
    assert output["prompt"].startswith("\n    You are a routing LLM")
