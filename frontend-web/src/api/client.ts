import type {
  JoinSessionResponse,
  SessionPlayer,
  SessionResponse,
  StartGameRequest,
  UpdateReadyStatusRequest,
} from "../../../shared/types/messages";

export type { SessionPlayer, SessionResponse } from "../../../shared/types/messages";

async function apiResponse<T>(response: Response): Promise<T> {
  const data = await response.json();
  if (!response.ok) {
    const detail = typeof data.detail === "string" ? data.detail : "Could not complete the request. Please try again.";
    throw new Error(detail);
  }
  return data as T;
}

export async function createSession(
  hostName: string,
  gameId: string,
  options: Record<string, boolean>,
): Promise<SessionResponse> {
  return apiResponse(await fetch("/api/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ host_name: hostName, settings: { gameId, options } }),
  }));
}

export async function getSession(code: string): Promise<SessionResponse> {
  return apiResponse(await fetch("/api/session/" + code));
}

export async function joinSession(
  code: string, playerId: string, name: string,
): Promise<JoinSessionResponse> {
  return apiResponse(await fetch("/api/session/" + code + "/join", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ player_id: playerId, name: name.trim() || null }),
  }));
}

export async function updateReadyStatus(
  code: string, playerId: string, ready: boolean,
): Promise<SessionPlayer> {
  const body: UpdateReadyStatusRequest = { ready };
  return apiResponse(await fetch("/api/session/" + code + "/players/" + playerId + "/ready", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }));
}

export async function startGame(code: string, request: StartGameRequest): Promise<SessionResponse> {
  return apiResponse(await fetch("/api/session/" + code + "/start", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  }));
}

export function playerSocketUrl(code: string, playerId: string): string {
  const url = new URL("/ws/session/" + code + "/player/" + playerId, window.location.href);
  url.protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  return url.href;
}
