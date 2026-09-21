"""Routes used by game hosts."""

from fastapi import APIRouter

router = APIRouter(prefix="/sessions", tags=["sessions"])


@router.post("", status_code=501)
def create_session():
    """Placeholder for the host session-creation endpoint."""

    raise NotImplementedError("Session creation is not implemented yet")
