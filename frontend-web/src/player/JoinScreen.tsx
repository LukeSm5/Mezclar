import { Link, useParams } from "react-router-dom";
import { useState } from "react";
import "./JoinScreen.css"

export default function JoinScreen() {
  const { code } = useParams<{ code: string }>();
  const [name, setName] = useState("");

  function handleSubmit() {
  // later: call submitUsername() from client.ts here
}

  function handleRegenerate() {

  }

  return (
    <main style={{ maxWidth: 560, margin: "0 auto", padding: 24 }}>
      <h1>Joining {code}</h1>
      <p style={{ color: "var(--text-muted)" }}>
        <div className="join-input-row">
          <input className="join-input"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Enter your name"
          />
          <button
            type="button"                          // important — see note below
            className="join-regenerate-button"
            onClick={handleRegenerate}
          >
            ↻
          </button>
        </div>
        <button className="join-button" onClick = {handleSubmit}>Join</button>
      </p>
      <Link to="/">Back</Link>
    </main>
  );
}
