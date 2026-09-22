from backend.app.sessions.session import Session

async def handle_join(websocket, session: Session, player_id: str, requested_name: str | None):
    pass

async def handle_regenerate_name(websocket, session: Session, player_id: str):
    pass