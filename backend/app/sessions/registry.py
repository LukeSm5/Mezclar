from backend.app.sessions.session import Session

_sessions: dict[str, Session] = {}

def get_or_create_session(session_id: str) -> Session:
    if session_id not in _sessions:
        _sessions[session_id] = Session(session_id)
    return _sessions[session_id]