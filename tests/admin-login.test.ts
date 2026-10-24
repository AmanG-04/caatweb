import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/cloudflare", () => ({ getEnv: () => ({}) }));
vi.mock("@/lib/rate-limit", () => ({ consumeRateLimit: async () => ({ allowed: true }) }));
import { POST } from "../app/api/auth/login/route";

const request = (adminId: string, password: string) => new Request("http://localhost:3000/api/auth/login", {
  method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ adminId, password }),
});
afterEach(() => vi.unstubAllEnvs());

describe("local admin credentials", () => {
  it("accepts the configured short development password with either local email or ID", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("ADMIN_ID", "admin-local"); vi.stubEnv("ADMIN_EMAIL", "local@example.test"); vi.stubEnv("ADMIN_PASSWORD", "test");
    for (const identifier of ["admin-local", "local@example.test"]) {
      const response = await POST(request(identifier, "test"));
      expect(response.status).toBe(200);
      expect(response.headers.get("set-cookie")).toContain("admin_token=");
      expect(response.headers.get("set-cookie")).toContain("HttpOnly");
    }
    expect((await POST(request("local@example.test", "wrong"))).status).toBe(401);
  });
  it("preserves the eight-character requirement outside development", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("ADMIN_EMAIL", "local@example.test"); vi.stubEnv("ADMIN_PASSWORD", "test");
    expect((await POST(request("local@example.test", "test"))).status).toBe(400);
  });
  it("returns a validation response for malformed JSON", async () => {
    const response = await POST(new Request("http://localhost:3000/api/auth/login", { method: "POST", body: "{" }));
    expect(response.status).toBe(400);
  });
});
