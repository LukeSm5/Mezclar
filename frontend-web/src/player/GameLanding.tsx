import { Link, useLocation } from "react-router-dom";

interface GameLandingState {
  playerId?: string;
  playerName?: string;
  sessionId?: string;
  gameId?: string;
}

export default function GameLanding() {
  const { state } = useLocation() as {
    state: GameLandingState | null;
  };

  return (
    <main
      style={{
        maxWidth: 560,
        margin: "0 auto",
        padding: 24,
        textAlign: "center",
      }}
    >
      <p
        style={{
          color: "var(--text-muted)",
          fontSize: 14,
        }}
      >
        Game started
      </p>

      <h1>Get ready!</h1>

      <p>
        Welcome, {state?.playerName ?? "Player"}.
      </p>

      <p style={{ color: "var(--text-muted)" }}>
        Your game is starting. The active gameplay screen
        will appear here.
      </p>

      <p>
        Game: {state?.gameId ?? "Unknown"}
      </p>

      <Link to="/">Leave game</Link>
    </main>
  );
}