from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.api import routes_player, routes_host
from backend.app.websockets import routes as websocket_routes

app = FastAPI()
app.include_router(routes_player.router)
app.include_router(routes_host.router)
app.include_router(websocket_routes.router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)