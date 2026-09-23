"""Routes used by game hosts."""

from fastapi import APIRouter, HTTPException

from backend.app.models.schemas import (
    CreateSessionRequest,
    GameSession,
    ToggleAutoNamesRequest,
)
from backend.app.sessions import session as session_store
from backend.app.sessions.registry import get_or_create_session

router = APIRouter()


@router.post("/session/{session_id}/toggle-auto-names")
def toggle_auto_names(session_id: str, request: ToggleAutoNamesRequest) -> None:
    session = get_or_create_session(session_id)
    session.set_auto_generate(request.enabled)


@router.post("/sessions", status_code=201, response_model=GameSession)
def create_session(request: CreateSessionRequest) -> GameSession:
    try:
        return session_store.create_session(request)
    except RuntimeError as error:
        raise HTTPException(status_code=503, detail=str(error)) from error
