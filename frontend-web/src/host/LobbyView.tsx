import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getSession, type GameSession } from "../api/client";
import { createLobbyQrCode } from "../utils/lobby";
import { GAMES } from "./games";
import "../styles.css";

export default function LobbyView() {
  const { code } = useParams<{ code: string }>();
  const [session, setSession] = useState<GameSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [qrCode, setQrCode] = useState("");
  const joinUrl = code ? new URL("/join/" + code, window.location.origin).href : "";

  useEffect(() => {
    if (!code) return;
    let active = true;

    async function refresh() {
      try {
        const next = await getSession(code!);
        if (active) {
          setSession(next);
          setError("");
        }
      } catch (error) {
        if (active) setError(error instanceof Error ? error.message : "Could not load the lobby.");
      } finally {
        if (active) setLoading(false);
      }
    }

    void refresh();
    const timer = window.setInterval(refresh, 3000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [code]);

  useEffect(() => {
    if (!joinUrl) return;
    let active = true;
    createLobbyQrCode(joinUrl)
      .then((image) => {
        if (active) setQrCode(image);
      })
      .catch(() => {
        if (active) setQrCode("");
      });
    return () => {
      active = false;
    };
  }, [joinUrl]);

  if (loading) return <main className="lobby"><p>Loading lobby...</p></main>;
  if (!session) {
    return (
      <main className="lobby">
        <p role="alert">{error || "Lobby not found."}</p>
        <Link to="/host/new">Back to create game</Link>
      </main>
    );
  }

  const game = GAMES.find((entry) => entry.id === session.settings.gameId);

  return (
    <main className="lobby">
      <h1>{game?.name ?? "Mezclar lobby"}</h1>
      <p className="lobby__game">Hosted by {session.host_name} · Waiting for players</p>
      {error && <p className="lobby__error" role="alert">{error}</p>}

      <section className="lobby-top" aria-label="Lobby information">
        <div className="join-code">
          <h2>Join code</h2>
          <p className="code">{session.join_code}</p>
        </div>

        <div className="qr-code">
          <h2>QR code</h2>
          {qrCode && (
            <img
              src={qrCode}
              width="192"
              height="192"
              alt="QR code linking to the join page"
            />
          )}
          <a href={joinUrl}>{joinUrl}</a>
        </div>
      </section>

      <section className="participants" aria-labelledby="participants-title">
        <h2 id="participants-title">Participants ({session.players.length})</h2>
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
      <Link className="lobby__back" to="/host/new">Back to create game</Link>
    </main>
  );
}
