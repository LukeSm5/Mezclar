import pytest
from unittest.mock import patch
from backend.app.sessions.session import Session


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

def test_regenerate_name_nonexistent_player():
    session = Session("abc123")
    with pytest.raises(ValueError):
        session.regenerate_name("nonexistent_player")

def test_regenerate_name_existing_player():
    session = Session("abc123")
    session.set_auto_generate(True)
    session.add_player("existing_player", requested_name="old_name")
    with patch("backend.app.sessions.session.generate_unique_name", return_value="new_name"):
        new_name = session.regenerate_name("existing_player")
        assert new_name == "new_name"
        assert session.get_player("existing_player").name == "new_name"
        assert "old_name" not in session.used_names
        assert "new_name" in session.used_names