"""Routes used by players to find a session and manage names."""

from typing import Annotated

from fastapi import APIRouter, HTTPException, Path

from backend.app.models.schemas import (
    GameSession,
    GenerateNameResponse,
    JoinSessionRequest,
    RegenerateNameRequest,
)
from backend.app.sessions import session as session_store
from backend.app.sessions.registry import get_or_create_session

router = APIRouter()


@router.post("/session/{session_id}/regenerate-name")
def regenerate_name(session_id: str, request: RegenerateNameRequest) -> GenerateNameResponse:
    session = get_or_create_session(session_id)
    try:
        name = session.regenerate_name(request.player_id)
    except ValueError as error:
        raise ValueError(str(error)) from error
    return GenerateNameResponse(name=name)


@router.get("/sessions/{join_code}", response_model=GameSession)
def get_session(
    join_code: Annotated[str, Path(pattern=r"^[1-9][0-9]{5}$")],
) -> GameSession:
    session = session_store.get_session(join_code)
    if session is None:
        raise HTTPException(status_code=404, detail="Session not found.")
    return session


@router.post("/sessions/{join_code}/players", status_code=201, response_model=GameSession)
def join_session(
    join_code: Annotated[str, Path(pattern=r"^[1-9][0-9]{5}$")],
    request: JoinSessionRequest,
) -> GameSession:
    session = session_store.join_session(join_code, request.display_name)
    if session is None:
        raise HTTPException(status_code=404, detail="Session not found.")
    return session
