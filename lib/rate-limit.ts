import { getEnv } from "@/lib/cloudflare";

export async function consumeRateLimit(request: Request, scope: string, limit: number, windowSeconds: number) {
  const db = getEnv().DB;
  if (!db) return { allowed: true, remaining: limit, reset: Math.ceil(Date.now() / 1000) + windowSeconds };
  const ip = request.headers.get("CF-Connecting-IP") ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const key = `${scope}:${ip}`; const now = Math.floor(Date.now() / 1000); const windowStarted = Math.floor(now / windowSeconds) * windowSeconds; const reset = windowStarted + windowSeconds;
  await db.prepare("INSERT INTO rate_limits (key,window_started,request_count) VALUES (?,?,1) ON CONFLICT(key) DO UPDATE SET request_count=CASE WHEN window_started < excluded.window_started THEN 1 ELSE request_count+1 END,window_started=CASE WHEN window_started < excluded.window_started THEN excluded.window_started ELSE window_started END,updated_at=CURRENT_TIMESTAMP").bind(key, windowStarted, 1).run();
  const row = await db.prepare("SELECT request_count FROM rate_limits WHERE key=?").bind(key).first<{ request_count: number }>(); const count = row?.request_count ?? limit + 1;
  return { allowed: count <= limit, remaining: Math.max(0, limit - count), reset };
}
