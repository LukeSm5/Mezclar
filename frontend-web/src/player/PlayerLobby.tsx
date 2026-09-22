import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";

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
  const playerId = state?.playerId;
  const playerName = state?.playerName ?? "Player";

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

    const websocket = new WebSocket(
      `ws://127.0.0.1:8000/ws/session/${sessionId}/player/${playerId}`
    );

    websocket.onopen = () => {
      setConnectionStatus("Connected");
      setError("");
    };

    websocket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);

        if (message.type === "game_started") {
          const gameStartedMessage =
            message as GameStartedMessage;

          navigate(`/player/${sessionId}/game`, {
            state: {
              playerId,
              playerName,
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
      setConnectionStatus("Connection error");
      setError("Unable to connect to the game server.");
    };

    websocket.onclose = () => {
      setConnectionStatus("Disconnected");
    };

    return () => {
      websocket.close();
    };
  }, [navigate, playerId, playerName, sessionId]);

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