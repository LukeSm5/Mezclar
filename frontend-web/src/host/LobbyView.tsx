import { Link, useLocation } from "react-router-dom";
import { GAMES } from "./games";
import type { GameOptionValues } from "./gameOptions";

interface LobbyState {
  gameId?: string;
  options?: GameOptionValues;
}

export default function LobbyView() {
  const { state } = useLocation() as { state: LobbyState | null };
  const game = GAMES.find((entry) => entry.id === state?.gameId);

  return (
    <main style={{ maxWidth: 560, margin: "0 auto", padding: 24 }}>
      <h1>Lobby</h1>
      <p style={{ color: "var(--text-muted)" }}>
        Placeholder. The join code, live player list, and the control to begin
        the round go here.
      </p>
      <p style={{ color: "var(--text-muted)" }}>
        {game
          ? `Configured game: ${game.name}. Options: ${JSON.stringify(state?.options ?? {})}`
          : "No game configured — reached directly rather than from Create game."}
      </p>
      <Link to="/host/new">Back to create game</Link>
    </main>
  );
}
