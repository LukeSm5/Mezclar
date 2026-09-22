import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import "./JoinScreen.css";

interface JoinSessionResponse {
  player_id: string;
  name: string;
  session_id: string;
}

export default function JoinScreen() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (!code || isJoining) return;

    setIsJoining(true);
    setError("");

    const playerId = crypto.randomUUID();

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/session/${code}/join`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            player_id: playerId,
            name: name.trim() || null,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Unable to join session.");
      }

      const sessionData: JoinSessionResponse = data;

      navigate(`/player/${sessionData.session_id}`, {
        state: {
          playerId: sessionData.player_id,
          playerName: sessionData.name,
          sessionId: sessionData.session_id,
        },
      });
    } catch (error) {
      console.error("Failed to join session:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Unable to join session. Please try again."
      );
    } finally {
      setIsJoining(false);
    }
  }

  return (
    <main className="join">
      <div className="join__inner">
        <header className="join__header">
          <p className="join__eyebrow">Joining game</p>

          <h1 className="join__title">{code}</h1>

          <p className="join__welcome">
            Enter your name to jump into the game.
          </p>
        </header>

        <form className="join__form" onSubmit={handleSubmit}>
          <label className="join__label" htmlFor="player-name">
            Your name
          </label>

          <input
            id="player-name"
            className="join__name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Enter your name"
            maxLength={30}
            autoComplete="off"
            autoFocus
          />

          <button
            className="join__submit"
            type="submit"
            disabled={isJoining || !code}
          >
            {isJoining ? "Joining..." : "Join game"}
          </button>

          {error && (
            <p className="join__error" role="alert">
              {error}
            </p>
          )}
        </form>

        <Link className="join__back" to="/">
          &larr; Back
        </Link>
      </div>
    </main>
  );
}