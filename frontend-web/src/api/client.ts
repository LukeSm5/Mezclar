export async function toggleAutoNames(sessionId: string, enabled: boolean): Promise<void> {
  await fetch(`http://127.0.0.1:8000/session/${sessionId}/toggle-auto-names`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ enabled }),
  });
}

export async function regenerateName(sessionId: string, player_id: string): Promise<string> {
  const response = await fetch(`http://127.0.0.1:8000/session/${sessionId}/regenerate-name`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ player_id }),
  });

  if (!response.ok) {
    throw new Error(`Failed to regenerate name for player ${player_id} in session ${sessionId}`);
  }
  const data = await response.json();
  return data.name;
}