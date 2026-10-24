export async function api<T>(path: string, method = "GET", body?: unknown): Promise<T> {
  const response = await fetch(path, { method, cache: "no-store", headers: body ? { "Content-Type": "application/json" } : undefined, body: body ? JSON.stringify(body) : undefined });
  const payload = await response.json() as { data: T; error?: { message: string; code: string } };
  if (!response.ok) throw new Error(payload.error?.message ?? "Request failed. Please retry.");
  return payload.data;
}
export const endpoint = (id: string) => `/api/admin/solar-projects/${encodeURIComponent(id)}`;
