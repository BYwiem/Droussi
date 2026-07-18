"""Tests for proxy-aware rate-limit client key derivation."""
from starlette.requests import Request

from app.rate_limit import client_key


def _request(headers: dict[str, str], client_host: str = "10.0.0.1") -> Request:
    scope = {
        "type": "http",
        "asgi": {"version": "3.0"},
        "http_version": "1.1",
        "method": "GET",
        "scheme": "http",
        "path": "/",
        "raw_path": b"/",
        "query_string": b"",
        "headers": [(k.lower().encode(), v.encode()) for k, v in headers.items()],
        "client": (client_host, 12345),
        "server": ("test", 80),
    }
    return Request(scope)


class TestClientKey:
    def test_uses_rightmost_forwarded_hop(self):
        req = _request({"x-forwarded-for": "1.2.3.4, 10.0.0.5"})
        assert client_key(req) == "10.0.0.5"

    def test_falls_back_to_socket_peer(self):
        req = _request({})
        assert client_key(req) == "10.0.0.1"
