import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getSession, joinSession, type SessionResponse } from "../api/client";
import { GAMES } from "../host/games";
import "./JoinScreen.css";

export default function JoinScreen() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [session, setSession] = useState<SessionResponse | null>(null);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState("");
  const game = GAMES.find((entry) => entry.id === (session?.game_id ?? session?.settings.gameId));

  useEffect(() => {
    if (!code) return;
    let active = true;
    setLoading(true);
    setSession(null);
    setError("");
    getSession(code).then((found) => {
      if (active) setSession(found);
    }).catch((error) => {
      if (active) setError(error instanceof Error ? error.message : "Could not load the lobby.");
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [code]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!code || !session || joining || (!name.trim() && !session.auto_generate_names)) return;
    setJoining(true);
    setError("");
    try {
      const playerId = sessionStorage.getItem("mezclar-player:" + code) ?? crypto.randomUUID();
      const player = await joinSession(code, playerId, name);
      sessionStorage.setItem("mezclar-player:" + code, player.player_id);
      navigate("/player/" + code);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Could not join the lobby.");
    } finally {
      setJoining(false);
    }
  }

  return (
    <main className="join">
      <div className="join__inner">
        <header className="join__header">
          <p className="join__eyebrow">{game?.name ?? "Joining game"}</p>
          <h1 className="join__title">{code}</h1>
          {session && <p className="join__welcome">Hosted by {session.host_name}</p>}
        </header>
        {loading ? <p>Finding lobby...</p> : session && (
          <form className="join__form" onSubmit={handleSubmit}>
            <label className="join__label" htmlFor="player-name">Your name</label>
            <input
              id="player-name" className="join__name" type="text" value={name}
              onChange={(event) => setName(event.target.value)} placeholder="Enter your name"
              maxLength={40} autoComplete="name" autoFocus
            />
            {session.auto_generate_names && <p>Leave blank for a generated name.</p>}
            <button className="join__submit" type="submit" disabled={joining || (!name.trim() && !session.auto_generate_names)}>
              {joining ? "Joining..." : "Join game"}
            </button>
          </form>
        )}
        {error && <p className="join__error" role="alert">{error}</p>}
        <Link className="join__back" to="/">&larr; Back</Link>
      </div>
    </main>
  );
}
