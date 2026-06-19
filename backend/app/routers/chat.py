from typing import Literal

from fastapi import APIRouter, Depends, HTTPException

from ..auth import CurrentUser, get_current_user
from ..db import get_supabase
from ..models.schemas import ChatMessageOut, ChatPostRequest
from ..services import llm
from ..services import usage as usage_service


router = APIRouter(prefix="/api/chat", tags=["chat"])

Scope = Literal["document", "exam"]


def _load_history(user_id: str, scope: Scope, scope_id: str) -> list[dict]:
    sb = get_supabase()
    rows = (
        sb.table("chat_messages")
        .select("*")
        .eq("user_id", user_id)
        .eq("scope", scope)
        .eq("scope_id", scope_id)
        .order("created_at")
        .execute()
    )
    return rows.data or []


def _verify_scope_access(user_id: str, scope: Scope, scope_id: str) -> str | None:
    """Returns the related document's extracted_text for grounding, or None for exam scope."""
    sb = get_supabase()
    if scope == "document":
        row = (
            sb.table("documents")
            .select("extracted_text")
            .eq("id", scope_id)
            .eq("user_id", user_id)
            .maybe_single()
            .execute()
        )
        if not row.data:
            raise HTTPException(status_code=404, detail="Document not found")
        return row.data.get("extracted_text") or ""
    # exam scope — also fetch related document for grounding
    row = (
        sb.table("exams")
        .select("document_id")
        .eq("id", scope_id)
        .eq("user_id", user_id)
        .maybe_single()
        .execute()
    )
    if not row.data:
        raise HTTPException(status_code=404, detail="Exam not found")
    if row.data.get("document_id"):
        doc = (
            sb.table("documents")
            .select("extracted_text")
            .eq("id", row.data["document_id"])
            .eq("user_id", user_id)
            .maybe_single()
            .execute()
        )
        if doc.data:
            return doc.data.get("extracted_text") or ""
    return None


@router.get("/{scope}/{scope_id}", response_model=list[ChatMessageOut])
def list_messages(
    scope: Scope,
    scope_id: str,
    user: CurrentUser = Depends(get_current_user),
) -> list[ChatMessageOut]:
    _verify_scope_access(user.id, scope, scope_id)
    rows = _load_history(user.id, scope, scope_id)
    return [ChatMessageOut.model_validate(r) for r in rows]


@router.post("/{scope}/{scope_id}", response_model=list[ChatMessageOut])
async def post_message(
    scope: Scope,
    scope_id: str,
    body: ChatPostRequest,
    user: CurrentUser = Depends(get_current_user),
) -> list[ChatMessageOut]:
    course_text = _verify_scope_access(user.id, scope, scope_id)
    sb = get_supabase()

    # Save user message
    sb.table("chat_messages").insert(
        {
            "user_id": user.id,
            "scope": scope,
            "scope_id": scope_id,
            "role": "user",
            "content": body.content,
        }
    ).execute()

    # Build LLM context
    history = _load_history(user.id, scope, scope_id)
    if scope == "document":
        system = (
            "You are a helpful tutor answering questions about a course document. "
            "Be concise, accurate, and ground your answers in the provided content. "
            "If the answer is not in the content, say so."
        )
    else:
        system = (
            "You are an assistant helping a teacher plan an exam from a course "
            "document. Acknowledge their guidance and ask brief clarifying "
            "questions if useful. Keep responses short."
        )
    messages: list[dict[str, str]] = [{"role": "system", "content": system}]
    if course_text:
        snippet = course_text[:8000]
        messages.append(
            {
                "role": "system",
                "content": f"Course content (may be truncated):\n\"\"\"\n{snippet}\n\"\"\"",
            }
        )
    for m in history:
        messages.append({"role": m["role"], "content": m["content"]})

    usage_service.ensure_within_limit(user.id)

    try:
        result = await llm.chat(messages, temperature=0.5, max_tokens=800)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"LLM error: {e}") from e

    usage_service.record_usage(user.id, result.total_tokens)
    reply = result.content.strip()

    sb.table("chat_messages").insert(
        {
            "user_id": user.id,
            "scope": scope,
            "scope_id": scope_id,
            "role": "assistant",
            "content": reply,
        }
    ).execute()

    return [
        ChatMessageOut.model_validate(r)
        for r in _load_history(user.id, scope, scope_id)
    ]
