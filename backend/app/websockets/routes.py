from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from backend.app.websockets.handlers import handle_join

router = APIRouter()

@router.websocket("/ws/{session_id}/{player_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str, player_id: str):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_json()

            if data["type"] == "join":
                await handle_join(websocket, session_id, player_id, data.get("requested_name"))
    except WebSocketDisconnect:
        print(f"Player {player_id} disconnected from session {session_id}")