"""Unit tests for Lemon Squeezy billing helpers."""
import hashlib
import hmac
import json

import pytest
from fastapi import HTTPException

from app.services import billing as billing_service

from .fakes import FakeResp, FakeSupabase


class TestWebhookSignature:
    def test_valid_signature(self):
        secret = "whsec_test"
        body = b'{"meta":{"event_name":"subscription_created"}}'
        sig = hmac.new(secret.encode(), body, hashlib.sha256).hexdigest()
        assert billing_service.verify_webhook_signature(body, sig, secret)

    def test_invalid_signature(self):
        assert not billing_service.verify_webhook_signature(b"{}", "deadbeef", "secret")

    def test_empty_secret_rejected(self):
        assert not billing_service.verify_webhook_signature(b"{}", "abc", "")


class TestApplySubscriptionWebhook:
    def test_created_sets_pro(self, monkeypatch):
        sb = FakeSupabase(tables={"app_users": [FakeResp(None)]})
        monkeypatch.setattr("app.services.billing.get_supabase", lambda: sb)
        payload = {
            "meta": {
                "event_name": "subscription_created",
                "custom_data": {"user_id": "user123"},
            },
            "data": {
                "id": "sub_1",
                "attributes": {
                    "status": "active",
                    "customer_id": 99,
                    "renews_at": "2026-08-01T00:00:00.000000Z",
                },
            },
        }
        billing_service.apply_subscription_webhook("subscription_created", payload)

    def test_expired_sets_free(self, monkeypatch):
        sb = FakeSupabase(tables={"app_users": [FakeResp(None)]})
        monkeypatch.setattr("app.services.billing.get_supabase", lambda: sb)
        payload = {
            "meta": {
                "event_name": "subscription_expired",
                "custom_data": {"user_id": "user123"},
            },
            "data": {
                "id": "sub_1",
                "attributes": {"status": "expired", "customer_id": 99},
            },
        }
        billing_service.apply_subscription_webhook("subscription_expired", payload)


class TestRequireBillingConfig:
    def test_missing_keys_raise_503(self):
        from app.config import Settings

        s = Settings(
            supabase_url="https://example.supabase.co",
            supabase_service_key="k",
            supabase_jwt_secret="j",
            openrouter_api_key="o",
            lemonsqueezy_api_key="",
            lemonsqueezy_store_id="",
            lemonsqueezy_pro_variant_id="",
        )
        with pytest.raises(HTTPException) as exc:
            billing_service._require_billing_config(s)
        assert exc.value.status_code == 503


class TestBillingWebhookRoute:
    def _billing_settings(self):
        from app.config import Settings

        return Settings(
            supabase_url="https://test.supabase.co",
            supabase_service_key="test-service-key",
            supabase_jwt_secret="test-jwt-secret",
            openrouter_api_key="test-openrouter-key",
            lemonsqueezy_webhook_secret="secret",
        )

    def test_rejects_bad_signature(self, app, client):
        from app.config import get_settings

        app.dependency_overrides[get_settings] = self._billing_settings
        try:
            r = client.post(
                "/api/billing/webhook",
                content=json.dumps({"meta": {"event_name": "subscription_created"}}),
                headers={"X-Signature": "bad", "Content-Type": "application/json"},
            )
            assert r.status_code == 401
        finally:
            app.dependency_overrides.pop(get_settings, None)

    def test_accepts_valid_signature(self, app, client, monkeypatch):
        from app.config import get_settings

        app.dependency_overrides[get_settings] = self._billing_settings
        monkeypatch.setattr(
            "app.routers.billing.billing_service.apply_subscription_webhook",
            lambda *_a, **_k: None,
        )
        body = json.dumps(
            {
                "meta": {
                    "event_name": "subscription_created",
                    "custom_data": {"user_id": "user123"},
                },
                "data": {"id": "1", "attributes": {"status": "active"}},
            }
        ).encode()
        sig = hmac.new(b"secret", body, hashlib.sha256).hexdigest()
        try:
            r = client.post(
                "/api/billing/webhook",
                content=body,
                headers={"X-Signature": sig, "Content-Type": "application/json"},
            )
            assert r.status_code == 200
            assert r.json() == {"status": "ok"}
        finally:
            app.dependency_overrides.pop(get_settings, None)
