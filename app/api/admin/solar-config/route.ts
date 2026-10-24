import { authorize, failure, json } from "@/lib/solar/http";
import { config } from "@/lib/solar/provider";
import { getEnv } from "@/lib/cloudflare";

export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  try {
    await authorize(request); const settings = config();
    return json({ enabled: settings.enabled, solarConfigured: Boolean(settings.key), browserKey: settings.enabled ? settings.browserKey ?? null : null,
      database: Boolean(getEnv().DB), storage: Boolean(getEnv().BILLS_BUCKET), dailyLimit: settings.dailyLimit });
  } catch (error) { return failure(error); }
}
