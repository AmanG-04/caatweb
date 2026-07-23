import { SignJWT, jwtVerify } from "jose";
const secret = () => new TextEncoder().encode(process.env.JWT_SECRET || "development-only-change-me");
export async function createAdminToken(adminId: string, role: string) { return new SignJWT({ adminId, role }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("8h").sign(secret()); }
export async function verifyAdminToken(token: string) { const { payload } = await jwtVerify(token, secret()); return payload as { adminId: string; role: string }; }
export async function requireAdmin(request: Request) { const cookie = request.headers.get("cookie")?.match(/(?:^|; )admin_token=([^;]+)/)?.[1]; if (!cookie) return null; try { return await verifyAdminToken(decodeURIComponent(cookie)); } catch { return null; } }
