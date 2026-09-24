/**
 * Filter criteria for the game picker on the create-game page.
 *
 * Values are kept as raw strings rather than numbers so the inputs can be
 * cleared — a controlled number input coerced to 0 can't be emptied. A blank
 * field means "unbounded on that side".
 */
import type { GameSummary } from "./games";

export interface GameFilters {
  minPlayers: string;
  maxPlayers: string;
  minMinutes: string;
  maxMinutes: string;
}

export const FILTER_FIELDS: { key: keyof GameFilters; label: string }[] = [
  { key: "minPlayers", label: "Min players" },
  { key: "maxPlayers", label: "Max players" },
  { key: "minMinutes", label: "Min minutes" },
  { key: "maxMinutes", label: "Max minutes" },
];

export const emptyFilters: GameFilters = {
  minPlayers: "",
  maxPlayers: "",
  minMinutes: "",
  maxMinutes: "",
};

function bound(raw: string, fallback: number): number {
  const value = Number.parseInt(raw, 10);
  return Number.isNaN(value) ? fallback : value;
}

/**
 * Ranges match when they overlap, not when the game's range sits entirely
 * inside the filter's. A host asking for 10–20 players wants Quiplash (10–50)
 * in the results, because it can be played with that many people. Overlap also
 * handles the common case of an exact headcount: setting min and max to the
 * same number yields every game that supports it.
 */
function overlaps(
  gameMin: number,
  gameMax: number,
  rawMin: string,
  rawMax: string,
): boolean {
  return gameMin <= bound(rawMax, Infinity) && gameMax >= bound(rawMin, -Infinity);
}

export function filterGames(
  games: GameSummary[],
  filters: GameFilters,
): GameSummary[] {
  return games.filter(
    (game) =>
      overlaps(
        game.minPlayers,
        game.maxPlayers,
        filters.minPlayers,
        filters.maxPlayers,
      ) &&
      overlaps(
        game.minMinutes,
        game.maxMinutes,
        filters.minMinutes,
        filters.maxMinutes,
      ),
  );
}

export function activeFilterCount(filters: GameFilters): number {
  return Object.values(filters).filter((value) => value.trim() !== "").length;
}

export interface FilterError {
  /** The field to flag, so the popup can mark the offending input. */
  field: keyof GameFilters;
  message: string;
}

function isInverted(rawMin: string, rawMax: string): boolean {
  const min = rawMin.trim();
  const max = rawMax.trim();
  // A bound is only comparable when both ends are set.
  if (min === "" || max === "") return false;
  return Number(min) > Number(max);
}

/**
 * Checked on apply rather than per keystroke, so a half-typed range isn't
 * flagged mid-edit. Equal bounds are allowed — min and max of 20 is how you
 * ask for games that support exactly 20 players.
 */
export function validateFilters(filters: GameFilters): FilterError | null {
  for (const field of FILTER_FIELDS) {
    const raw = filters[field.key].trim();
    if (raw === "") continue;
    if (!/^\d+$/.test(raw) || Number(raw) < 1) {
      return {
        field: field.key,
        message: `${field.label} must be a whole number above 0.`,
      };
    }
  }

  if (isInverted(filters.minPlayers, filters.maxPlayers)) {
    return {
      field: "minPlayers",
      message: "Min players can't be more than max players.",
    };
  }

  if (isInverted(filters.minMinutes, filters.maxMinutes)) {
    return {
      field: "minMinutes",
      message: "Min minutes can't be more than max minutes.",
    };
  }

  return null;
}
