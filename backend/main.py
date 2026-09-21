"""FastAPI application entry point for Mezclar."""

from fastapi import FastAPI

from backend.app.api.routes_host import router as host_router
from backend.app.api.routes_player import router as player_router

app = FastAPI(title="Mezclar API")

app.include_router(host_router)
app.include_router(player_router)
