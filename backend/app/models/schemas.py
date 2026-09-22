from pydantic import BaseModel

class GenerateNameResponse(BaseModel):
    name: str

class RegenerateNameRequest(BaseModel):
    player_id: str

class ToggleAutoNamesRequest(BaseModel):
    enabled: bool