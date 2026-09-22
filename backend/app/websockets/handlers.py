from fastapi import WebSocket, WebSocketDisconnect

from backend.app.sessions.session import Session
from backend.app.websockets.connection_manager import (
    connection_manager,
)


async def handle_join(
    websocket: WebSocket,
    session: Session,
    player_id: str,
    requested_name: str | None,
) -> None:
    player = session.get_player(player_id)

    if player is None:
        await websocket.close(code=1008)
        return

    await connection_manager.connect(
        session_id=session.session_id,
        player_id=player_id,
        websocket=websocket,
    )

    await websocket.send_json(
        {
            "type": "connected",
            "session_id": session.session_id,
            "player_id": player.player_id,
            "name": player.name,
        }
    )

    try:
        while True:
            await websocket.receive_text()

    except WebSocketDisconnect:
        connection_manager.disconnect(
            session_id=session.session_id,
            player_id=player_id,
        )