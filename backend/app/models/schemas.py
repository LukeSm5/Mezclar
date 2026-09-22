from pydantic import BaseModel

class GenerateNameResponse(BaseModel):
    name: str

class RegenerateNameRequest(BaseModel):
    session_id: str
    player_id: str

class ToggleAutoNamesRequest(BaseModel):
    session_id: str
    enabled: bool