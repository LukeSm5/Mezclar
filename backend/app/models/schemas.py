"""Request and response models for game sessions."""

from pydantic import BaseModel, ConfigDict, Field, JsonValue, StrictBool


class GenerateNameResponse(BaseModel):
    name: str


class RegenerateNameRequest(BaseModel):
    player_id: str


class ToggleAutoNamesRequest(BaseModel):
    enabled: bool


class CreateSessionRequest(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")

    host_name: str = Field(default="Host", min_length=1)
    settings: dict[str, JsonValue] = Field(default_factory=dict)


class JoinSessionRequest(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")

    player_id: str = Field(min_length=1)
    name: str | None = Field(default=None, min_length=1)


class SessionPlayerResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    player_id: str
    name: str
    ready: bool


class JoinSessionResponse(SessionPlayerResponse):
    session_id: str


class UpdateReadyStatusRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    ready: StrictBool


class SessionResponse(BaseModel):
    session_id: str
    host_name: str
    settings: dict[str, JsonValue]
    player_count: int
    players: list[SessionPlayerResponse]
    game_started: bool
    auto_generate_names: bool
    game_id: str | None
    minimum_players: int | None
    maximum_players: int | None


class StartGameRequest(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")

    game_id: str = Field(min_length=1)
    minimum_players: int = Field(ge=1)
    maximum_players: int = Field(ge=1)
