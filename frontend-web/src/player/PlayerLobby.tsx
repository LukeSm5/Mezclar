import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getSession, playerSocketUrl, updateReadyStatus, type SessionPlayer } from "../api/client";

export default function PlayerLobby() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const playerId = code ? sessionStorage.getItem("mezclar-player:" + code) : null;
  const [player, setPlayer] = useState<SessionPlayer | null>(null);
  const [saving, setSaving] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("Connecting...");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!code || !playerId) {
      setError("Please join this lobby first.");
      setConnectionStatus("Disconnected");
      return;
    }
    let active = true;
    let playerName = "Player";
    getSession(code).then((session) => {
      if (!active) return;
      const found = session.players.find((entry) => entry.player_id === playerId);
      if (!found) throw new Error("Player not found. Please rejoin the lobby.");
      playerName = found.name;
      setPlayer(found);
    }).catch((error) => {
      if (active) setError(error instanceof Error ? error.message : "Could not load the player.");
    });
    const websocket = new WebSocket(playerSocketUrl(code, playerId));
    websocket.onopen = () => { if (active) setConnectionStatus("Connected"); };
    websocket.onmessage = (event) => {
      if (!active) return;
      try {
        const message = JSON.parse(event.data);
        if (message.type === "connected") {
          playerName = message.name;
          setPlayer({ player_id: message.player_id, name: message.name, ready: message.ready });
        } else if (message.type === "game_started") {
          navigate("/player/" + code + "/game", {
            state: { playerId, playerName, sessionId: code, gameId: message.game_id },
          });
        }
      } catch {
        setError("Could not read the game update.");
      }
    };
    websocket.onerror = () => { if (active) setError("Unable to connect to the game server."); };
    websocket.onclose = () => { if (active) setConnectionStatus("Disconnected"); };
    return () => { active = false; websocket.close(); };
  }, [code, navigate, playerId]);

  async function handleReady() {
    if (!code || !playerId || !player || saving) return;
    setSaving(true);
    setError("");
    try {
      setPlayer(await updateReadyStatus(code, playerId, !player.ready));
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
        Welcome to the game, {player?.name ?? "Player"}.
      </p>

      <section
        aria-labelledby="waiting-title"
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
          {code}
        </h2>

        <h2 id="waiting-title">Waiting for the host</h2>

        <p style={{ color: "var(--text-muted)" }}>
          The game will begin when the host starts it.
        </p>

        <p aria-live="polite" style={{ color: "var(--text-muted)" }}>
          {player?.ready ? "You are ready." : "You are not ready yet."}
        </p>

        <button
          type="button"
          aria-pressed={player?.ready ?? false}
          disabled={!player || saving}
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
            cursor: player && !saving ? "pointer" : "not-allowed",
            opacity: player && !saving ? 1 : 0.4,
          }}
        >
          {saving ? "Updating..." : player?.ready ? "Mark not ready" : "I'm ready"}
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

      <Link to={playerId ? "/" : "/join/" + code}>
        {playerId ? "Leave game" : "Back to join"}
      </Link>
    </main>
  );
}
