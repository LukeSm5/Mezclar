"""Session state shared by the HTTP and WebSocket routes."""

from copy import deepcopy

from pydantic import JsonValue

from backend.app.naming.generator import generate_unique_name
from backend.app.sessions.player import Player


class Session:
    def __init__(
        self,
        session_id: str,
        host_name: str = "Host",
        settings: dict[str, JsonValue] | None = None,
    ):
        self.session_id = session_id
        self.host_name = host_name
        self.settings = deepcopy(settings) if settings is not None else {}
        self.players: dict[str, Player] = {}
        options = self.settings.get("options", {})
        self.auto_generate_names = isinstance(options, dict) and options.get("autoGenerateNames") is True
        self.used_names: set[str] = set()
        self.game_id: str | None = None
        self.minimum_players: int | None = None
        self.maximum_players: int | None = None
        self.game_started = False

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
        existing = self.get_player(player_id)
        if existing is not None:
            return existing
        player = Player(player_id, self.assign_name(requested_name))
        self.players[player_id] = player
        return player

    def remove_player(self, player_id: str) -> None:
        player = self.players.pop(player_id, None)
        if player is not None:
            self.remove_used_name(player.name)

    def get_player(self, player_id: str) -> Player | None:
        return self.players.get(player_id)

    def set_player_ready(self, player_id: str, ready: bool) -> Player:
        player = self.get_player(player_id)
        if player is None:
            raise ValueError("Player not found")
        player.ready = ready
        return player

    def regenerate_name(self, player_id: str) -> str:
        player = self.get_player(player_id)
        if player is None:
            raise ValueError("Player not found")
        # Reserve the replacement before removing the old name, so a failed
        # generation leaves the player's current name intact.
        new_name = generate_unique_name(self.used_names - {player.name})
        self.remove_used_name(player.name)
        self.add_used_name(new_name)
        player.name = new_name
        return new_name

    def configure_game(self, game_id: str, minimum_players: int, maximum_players: int) -> None:
        if self.game_started:
            raise ValueError("Cannot configure a game that has started.")
        if minimum_players < 1:
            raise ValueError("Minimum players must be at least 1.")
        if maximum_players < minimum_players:
            raise ValueError("Maximum players must be greater than or equal to minimum players.")
        if len(self.players) > maximum_players:
            raise ValueError("The current player count exceeds the maximum player limit.")
        self.game_id = game_id
        self.minimum_players = minimum_players
        self.maximum_players = maximum_players

    def can_start_game(self) -> bool:
        if self.game_started or self.game_id is None:
            return False
        if self.minimum_players is None or self.maximum_players is None:
            return False
        return self.minimum_players <= len(self.players) <= self.maximum_players

    def start_game(self) -> None:
        if self.game_started:
            raise ValueError("Game has already started.")
        if not self.can_start_game():
            raise ValueError("Game cannot start because the start conditions have not been met.")
        self.game_started = True
