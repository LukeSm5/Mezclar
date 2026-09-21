"""Request and response models for game sessions."""

from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, JsonValue


class CreateSessionRequest(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")

    host_name: str = Field(min_length=1)
    settings: dict[str, JsonValue] = Field(default_factory=dict)


class Player(BaseModel):
    id: str
    display_name: str


class GameSession(BaseModel):
    join_code: str
    host_name: str
    status: Literal["lobby"] = "lobby"
    players: list[Player] = Field(default_factory=list)
    settings: dict[str, JsonValue] = Field(default_factory=dict)


class Game(BaseModel):
    """Placeholder model for a predefined game."""

    pass
