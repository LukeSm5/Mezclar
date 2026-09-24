import { useEffect, useId, useRef, useState } from "react";
import type { FormEvent, KeyboardEvent } from "react";
import {
  FILTER_FIELDS,
  activeFilterCount,
  emptyFilters,
  validateFilters,
  type FilterError,
  type GameFilters,
} from "./gameFilters";

interface GameFilterPopoverProps {
  filters: GameFilters;
  onApply: (filters: GameFilters) => void;
}

/**
 * Player/time range filters in a popup. Edits are held as a draft and only
 * take effect on apply, so dismissing the popup discards them.
 */
export default function GameFilterPopover({
  filters,
  onApply,
}: GameFilterPopoverProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<GameFilters>(filters);
  const [error, setError] = useState<FilterError | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const panelId = useId();

  const activeCount = activeFilterCount(filters);

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  useEffect(() => {
    if (open) firstFieldRef.current?.focus();
  }, [open]);

  function openPanel() {
    setDraft(filters);
    setError(null);
    setOpen(true);
  }

  function close() {
    setOpen(false);
    triggerRef.current?.focus();
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const problem = validateFilters(draft);
    if (problem) {
      setError(problem);
      return;
    }
    onApply(draft);
    close();
  }

  function handleClear() {
    setDraft(emptyFilters);
    setError(null);
    onApply(emptyFilters);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (open && event.key === "Escape") {
      event.preventDefault();
      close();
    }
  }

  return (
    <div className="filter-pop" ref={rootRef} onKeyDown={handleKeyDown}>
      <button
        ref={triggerRef}
        type="button"
        className={`filter-pop__trigger${open ? " is-open" : ""}`}
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        onClick={() => (open ? close() : openPanel())}
      >
        Filters
        {activeCount > 0 && (
          <span className="filter-pop__badge">{activeCount}</span>
        )}
      </button>

      {open && (
        <form className="filter-pop__panel" id={panelId} onSubmit={handleSubmit}>
          <div className="filter-pop__grid">
            {FILTER_FIELDS.map((field, index) => (
              <label className="filter-pop__field" key={field.key}>
                <span className="filter-pop__label">{field.label}</span>
                <input
                  ref={index === 0 ? firstFieldRef : undefined}
                  className="filter-pop__number"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  value={draft[field.key]}
                  aria-invalid={error?.field === field.key}
                  onChange={(event) => {
                    setError(null);
                    setDraft((previous) => ({
                      ...previous,
                      [field.key]: event.target.value,
                    }));
                  }}
                  placeholder="Any"
                />
              </label>
            ))}
          </div>

          {error && (
            <p className="filter-pop__error" role="alert">
              {error.message}
            </p>
          )}

          <div className="filter-pop__actions">
            <button
              type="button"
              className="filter-pop__clear"
              onClick={handleClear}
              disabled={activeFilterCount(draft) === 0}
            >
              Clear
            </button>
            <button type="submit" className="filter-pop__apply">
              Apply
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
