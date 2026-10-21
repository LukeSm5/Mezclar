import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { getSession, type SessionResponse } from "../api/client";
import QuipInput from "./QuipInput";

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

  const sessionId = state?.sessionId;

  const [session, setSession] = useState<SessionResponse | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) {
      setError("Missing session information. Please rejoin the game.");
      setLoading(false);
      return;
    }

    getSession(sessionId)
      .then(setSession)
      .catch((error: unknown) => {
        setError(
          error instanceof Error
            ? error.message
            : "Could not load the game."
        );
      })
      .finally(() => setLoading(false));
  }, [sessionId]);

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

      {loading && <p>Loading game...</p>}

      {error && <p role="alert">{error}</p>}

      {!loading && !error && session && (
        <section>
          <h2>Round {session.current_round}</h2>
          <p>{session.current_prompt ?? "No prompt selected yet."}</p>
          {session.game_id === "quiplash" && <QuipInput key={session.current_round} />}
        </section>
      )}

      

      <p>
        Game: {state?.gameId ?? "Unknown"}
      </p>

      <Link to="/">Leave game</Link>
    </main>
  );
}