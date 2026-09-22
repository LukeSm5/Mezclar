import { Link, useParams } from "react-router-dom";

export default function JoinScreen() {
  const { code } = useParams<{ code: string }>();

  return (
    <main style={{ maxWidth: 560, margin: "0 auto", padding: 24 }}>
      <h1>Joining {code}</h1>
      <p style={{ color: "var(--text-muted)" }}>
        Placeholder. Name entry and the lobby socket connection go here.
      </p>
      <Link to="/">Back</Link>
    </main>
  );
}
