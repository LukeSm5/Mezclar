from backend.app.naming.generator import generate_unique_name
from backend.app.sessions.player import Player

class Session:
    def __init__(self, session_id: str):
        self.session_id = session_id
        self.players: dict[str, "Player"] = {}
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
