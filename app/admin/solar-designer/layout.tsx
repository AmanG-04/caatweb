import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyAdminToken } from "@/lib/auth";
import "./designer.css";

export default async function DesignerLayout({ children }: { children: React.ReactNode }) {
  const token = (await cookies()).get("admin_token")?.value;
  let role: string | undefined;
  try { if (token) role = (await verifyAdminToken(token)).role; } catch { /* Existing admin login handles expired sessions. */ }
  if (role !== "admin") redirect("/admin");
  return children;
}
