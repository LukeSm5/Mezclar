import { useEffect, useState } from 'react';
import { createLobbyQrCode, generateJoinCode } from '../utils/lobby';

type Participant = {
  id: string;
  display_name: string;
};

type LobbyViewProps = {
  lobbyName?: string;
  participants?: Participant[];
  codeLength?: number;
};

export default function LobbyView({
  lobbyName = 'Mezclar lobby',
  participants = [],
  codeLength = 6,
}: LobbyViewProps) {
  const [joinCode] = useState(() => generateJoinCode(codeLength));
  const [qrCode, setQrCode] = useState('');
  const [qrError, setQrError] = useState(false);
  const localUrl = `http://localhost:${window.location.port || '5173'}`;

  useEffect(() => {
    let active = true;

    createLobbyQrCode(localUrl).then(
      (image) => {
        if (active) {
          setQrCode(image);
        }
      },
      () => {
        if (active) {
          setQrError(true);
        }
      },
    );

    return () => {
      active = false;
    };
  }, [localUrl]);

  return (
    <main className="lobby">
      <h1>{lobbyName}</h1>

      <section className="lobby-top" aria-label="Lobby information">
        <div className="join-code">
          <h2>Join code</h2>
          <p className="code">{joinCode}</p>
        </div>

        <div className="qr-code">
          <h2>QR code</h2>

          {qrCode ? (
            <img
              src={qrCode}
              width="192"
              height="192"
              alt="QR code linking to the local lobby page"
            />
          ) : (
            <p role="status" aria-live="polite">
              {qrError ? 'QR code could not be created.' : 'Creating QR code...'}
            </p>
          )}

          <a href={localUrl}>{localUrl}</a>
        </div>
      </section>

      <section className="participants" aria-labelledby="participants-title">
        <h2 id="participants-title">
          Participants ({participants.length})
        </h2>

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
    </main>
  );
}
