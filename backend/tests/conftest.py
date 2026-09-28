import pytest
from fastapi.testclient import TestClient

from backend.app.sessions import registry
from backend.app.websockets.connection_manager import connection_manager
from backend.main import app


@pytest.fixture(autouse=True)
def clear_sessions():
    registry._sessions.clear()
    connection_manager.active_connections.clear()
    yield
    registry._sessions.clear()
    connection_manager.active_connections.clear()


@pytest.fixture
def client():
    with TestClient(app) as test_client:
        yield test_client
