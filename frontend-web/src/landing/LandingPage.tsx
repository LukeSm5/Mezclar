import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import "./LandingPage.css";

const JOIN_CODE_LENGTH = 6;

function sanitizeCode(raw: string): string {
  return raw.replace(/[^0-9]/g, "").slice(0, JOIN_CODE_LENGTH);
}

export default function LandingPage() {
  const navigate = useNavigate();
  const [code, setCode] = useState("");

  const isComplete = code.length === JOIN_CODE_LENGTH;

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!isComplete) return;
    navigate("/join/" + code);
  }

  return (
    <main className="landing">
      <div className="landing__inner">
        <header className="landing__header">
          <h1 className="landing__title">Mezclar</h1>
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
            placeholder="123456"
            inputMode="numeric"
            autoComplete="off"
            spellCheck={false}
            maxLength={JOIN_CODE_LENGTH}
            aria-label="Six digit join code"
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
