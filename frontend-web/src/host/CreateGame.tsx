import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GAMES, formatPlayerRange, formatTimeRange } from "./games";
import GameSelect from "./GameSelect";
import {
  GAME_OPTIONS,
  defaultOptionValues,
  type GameOptionValues,
} from "./gameOptions";
import {
  activeFilterCount,
  emptyFilters,
  filterGames,
  type GameFilters,
} from "./gameFilters";
import GameFilterPopover from "./GameFilterPopover";
import "./CreateGame.css";
import { toggleAutoNames } from "../api/client";

export default function CreateGame() {
  const navigate = useNavigate();
  const [gameId, setGameId] = useState("");
  const [options, setOptions] = useState<GameOptionValues>(defaultOptionValues);
  const [filters, setFilters] = useState<GameFilters>(emptyFilters);

  // Looked up against the full catalog, not the filtered list: filtering is a
  // way to find a game, and must not disturb one that's already chosen.
  const selectedGame = GAMES.find((game) => game.id === gameId);
  const visibleGames = filterGames(GAMES, filters);
  const filtersActive = activeFilterCount(filters) > 0;

  function setOption(id: string, value: boolean) {
    setOptions((previous) => ({ ...previous, [id]: value }));
  }

  function handleStart() {
    if (!selectedGame) return;
    const session_id = crypto.randomUUID();

    if (options.autoGenerateNames) {
      toggleAutoNames(session_id, true);
    }
    navigate("/host/lobby", { state: { gameId: selectedGame.id, options } });
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
            on the next screen, and players can join right up until you start.
          </p>
        </header>

        <section className="create__section" aria-labelledby="game-heading">
          <div className="create__heading-row">
            <h2 className="create__heading" id="game-heading">
              Choose a game
            </h2>
            <div className="create__heading-tools">
              {/* Always mounted — a live region inserted alongside its first
                  message tends not to get announced. */}
              <span className="create__count" aria-live="polite">
                {filtersActive
                  ? `${visibleGames.length} of ${GAMES.length} games`
                  : ""}
              </span>
              <GameFilterPopover filters={filters} onApply={setFilters} />
            </div>
          </div>

          <GameSelect
            games={visibleGames}
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
            disabled={!selectedGame}
          >
            Start game
          </button>
          {!selectedGame && (
            <p className="create__hint">Choose a game to continue.</p>
          )}
        </div>
      </div>
    </main>
  );
}
