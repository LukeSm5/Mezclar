"""Routes used by game hosts."""

from fastapi import APIRouter, HTTPException

from backend.app.models.schemas import CreateSessionRequest, GameSession
from backend.app.sessions import session as session_store

router = APIRouter(prefix="/sessions", tags=["sessions"])


@router.post("", status_code=201, response_model=GameSession)
def create_session(request: CreateSessionRequest) -> GameSession:
    try:
        return session_store.create_session(request)
    except RuntimeError as error:
        raise HTTPException(status_code=503, detail=str(error)) from error
