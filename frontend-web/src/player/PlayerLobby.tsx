import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";

import { playerSocketUrl, updateReadyStatus } from "../api/client";

interface PlayerLobbyState {
  playerId?: string;
  playerName?: string;
  sessionId?: string;
}

interface GameStartedMessage {
  type: "game_started";
  session_id: string;
  game_id: string;
}

export default function PlayerLobby() {
  const { code } = useParams<{ code: string }>();
  const { state } = useLocation() as {
    state: PlayerLobbyState | null;
  };

  const navigate = useNavigate();

  const sessionId = state?.sessionId ?? code;
  const playerId = state?.playerId ?? (sessionId ? sessionStorage.getItem("mezclar-player:" + sessionId) : null);
  const [playerName, setPlayerName] = useState(state?.playerName ?? "Player");
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);

  const [connectionStatus, setConnectionStatus] = useState(
    "Connecting..."
  );

  const [error, setError] = useState("");

  useEffect(() => {
    if (!sessionId || !playerId) {
      setError("Missing session or player information.");
      setConnectionStatus("Disconnected");
      return;
    }

    let active = true;
    let connectedName = state?.playerName ?? "Player";
    const websocket = new WebSocket(
      playerSocketUrl(sessionId, playerId)
    );

    websocket.onopen = () => {
      if (!active) return;
      setConnectionStatus("Connected");
      setError("");
    };

    websocket.onmessage = (event) => {
      if (!active) return;
      try {
        const message = JSON.parse(event.data);

        if (message.type === "connected") {
          connectedName = message.name;
          setPlayerName(message.name);
          setReady(message.ready);
        }
        if (message.type === "game_started") {
          const gameStartedMessage =
            message as GameStartedMessage;

          navigate(`/player/${sessionId}/game`, {
            state: {
              playerId,
              playerName: connectedName,
              sessionId,
              gameId: gameStartedMessage.game_id,
            },
          });
        }
      } catch (error) {
        console.error(
          "Failed to process WebSocket message:",
          error
        );
      }
    };

    websocket.onerror = () => {
      if (!active) return;
      setConnectionStatus("Connection error");
      setError("Unable to connect to the game server.");
    };

    websocket.onclose = () => {
      if (!active) return;
      setConnectionStatus("Disconnected");
    };

    return () => {
      active = false;
      websocket.close();
    };
  }, [navigate, playerId, state?.playerName, sessionId]);

  async function handleReady() {
    if (!sessionId || !playerId || saving) return;
    setSaving(true);
    setError("");
    try {
      setReady((await updateReadyStatus(sessionId, playerId, !ready)).ready);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Could not update ready status.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main
      style={{
        maxWidth: 560,
        margin: "0 auto",
        padding: 24,
        textAlign: "center",
      }}
    >
      <h1>You're in!</h1>

      <p>
        Welcome to the game, {playerName}.
      </p>

      <section
        style={{
          margin: "24px 0",
          padding: 24,
          border: "1px solid var(--border)",
          borderRadius: 12,
        }}
      >
        <p
          style={{
            margin: 0,
            color: "var(--text-muted)",
          }}
        >
          Game Code
        </p>

        <h2
          style={{
            margin: "8px 0 24px",
            fontSize: 40,
            letterSpacing: 6,
          }}
        >
          {sessionId}
        </h2>

        <h2>Waiting for the host</h2>

        <p style={{ color: "var(--text-muted)" }}>
          The game will begin when the host starts it.
        </p>

        <p aria-live="polite" style={{ color: "var(--text-muted)" }}>
          {ready ? "You are ready." : "You are not ready yet."}
        </p>

        <button
          type="button"
          aria-pressed={ready}
          disabled={!playerId || saving || connectionStatus !== "Connected"}
          onClick={handleReady}
          style={{
            width: "100%",
            marginTop: 16,
            padding: 16,
            border: "none",
            borderRadius: 12,
            background: "var(--accent)",
            color: "var(--accent-text)",
            fontFamily: "inherit",
            fontSize: 16,
            fontWeight: 700,
            cursor: playerId && !saving ? "pointer" : "not-allowed",
            opacity: playerId && !saving ? 1 : 0.4,
          }}
        >
          {saving ? "Updating..." : ready ? "Mark not ready" : "I'm ready"}
        </button>

        <p
          style={{
            marginTop: 24,
            color: "var(--text-muted)",
            fontSize: 14,
          }}
        >
          Connection: {connectionStatus}
        </p>
      </section>

      {error && (
        <p
          role="alert"
          style={{
            color: "var(--text-muted)",
          }}
        >
          {error}
        </p>
      )}

      <Link to="/">Leave game</Link>
    </main>
  );
}