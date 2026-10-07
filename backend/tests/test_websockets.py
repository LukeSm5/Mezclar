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
            assert first.receive_json()["type"] == "players_updated"
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

def player_names(message):
    return [player["name"] for player in message["players"]]

def test_players_see_each_other_in_the_lobby(client):
    code = client.post("/session").json()["session_id"]
    client.post("/session/" + code + "/join", json={"player_id": "first", "name": "Alex"})
    with client.websocket_connect("/ws/session/" + code + "/player/first") as first:
        assert player_names(first.receive_json()) == ["Alex"]
        client.post("/session/" + code + "/join", json={"player_id": "second", "name": "Jordan"})
        with client.websocket_connect("/ws/session/" + code + "/player/second") as second:
            assert player_names(second.receive_json()) == ["Alex", "Jordan"]
            update = first.receive_json()
            assert update["type"] == "players_updated"
            assert player_names(update) == ["Alex", "Jordan"]

def test_roster_updates_when_a_player_is_kicked_or_hidden(client):
    code = client.post("/session").json()["session_id"]
    for player_id, name in [("first", "Alex"), ("second", "Jordan")]:
        client.post("/session/" + code + "/join", json={"player_id": player_id, "name": name})
    with client.websocket_connect("/ws/session/" + code + "/player/first") as first:
        first.receive_json()
        client.post("/session/" + code + "/hide", json={"player_id": "second", "hidden": True})
        assert player_names(first.receive_json()) == ["Alex", "Hidden player"]
        client.post("/session/" + code + "/kick", json={"player_id": "second"})
        assert player_names(first.receive_json()) == ["Alex"]
