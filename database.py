import json
import sqlite3
from pathlib import Path
from datetime import datetime, timezone

from config import settings

DB_PATH = Path(settings.database_path).expanduser()
if not DB_PATH.is_absolute():
    DB_PATH = Path(__file__).resolve().parent / DB_PATH


def _connect():
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(DB_PATH, timeout=15)
    connection.row_factory = sqlite3.Row
    return connection


def init_db():
    with _connect() as connection:
        connection.execute("""
            CREATE TABLE IF NOT EXISTS search_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                query TEXT NOT NULL,
                total INTEGER NOT NULL,
                mode TEXT NOT NULL,
                results_json TEXT NOT NULL,
                created_at TEXT NOT NULL
            )
        """)
        connection.execute(
            "CREATE INDEX IF NOT EXISTS idx_search_history_created_at "
            "ON search_history(created_at DESC)"
        )


def save_search(query: str, total: int, mode: str, items: list[dict]):
    created_at = datetime.now(timezone.utc).isoformat()
    with _connect() as connection:
        connection.execute(
            """INSERT INTO search_history
               (query, total, mode, results_json, created_at)
               VALUES (?, ?, ?, ?, ?)""",
            (query, total, mode, json.dumps(items, ensure_ascii=False), created_at),
        )


def get_recent_searches(limit: int = 20):
    with _connect() as connection:
        rows = connection.execute(
            """SELECT id, query, total, mode, created_at
               FROM search_history
               ORDER BY id DESC LIMIT ?""",
            (limit,),
        ).fetchall()
    return [dict(row) for row in rows]
