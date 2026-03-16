export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface HistoryItem {
  role: "user" | "assistant";
  content: string;
}

export async function sendMessage(message: string, history: HistoryItem[] = []): Promise<string> {
  try {
    const res = await fetch(`${API_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, history }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.response;
  } catch {
    return "I can't reach the backend right now. Make sure the server is running at " + API_URL;
  }
}

export async function checkHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/health`, { signal: AbortSignal.timeout(3000) });
    return res.ok;
  } catch {
    return false;
  }
}
