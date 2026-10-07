export interface GameSummary {
  id: string;
  name: string;
  minPlayers: number;
  maxPlayers: number;
  minMinutes: number;
  maxMinutes: number;
  description: string;
  rules: string;
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
    rules:
      `
        Players receive prompts and submit their funniest responses. 
        Responses are shown to the group, and players vote for their favorite. 
        The response with the most votes earns points. 
        Players continue through multiple rounds, with the highest-scoring players winning the game.
      `  
    
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
    rules: 
      `
        Players are divided into small groups.
        Each group must find things that every member has in common.
        Groups submit their answers before time runs out.
        Later rounds introduce more specific prompts.
        The group that finds the most common ground wins.
      `,
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
    rules: 
    `
      Players are presented with a statement.
      Each player chooses the side they agree with.
      Players discuss the statement with people on both sides.
      Players try to convince people on the opposing side to change their position.
      The game continues through several statements.
    `,
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
    rules: 
      `
        A small number of players are secretly assigned as moles.
        Moles receive a hidden objective.
        Everyone else tries to identify the moles.
        Players question and interact with one another.
        Players vote on who they believe the moles are.
        Players earn points for correctly identifying moles.
        Moles earn points for successfully completing their secret objectives.
      `,
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
    rules: 
      `
        Players are given a question with multiple possible answers.
        Each player predicts which answer will be the most popular.
        Players earn points based on how accurately they predict the crowd.
        The game continues through multiple questions.
        The player with the highest score wins.
      `,
  },
];

export function formatPlayerRange(game: GameSummary): string {
  return `${game.minPlayers}–${game.maxPlayers} players`;
}

export function formatTimeRange(game: GameSummary): string {
  return `${game.minMinutes}–${game.maxMinutes} min`;
}
