"""Session state and temporary storage for a single backend process."""

from threading import Lock

from backend.app.models.schemas import CreateSessionRequest, GameSession
from backend.app.naming.generator import generate_unique_name
from backend.app.sessions.codes import generate_join_code
from backend.app.sessions.player import Player


class Session:
    def __init__(self, session_id: str):
        self.session_id = session_id
        self.players: dict[str, Player] = {}
        self.auto_generate_names: bool = False
        self.used_names: set[str] = set()

    def set_auto_generate(self, enabled: bool) -> None:
        self.auto_generate_names = enabled

    def add_used_name(self, name: str) -> None:
        self.used_names.add(name)

    def remove_used_name(self, name: str) -> None:
        self.used_names.discard(name)

    def assign_name(self, requested_name: str | None = None) -> str:
        if requested_name is not None:
            self.add_used_name(requested_name)
            return requested_name

        if self.auto_generate_names:
            name = generate_unique_name(self.used_names)
            self.add_used_name(name)
            return name

        raise ValueError("Name must be provided or auto-generation must be enabled.")

    def add_player(self, player_id: str, requested_name: str | None = None) -> Player:
        name = self.assign_name(requested_name)
        player = Player(player_id, name)
        self.players[player_id] = player
        return player

    def remove_player(self, player_id: str) -> None:
        if player_id in self.players:
            player = self.players.pop(player_id)
            self.remove_used_name(player.name)

    def get_player(self, player_id: str) -> Player | None:
        return self.players.get(player_id)

    def regenerate_name(self, player_id: str) -> str:
        player = self.get_player(player_id)
        if player is None:
            raise ValueError(f"Player with ID {player_id} does not exist.")

        self.remove_used_name(player.name)
        new_name = self.assign_name()
        player.name = new_name
        return new_name


active_sessions: dict[str, GameSession] = {}
_session_lock = Lock()


def create_session(request: CreateSessionRequest) -> GameSession:
    # Sync routes run in threads; checking and reserving a code must be atomic.
    with _session_lock:
        for _ in range(10):
            join_code = generate_join_code()
            if join_code in active_sessions:
                continue

            session = GameSession(join_code=join_code, **request.model_dump())
            active_sessions[join_code] = session
            return session

    raise RuntimeError("Could not allocate a join code. Try again.")


def get_session(join_code: str) -> GameSession | None:
    return active_sessions.get(join_code)
