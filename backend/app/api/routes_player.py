from backend.app.models.schemas import GenerateNameResponse, RegenerateNameRequest
from fastapi import APIRouter
from backend.app.sessions.registry import get_or_create_session
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