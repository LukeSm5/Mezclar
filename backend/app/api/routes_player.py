"""Routes used by players to find a session."""

from fastapi import APIRouter

router = APIRouter(prefix="/sessions", tags=["sessions"])


@router.get("/{join_code}", status_code=501)
def get_session(join_code: str):
    """Placeholder for looking up a session by join code."""

    raise NotImplementedError("Session lookup is not implemented yet")
