"""Apply Supabase SQL migrations using DATABASE_URL from backend/.env."""

from __future__ import annotations

import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MIGRATIONS_DIR = ROOT / "supabase" / "migrations"
# Apply only the security lockdown migrations (idempotent / additive).
# Do not re-run the full 0001–0008 history against an already-provisioned DB.
MIGRATIONS = [
    MIGRATIONS_DIR / "0009_lock_down_client_mutations.sql",
    MIGRATIONS_DIR / "0010_admin_role.sql",
]


def load_database_url() -> str:
    env_path = ROOT / "backend" / ".env"
    if env_path.exists():
        for line in env_path.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, value = line.split("=", 1)
            if key.strip() == "DATABASE_URL":
                return value.strip().strip('"').strip("'")
    return os.environ.get("DATABASE_URL", "").strip()


def main() -> int:
    database_url = load_database_url()
    if not database_url:
        print(
            "DATABASE_URL is not set.\n"
            "Add it to backend/.env from Supabase Project Settings -> Database -> "
            "Connection string (URI, session mode).\n"
            "Example:\n"
            "DATABASE_URL=postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres"
        )
        return 1

    if not MIGRATIONS:
        print(f"No SQL files found in {MIGRATIONS_DIR}")
        return 1

    try:
        import psycopg2
    except ImportError:
        print("Installing psycopg2-binary…")
        import subprocess

        subprocess.check_call(
            [sys.executable, "-m", "pip", "install", "psycopg2-binary"],
        )
        import psycopg2

    conn = psycopg2.connect(database_url)
    conn.autocommit = True

    try:
        with conn.cursor() as cur:
            for path in MIGRATIONS:
                sql = path.read_text(encoding="utf-8")
                print(f"Applying {path.name}…")
                cur.execute(sql)
                print("  OK")
    finally:
        conn.close()

    print("All migrations applied.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
