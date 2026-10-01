from backend.app.models.schemas import (
    GenerateNameResponse, 
    RegenerateNameRequest,
    JoinSessionRequest,
    JoinSessionResponse,
    SubmitNameRequest
)

from fastapi import APIRouter, HTTPException
from backend.app.sessions.registry import get_or_create_session, get_session
from backend.app.naming.generator import generate_unique_name

router = APIRouter()

@router.post("/session/{session_id}/regenerate-name")
def regenerate_name(session_id: str, request: RegenerateNameRequest) -> GenerateNameResponse:
    session = get_or_create_session(session_id)
    try:
        name = session.regenerate_name(request.player_id)
    except ValueError as e:
        raise ValueError(str(e))
    return GenerateNameResponse(name=name)

@router.post("/session/{session_id}/submit-name")
def submit_name(session_id: str, request: SubmitNameRequest) -> GenerateNameResponse:
    session = get_or_create_session(session_id)
    try:
        name = session.submit_name(request.player_id, request.requested_name)
    except ValueError as e:
        raise ValueError(str(e))
    return GenerateNameResponse(name=name)

@router.post("/session/{session_id}/join", response_model=JoinSessionResponse)
def join_session(
    session_id: str,
    request: JoinSessionRequest
) -> JoinSessionResponse:
    session = get_session(session_id)

    if not session:
        raise HTTPException(
            status_code=404,
            detail="Session not found",
        )

    if session.game_id is None:
        raise HTTPException(
            status_code=400,
            detail="Game has not been configured for this session.",
        )

    if request.player_id in session.players:
        player = session.get_player(request.player_id)

        return JoinSessionResponse(
            player_id=player.player_id,
            name=player.name,
            session_id=session_id,
            game_id=session.game_id,
        )

    try:
        player = session.add_player(
            player_id=request.player_id,
            requested_name=request.name,
        )
    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )

    return JoinSessionResponse(
        player_id=player.player_id,
        name=player.name,
        session_id=session_id,
        game_id=session.game_id,
    )