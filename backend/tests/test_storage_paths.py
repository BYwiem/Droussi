"""Unit tests for storage path ownership validation."""
import pytest

from app.services.storage_paths import (
    InvalidStoragePath,
    safe_user_storage_paths,
    validate_user_storage_path,
)


class TestValidateUserStoragePath:
    def test_accepts_owned_path(self):
        assert (
            validate_user_storage_path("user123/notes.pdf", "user123")
            == "user123/notes.pdf"
        )

    @pytest.mark.parametrize(
        "bad_path",
        [
            "someone-else/notes.pdf",
            "user123/../someone-else/secret.pdf",
            "/user123/notes.pdf",
            "user123\\notes.pdf",
            "user123",
            "user1234/notes.pdf",
            "",
            None,
        ],
    )
    def test_rejects_unsafe_paths(self, bad_path):
        with pytest.raises(InvalidStoragePath):
            validate_user_storage_path(bad_path, "user123")


class TestSafeUserStoragePaths:
    def test_filters_to_owned_paths(self):
        assert safe_user_storage_paths(
            ["user123/a.pdf", "victim/b.pdf", None, "user123/c.pdf"],
            "user123",
        ) == ["user123/a.pdf", "user123/c.pdf"]
