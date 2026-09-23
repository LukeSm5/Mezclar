export type GameSession = {
  join_code: string;
  host_name: string;
  status: "lobby";
  players: { id: string; display_name: string }[];
  settings: {
    gameId?: string;
    options?: Record<string, boolean>;
  };
};

async function sessionResponse(response: Response): Promise<GameSession> {
  if (response.status === 404) {
    throw new Error("No lobby found for that code.");
  }
  if (!response.ok) {
    throw new Error("Could not reach the lobby. Please try again.");
  }
  return response.json() as Promise<GameSession>;
}

export async function createSession(
  hostName: string,
  gameId: string,
  options: Record<string, boolean>,
): Promise<GameSession> {
  const response = await fetch("/api/sessions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      host_name: hostName,
      settings: { gameId, options },
    }),
  });
  return sessionResponse(response);
}

export async function getSession(code: string): Promise<GameSession> {
  return sessionResponse(await fetch("/api/sessions/" + code));
}

export async function joinSession(
  code: string,
  displayName: string,
): Promise<GameSession> {
  const response = await fetch("/api/sessions/" + code + "/players", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ display_name: displayName }),
  });
  return sessionResponse(response);
}
