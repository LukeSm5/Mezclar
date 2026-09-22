from fastapi import APIRouter, WebSocket

from backend.app.sessions.registry import get_session
from backend.app.websockets.handlers import handle_join


router = APIRouter()


@router.websocket("/ws/session/{session_id}/player/{player_id}")
async def player_websocket(
    websocket: WebSocket,
    session_id: str,
    player_id: str,
) -> None:
    session = get_session(session_id)

    if session is None:
        await websocket.close(code=1008)
        return

    await handle_join(
        websocket=websocket,
        session=session,
        player_id=player_id,
        requested_name=None,
    )