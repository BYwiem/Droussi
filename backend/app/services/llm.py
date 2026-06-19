import asyncio
import logging
from dataclasses import dataclass
from typing import Any

import httpx

from ..config import get_settings


logger = logging.getLogger(__name__)

OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"

# Only retry if the server says we can retry within this many seconds.
# A larger Retry-After means a daily/long-term quota — don't burn time waiting.
_MAX_RETRY_AFTER = 12
_MAX_RETRIES = 1


@dataclass(frozen=True)
class ChatResult:
    content: str
    prompt_tokens: int
    completion_tokens: int
    total_tokens: int


def _parse_result(payload: dict[str, Any]) -> ChatResult:
    content = payload["choices"][0]["message"]["content"]
    usage = payload.get("usage") or {}
    prompt_tokens = int(usage.get("prompt_tokens") or 0)
    completion_tokens = int(usage.get("completion_tokens") or 0)
    total_tokens = int(
        usage.get("total_tokens") or (prompt_tokens + completion_tokens)
    )
    return ChatResult(
        content=content,
        prompt_tokens=prompt_tokens,
        completion_tokens=completion_tokens,
        total_tokens=total_tokens,
    )


def _http_timeout() -> httpx.Timeout:
    seconds = get_settings().openrouter_request_timeout
    return httpx.Timeout(connect=10.0, read=float(seconds), write=30.0, pool=10.0)


async def _request_model(
    client: httpx.AsyncClient,
    *,
    headers: dict[str, str],
    body: dict[str, Any],
    model: str,
) -> ChatResult:
    request_body = {**body, "model": model}
    last_status: int | None = None

    for attempt in range(_MAX_RETRIES + 1):
        r = await client.post(OPENROUTER_URL, headers=headers, json=request_body)
        last_status = r.status_code
        if r.status_code != 429:
            r.raise_for_status()
            try:
                return _parse_result(r.json())
            except (KeyError, IndexError, TypeError, ValueError) as e:
                raise RuntimeError(
                    f"Unexpected OpenRouter response from '{model}': {r.json()}"
                ) from e

        retry_after = int(r.headers.get("Retry-After", _MAX_RETRY_AFTER + 1))
        if attempt < _MAX_RETRIES and retry_after <= _MAX_RETRY_AFTER:
            await asyncio.sleep(retry_after)
            continue
        break

    raise RuntimeError(
        f"OpenRouter rate limit exceeded for model '{model}' (HTTP {last_status})."
    )


async def chat(
    messages: list[dict[str, str]],
    *,
    response_format_json: bool = False,
    model: str | None = None,
    temperature: float = 0.4,
    max_tokens: int = 4000,
) -> ChatResult:
    s = get_settings()
    headers = {
        "Authorization": f"Bearer {s.openrouter_api_key}",
        "HTTP-Referer": s.openrouter_referer,
        "X-Title": s.openrouter_title,
        "Content-Type": "application/json",
    }
    body: dict[str, Any] = {
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens,
    }
    if response_format_json:
        body["response_format"] = {"type": "json_object"}

    models = [model] if model else s.openrouter_models
    models = models[: s.openrouter_max_model_attempts]
    errors: list[str] = []

    async with httpx.AsyncClient(timeout=_http_timeout()) as client:
        for candidate in models:
            logger.info("OpenRouter request using model %s", candidate)
            try:
                return await _request_model(
                    client, headers=headers, body=body, model=candidate
                )
            except RuntimeError as e:
                logger.warning("OpenRouter model %s failed: %s", candidate, e)
                errors.append(str(e))
                continue
            except httpx.TimeoutException:
                msg = (
                    f"OpenRouter timed out for model '{candidate}' "
                    f"after {s.openrouter_request_timeout}s."
                )
                logger.warning(msg)
                errors.append(msg)
                continue
            except httpx.HTTPError as e:
                msg = f"OpenRouter network error for model '{candidate}': {e}"
                logger.warning(msg)
                errors.append(msg)
                continue
            except httpx.HTTPStatusError as e:
                errors.append(
                    f"OpenRouter error for model '{candidate}': "
                    f"HTTP {e.response.status_code} {e.response.text[:200]}"
                )
                continue

    tried = ", ".join(models)
    raise RuntimeError(
        "All configured OpenRouter models failed. "
        f"Tried: {tried}. "
        + " | ".join(errors)
        + " Add credits at https://openrouter.ai/credits or set OPENROUTER_MODEL "
        "to another free model in backend/.env."
    )
