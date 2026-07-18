"""Validate storage object keys before service-role download/sign/delete.

The Supabase service role bypasses Storage RLS, so every path taken from the
database (or the client) must be proven to live under the caller's folder
before it is used.
"""
from __future__ import annotations

import posixpath


class InvalidStoragePath(ValueError):
    """Raised when a storage path is missing, malformed, or not owned by the user."""


def validate_user_storage_path(storage_path: str | None, user_id: str) -> str:
    """Return a storage path proven to live directly under the caller's folder.

    A plain ``startswith(f"{user_id}/")`` check is not enough: a traversal
    payload such as ``{user_id}/../{victim_id}/secret.pdf`` would otherwise let
    one user act on another user's object. Normalize the path and require its
    first segment to equal the caller's id with no ``..``, backslash, or
    absolute-path escapes.
    """
    raw = (storage_path or "").strip()
    if not raw or "\\" in raw or "\x00" in raw or raw.startswith("/"):
        raise InvalidStoragePath(
            "Storage path must belong to the authenticated user."
        )
    # posixpath.normpath collapses "a/../b" so traversal cannot be hidden.
    normalized = posixpath.normpath(raw)
    segments = normalized.split("/")
    if (
        normalized != raw
        or ".." in segments
        or segments[0] != user_id
        or len(segments) < 2
        or "" in segments
    ):
        raise InvalidStoragePath(
            "Storage path must belong to the authenticated user."
        )
    return normalized


def safe_user_storage_paths(
    paths: list[str | None], user_id: str
) -> list[str]:
    """Filter to paths that validate under ``user_id``; drop the rest."""
    out: list[str] = []
    for path in paths:
        try:
            out.append(validate_user_storage_path(path, user_id))
        except InvalidStoragePath:
            continue
    return out
