"""Validation rules of the exam spec, including the Tunisian school context."""
import pytest
from pydantic import ValidationError

from app.models.schemas import ExamSpec
from app.routers.exams import _stored_spec

from .conftest import make_spec


class TestExamSpecCompatibility:
    def test_legacy_spec_without_new_fields_defaults_to_generic(self):
        spec = make_spec()
        assert spec.exam_type == "generic"
        assert spec.level is None
        assert spec.language == "en"

    def test_accepts_arabic_and_new_question_types(self):
        spec = make_spec(language="ar", question_types=["true_false", "short", "essay"])
        assert spec.language == "ar"

    def test_rejects_unknown_language_and_type(self):
        with pytest.raises(ValidationError):
            make_spec(language="de")
        with pytest.raises(ValidationError):
            make_spec(question_types=["riddle"])


class TestTunisianFields:
    def test_accepts_university_exam_type_and_level(self):
        spec = make_spec(exam_type="partiel", level="lic_2", language="fr")
        assert spec.exam_type == "partiel"
        assert spec.level == "lic_2"

    @pytest.mark.parametrize(
        "field, value",
        [
            ("exam_type", "quiz"),
            ("level", "10eme"),
            ("section", "medecine"),
            ("trimester", 4),
            ("trimester", 0),
            ("duration_minutes", 5),
            ("subject", "x" * 81),
            ("school_name", "x" * 121),
        ],
    )
    def test_rejects_out_of_range_context(self, field, value):
        with pytest.raises(ValidationError):
            make_spec(**{field: value})


class TestStoredSpec:
    def test_parses_valid_row_spec(self):
        raw = make_spec(language="fr", exam_type="dc").model_dump()
        spec = _stored_spec(raw)
        assert isinstance(spec, ExamSpec)
        assert spec.exam_type == "dc"

    def test_returns_none_for_missing_or_invalid(self):
        assert _stored_spec(None) is None
        assert _stored_spec("not a dict") is None
        assert _stored_spec({"difficulty": "medium"}) is None
