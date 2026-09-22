from backend.app.models.schemas import (
    GenerateNameResponse, 
    RegenerateNameRequest,
    JoinSessionRequest,
    JoinSessionResponse,
)

from fastapi import APIRouter, HTTPException
from backend.app.sessions.registry import get_or_create_session, get_session
from backend.app.naming.generator import generate_unique_name

router = APIRouter()

@router.post("/session/{session_id}/regenerate-name")
def regenerate_name(session_id: str, request: RegenerateNameRequest) -> GenerateNameResponse:
    session = get_or_create_session(session_id)
    player = session.get_player(request.player_id)
    if not player:
        raise ValueError("Player not found")
    session.remove_used_name(player.name)
    name = generate_unique_name(session.used_names)
    session.add_used_name(name)
    player.name = name
    return GenerateNameResponse(name=name)

@router.post("/session/{session_id}/join", response_model=JoinSessionResponse)
def join_session(session_id: str, request: JoinSessionRequest) -> JoinSessionResponse:
    session = get_session(session_id)

    if not session:
        raise HTTPException(
            status_code=404,
            detail="Session not found",
        )

    if request.player_id in session.players:
        player = session.get_player(request.player_id)

        return JoinSessionResponse(player_id=player.player_id, name=player.name, session_id=session_id)

    try:
        player = session.add_player(player_id=request.player_id, requested_name=request.name,)
    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )

    return JoinSessionResponse(player_id=player.player_id, name=player.name, session_id=session_id)