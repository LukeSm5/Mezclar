import { Link, useParams } from "react-router-dom";
import { useState } from "react";
import "./JoinScreen.css"

export default function JoinScreen() {
  const { code } = useParams<{ code: string }>();
  const [name, setName] = useState("");

  function handleSubmit() {
  // later: call submitUsername() from client.ts here
}

  return (
    <main style={{ maxWidth: 560, margin: "0 auto", padding: 24 }}>
      <h1>Joining {code}</h1>
      <p style={{ color: "var(--text-muted)" }}>
        <input className="join-input"
        type="text"
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder="Enter your name"
        />
        <button className="join-button" onClick = {handleSubmit}>Join</button>


      </p>
      <Link to="/">Back</Link>
    </main>
  );
}
