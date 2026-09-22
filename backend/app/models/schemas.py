from pydantic import BaseModel

class GenerateNameResponse(BaseModel):
    name: str

class RegenerateNameRequest(BaseModel):
    player_id: str

class ToggleAutoNamesRequest(BaseModel):
    enabled: bool

class JoinSessionRequest(BaseModel):
    player_id: str
    name: str | None = None

class JoinSessionResponse(BaseModel):
    player_id: str
    name: str
    session_id: str

class SessionPlayerResponse(BaseModel):
    player_id: str
    name: str

class SessionResponse(BaseModel):
    session_id: str
    player_count: int
    players: list[SessionPlayerResponse]
    game_started: bool

class StartGameRequest(BaseModel):
    game_id: str
    minimum_players: int
    maximum_players: int