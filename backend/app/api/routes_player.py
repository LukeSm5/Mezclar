"""Routes used by players to join, manage names, and mark themselves ready."""

from fastapi import APIRouter, HTTPException
from backend.app.api import SessionCode

from backend.app.models.schemas import (
    GenerateNameResponse,
    JoinSessionRequest,
    JoinSessionResponse,
    RegenerateNameRequest,
    SessionPlayerResponse,
    UpdateReadyStatusRequest,
)
from backend.app.sessions.registry import get_session

router = APIRouter()


@router.post("/session/{session_id}/regenerate-name", response_model=GenerateNameResponse)
def regenerate_name(session_id: SessionCode, request: RegenerateNameRequest) -> GenerateNameResponse:
    session = get_session(session_id)
    if session is None:
        raise HTTPException(status_code=404, detail="Session not found")
    if session.get_player(request.player_id) is None:
        raise HTTPException(status_code=404, detail="Player not found")
    try:
        name = session.regenerate_name(request.player_id)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error
    return GenerateNameResponse(name=name)


@router.post("/session/{session_id}/join", response_model=JoinSessionResponse)
def join_session(session_id: SessionCode, request: JoinSessionRequest) -> JoinSessionResponse:
    session = get_session(session_id)
    if session is None:
        raise HTTPException(status_code=404, detail="Session not found")
    try:
        player = session.add_player(request.player_id, request.name)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error
    return JoinSessionResponse(session_id=session_id, **SessionPlayerResponse.model_validate(player).model_dump())


@router.patch("/session/{session_id}/players/{player_id}/ready", response_model=SessionPlayerResponse)
def update_ready_status(
    session_id: SessionCode, player_id: str, request: UpdateReadyStatusRequest,
) -> SessionPlayerResponse:
    session = get_session(session_id)
    if session is None:
        raise HTTPException(status_code=404, detail="Session not found")
    try:
        player = session.set_player_ready(player_id, request.ready)
    except ValueError as error:
        raise HTTPException(status_code=404, detail=str(error)) from error
    return SessionPlayerResponse.model_validate(player)
