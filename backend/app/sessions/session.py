"""Temporary session storage for a single backend process."""

from threading import Lock

from backend.app.models.schemas import CreateSessionRequest, GameSession
from backend.app.sessions.codes import generate_join_code

active_sessions: dict[str, GameSession] = {}
_session_lock = Lock()


def create_session(request: CreateSessionRequest) -> GameSession:
    # Sync routes run in threads; checking and reserving a code must be atomic.
    with _session_lock:
        for _ in range(10):
            join_code = generate_join_code()

            if join_code in active_sessions:
                continue

            session = GameSession(join_code=join_code, **request.model_dump())
            active_sessions[join_code] = session
            return session

    raise RuntimeError("Could not allocate a join code. Try again.")


def get_session(join_code: str) -> GameSession | None:
    return active_sessions.get(join_code)
