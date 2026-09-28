import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getSession, startGame, type SessionResponse } from "../api/client";
import { createLobbyQrCode } from "../utils/lobby";
import { GAMES } from "./games";
import "../styles.css";

export default function LobbyView() {
  const { code } = useParams<{ code: string }>();
  const [session, setSession] = useState<SessionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [minimumPlayers, setMinimumPlayers] = useState<number | null>(null);
  const [starting, setStarting] = useState(false);
  const joinUrl = code ? new URL("/join/" + code, window.location.origin).href : "";
  const game = GAMES.find((entry) => entry.id === (session?.game_id ?? session?.settings.gameId));

  useEffect(() => {
    if (!code) return;
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

  useEffect(() => {
    if (!joinUrl) return;
    let active = true;
    createLobbyQrCode(joinUrl).then((image) => {
      if (active) setQrCode(image);
    }).catch(() => {
      if (active) setQrCode("");
    });
    return () => { active = false; };
  }, [joinUrl]);

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

  if (loading) return <main className="lobby"><p>Loading lobby...</p></main>;
  if (!session) return (
    <main className="lobby">
      <p role="alert">{error || "Lobby not found."}</p>
      <Link to="/host/new">Back to create game</Link>
    </main>
  );

  return (
    <main className="lobby">
      <h1>{game?.name ?? "Mezclar lobby"}</h1>
      <p className="lobby__game">
        Hosted by {session.host_name} &middot; {session.game_started ? "Game started" : "Waiting for players"}
      </p>
      <section className="lobby-top" aria-label="Lobby information">
        <div className="join-code">
          <h2>Join code</h2>
          <p className="code">{session.session_id}</p>
        </div>
        <div className="qr-code">
          <h2>QR code</h2>
          {qrCode && <img src={qrCode} width="192" height="192" alt="QR code linking to the join page" />}
          <a href={joinUrl}>{joinUrl}</a>
        </div>
      </section>
      <section className="participants" aria-labelledby="participants-title">
        <h2 id="participants-title">Participants ({session.player_count})</h2>
        <p className="lobby__readiness" aria-live="polite">{readyCount} of {session.player_count} players ready</p>
        {session.players.length === 0 ? <p>No participants yet.</p> : (
          <ul>{session.players.map((player) => (
            <li key={player.player_id}>
              {player.name} &middot; {player.ready ? "Ready" : "Not ready"}
            </li>
          ))}</ul>
        )}
      </section>
      {game && (
        <section className="lobby__start" aria-labelledby="start-title">
          <h2 id="start-title">Start conditions</h2>
          <label htmlFor="minimum-players">Minimum players required</label>
          <input
            id="minimum-players" className="lobby__input" type="number"
            min={1} max={game.maxPlayers} value={minimumPlayers ?? game.minPlayers}
            disabled={session.game_started}
            onChange={(event) => setMinimumPlayers(Math.min(game.maxPlayers, Math.max(1, Math.floor(Number(event.target.value)))))}
          />
          {!session.game_started && session.player_count < (minimumPlayers ?? game.minPlayers) && (
            <p>Waiting for {(minimumPlayers ?? game.minPlayers) - session.player_count} more players.</p>
          )}
          {session.player_count > game.maxPlayers && <p>Too many players for this game.</p>}
          <button className="lobby__button" type="button" disabled={!canStart || starting} onClick={handleStart}>
            {session.game_started ? "Game started" : starting ? "Starting..." : "Start Game"}
          </button>
        </section>
      )}
      {error && <p className="lobby__error" role="alert">{error}</p>}
      <Link className="lobby__back" to="/host/new">Back to create game</Link>
    </main>
  );
}
