from dataclasses import dataclass
from datetime import date, datetime, timedelta, timezone

from fastapi import HTTPException

from ..config import get_settings
from ..db import get_supabase


@dataclass(frozen=True)
class UsageSnapshot:
    tokens_used: int
    tokens_limit: int
    user_count: int
    total_limit: int
    usage_date: date
    resets_at: datetime

    @property
    def percent(self) -> float:
        if self.tokens_limit <= 0:
            return 100.0
        return min(100.0, (self.tokens_used / self.tokens_limit) * 100.0)

    @property
    def remaining(self) -> int:
        return max(0, self.tokens_limit - self.tokens_used)


def _today_utc() -> date:
    return datetime.now(timezone.utc).date()


def _resets_at_utc(usage_date: date) -> datetime:
    return datetime.combine(
        usage_date + timedelta(days=1),
        datetime.min.time(),
        tzinfo=timezone.utc,
    )


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def register_user(user_id: str) -> None:
    sb = get_supabase()
    sb.table("app_users").upsert({"user_id": user_id}, on_conflict="user_id").execute()


def count_users() -> int:
    sb = get_supabase()
    rows = sb.table("app_users").select("user_id", count="exact").execute()
    return max(rows.count or 0, 1)


def per_user_limit() -> int:
    total = get_settings().openrouter_token_limit
    return max(total // count_users(), 1)


def _get_or_create_daily_row(user_id: str, usage_date: date) -> dict:
    sb = get_supabase()
    date_str = usage_date.isoformat()
    existing = (
        sb.table("user_daily_usage")
        .select("*")
        .eq("user_id", user_id)
        .eq("usage_date", date_str)
        .maybe_single()
        .execute()
    )
    if existing and existing.data:
        return existing.data

    inserted = (
        sb.table("user_daily_usage")
        .insert(
            {
                "user_id": user_id,
                "usage_date": date_str,
                "tokens_used": 0,
            }
        )
        .execute()
    )
    if inserted.data:
        return inserted.data[0]

    retry = (
        sb.table("user_daily_usage")
        .select("*")
        .eq("user_id", user_id)
        .eq("usage_date", date_str)
        .maybe_single()
        .execute()
    )
    if not retry or not retry.data:
        raise RuntimeError("Could not initialize daily usage row")
    return retry.data


def get_usage(user_id: str) -> UsageSnapshot:
    register_user(user_id)
    usage_date = _today_utc()
    row = _get_or_create_daily_row(user_id, usage_date)
    limit = per_user_limit()
    return UsageSnapshot(
        tokens_used=int(row.get("tokens_used") or 0),
        tokens_limit=limit,
        user_count=count_users(),
        total_limit=get_settings().openrouter_token_limit,
        usage_date=usage_date,
        resets_at=_resets_at_utc(usage_date),
    )


def ensure_within_limit(user_id: str) -> UsageSnapshot:
    usage = get_usage(user_id)
    if usage.tokens_used >= usage.tokens_limit:
        raise HTTPException(
            status_code=429,
            detail=(
                f"Daily token limit reached ({usage.tokens_used:,} / "
                f"{usage.tokens_limit:,}). Your quota resets at midnight UTC."
            ),
        )
    return usage


def record_usage(user_id: str, tokens: int) -> UsageSnapshot:
    if tokens <= 0:
        return get_usage(user_id)

    register_user(user_id)
    usage_date = _today_utc()
    row = _get_or_create_daily_row(user_id, usage_date)
    new_total = int(row.get("tokens_used") or 0) + tokens

    sb = get_supabase()
    sb.table("user_daily_usage").update(
        {"tokens_used": new_total, "updated_at": _now_iso()}
    ).eq("user_id", user_id).eq("usage_date", usage_date.isoformat()).execute()

    return get_usage(user_id)
