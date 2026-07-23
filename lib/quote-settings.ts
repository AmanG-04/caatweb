import { getEnv } from "@/lib/cloudflare";
import { TEMPLATE_QUOTE_SETTINGS } from "@/lib/settings";
import type { QuoteInput } from "@/lib/types";

export async function loadQuoteSettings(): Promise<Omit<QuoteInput, "monthlyBill" | "monthlyUnits" | "propertyType" | "roofType">> {
  const db = getEnv().DB;
  if (!db) return TEMPLATE_QUOTE_SETTINGS;
  const rows = await db.prepare("SELECT key,value,value_type FROM settings").bind().all<{ key: string; value: string; value_type: string }>();
  const settings: Record<string, unknown> = { ...TEMPLATE_QUOTE_SETTINGS };
  for (const row of rows.results) settings[row.key] = row.value_type === "number" ? Number(row.value) : row.value;
  return settings as Omit<QuoteInput, "monthlyBill" | "monthlyUnits" | "propertyType" | "roofType">;
}
