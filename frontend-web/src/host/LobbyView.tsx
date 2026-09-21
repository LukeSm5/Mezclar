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

  function getParticipantInitial(name: string) {
    return name.trim().charAt(0).toUpperCase() || '?';
  }

  return (
    <main className="lobby">
      <section className="lobby-info" aria-labelledby="lobby-title">
        <div className="lobby-details">
          <p className="eyebrow">
            <span className="eyebrow-dot" aria-hidden="true" />
            Host lobby
          </p>

          <h1 id="lobby-title">{lobbyName}</h1>

          <p className="lobby-instruction">
            Share the code or let players scan the QR code to join.
          </p>

          <div className="join-code">
            <p className="join-code-label">Join code</p>
            <p className="code">{joinCode}</p>
          </div>
        </div>

        <div className="qr-area">
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
          <p className="muted qr-note">Local preview link</p>
        </div>
      </section>

      <section className="participants" aria-labelledby="participants-title">
        <div className="participants-heading">
          <div>
            <p className="section-label">In the room</p>
            <h2 id="participants-title">Participants</h2>
          </div>

          <span
            className="count"
            aria-label={`${participants.length} participants`}
          >
            {participants.length}
          </span>
        </div>

        {participants.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon" aria-hidden="true">
              +
            </div>
            <p className="empty-state-title">No participants yet</p>
            <p className="muted">
              Participants will appear here when they join.
            </p>
          </div>
        ) : (
          <ul className="participant-list">
            {participants.map((participant) => (
              <li key={participant.id}>
                <span className="participant-avatar" aria-hidden="true">
                  {getParticipantInitial(participant.display_name)}
                </span>
                <span>{participant.display_name}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
