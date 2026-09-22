from backend.app.models.schemas import (
    ToggleAutoNamesRequest,
    SessionPlayerResponse,
    SessionResponse,
    StartGameRequest,
)
from fastapi import APIRouter, HTTPException
from backend.app.sessions.registry import get_or_create_session, session_exists, get_session
from backend.app.sessions.code_generator import generate_session_code

from backend.app.websockets.connection_manager import (
    connection_manager,
)

router = APIRouter()

@router.post("/session/{session_id}/toggle-auto-names")
def toggle_auto_names(session_id: str, request: ToggleAutoNamesRequest) -> None:
    session = get_or_create_session(session_id)
    session.set_auto_generate(request.enabled)

@router.post("/session")
def create_session() -> dict[str, str]:
    while True:
        session_id = generate_session_code()

        if not session_exists(session_id):
            break

    get_or_create_session(session_id)

    return {
        "session_id": session_id
    }

@router.get("/session/{session_id}", response_model=SessionResponse)
def get_session_info(session_id: str) -> SessionResponse:
    session = get_session(session_id)

    if not session:
        raise HTTPException(
            status_code=404,
            detail="Session not found",
        )

    players = [SessionPlayerResponse(player_id=player.player_id, name=player.name) for player in session.players.values()]

    return SessionResponse(session_id=session.session_id, player_count=len(players), players=players, game_started=False)

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