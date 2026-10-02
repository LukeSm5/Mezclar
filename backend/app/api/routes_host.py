from backend.app.models.schemas import (
    ToggleAutoNamesRequest,
    CreateSessionRequest,
    SessionPlayerResponse,
    SessionResponse,
    StartGameRequest,
    CreateSessionRequest
)
from fastapi import APIRouter, HTTPException
from backend.app.sessions.registry import get_or_create_session, get_session
from backend.app.sessions import registry
from backend.app.api import SessionCode

from backend.app.websockets.connection_manager import (
    connection_manager,
)

router = APIRouter()

@router.post("/session/{session_id}/toggle-auto-names")
def toggle_auto_names(session_id: str, request: ToggleAutoNamesRequest) -> None:
    session = get_or_create_session(session_id)
    session.set_auto_generate(request.enabled)

@router.post("/session", response_model=SessionResponse)
def create_session(request: CreateSessionRequest | None = None) -> SessionResponse:
    try:
        session = registry.create_session(request)
    except RuntimeError as error:
        raise HTTPException(status_code=503, detail=str(error)) from error
    return get_session_info(session.session_id)

@router.get("/session/{session_id}", response_model=SessionResponse)
def get_session_info(session_id: SessionCode) -> SessionResponse:
    session = get_session(session_id)

    if not session:
        raise HTTPException(
            status_code=404,
            detail="Session not found",
        )

    players = [SessionPlayerResponse(player_id=player.player_id, name=player.name, ready=player.ready) for player in session.players.values()]

    return SessionResponse(
        session_id=session.session_id, player_count=len(players), players=players,
        game_started=session.game_started, host_name=session.host_name,
        settings=session.settings, auto_generate_names=session.auto_generate_names,
        game_id=session.game_id, minimum_players=session.minimum_players,
        maximum_players=session.maximum_players,
    )

@router.post("/session/{session_id}/start")
async def start_game(session_id: str, request: StartGameRequest,) -> dict:
    session = get_session(session_id)

    if not session:
        raise HTTPException(
            status_code=404,
            detail="Session not found",
        )

    if session.game_started:
        raise HTTPException(
            status_code=409,
            detail="Game has already started.",
        )

    try:
        session.configure_game(
            game_id=request.game_id,
            minimum_players=request.minimum_players,
            maximum_players=request.maximum_players,
        )

        session.start_game()

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )

    await connection_manager.broadcast_to_session(
        session_id=session.session_id,
        message={
            "type": "game_started",
            "session_id": session.session_id,
            "game_id": session.game_id,
        },
    )

    return {
        "session_id": session.session_id,
        "game_id": session.game_id,
        "game_started": session.game_started,
        "player_count": len(session.players),
    }