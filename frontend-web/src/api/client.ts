export async function toggleAutoNames(sessionId: string, enabled: boolean): Promise<void> {
  await fetch(`http://127.0.0.1:8000/session/${sessionId}/toggle-auto-names`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ enabled }),
  });
}