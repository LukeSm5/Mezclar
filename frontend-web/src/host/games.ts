/**
 * Placeholder game catalog. These are stand-ins so the create-game page has
 * something real to render — replace with a fetch from the backend once a
 * game registry exists there.
 */
export interface GameSummary {
  id: string;
  name: string;
  minPlayers: number;
  maxPlayers: number;
  minMinutes: number;
  maxMinutes: number;
  description: string;
}

export const GAMES: GameSummary[] = [
  {
    id: "quiplash",
    name: "Quiplash",
    minPlayers: 10,
    maxPlayers: 50,
    minMinutes: 5,
    maxMinutes: 30,
    description:
      "Players compete in a tournament to see who can respond with the funniest quips to prompts.",
  },
  {
    id: "common-ground",
    name: "Common Ground",
    minPlayers: 10,
    maxPlayers: 250,
    minMinutes: 8,
    maxMinutes: 12,
    description:
      "Small groups race to find things every single person shares. Late rounds force people past the easy answers and into real conversation.",
  },
  {
    id: "hot-take",
    name: "Hot Take",
    minPlayers: 20,
    maxPlayers: 500,
    minMinutes: 10,
    maxMinutes: 15,
    description:
      "The room is handed a divisive statement and splits by opinion. Players then try to argue individuals across the floor to their side.",
  },
  {
    id: "mole-hunt",
    name: "Mole Hunt",
    minPlayers: 15,
    maxPlayers: 120,
    minMinutes: 15,
    maxMinutes: 20,
    description:
      "A handful of players get a secret second agenda. Everyone else has to work out who, using nothing but face-to-face questioning.",
  },
  {
    id: "crowd-call",
    name: "Crowd Call",
    minPlayers: 30,
    maxPlayers: 500,
    minMinutes: 5,
    maxMinutes: 8,
    description:
      "Players predict how the rest of the room will answer. Points come from reading the crowd, not from being right.",
  },
];

export function formatPlayerRange(game: GameSummary): string {
  return `${game.minPlayers}–${game.maxPlayers} players`;
}

export function formatTimeRange(game: GameSummary): string {
  return `${game.minMinutes}–${game.maxMinutes} min`;
}
