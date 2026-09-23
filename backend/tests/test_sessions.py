from concurrent.futures import ThreadPoolExecutor
from unittest.mock import patch

import pytest
from fastapi.testclient import TestClient

from backend.app.models.schemas import CreateSessionRequest, Player
from backend.app.sessions import session as session_store
from backend.app.sessions.session import Session
from backend.main import app

def test_set_auto_generate():
    session = Session("abc123")
    session.set_auto_generate(True)
    assert session.auto_generate_names is True

def test_add_used_name():
    session = Session("abc123")
    session.add_used_name("test_name")
    assert "test_name" in session.used_names

def test_remove_used_name():
    session = Session("abc123")
    session.add_used_name("test_name")
    session.remove_used_name("test_name")
    assert "test_name" not in session.used_names

def test_assign_name_with_requested_name():
    session = Session("abc123")
    name = session.assign_name("requested_name")
    assert name == "requested_name"
    assert "requested_name" in session.used_names

def test_assign_name_with_auto_generate():
    session = Session("abc123")
    session.set_auto_generate(True)
    with patch('backend.app.sessions.session.generate_unique_name', return_value="generated_name"):
        name = session.assign_name()
        assert name == "generated_name"
        assert "generated_name" in session.used_names

def test_raise_error_when_no_name_and_auto_generate_disabled():
    session = Session("abc123")
    with pytest.raises(ValueError):
        session.assign_name()

def test_add_player_with_requested_name():
    session = Session("abc123")
    player = session.add_player("player1", "requested_name")
    assert player.name == "requested_name"
    assert "requested_name" in session.used_names
    assert session.get_player("player1") == player

def test_remove_player_removes_used_name():
    session = Session("abc123")
    player = session.add_player("player1", "requested_name")
    session.remove_player("player1")
    assert "requested_name" not in session.used_names

def test_get_player_returns_none_if_missing():
    session = Session("abc123")
    assert session.get_player("nonexistent") is None

@pytest.fixture(autouse=True)
def clear_sessions():
    session_store.active_sessions.clear()
    yield
    session_store.active_sessions.clear()


@pytest.fixture
def client():
    with TestClient(app) as test_client:
        yield test_client


def test_create_session(client):
    response = client.post(
        "/sessions",
        json={"host_name": "  George  ", "settings": {"rounds": 3}},
    )

    assert response.status_code == 201
    session = response.json()
    code = session["join_code"]

    assert len(code) == 6
    assert code.isascii() and code.isdigit()
    assert 100_000 <= int(code) <= 999_999
    assert session == {
        "join_code": code,
        "host_name": "George",
        "status": "lobby",
        "players": [],
        "settings": {"rounds": 3},
    }
    assert session_store.active_sessions[code].model_dump() == session


@pytest.mark.parametrize(
    "payload",
    [
        {},
        {"host_name": ""},
        {"host_name": "   "},
        {"host_name": None},
        {"host_name": 123},
        {"host_name": "George", "settings": []},
        {"host_name": "George", "settings": None},
        {"host_name": "George", "join_code": "123456"},
        {"host_name": "George", "status": "active"},
        "not an object",
    ],
)
def test_invalid_create_request(client, payload):
    response = client.post("/sessions", json=payload)

    assert response.status_code == 422
    assert session_store.active_sessions == {}


def test_missing_or_malformed_body(client):
    assert client.post("/sessions").status_code == 422
    response = client.post(
        "/sessions",
        content="{",
        headers={"Content-Type": "application/json"},
    )

    assert response.status_code == 422
    assert session_store.active_sessions == {}


def test_get_session_by_code(client):
    first = client.post("/sessions", json={"host_name": "George"}).json()
    second = client.post("/sessions", json={"host_name": "Taylor"}).json()

    for session in [first, second]:
        response = client.get(f"/sessions/{session['join_code']}")
        assert response.status_code == 200
        assert response.json() == session

    assert first["join_code"] != second["join_code"]
    assert first["settings"] == {}
    assert len(session_store.active_sessions) == 2


def test_unknown_session(client):
    response = client.get("/sessions/123456")

    assert response.status_code == 404
    assert response.json() == {"detail": "Session not found."}
    assert session_store.active_sessions == {}


@pytest.mark.parametrize(
    "code",
    ["abc123", "12345", "1234567", "000000", "-12345", "12.345"],
)
def test_invalid_join_code(client, code):
    assert client.get(f"/sessions/{code}").status_code == 422


def test_collision_retries_without_overwriting(client):
    with patch.object(
        session_store,
        "generate_join_code",
        side_effect=["123456", "123456", "654321"],
    ):
        first = client.post("/sessions", json={"host_name": "George"})
        second = client.post("/sessions", json={"host_name": "Taylor"})

    assert first.status_code == second.status_code == 201
    assert first.json()["join_code"] == "123456"
    assert second.json()["join_code"] == "654321"
    assert session_store.active_sessions["123456"].host_name == "George"
    assert len(session_store.active_sessions) == 2


def test_repeated_collisions_return_service_unavailable(client):
    with patch.object(session_store, "generate_join_code", return_value="123456"):
        original = client.post("/sessions", json={"host_name": "George"})
        response = client.post("/sessions", json={"host_name": "Taylor"})

    assert original.status_code == 201
    assert response.status_code == 503
    assert response.json() == {
        "detail": "Could not allocate a join code. Try again.",
    }
    assert len(session_store.active_sessions) == 1
    assert session_store.active_sessions["123456"].host_name == "George"


def test_sessions_do_not_share_mutable_data():
    request = CreateSessionRequest(
        host_name="George",
        settings={"round": {"duration": 30}},
    )
    first = session_store.create_session(request)
    second = session_store.create_session(request)

    first.settings["round"]["duration"] = 60
    first.players.append(Player(id="player-1", display_name="Taylor"))

    assert second.settings == {"round": {"duration": 30}}
    assert request.settings == {"round": {"duration": 30}}
    assert second.players == []


def test_concurrent_creation_keeps_all_sessions():
    request = CreateSessionRequest(host_name="George")

    with ThreadPoolExecutor(max_workers=8) as executor:
        sessions = list(executor.map(session_store.create_session, [request] * 20))

    assert len({session.join_code for session in sessions}) == 20
    assert len(session_store.active_sessions) == 20


def test_join_session_records_player_in_right_lobby(client):
    first = client.post("/sessions", json={"host_name": "George"}).json()
    second = client.post("/sessions", json={"host_name": "Taylor"}).json()

    response = client.post(
        f"/sessions/{first['join_code']}/players",
        json={"display_name": "  Casey  "},
    )

    assert response.status_code == 201
    players = response.json()["players"]
    assert len(players) == 1
    assert players[0]["id"]
    assert players[0]["display_name"] == "Casey"
    assert client.get(f"/sessions/{first['join_code']}").json()["players"] == players
    assert client.get(f"/sessions/{second['join_code']}").json()["players"] == []


def test_join_unknown_session(client):
    response = client.post(
        "/sessions/123456/players",
        json={"display_name": "Casey"},
    )
    assert response.status_code == 404
    assert response.json() == {"detail": "Session not found."}


@pytest.mark.parametrize("payload", [{}, {"display_name": ""}, {"display_name": "   "}])
def test_join_requires_name(client, payload):
    session = client.post("/sessions", json={"host_name": "George"}).json()
    response = client.post(f"/sessions/{session['join_code']}/players", json=payload)

    assert response.status_code == 422
    assert client.get(f"/sessions/{session['join_code']}").json()["players"] == []
