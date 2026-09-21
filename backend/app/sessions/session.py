"""Temporary in-memory session storage."""

from backend.app.models.schemas import GameSession

active_sessions: dict[str, GameSession] = {}
