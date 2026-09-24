from pydantic import BaseModel

class GenerateNameResponse(BaseModel):
    name: str

class RegenerateNameRequest(BaseModel):
    player_id: str

class ToggleAutoNamesRequest(BaseModel):
    enabled: bool

class SubmitNameRequest(BaseModel):
    player_id: str
    requested_name: str