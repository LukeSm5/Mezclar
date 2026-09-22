import { Link, useLocation } from "react-router-dom";
import { GAMES } from "./games";
import type { GameOptionValues } from "./gameOptions";
import { useEffect, useState } from "react";

interface LobbyState {
  sessionId?: string;
  gameId?: string;
  options?: GameOptionValues;
}

interface SessionPlayer {
  player_id: string;
  name: string;
}

interface SessionResponse {
  session_id: string;
  player_count: number;
  players: SessionPlayer[];
  game_started: boolean;
}

export default function LobbyView() {
  const { state } = useLocation() as { state: LobbyState | null };
  const game = GAMES.find((entry) => entry.id === state?.gameId);

  const sessionId = state?.sessionId;

  const [session, setSession] = useState<SessionResponse | null>(null);

  const [minPlayers, setMinPlayers] = useState(game?.minPlayers ?? 2);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [isStarting, setIsStarting] = useState(false);
  const [startError, setStartError] = useState("");

  useEffect(() => {
    if (!sessionId) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    async function fetchSession() {
      try {
        const response = await fetch(
          `http://127.0.0.1:8000/session/${sessionId}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.detail || "Unable to load session."
          );
        }

        if (isMounted) {
          setSession(data);
          setError("");
        }
      } catch (error) {
        console.error("Failed to fetch session:", error);

        if (isMounted) {
          setError(
            error instanceof Error
              ? error.message
              : "Unable to load session."
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchSession();

    const intervalId = window.setInterval(fetchSession, 2000);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, [sessionId]);

  const playerCount = session?.player_count ?? 0;

  const isReadyToStart = 
    game !== undefined &&
    playerCount >= minPlayers &&
    playerCount <= game.maxPlayers;

  function handleMinPlayersChange(value: string) {
    const parsedValue = Number(value);

    if (!game || !Number.isFinite(parsedValue)) {
      return;
    }

    const newMin = Math.min(
      game.maxPlayers, Math.max(1, Math.floor(parsedValue))
    );

    setMinPlayers(newMin);
  }

  async function handleStartGame() {
    if (!sessionId || !game || !isReadyToStart || isStarting) {
      return;
    }

    setIsStarting(true);
    setStartError("");

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/session/${sessionId}/start`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            game_id: game.id,
            minimum_players: minPlayers,
            maximum_players: game.maxPlayers,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Unable to start the game."
        );
      }

      console.log("Game started:", data);

      setSession((previous) =>
        previous
          ? {
              ...previous,
              game_started: true,
            }
          : previous
      );
    } catch (error) {
      console.error("Failed to start game:", error);

      setStartError(
        error instanceof Error
          ? error.message
          : "Unable to start the game."
      );
    } finally {
      setIsStarting(false);
    }
  }


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
      </header>

      {!sessionId ? (
        <section style={{ marginTop: 24 }}>
          <p style={{ color: "var(--text-muted)" }}>
            No join code found. Please create a new game session.
          </p>

          <Link to="/host/new">Back to create game</Link>
        </section>
      ) : (
        <>
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
              {sessionId}
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
              {isLoading
                ? "Loading players..."
                : "Players currently in the lobby"}
            </p>

            {session && session.players.length > 0 && (
              <ul
                style={{
                  marginTop: 20,
                  paddingLeft: 20,
                }}
              >
                {session.players.map((player) => (
                  <li key={player.player_id}>
                    {player.name}
                  </li>
                ))}
              </ul>
            )}

            {session && session.players.length === 0 && (
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
                  onChange={(event) =>
                    handleMinPlayersChange(event.target.value)
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

            {!game && (
              <p style={{ color: "var(--text-muted)" }}>
                No game selected.
              </p>
            )}

            {game && playerCount < minPlayers && (
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

            {isReadyToStart && (
              <p style={{ color: "var(--text-muted)" }}>
                The lobby meets the current start conditions.
              </p>
            )}

            <button
              type="button"
              disabled={!isReadyToStart || isStarting}
              onClick={handleStartGame}
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
                  isReadyToStart && !isStarting
                    ? "pointer"
                    : "not-allowed",
                opacity:
                  isReadyToStart && !isStarting
                    ? 1
                    : 0.4,
              }}
            >
              {isStarting ? "Starting..." : "Start Game"}
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
        </>
      )}
    </main>
  );
}


