from collections import defaultdict

from fastapi import WebSocket


class ConnectionManager:
    def __init__(self):
        self.active_connections: dict[
            str,
            dict[str, WebSocket],
        ] = defaultdict(dict)

    async def connect(
        self,
        session_id: str,
        player_id: str,
        websocket: WebSocket,
    ) -> None:
        await websocket.accept()

        self.active_connections[session_id][player_id] = websocket

    def disconnect(
        self,
        session_id: str,
        player_id: str,
    ) -> None:
        session_connections = self.active_connections.get(session_id)

        if not session_connections:
            return

        session_connections.pop(player_id, None)

        if not session_connections:
            self.active_connections.pop(session_id, None)

    async def send_to_player(
        self,
        session_id: str,
        player_id: str,
        message: dict,
    ) -> None:
        websocket = self.active_connections.get(
            session_id,
            {},
        ).get(player_id)

        if websocket is None:
            return

        await websocket.send_json(message)

    async def broadcast_to_session(
        self,
        session_id: str,
        message: dict,
    ) -> None:
        connections = self.active_connections.get(
            session_id,
            {},
        )

        disconnected_players: list[str] = []

        for player_id, websocket in connections.items():
            try:
                await websocket.send_json(message)
            except Exception:
                disconnected_players.append(player_id)

        for player_id in disconnected_players:
            self.disconnect(session_id, player_id)


connection_manager = ConnectionManager()