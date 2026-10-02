import pytest

from starlette.websockets import WebSocketDisconnect

def test_start_game_notifies_all_connected_players(client):
    code = client.post("/session").json()["session_id"]
    for player_id in ["first", "second"]:
        client.post("/session/" + code + "/join", json={"player_id": player_id, "name": player_id})
    client.patch("/session/" + code + "/players/first/ready", json={"ready": True})
    with client.websocket_connect("/ws/session/" + code + "/player/first") as first:
        assert first.receive_json()["ready"] is True
        with client.websocket_connect("/ws/session/" + code + "/player/second") as second:
            assert second.receive_json()["ready"] is False
            response = client.post("/session/" + code + "/start", json={
                "game_id": "test-game", "minimum_players": 2, "maximum_players": 4,
            })
            assert response.status_code == 200
            expected = {"type": "game_started", "session_id": code, "game_id": "test-game"}
            assert first.receive_json() == second.receive_json() == expected

def test_reconnecting_after_start_receives_game_started(client):
    code = client.post("/session").json()["session_id"]
    client.post("/session/" + code + "/join", json={"player_id": "first", "name": "Casey"})
    client.post("/session/" + code + "/start", json={
        "game_id": "test-game", "minimum_players": 1, "maximum_players": 4,
    })
    with client.websocket_connect("/ws/session/" + code + "/player/first") as socket:
        assert socket.receive_json()["type"] == "connected"
        assert socket.receive_json()["type"] == "game_started"

def test_websocket_rejects_non_members(client):
    code = client.post("/session").json()["session_id"]
    for session_id in [code, "ZZZZ"]:
        with pytest.raises(WebSocketDisconnect):
            with client.websocket_connect("/ws/session/" + session_id + "/player/missing"):
                pass
