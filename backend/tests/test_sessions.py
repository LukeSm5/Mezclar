from concurrent.futures import ThreadPoolExecutor
from unittest.mock import patch

import pytest

from backend.app.models.schemas import CreateSessionRequest
from backend.app.sessions import registry
from backend.app.sessions.session import Session


def test_set_auto_generate():
    session = Session("AB12")
    session.set_auto_generate(True)
    assert session.auto_generate_names is True


def test_add_used_name():
    session = Session("AB12")
    session.add_used_name("test_name")
    assert "test_name" in session.used_names


def test_remove_used_name():
    session = Session("AB12")
    session.add_used_name("test_name")
    session.remove_used_name("test_name")
    assert "test_name" not in session.used_names


def test_assign_name_with_requested_name():
    session = Session("AB12")
    assert session.assign_name("requested_name") == "requested_name"
    assert "requested_name" in session.used_names


def test_assign_name_with_auto_generate():
    session = Session("AB12")
    session.set_auto_generate(True)
    with patch("backend.app.sessions.session.generate_unique_name", return_value="generated_name"):
        assert session.assign_name() == "generated_name"
        assert "generated_name" in session.used_names


def test_raise_error_when_no_name_and_auto_generate_disabled():
    with pytest.raises(ValueError):
        Session("AB12").assign_name()


def test_add_player_with_requested_name():
    session = Session("AB12")
    player = session.add_player("player1", "requested_name")
    assert player.name == "requested_name"
    assert "requested_name" in session.used_names
    assert session.get_player("player1") == player


def test_remove_player_removes_used_name():
    session = Session("AB12")
    session.add_player("player1", "requested_name")
    session.remove_player("player1")
    assert "requested_name" not in session.used_names


def test_get_player_returns_none_if_missing():
    assert Session("AB12").get_player("nonexistent") is None


def test_regenerate_name_nonexistent_player():
    with pytest.raises(ValueError):
        Session("AB12").regenerate_name("nonexistent")


def test_regenerate_name_existing_player():
    session = Session("AB12")
    session.add_player("existing_player", "old_name")
    with patch("backend.app.sessions.session.generate_unique_name", return_value="new_name"):
        assert session.regenerate_name("existing_player") == "new_name"
    assert session.get_player("existing_player").name == "new_name"
    assert session.used_names == {"new_name"}


def test_regeneration_failure_keeps_original_name():
    session = Session("AB12")
    session.add_player("player1", "old_name")
    with patch("backend.app.sessions.session.generate_unique_name", side_effect=ValueError("Exhausted")):
        with pytest.raises(ValueError):
            session.regenerate_name("player1")
    assert session.get_player("player1").name == "old_name"
    assert session.used_names == {"old_name"}


def test_create_session(client):
    response = client.post("/session", json={"host_name": "  George  ", "settings": {"rounds": 3}})
    assert response.status_code == 200
    session = response.json()
    assert len(session["session_id"]) == 4
    assert session["host_name"] == "George"
    assert session["settings"] == {"rounds": 3}
    assert session["players"] == []
    assert session["player_count"] == 0
    assert session["game_started"] is False
    assert client.get("/session/" + session["session_id"]).json() == session


def test_feature_branch_create_call_without_body_is_supported(client):
    response = client.post("/session")
    assert response.status_code == 200
    assert response.json()["host_name"] == "Host"


@pytest.mark.parametrize("payload", [
    {"host_name": ""}, {"host_name": "   "}, {"host_name": None}, {"host_name": 123},
    {"host_name": "George", "settings": []}, {"host_name": "George", "settings": None},
    {"host_name": "George", "session_id": "AB12"}, {"host_name": "George", "game_started": True},
    "not an object",
])
def test_invalid_create_request(client, payload):
    assert client.post("/session", json=payload).status_code == 422
    assert registry._sessions == {}


def test_malformed_body(client):
    response = client.post("/session", content="{", headers={"Content-Type": "application/json"})
    assert response.status_code == 422
    assert registry._sessions == {}


def test_get_session_by_code(client):
    sessions = [client.post("/session", json={"host_name": name}).json() for name in ["George", "Taylor"]]
    for session in sessions:
        response = client.get("/session/" + session["session_id"])
        assert response.status_code == 200
        assert response.json() == session
    assert sessions[0]["session_id"] != sessions[1]["session_id"]
    assert len(registry._sessions) == 2


def test_unknown_session(client):
    response = client.get("/session/AB12")
    assert response.status_code == 404
    assert response.json() == {"detail": "Session not found"}
    assert registry._sessions == {}


@pytest.mark.parametrize("code", ["abc1", "AB1", "AB123", "12.3", "-123", "123456"])
def test_invalid_join_code(client, code):
    assert client.get("/session/" + code).status_code == 422


def test_collision_retries_without_overwriting(client):
    with patch.object(registry, "generate_session_code", side_effect=["AB12", "AB12", "CD34"]):
        first = client.post("/session", json={"host_name": "George"})
        second = client.post("/session", json={"host_name": "Taylor"})
    assert first.status_code == second.status_code == 200
    assert first.json()["session_id"] == "AB12"
    assert second.json()["session_id"] == "CD34"
    assert registry.get_session("AB12").host_name == "George"


def test_repeated_collisions_return_service_unavailable(client):
    with patch.object(registry, "generate_session_code", return_value="AB12"):
        client.post("/session", json={"host_name": "George"})
        response = client.post("/session", json={"host_name": "Taylor"})
    assert response.status_code == 503
    assert response.json() == {"detail": "Could not allocate a join code. Try again."}
    assert len(registry._sessions) == 1
    assert registry.get_session("AB12").host_name == "George"


def test_sessions_do_not_share_mutable_data():
    request = CreateSessionRequest(host_name="George", settings={"round": {"duration": 30}})
    first, second = registry.create_session(request), registry.create_session(request)
    first.settings["round"]["duration"] = 60
    first.add_player("player1", "Taylor")
    assert second.settings == request.settings == {"round": {"duration": 30}}
    assert second.players == {}


def test_concurrent_creation_keeps_all_sessions():
    with ThreadPoolExecutor(max_workers=8) as executor:
        sessions = list(executor.map(registry.create_session, [CreateSessionRequest()] * 20))
    assert len({session.session_id for session in sessions}) == 20
    assert len(registry._sessions) == 20


def test_join_session_records_player_in_right_lobby(client):
    first, second = [client.post("/session").json()["session_id"] for _ in range(2)]
    response = client.post("/session/" + first + "/join", json={"player_id": "player1", "name": "  Casey  "})
    assert response.status_code == 200
    player = {"player_id": "player1", "name": "Casey", "ready": False}
    assert response.json() == {**player, "session_id": first}
    assert client.get("/session/" + first).json()["players"] == [player]
    assert client.get("/session/" + second).json()["players"] == []


def test_join_unknown_session(client):
    response = client.post("/session/AB12/join", json={"player_id": "player1", "name": "Casey"})
    assert response.status_code == 404


@pytest.mark.parametrize("payload", [
    {}, {"player_id": ""}, {"player_id": "player1", "name": ""}, {"player_id": "player1", "name": "   "},
])
def test_join_requires_valid_player_data(client, payload):
    code = client.post("/session").json()["session_id"]
    assert client.post("/session/" + code + "/join", json=payload).status_code == 422
    assert client.get("/session/" + code).json()["players"] == []


def test_auto_names_use_the_created_lobby_settings(client):
    code = client.post("/session", json={"settings": {"options": {"autoGenerateNames": True}}}).json()["session_id"]
    with patch("backend.app.sessions.session.generate_unique_name", return_value="Generated Player"):
        response = client.post("/session/" + code + "/join", json={"player_id": "player1"})
    assert response.status_code == 200
    assert response.json()["name"] == "Generated Player"
    assert client.get("/session/" + code).json()["players"][0]["name"] == "Generated Player"


def test_name_toggle_and_regeneration_share_the_lobby_registry(client):
    code = client.post("/session").json()["session_id"]
    assert client.post("/session/" + code + "/toggle-auto-names", json={"enabled": True}).status_code == 200
    with patch("backend.app.sessions.session.generate_unique_name", side_effect=["First Name", "Next Name"]):
        client.post("/session/" + code + "/join", json={"player_id": "player1"})
        response = client.post("/session/" + code + "/regenerate-name", json={"player_id": "player1"})
    assert response.status_code == 200
    assert response.json() == {"name": "Next Name"}
    assert client.get("/session/" + code).json()["players"][0]["name"] == "Next Name"
