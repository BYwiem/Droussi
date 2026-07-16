"""Lemon Squeezy billing: checkout, customer portal, signed webhooks.

Lemon Squeezy is the Merchant of Record — it charges the customer, handles tax,
and fires webhooks we use to keep ``app_users.plan`` in sync.
"""
from __future__ import annotations

import hashlib
import hmac
import logging
from datetime import datetime, timezone
from typing import Any

import httpx
from fastapi import HTTPException

from ..config import Settings, get_settings
from ..db import get_supabase

logger = logging.getLogger(__name__)

LS_API = "https://api.lemonsqueezy.com/v1"

# Subscription statuses that grant Pro access.
_ACTIVE_STATUSES = frozenset({"active", "on_trial", "paused", "past_due"})


def _require_billing_config(settings: Settings | None = None) -> Settings:
    s = settings or get_settings()
    missing = [
        name
        for name, val in (
            ("LEMONSQUEEZY_API_KEY", s.lemonsqueezy_api_key),
            ("LEMONSQUEEZY_STORE_ID", s.lemonsqueezy_store_id),
            ("LEMONSQUEEZY_PRO_VARIANT_ID", s.lemonsqueezy_pro_variant_id),
        )
        if not val
    ]
    if missing:
        raise HTTPException(
            status_code=503,
            detail=(
                "Billing is not configured. Set "
                + ", ".join(missing)
                + " on the server."
            ),
        )
    return s


def _headers(api_key: str) -> dict[str, str]:
    return {
        "Authorization": f"Bearer {api_key}",
        "Accept": "application/vnd.api+json",
        "Content-Type": "application/vnd.api+json",
    }


def verify_webhook_signature(raw_body: bytes, signature: str, secret: str) -> bool:
    """HMAC-SHA256 hex digest of the raw body, compared in constant time."""
    if not secret or not signature:
        return False
    digest = hmac.new(secret.encode("utf-8"), raw_body, hashlib.sha256).hexdigest()
    return hmac.compare_digest(digest, signature)


async def create_checkout(
    *,
    user_id: str,
    email: str | None,
    settings: Settings | None = None,
) -> str:
    """Create a Lemon Squeezy checkout for the Pro variant; return its URL."""
    s = _require_billing_config(settings)
    payload = {
        "data": {
            "type": "checkouts",
            "attributes": {
                "checkout_data": {
                    "email": email or "",
                    "custom": {"user_id": user_id},
                },
                "product_options": {
                    "redirect_url": s.billing_success_url,
                },
                "checkout_options": {
                    "embed": False,
                },
            },
            "relationships": {
                "store": {
                    "data": {"type": "stores", "id": str(s.lemonsqueezy_store_id)}
                },
                "variant": {
                    "data": {
                        "type": "variants",
                        "id": str(s.lemonsqueezy_pro_variant_id),
                    }
                },
            },
        }
    }
    async with httpx.AsyncClient(timeout=20.0) as client:
        r = await client.post(
            f"{LS_API}/checkouts",
            headers=_headers(s.lemonsqueezy_api_key),
            json=payload,
        )
        if r.status_code >= 400:
            logger.error("Lemon Squeezy checkout failed: %s %s", r.status_code, r.text[:300])
            raise HTTPException(status_code=502, detail="Could not start checkout.")
        data = r.json()
    url = (data.get("data") or {}).get("attributes", {}).get("url")
    if not url:
        raise HTTPException(status_code=502, detail="Checkout URL missing from provider.")
    return url


async def get_customer_portal_url(
    *,
    user_id: str,
    settings: Settings | None = None,
) -> str:
    """Return the Lemon Squeezy customer-portal URL for the caller's subscription."""
    s = _require_billing_config(settings)
    sb = get_supabase()
    row = (
        sb.table("app_users")
        .select("provider_customer_id, subscription_id")
        .eq("user_id", user_id)
        .maybe_single()
        .execute()
    )
    customer_id = (row.data or {}).get("provider_customer_id") if row else None
    if not customer_id:
        raise HTTPException(
            status_code=404,
            detail="No billing account found. Upgrade to Pro first.",
        )

    async with httpx.AsyncClient(timeout=20.0) as client:
        r = await client.get(
            f"{LS_API}/customers/{customer_id}",
            headers=_headers(s.lemonsqueezy_api_key),
        )
        if r.status_code >= 400:
            logger.error("Lemon Squeezy customer fetch failed: %s", r.status_code)
            raise HTTPException(status_code=502, detail="Could not open billing portal.")
        data = r.json()
    urls = (data.get("data") or {}).get("attributes", {}).get("urls") or {}
    portal = urls.get("customer_portal")
    if not portal:
        raise HTTPException(status_code=502, detail="Billing portal URL unavailable.")
    return portal


def _parse_period_end(attrs: dict[str, Any]) -> str | None:
    raw = attrs.get("renews_at") or attrs.get("ends_at")
    if not raw:
        return None
    try:
        # Normalize to ISO; Lemon Squeezy sends e.g. 2024-01-01T00:00:00.000000Z
        dt = datetime.fromisoformat(str(raw).replace("Z", "+00:00"))
        return dt.astimezone(timezone.utc).isoformat()
    except ValueError:
        return str(raw)


def apply_subscription_webhook(event_name: str, payload: dict[str, Any]) -> None:
    """Map a Lemon Squeezy subscription webhook onto ``app_users``.

    Events handled:
      subscription_created / subscription_updated / subscription_resumed → pro
        (when status is active-ish)
      subscription_cancelled / subscription_expired / subscription_paused → free
        when status is no longer active (paused keeps pro briefly via past_due/paused)
    """
    meta = payload.get("meta") or {}
    custom = meta.get("custom_data") or {}
    data = payload.get("data") or {}
    attrs = data.get("attributes") or {}

    user_id = custom.get("user_id")
    if not user_id:
        # Fall back: look up by subscription id if we already stored it.
        subscription_id = str(data.get("id") or "")
        if not subscription_id:
            logger.warning("Webhook %s missing user_id and subscription id", event_name)
            return
        sb = get_supabase()
        existing = (
            sb.table("app_users")
            .select("user_id")
            .eq("subscription_id", subscription_id)
            .maybe_single()
            .execute()
        )
        if not existing or not existing.data:
            logger.warning("Webhook %s: unknown subscription %s", event_name, subscription_id)
            return
        user_id = existing.data["user_id"]

    status = str(attrs.get("status") or "").lower()
    subscription_id = str(data.get("id") or "") or None
    customer_id = attrs.get("customer_id")
    if customer_id is not None:
        customer_id = str(customer_id)

    # Downgrade on explicit terminal events; otherwise grant Pro while status is live.
    if event_name in (
        "subscription_expired",
        "subscription_cancelled",
    ) or status in ("expired", "cancelled", "unpaid"):
        plan = "free"
    elif status in _ACTIVE_STATUSES or event_name in (
        "subscription_created",
        "subscription_updated",
        "subscription_resumed",
        "subscription_unpaused",
    ):
        plan = "pro" if status in _ACTIVE_STATUSES or status == "" else "free"
        if status == "" and event_name.startswith("subscription_"):
            plan = "pro"
    else:
        plan = "free"

    # Paused / past_due: keep Pro so users aren't cut off mid-cycle for a failed card.
    if status in ("paused", "past_due", "on_trial", "active"):
        plan = "pro"

    update: dict[str, Any] = {
        "user_id": user_id,
        "plan": plan,
        "subscription_status": status or None,
        "subscription_id": subscription_id,
        "provider_customer_id": customer_id,
        "current_period_end": _parse_period_end(attrs),
    }

    sb = get_supabase()
    sb.table("app_users").upsert(update, on_conflict="user_id").execute()
    logger.info(
        "Billing webhook %s → user=%s plan=%s status=%s",
        event_name,
        user_id,
        plan,
        status,
    )


def get_billing_profile(user_id: str) -> dict[str, Any]:
    """Return plan + subscription fields for /api/me."""
    sb = get_supabase()
    row = (
        sb.table("app_users")
        .select(
            "plan, subscription_status, subscription_id, "
            "provider_customer_id, current_period_end"
        )
        .eq("user_id", user_id)
        .maybe_single()
        .execute()
    )
    data = (row.data if row else None) or {}
    return {
        "plan": (data.get("plan") or "free").lower(),
        "subscription_status": data.get("subscription_status"),
        "current_period_end": data.get("current_period_end"),
    }
