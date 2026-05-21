from typing import Any

import httpx

from ..config import get_settings


OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"


async def chat(
    messages: list[dict[str, str]],
    *,
    response_format_json: bool = False,
    model: str | None = None,
    temperature: float = 0.4,
    max_tokens: int = 4000,
) -> str:
    s = get_settings()
    headers = {
        "Authorization": f"Bearer {s.openrouter_api_key}",
        "HTTP-Referer": s.openrouter_referer,
        "X-Title": s.openrouter_title,
        "Content-Type": "application/json",
    }
    payload: dict[str, Any] = {
        "model": model or s.openrouter_model,
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens,
    }
    if response_format_json:
        payload["response_format"] = {"type": "json_object"}

    async with httpx.AsyncClient(timeout=120.0) as client:
        r = await client.post(OPENROUTER_URL, headers=headers, json=payload)
        r.raise_for_status()
        data = r.json()

    try:
        return data["choices"][0]["message"]["content"]
    except (KeyError, IndexError) as e:
        raise RuntimeError(f"Unexpected OpenRouter response: {data}") from e
