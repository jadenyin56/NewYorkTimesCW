const requests = new Map<string, number[]>();
const WINDOW_MS = 60_000;

export function allowAIRequest(request: Request, scope: string, limit = 8) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const key = `${scope}:${forwarded || "local"}`;
  const now = Date.now();
  const recent = (requests.get(key) ?? []).filter((timestamp) => now - timestamp < WINDOW_MS);
  if (recent.length >= limit) return false;
  recent.push(now);
  requests.set(key, recent);
  return true;
}
