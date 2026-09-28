import { useEffect, useId, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import type { GameSummary } from "./games";

interface GameSelectProps {
  games: GameSummary[];
  value: string;
  onChange: (id: string) => void;
  describedBy?: string;
}

/**
 * Listbox in place of a native <select>. The browser paints a native dropdown
 * with OS colors, which can't be made transparent — this renders the list
 * ourselves so it matches the frosted panels on the rest of the page.
 */
export default function GameSelect({
  games,
  value,
  onChange,
  describedBy,
}: GameSelectProps) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listId = useId();

  const selected = games.find((game) => game.id === value);

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  // Filtering can shrink the list out from under the highlight while it's open.
  useEffect(() => {
    setActiveIndex((index) => Math.min(index, Math.max(games.length - 1, 0)));
  }, [games.length]);

  function openList() {
    const index = games.findIndex((game) => game.id === value);
    setActiveIndex(index >= 0 ? index : 0);
    setOpen(true);
  }

  function close() {
    setOpen(false);
    triggerRef.current?.focus();
  }

  function choose(index: number) {
    const game = games[index];
    if (!game) return;
    onChange(game.id);
    close();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (!open) {
      if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openList();
      }
      return;
    }

    switch (event.key) {
      case "Escape":
        event.preventDefault();
        close();
        break;
      case "ArrowDown":
        event.preventDefault();
        setActiveIndex((index) => Math.min(index + 1, games.length - 1));
        break;
      case "ArrowUp":
        event.preventDefault();
        setActiveIndex((index) => Math.max(index - 1, 0));
        break;
      case "Home":
        event.preventDefault();
        setActiveIndex(0);
        break;
      case "End":
        event.preventDefault();
        setActiveIndex(games.length - 1);
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        choose(activeIndex);
        break;
    }
  }

  return (
    <div className="select" ref={rootRef} onKeyDown={handleKeyDown}>
      <button
        ref={triggerRef}
        type="button"
        className={`select__trigger${open ? " is-open" : ""}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-activedescendant={
          open && games.length > 0 ? `${listId}-${activeIndex}` : undefined
        }
        aria-describedby={describedBy}
        onClick={() => (open ? setOpen(false) : openList())}
      >
        <span className={selected ? "select__value" : "select__placeholder"}>
          {selected ? selected.name : "Select a game…"}
        </span>
        <span className="select__chevron" aria-hidden="true" />
      </button>

      {open && (
        <ul className="select__list" id={listId} role="listbox" tabIndex={-1}>
          {games.length === 0 && (
            <li className="select__no-match" role="presentation">
              No games match your filters
            </li>
          )}
          {games.map((game, index) => (
            <li
              key={game.id}
              id={`${listId}-${index}`}
              role="option"
              aria-selected={game.id === value}
              className={`select__option${index === activeIndex ? " is-active" : ""}`}
              onMouseEnter={() => setActiveIndex(index)}
              onClick={() => choose(index)}
            >
              {game.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
