"""Routes used by game hosts."""

from fastapi import APIRouter, HTTPException
from backend.app.api import SessionCode

from backend.app.models.schemas import (
    CreateSessionRequest,
    SessionPlayerResponse,
    SessionResponse,
    StartGameRequest,
    ToggleAutoNamesRequest,
)
from backend.app.sessions import registry
from backend.app.sessions.session import Session
from backend.app.websockets.connection_manager import connection_manager

router = APIRouter()


def session_response(session: Session) -> SessionResponse:
    return SessionResponse(
        session_id=session.session_id,
        host_name=session.host_name,
        settings=session.settings,
        player_count=len(session.players),
        players=[SessionPlayerResponse.model_validate(player) for player in session.players.values()],
        game_started=session.game_started,
        auto_generate_names=session.auto_generate_names,
        game_id=session.game_id,
        minimum_players=session.minimum_players,
        maximum_players=session.maximum_players,
    )


@router.post("/session/{session_id}/toggle-auto-names")
def toggle_auto_names(session_id: SessionCode, request: ToggleAutoNamesRequest) -> None:
    session = registry.get_session(session_id)
    if session is None:
        raise HTTPException(status_code=404, detail="Session not found")
    session.set_auto_generate(request.enabled)


@router.post("/session", response_model=SessionResponse)
def create_session(request: CreateSessionRequest | None = None) -> SessionResponse:
    try:
        return session_response(registry.create_session(request))
    except RuntimeError as error:
        raise HTTPException(status_code=503, detail=str(error)) from error


@router.get("/session/{session_id}", response_model=SessionResponse)
def get_session_info(session_id: SessionCode) -> SessionResponse:
    session = registry.get_session(session_id)
    if session is None:
        raise HTTPException(status_code=404, detail="Session not found")
    return session_response(session)


@router.post("/session/{session_id}/start", response_model=SessionResponse)
async def start_game(session_id: SessionCode, request: StartGameRequest) -> SessionResponse:
    session = registry.get_session(session_id)
    if session is None:
        raise HTTPException(status_code=404, detail="Session not found")
    if session.game_started:
        raise HTTPException(status_code=409, detail="Game has already started.")
    try:
        session.configure_game(request.game_id, request.minimum_players, request.maximum_players)
        session.start_game()
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error
    await connection_manager.broadcast_to_session(
        session_id=session.session_id,
        message={"type": "game_started", "session_id": session.session_id, "game_id": session.game_id},
    )
    return session_response(session)
