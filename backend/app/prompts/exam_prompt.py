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
- Write the entire exam (title, questions, answers, explanations) in the language specified in the user prompt.
"""

_LANGUAGE_LABELS = {"en": "English", "fr": "French"}


def build_user_prompt(
    *,
    spec: ExamSpec,
    course_text: str,
) -> str:
    types_label = " and ".join(
        {"mcq": "MCQ", "open": "open-ended"}[t] for t in spec.question_types
    )
    points_breakdown = ", ".join(
        f"exercise {i + 1}: {p} pts"
        for i, p in enumerate(spec.per_exercise_points)
    )

    extra = (
        f"\n\nExtra instructions: {spec.extra_instructions}"
        if spec.extra_instructions
        else ""
    )

    language_label = _LANGUAGE_LABELS.get(spec.language, "English")

    # cap to keep tokens manageable; free OpenRouter models have small context
    max_chars = 12000
    truncated = course_text[:max_chars]
    if len(course_text) > max_chars:
        truncated += "\n\n[... content truncated ...]"

    return f"""Generate an exam with the following specification.

Difficulty: {spec.difficulty}
Question types allowed: {types_label}
Number of exercises: {spec.num_exercises}
Total points: {spec.total_points}
Points per exercise: {points_breakdown}
Order the exercises so that all MCQ exercises come first, followed by the open-ended ones, matching the points-per-exercise list above.
Output language: {language_label} (write ALL text — title, questions, answers, explanations — in {language_label})
Export format (for your awareness, not the JSON): {spec.export_format}{extra}

Course content:
\"\"\"
{truncated}
\"\"\"

Return ONLY the JSON object as described in the system message.
"""
