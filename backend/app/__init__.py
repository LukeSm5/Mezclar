from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.api.routes_websocket import router as websocket_router

from backend.app.api.routes_host import router as host_router
from backend.app.api.routes_player import router as player_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(host_router)
app.include_router(player_router)
app.include_router(websocket_router)