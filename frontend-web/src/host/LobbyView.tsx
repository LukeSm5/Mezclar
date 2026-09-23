import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { createLobbyQrCode, generateJoinCode } from "../utils/lobby";
import { GAMES } from "./games";
import type { GameOptionValues } from "./gameOptions";
import "../styles.css";

type Participant = {
  id: string;
  display_name: string;
};

type LobbyState = {
  gameId?: string;
  options?: GameOptionValues;
};

type LobbyViewProps = {
  joinCode?: string;
  lobbyName?: string;
  participants?: Participant[];
};

export default function LobbyView({
  joinCode,
  lobbyName = "Mezclar lobby",
  participants = [],
}: LobbyViewProps) {
  const { state } = useLocation() as { state: LobbyState | null };
  const game = GAMES.find((entry) => entry.id === state?.gameId);
  const [demoJoinCode] = useState(generateJoinCode);
  const code = joinCode ?? demoJoinCode;
  const joinUrl = new URL(`/join/${code}`, window.location.origin).href;
  const [qrCode, setQrCode] = useState("");

  useEffect(() => {
    let current = true;
    createLobbyQrCode(joinUrl).then((image) => {
      if (current) setQrCode(image);
    });
    return () => {
      current = false;
    };
  }, [joinUrl]);

  return (
    <main className="lobby">
      <h1>{lobbyName}</h1>
      <p className="lobby__game">
        {game
          ? `Configured game: ${game.name}. Options: ${JSON.stringify(state?.options ?? {})}`
          : "No game configured — reached directly rather than from Create game."}
      </p>

      <section className="lobby-top" aria-label="Lobby information">
        <div className="join-code">
          <h2>Join code</h2>
          <p className="code">{code}</p>
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
        <h2 id="participants-title">Participants ({participants.length})</h2>
        {participants.length === 0 ? (
          <p>No participants yet.</p>
        ) : (
          <ul>
            {participants.map((participant) => (
              <li key={participant.id}>{participant.display_name}</li>
            ))}
          </ul>
        )}
      </section>
      <Link className="lobby__back" to="/host/new">Back to create game</Link>
    </main>
  );
}
