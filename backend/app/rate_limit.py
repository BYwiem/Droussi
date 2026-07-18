"""Shared SlowAPI limiter.

Render terminates TLS at a proxy, so ``request.client.host`` is the proxy IP.
We derive the client key from the *right-most* ``X-Forwarded-For`` entry when
present (the hop appended by the trusted proxy), falling back to the socket
peer. Using the left-most entry would let clients spoof the key and bypass
limits. Storage is in-process memory, which is adequate for a single free-tier
instance; move to Redis if the API is scaled to multiple instances.
"""
import os

from slowapi import Limiter
from slowapi.util import get_remote_address
from starlette.requests import Request


def client_key(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        # Right-most hop is added by the reverse proxy; left-most is client-spoofable.
        hops = [h.strip() for h in forwarded.split(",") if h.strip()]
        if hops:
            return hops[-1]
    return get_remote_address(request)


# Allow tests (and local debugging) to turn limiting off so a fast burst of
# requests from one key doesn't produce spurious 429s.
_enabled = os.environ.get("RATE_LIMIT_ENABLED", "true").lower() != "false"

limiter = Limiter(
    key_func=client_key,
    default_limits=["120/minute"],
    enabled=_enabled,
)
