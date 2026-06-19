import json
import re

from pydantic import ValidationError

from ..models.schemas import ExamContent, ExamSpec
from ..prompts.exam_prompt import SYSTEM_PROMPT, build_user_prompt
from . import llm
from . import usage as usage_service


def _extract_json(text: str) -> str:
    """OpenRouter free models sometimes wrap JSON in markdown fences — strip them."""
    text = text.strip()
    fence = re.match(r"^```(?:json)?\s*(.*?)\s*```$", text, re.DOTALL)
    if fence:
        return fence.group(1).strip()
    # find first { ... last }
    first = text.find("{")
    last = text.rfind("}")
    if first != -1 and last != -1 and last > first:
        return text[first : last + 1]
    return text


def _fix_points(content: ExamContent, spec: ExamSpec) -> ExamContent:
    """Force per-exercise points to match the requested distribution, in case the
    model drifted. Also re-clamps total_points and exercise count to spec where
    safe (truncating extras / padding with the last exercise duplicated if missing)."""
    exercises = list(content.exercises)

    # Truncate if too many
    if len(exercises) > spec.num_exercises:
        exercises = exercises[: spec.num_exercises]

    # If too few, we keep what we have — caller will treat as soft failure.
    for i, ex in enumerate(exercises):
        if i < len(spec.per_exercise_points):
            ex.points = spec.per_exercise_points[i]

    content.exercises = exercises
    content.total_points = spec.total_points
    return content


async def generate_exam(
    *,
    user_id: str,
    spec: ExamSpec,
    course_text: str,
    chat_history: list[dict[str, str]],
) -> ExamContent:
    spec.validate_consistency()

    user_prompt = build_user_prompt(
        spec=spec, course_text=course_text, chat_history=chat_history
    )
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": user_prompt},
    ]

    last_error: Exception | None = None
    for attempt in range(2):
        usage_service.ensure_within_limit(user_id)
        try:
            result = await llm.chat(
                messages, response_format_json=True, max_tokens=2500
            )
            usage_service.record_usage(user_id, result.total_tokens)
            payload = json.loads(_extract_json(result.content))
            content = ExamContent.model_validate(payload)
            if len(content.exercises) != spec.num_exercises:
                raise ValueError(
                    f"Expected {spec.num_exercises} exercises, got {len(content.exercises)}"
                )
            return _fix_points(content, spec)
        except (json.JSONDecodeError, ValidationError, ValueError) as e:
            last_error = e
            messages.append(
                {
                    "role": "user",
                    "content": (
                        "Your previous response could not be parsed: "
                        f"{e}. Respond again with ONLY the JSON object, "
                        "no markdown or commentary."
                    ),
                }
            )
            continue

    raise RuntimeError(f"Failed to generate a valid exam: {last_error}")
