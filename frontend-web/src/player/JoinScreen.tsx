import { Link, useParams } from "react-router-dom";
import { useState } from "react";

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
        <input
        type="text"
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder="Enter your name"
        />
        <button onClick = {handleSubmit}>Join</button>


        Placeholder. Name entry and the lobby socket connection go here.
      </p>
      <Link to="/">Back</Link>
    </main>
  );
}
