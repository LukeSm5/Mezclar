/**
 * Host-configurable options shown on the create-game page.
 *
 * To add an option, append one entry here — the options panel renders this
 * list generically, so no JSX changes are needed. Only boolean toggles are
 * supported so far; a new `kind` field is the place to start when an option
 * needs a different control.
 */
export interface GameOptionDef {
  id: string;
  label: string;
  description: string;
  defaultValue: boolean;
}

export const GAME_OPTIONS: GameOptionDef[] = [
  {
    id: "cleanWordsOnly",
    label: "Clean words only",
    description:
      "Restricts generated player names and submitted text to a family-friendly wordlist.",
    defaultValue: true,
  },
  {
    id: "autoGenerateNames",
    label: "Auto-generate player names",
    description:
      "Assigns each player a randomly generated name instead of letting them pick their own.",
    defaultValue: false,
  },
];

export type GameOptionValues = Record<string, boolean>;

export function defaultOptionValues(): GameOptionValues {
  return Object.fromEntries(
    GAME_OPTIONS.map((option) => [option.id, option.defaultValue]),
  );
}
