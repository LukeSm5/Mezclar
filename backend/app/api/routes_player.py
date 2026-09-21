"""Routes used by players to find a session."""

from typing import Annotated

from fastapi import APIRouter, HTTPException, Path

from backend.app.models.schemas import GameSession
from backend.app.sessions import session as session_store

router = APIRouter(prefix="/sessions", tags=["sessions"])


@router.get("/{join_code}", response_model=GameSession)
def get_session(
    join_code: Annotated[str, Path(pattern=r"^[1-9][0-9]{5}$")],
) -> GameSession:
    session = session_store.get_session(join_code)

    if session is None:
        raise HTTPException(status_code=404, detail="Session not found.")

    return session
