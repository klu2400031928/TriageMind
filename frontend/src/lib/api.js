const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export async function getHealth() {
  try {
    const res = await fetch(`${API_BASE}/health`, { cache: "no-store" });
    return await res.json();
  } catch (e) {
    return { status: "offline" };
  }
}

export async function getAlerts() {
  const res = await fetch(`${API_BASE}/alerts`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch alerts");
  return await res.json();
}

export async function getAlert(id) {
  const res = await fetch(`${API_BASE}/alerts/${id}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch alert");
  return await res.json();
}

export async function triageAlert(alert, useMemory = true) {
  const res = await fetch(`${API_BASE}/triage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ alert, use_memory: useMemory }),
  });
  if (!res.ok) throw new Error("Triage request failed");
  return await res.json();
}

export async function submitFeedback(feedback, alertContext) {
  const res = await fetch(`${API_BASE}/feedback`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ feedback, alert_context: alertContext }),
  });
  if (!res.ok) throw new Error("Feedback submission failed");
  return await res.json();
}

export async function getRecentMemories(query) {
  const url = query
    ? `${API_BASE}/memory/recent?query=${encodeURIComponent(query)}`
    : `${API_BASE}/memory/recent`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch memories");
  return await res.json();
}

export async function getLearningStats() {
  const res = await fetch(`${API_BASE}/learning/stats`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch learning stats");
  return await res.json();
}

export async function runReflection(query) {
  const res = await fetch(`${API_BASE}/learning/reflect`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: query || "What patterns have I learned from analyst decisions?" }),
  });
  if (!res.ok) throw new Error("Reflection failed");
  return await res.json();
}

export async function resetDemo() {
  const res = await fetch(`${API_BASE}/demo/reset`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error("Demo reset failed");
  return await res.json();
}
