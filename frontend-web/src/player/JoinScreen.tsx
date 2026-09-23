import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { getSession, joinSession, type GameSession } from "../api/client";
import { GAMES } from "../host/games";
import "../styles.css";

export default function JoinScreen() {
  const { code } = useParams<{ code: string }>();
  const [session, setSession] = useState<GameSession | null>(null);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [joined, setJoined] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!code) return;
    let active = true;
    getSession(code)
      .then((found) => {
        if (active) setSession(found);
      })
      .catch((error) => {
        if (active) setError(error instanceof Error ? error.message : "Could not load the lobby.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [code]);

  async function handleJoin(event: FormEvent) {
    event.preventDefault();
    if (!code || !name.trim() || joining) return;
    setJoining(true);
    setError("");

    try {
      const updated = await joinSession(code, name.trim());
      setSession(updated);
      setJoined(true);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Could not join the lobby.");
    } finally {
      setJoining(false);
    }
  }

  if (loading) return <main className="lobby"><p>Finding lobby...</p></main>;
  if (!session) {
    return (
      <main className="lobby">
        <p role="alert">{error || "Lobby not found."}</p>
        <Link to="/">Back to join</Link>
      </main>
    );
  }

  const game = GAMES.find((entry) => entry.id === session.settings.gameId);

  return (
    <main className="lobby">
      <h1>{game?.name ?? "Mezclar lobby"}</h1>
      <p className="lobby__game">
        Code {session.join_code} · Hosted by {session.host_name}
      </p>

      {joined ? (
        <p>You're in! Waiting for the host to start.</p>
      ) : (
        <form className="lobby__form" onSubmit={handleJoin}>
          <label htmlFor="player-name">Your name</label>
          <input
            id="player-name"
            className="lobby__input"
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={40}
            autoComplete="name"
          />
          <button className="lobby__button" type="submit" disabled={!name.trim() || joining}>
            {joining ? "Joining..." : "Join lobby"}
          </button>
        </form>
      )}
      {error && <p className="lobby__error" role="alert">{error}</p>}

      <section className="participants" aria-labelledby="players-title">
        <h2 id="players-title">Participants ({session.players.length})</h2>
        {session.players.length === 0 ? (
          <p>No participants yet.</p>
        ) : (
          <ul>
            {session.players.map((player) => (
              <li key={player.id}>{player.display_name}</li>
            ))}
          </ul>
        )}
      </section>
      <Link className="lobby__back" to="/">Back to join</Link>
    </main>
  );
}
