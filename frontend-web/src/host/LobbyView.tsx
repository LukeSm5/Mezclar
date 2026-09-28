import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getSession, startGame, type SessionResponse } from "../api/client";
import { GAMES } from "./games";

export default function LobbyView() {
  const { code } = useParams<{ code: string }>();
  const [session, setSession] = useState<SessionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [minimumPlayers, setMinimumPlayers] = useState<number | null>(null);
  const [starting, setStarting] = useState(false);
  const game = GAMES.find((entry) => entry.id === (session?.game_id ?? session?.settings.gameId));

  useEffect(() => {
    if (!code) {
      setLoading(false);
      return;
    }
    let active = true;
    async function refresh() {
      try {
        const next = await getSession(code!);
        if (active) {
          setSession(next);
          const selectedGame = GAMES.find((entry) => entry.id === (next.game_id ?? next.settings.gameId));
          setMinimumPlayers((previous) => previous ?? next.minimum_players ?? selectedGame?.minPlayers ?? 1);
          setError("");
        }
      } catch (error) {
        if (active) setError(error instanceof Error ? error.message : "Could not load the lobby.");
      } finally {
        if (active) setLoading(false);
      }
    }
    void refresh();
    const timer = window.setInterval(refresh, 2000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [code]);

  const readyCount = session?.players.filter((player) => player.ready).length ?? 0;
  const canStart = !!game && !!session && minimumPlayers !== null
    && !session.game_started && session.player_count >= minimumPlayers
    && session.player_count <= game.maxPlayers;

  async function handleStart() {
    if (!code || !game || minimumPlayers === null || !canStart || starting) return;
    setStarting(true);
    setError("");
    try {
      setSession(await startGame(code, {
        game_id: game.id,
        minimum_players: minimumPlayers,
        maximum_players: game.maxPlayers,
      }));
    } catch (error) {
      setError(error instanceof Error ? error.message : "Could not start the game.");
    } finally {
      setStarting(false);
    }
  }

  const playerCount = session?.player_count ?? 0;
  const minPlayers = minimumPlayers ?? game?.minPlayers ?? 1;

  if (loading) return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: 24 }}>
      <p>Loading lobby...</p>
    </main>
  );
  if (!session) return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: 24 }}>
      <p role="alert">{error || "Lobby not found."}</p>
      <Link to="/host/new">Back to create game</Link>
    </main>
  );

  return (
    <main
      style={{
        maxWidth: 720,
        margin: "0 auto",
        padding: 24,
      }}
    >
      <header>
        <p
          style={{
            margin: 0,
            color: "var(--text-muted)",
            fontSize: 14,
          }}
        >
          Host lobby
        </p>

        <h1 style={{ margin: "8px 0 0" }}>
          {game?.name ?? "Lobby"}
        </h1>

        {game && (
          <p
            style={{
              color: "var(--text-muted)",
              lineHeight: 1.5,
            }}
          >
            {game.description}
          </p>
        )}
        <p style={{ color: "var(--text-muted)" }}>
          Hosted by {session.host_name}
        </p>
      </header>

      <section
        style={{
          margin: "24px 0",
          padding: 24,
          textAlign: "center",
          border: "1px solid var(--border)",
          borderRadius: 12,
        }}
      >
        <p
          style={{
            margin: 0,
            color: "var(--text-muted)",
            fontSize: 14,
          }}
        >
          Join Code
        </p>

        <h2
          style={{
            margin: "8px 0 0",
            fontSize: 48,
            letterSpacing: 8,
          }}
        >
          {code}
        </h2>

        <p
          style={{
            margin: "12px 0 0",
            color: "var(--text-muted)",
          }}
        >
          Share this code with your players.
        </p>
      </section>

      <section
        style={{
          marginBottom: 24,
          padding: 24,
          border: "1px solid var(--border)",
          borderRadius: 12,
        }}
      >
        <h2 style={{ marginTop: 0 }}>Players</h2>

        <p
          style={{
            margin: 0,
            fontSize: 32,
            fontWeight: 700,
          }}
        >
          {playerCount}
          {game ? ` / ${game.maxPlayers}` : ""}
        </p>

        <p
          style={{
            color: "var(--text-muted)",
            marginBottom: 0,
          }}
        >
          Players currently in the lobby
        </p>

        <p aria-live="polite" style={{ color: "var(--text-muted)" }}>
          {readyCount} of {playerCount} players ready
        </p>

        {session.players.length > 0 && (
          <ul
            style={{
              marginTop: 20,
              paddingLeft: 20,
            }}
          >
            {session.players.map((player) => (
              <li key={player.player_id}>
                {player.name} &middot; {player.ready ? "Ready" : "Not ready"}
              </li>
            ))}
          </ul>
        )}

        {session.players.length === 0 && (
          <p style={{ color: "var(--text-muted)" }}>
            No players have joined yet.
          </p>
        )}
      </section>

      <section
        style={{
          marginBottom: 24,
          padding: 24,
          border: "1px solid var(--border)",
          borderRadius: 12,
        }}
      >
        <h2 style={{ marginTop: 0 }}>Start conditions</h2>

        {game ? (
          <>
            <label
              htmlFor="minimum-players"
              style={{
                display: "block",
                marginBottom: 8,
                color: "var(--text-muted)",
              }}
            >
              Minimum players required
            </label>

            <input
              id="minimum-players"
              type="number"
              min={1}
              max={game.maxPlayers}
              value={minPlayers}
              disabled={session.game_started}
              onChange={(event) =>
                setMinimumPlayers(Math.min(game.maxPlayers, Math.max(1, Math.floor(Number(event.target.value)))))
              }
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: 12,
                border: "1px solid var(--border)",
                borderRadius: 8,
                background: "var(--surface)",
                color: "var(--text)",
                fontSize: 16,
              }}
            />

            <p
              style={{
                marginBottom: 0,
                color: "var(--text-muted)",
                fontSize: 14,
              }}
            >
              The game requires at least {minPlayers}{" "}
              players and supports up to {game.maxPlayers}{" "}
              players.
            </p>
          </>
        ) : (
          <p style={{ color: "var(--text-muted)" }}>
            No game configuration found.
          </p>
        )}
      </section>

      <section
        style={{
          marginBottom: 24,
          padding: 24,
          border: "1px solid var(--border)",
          borderRadius: 12,
        }}
      >
        <h2 style={{ marginTop: 0 }}>Game status</h2>

        {session.game_started && (
          <p style={{ color: "var(--text-muted)" }}>Game started.</p>
        )}

        {!game && (
          <p style={{ color: "var(--text-muted)" }}>
            No game selected.
          </p>
        )}

        {game && !session.game_started && playerCount < minPlayers && (
          <p style={{ color: "var(--text-muted)" }}>
            Waiting for{" "}
            {minPlayers - playerCount} more player
            {minPlayers - playerCount === 1 ? "" : "s"}.
          </p>
        )}

        {game && playerCount > game.maxPlayers && (
          <p style={{ color: "var(--text-muted)" }}>
            Too many players for this game.
          </p>
        )}

        {canStart && (
          <p style={{ color: "var(--text-muted)" }}>
            The lobby meets the current start conditions.
          </p>
        )}

        <button
          type="button"
          disabled={!canStart || starting}
          onClick={handleStart}
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
            cursor:
              canStart && !starting
                ? "pointer"
                : "not-allowed",
            opacity:
              canStart && !starting
                ? 1
                : 0.4,
          }}
        >
          {session.game_started ? "Game started" : starting ? "Starting..." : "Start Game"}
        </button>
      </section>

      {error && (
        <p
          role="alert"
          style={{
            padding: 12,
            border: "1px solid var(--border)",
            borderRadius: 8,
            color: "var(--text-muted)",
          }}
        >
          {error}
        </p>
      )}

      <p>
        <Link to="/host/new">Back to create game</Link>
      </p>
    </main>
  );
}
