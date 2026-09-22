from backend.app.sessions.session import Session
from fastapi import WebSocket

async def handle_join(websocket: WebSocket, session: Session, player_id: str, requested_name: str | None):
    player = session.add_player(player_id, requested_name)
    await websocket.send_json({"type": "name_assigned", "name": player.name})