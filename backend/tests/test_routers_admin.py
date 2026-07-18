"""Router tests for /api/admin."""
from app.auth import CurrentUser, get_current_user
from app.services.llm import KeyStatus

TOTALS = {
    "user_count": 3,
    "exams_today": 5,
    "exams_total": 40,
    "cost_usd_today": 0.01,
    "cost_usd_total": 0.5,
}
RANKINGS = [
    {
        "user_id": "u1",
        "email": "u1@test.com",
        "exams_today": 2,
        "exams_total": 10,
        "cost_usd_today": 0.005,
        "cost_usd_total": 0.1,
    }
]


def _patch_services(monkeypatch, key_status):
    monkeypatch.setattr("app.routers.admin.usage_service.admin_totals", lambda: TOTALS)
    monkeypatch.setattr(
        "app.routers.admin.usage_service.admin_user_rankings", lambda: RANKINGS
    )

    async def fake_key_status():
        return key_status

    monkeypatch.setattr("app.routers.admin.llm.get_key_status", fake_key_status)


def test_non_admin_gets_403(client, monkeypatch):
    monkeypatch.setattr(
        "app.routers.admin.usage_service.user_is_admin", lambda *_a, **_k: False
    )
    r = client.get("/api/admin/overview")
    assert r.status_code == 403


def test_unverified_email_gets_403(app, client, monkeypatch):
    app.dependency_overrides[get_current_user] = lambda: CurrentUser(
        id="admin", email="admin@test.com", email_verified=False
    )
    monkeypatch.setattr(
        "app.routers.admin.usage_service.user_is_admin", lambda *_a, **_k: True
    )
    r = client.get("/api/admin/overview")
    assert r.status_code == 403


def test_overview_success_without_key_status(app, client, monkeypatch):
    app.dependency_overrides[get_current_user] = lambda: CurrentUser(
        id="admin", email="admin@test.com", email_verified=True
    )
    monkeypatch.setattr(
        "app.routers.admin.usage_service.user_is_admin", lambda *_a, **_k: True
    )
    _patch_services(monkeypatch, key_status=None)
    r = client.get("/api/admin/overview")
    assert r.status_code == 200
    body = r.json()
    assert body["user_count"] == 3
    assert body["account_usage_usd"] is None
    assert body["rankings"][0]["email"] == "u1@test.com"


def test_overview_includes_key_status(app, client, monkeypatch):
    app.dependency_overrides[get_current_user] = lambda: CurrentUser(
        id="admin", email="admin@test.com", email_verified=True
    )
    monkeypatch.setattr(
        "app.routers.admin.usage_service.user_is_admin", lambda *_a, **_k: True
    )
    _patch_services(
        monkeypatch,
        key_status=KeyStatus(
            usage_usd=1.2345678,
            limit_usd=5.0,
            limit_remaining_usd=3.76,
            is_free_tier=True,
        ),
    )
    r = client.get("/api/admin/overview")
    assert r.status_code == 200
    body = r.json()
    assert body["account_usage_usd"] == 1.234568
    assert body["account_is_free_tier"] is True
