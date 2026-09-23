import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createSession } from "../api/client";
import { GAMES, formatPlayerRange, formatTimeRange } from "./games";
import GameSelect from "./GameSelect";
import {
  GAME_OPTIONS,
  defaultOptionValues,
  type GameOptionValues,
} from "./gameOptions";
import "./CreateGame.css";

export default function CreateGame() {
  const navigate = useNavigate();
  const [hostName, setHostName] = useState("");
  const [gameId, setGameId] = useState("");
  const [options, setOptions] = useState<GameOptionValues>(defaultOptionValues);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const selectedGame = GAMES.find((game) => game.id === gameId);

  function setOption(id: string, value: boolean) {
    setOptions((previous) => ({ ...previous, [id]: value }));
  }

  async function handleStart() {
    if (!selectedGame || !hostName.trim() || creating) return;
    setCreating(true);
    setError("");

    try {
      const session = await createSession(hostName.trim(), selectedGame.id, options);
      navigate("/host/lobby/" + session.join_code);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Could not create the lobby.");
    } finally {
      setCreating(false);
    }
  }

  return (
    <main className="create">
      <div className="create__inner">
        <button className="create__back" type="button" onClick={() => navigate("/")}>
          &larr; Back
        </button>

        <header className="create__header">
          <h1 className="create__title">Host a game</h1>
          <p className="create__lede">
            Pick a game and set your options. You&rsquo;ll get a join code to share
            on the next screen.
          </p>
        </header>

        <section className="create__section" aria-labelledby="host-heading">
          <h2 className="create__heading" id="host-heading">Your name</h2>
          <input
            className="create__name"
            value={hostName}
            onChange={(event) => setHostName(event.target.value)}
            placeholder="Host name"
            maxLength={40}
            autoComplete="name"
          />
        </section>

        <section className="create__section" aria-labelledby="game-heading">
          <h2 className="create__heading" id="game-heading">
            Choose a game
          </h2>

          <GameSelect
            games={GAMES}
            value={gameId}
            onChange={setGameId}
            describedBy={selectedGame ? "game-detail" : undefined}
          />

          {selectedGame ? (
            <div className="create__detail" id="game-detail">
              <div className="create__detail-name">{selectedGame.name}</div>
              <div className="create__meta">
                <span className="create__tag">{formatPlayerRange(selectedGame)}</span>
                <span className="create__tag">{formatTimeRange(selectedGame)}</span>
              </div>
              <p className="create__description">{selectedGame.description}</p>
            </div>
          ) : (
            <p className="create__empty">
              Select a game to see its player count, length, and description.
            </p>
          )}
        </section>

        <section className="create__section" aria-labelledby="options-heading">
          <h2 className="create__heading" id="options-heading">
            Game options
          </h2>

          <div className="create__options">
            {GAME_OPTIONS.map((option) => (
              <label className="option" key={option.id}>
                <span className="option__text">
                  <span className="option__label">{option.label}</span>
                  <span className="option__description">{option.description}</span>
                </span>
                <input
                  className="option__input"
                  type="checkbox"
                  checked={options[option.id] ?? option.defaultValue}
                  onChange={(event) => setOption(option.id, event.target.checked)}
                />
                <span className="option__switch" aria-hidden="true" />
              </label>
            ))}
          </div>
        </section>

        <div className="create__actions">
          <button
            className="create__start"
            type="button"
            onClick={handleStart}
            disabled={!selectedGame || !hostName.trim() || creating}
          >
            {creating ? "Creating..." : "Create lobby"}
          </button>
          {!selectedGame && (
            <p className="create__hint">Choose a game to continue.</p>
          )}
          {error && <p className="create__hint" role="alert">{error}</p>}
        </div>
      </div>
    </main>
  );
}
