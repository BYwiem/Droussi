from ..models.schemas import ExamSpec


SYSTEM_PROMPT = """You are an expert exam writer for teachers. \
Given a course document, you generate exams that are pedagogically sound, \
clearly worded, and aligned with the requested difficulty and structure.

You MUST respond with a single JSON object (no markdown, no commentary) \
matching this schema:

{
  "title": string,
  "total_points": integer,
  "exercises": [
    {
      "type": "mcq" | "open",
      "question": string,
      "choices": [string, ...]  // only for mcq, 3-5 choices
      "answer": string,         // for mcq: the correct choice text
      "explanation": string,    // brief justification
      "points": integer
    }
  ]
}

Rules:
- Number of exercises MUST exactly match the requested count.
- Sum of exercises[].points MUST exactly equal total_points.
- Use ONLY the provided question types.
- Questions must be answerable from the provided course content.
- Write in English.
"""


def build_user_prompt(
    *,
    spec: ExamSpec,
    course_text: str,
    chat_history: list[dict[str, str]],
) -> str:
    types_label = " and ".join(
        {"mcq": "MCQ", "open": "open-ended"}[t] for t in spec.question_types
    )
    points_breakdown = ", ".join(
        f"exercise {i + 1}: {p} pts"
        for i, p in enumerate(spec.per_exercise_points)
    )

    chat_block = ""
    if chat_history:
        rendered = "\n".join(
            f"- {m['role']}: {m['content']}" for m in chat_history
        )
        chat_block = f"\n\nAdditional user instructions from chat:\n{rendered}"

    extra = (
        f"\n\nExtra instructions: {spec.extra_instructions}"
        if spec.extra_instructions
        else ""
    )

    # cap to keep tokens manageable; free OpenRouter models have small context
    max_chars = 18000
    truncated = course_text[:max_chars]
    if len(course_text) > max_chars:
        truncated += "\n\n[... content truncated ...]"

    return f"""Generate an exam with the following specification.

Difficulty: {spec.difficulty}
Question types allowed: {types_label}
Number of exercises: {spec.num_exercises}
Total points: {spec.total_points}
Points per exercise: {points_breakdown}
Export format (for your awareness, not the JSON): {spec.export_format}{extra}{chat_block}

Course content:
\"\"\"
{truncated}
\"\"\"

Return ONLY the JSON object as described in the system message.
"""
