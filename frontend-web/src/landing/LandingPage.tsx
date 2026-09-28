import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import mezclarLogo from "../assets/mezclar-logo.png";
import "./LandingPage.css";

// The backend does not define a join-code format yet. Change this (and the
// sanitizer below) once session codes are actually generated server-side.
const JOIN_CODE_LENGTH = 4;

function sanitizeCode(raw: string): string {
  return raw
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, JOIN_CODE_LENGTH);
}

export default function LandingPage() {
  const navigate = useNavigate();
  const [code, setCode] = useState("");

  const isComplete = code.length === JOIN_CODE_LENGTH;

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!isComplete) return;
    navigate(`/join/${code}`);
  }

  return (
    <main className="landing">
      <div className="landing__inner">
        <header className="landing__header">
          <img className="landing__title" src={mezclarLogo} alt="Mezclar" />
          <p className="landing__welcome">
            Get a room talking. Enter your game code to jump in.
          </p>
        </header>

        <form className="landing__join" onSubmit={handleSubmit}>
          <input
            id="join-code"
            className="landing__code"
            value={code}
            onChange={(event) => setCode(sanitizeCode(event.target.value))}
            placeholder="AB12"
            inputMode="text"
            autoComplete="off"
            autoCapitalize="characters"
            autoCorrect="off"
            spellCheck={false}
            maxLength={JOIN_CODE_LENGTH}
            autoFocus
          />
          <button className="landing__submit" type="submit" disabled={!isComplete}>
            Join game
          </button>
        </form>

        <button
          className="landing__host"
          type="button"
          onClick={() => navigate("/host/new")}
        >
          Host a game instead
        </button>
      </div>

      <footer className="landing__footer">
        <button
          className="landing__howto"
          type="button"
          onClick={() => navigate("/about")}
        >
          About Mezclar
        </button>
      </footer>
    </main>
  );
}
