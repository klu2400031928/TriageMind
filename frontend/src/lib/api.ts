import { Alert, TriageResult, FeedbackRequest, FeedbackResponse, LearningStats } from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export async function getHealth(): Promise<{ status: string; hindsight?: any }> {
  try {
    const res = await fetch(`${API_BASE}/health`, { cache: "no-store" });
    return await res.json();
  } catch (e) {
    return { status: "offline" };
  }
}

export async function getAlerts(): Promise<{ alerts: Alert[]; total: number }> {
  const res = await fetch(`${API_BASE}/alerts`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch alerts");
  return await res.json();
}

export async function getAlert(id: string): Promise<{ alert: Alert; triage?: TriageResult }> {
  const res = await fetch(`${API_BASE}/alerts/${id}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch alert");
  return await res.json();
}

export async function triageAlert(alert: Alert, useMemory: boolean = true): Promise<TriageResult> {
  const res = await fetch(`${API_BASE}/triage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ alert, use_memory: useMemory }),
  });
  if (!res.ok) throw new Error("Triage request failed");
  return await res.json();
}

export async function submitFeedback(
  feedback: FeedbackRequest,
  alertContext?: Record<string, any>
): Promise<FeedbackResponse> {
  const res = await fetch(`${API_BASE}/feedback`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ feedback, alert_context: alertContext }),
  });
  if (!res.ok) throw new Error("Feedback submission failed");
  return await res.json();
}

export async function getRecentMemories(query?: string): Promise<{ memories: any[]; total: number }> {
  const url = query
    ? `${API_BASE}/memory/recent?query=${encodeURIComponent(query)}`
    : `${API_BASE}/memory/recent`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch memories");
  return await res.json();
}

export async function getLearningStats(): Promise<LearningStats> {
  const res = await fetch(`${API_BASE}/learning/stats`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch learning stats");
  return await res.json();
}

export async function runReflection(query?: string): Promise<{ reflection: string }> {
  const res = await fetch(`${API_BASE}/learning/reflect`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: query || "What patterns have I learned from analyst decisions?" }),
  });
  if (!res.ok) throw new Error("Reflection failed");
  return await res.json();
}

export async function resetDemo(): Promise<any> {
  const res = await fetch(`${API_BASE}/demo/reset`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error("Demo reset failed");
  return await res.json();
}
