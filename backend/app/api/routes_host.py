from backend.app.models.schemas import ToggleAutoNamesRequest
from fastapi import APIRouter
from backend.app.sessions.registry import get_or_create_session
router = APIRouter()

@router.post("/session/{session_id}/toggle-auto-names")
def toggle_auto_names(session_id: str, request: ToggleAutoNamesRequest) -> None:
    session = get_or_create_session(session_id)
    session.set_auto_generate(request.enabled)
