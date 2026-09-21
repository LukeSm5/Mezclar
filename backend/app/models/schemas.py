"""Placeholder request and response models for the backend."""

from pydantic import BaseModel


class GameSession(BaseModel):
    """Placeholder model for a temporary game session."""

    pass


class Player(BaseModel):
    """Placeholder model for a player in a session."""

    pass


class Game(BaseModel):
    """Placeholder model for a predefined game."""

    pass
