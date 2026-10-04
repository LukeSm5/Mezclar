from backend.app.models.schemas import (
    GenerateNameResponse, 
    RegenerateNameRequest,
    JoinSessionRequest,
    JoinSessionResponse,
    SubmitNameRequest,
    UpdateReadyStatusRequest,
    SessionPlayerResponse,
    KickPlayerRequest
)

from fastapi import APIRouter, HTTPException
from backend.app.sessions.registry import get_or_create_session, get_session
from backend.app.naming.generator import generate_unique_name
from backend.app.websockets.connection_manager import connection_manager

router = APIRouter()

@router.post("/session/{session_id}/regenerate-name")
def regenerate_name(session_id: str, request: RegenerateNameRequest) -> GenerateNameResponse:
    session = get_or_create_session(session_id)
    try:
        name = session.regenerate_name(request.player_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return GenerateNameResponse(name=name)

@router.post("/session/{session_id}/submit-name")
def submit_name(session_id: str, request: SubmitNameRequest) -> GenerateNameResponse:
    session = get_or_create_session(session_id)
    try:
        name = session.submit_name(request.player_id, request.requested_name)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
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

    if request.player_id in session.players:
        player = session.get_player(request.player_id)

        return JoinSessionResponse(
            player_id=player.player_id,
            name=player.name,
            session_id=session_id, 
            ready=player.ready,
            hidden=player.hidden
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

    return JoinSessionResponse(player_id=player.player_id, name=player.name, session_id=session_id, ready=player.ready, hidden=player.hidden)

@router.patch("/session/{session_id}/players/{player_id}/ready", response_model=SessionPlayerResponse)
def update_ready_status(session_id: str, player_id: str, request: UpdateReadyStatusRequest) -> SessionPlayerResponse:
    session = get_session(session_id)
    if session is None:
        raise HTTPException(status_code=404, detail="Session not found")
    try:
        player = session.set_player_ready(player_id, request.ready)
    except ValueError as error:
        raise HTTPException(status_code=404, detail=str(error)) from error
    return SessionPlayerResponse(player_id=player.player_id, name=player.name, ready=player.ready, hidden=player.hidden)

@router.post("/session/{session_id}/kick")
async def kick_player(session_id: str, request: KickPlayerRequest):
    session = get_session(session_id)
    if session is None:
        raise HTTPException(status_code=404, detail="Session not found")
    try:
        session.kick_player(request.player_id)
    except ValueError as error:
        raise HTTPException(status_code=404, detail=str(error)) from error
    await connection_manager.send_to_player(
        session_id, request.player_id,
        {"type": "kicked", "session_id": session_id},
    )

    await connection_manager.disconnect_player(session_id, request.player_id)

    return {"status": "ok"}
