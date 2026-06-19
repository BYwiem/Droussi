from typing import Literal, Optional

from pydantic import BaseModel, Field, field_validator


Difficulty = Literal["easy", "medium", "hard"]
QuestionType = Literal["mcq", "open"]
ExportFormat = Literal["pdf", "docx"]


class ExamSpec(BaseModel):
    difficulty: Difficulty
    question_types: list[QuestionType] = Field(min_length=1)
    num_exercises: int = Field(ge=1, le=20)
    total_points: int = Field(ge=1, le=1000)
    per_exercise_points: list[int]
    export_format: ExportFormat
    extra_instructions: Optional[str] = None

    @field_validator("per_exercise_points")
    @classmethod
    def _positive(cls, v: list[int]) -> list[int]:
        if any(p < 0 for p in v):
            raise ValueError("per_exercise_points must be non-negative")
        return v

    def validate_consistency(self) -> None:
        if len(self.per_exercise_points) != self.num_exercises:
            raise ValueError(
                "per_exercise_points length must equal num_exercises"
            )
        if sum(self.per_exercise_points) != self.total_points:
            raise ValueError("per_exercise_points must sum to total_points")


class RegisterDocumentRequest(BaseModel):
    filename: str
    storage_path: str
    mime_type: Optional[str] = None
    size_bytes: Optional[int] = None


class DocumentOut(BaseModel):
    id: str
    user_id: str
    filename: str
    storage_path: str
    mime_type: Optional[str]
    size_bytes: Optional[int]
    created_at: str


class Exercise(BaseModel):
    type: QuestionType
    question: str
    choices: Optional[list[str]] = None
    answer: str
    explanation: Optional[str] = None
    points: int


class ExamContent(BaseModel):
    title: str
    total_points: int
    exercises: list[Exercise]


class GenerateExamRequest(BaseModel):
    document_id: str
    spec: ExamSpec


class ExamOut(BaseModel):
    id: str
    user_id: str
    document_id: Optional[str]
    title: Optional[str]
    spec: ExamSpec | dict
    content: Optional[ExamContent | dict]
    export_format: Optional[ExportFormat]
    export_path: Optional[str]
    status: str
    created_at: str


class ChatPostRequest(BaseModel):
    content: str


class ChatMessageOut(BaseModel):
    id: str
    scope: Literal["document", "exam"]
    scope_id: str
    role: Literal["user", "assistant"]
    content: str
    created_at: str


class UsageOut(BaseModel):
    tokens_used: int
    tokens_limit: int
    remaining: int
    percent: float
    user_count: int
    total_limit: int
    usage_date: str
    resets_at: str
