import { z } from "zod";
import { authorize, body, failure, json } from "@/lib/solar/http";
import { findProject } from "@/lib/solar/store";
import { googleSolarProvider, SolarError } from "@/lib/solar/provider";

export const dynamic = "force-dynamic";
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await authorize(request, true); await findProject((await params).id);
    const parsed = z.object({ address: z.string().trim().min(3).max(400) }).safeParse(await body(request));
    if (!parsed.success) throw new SolarError("VALIDATION_ERROR", "Enter a house number, street, locality and city to search.", 400);
    // Search results are transient, never copied into permanent project inputs.
    return json({ items: await googleSolarProvider.search(parsed.data.address) });
  } catch (error) { return failure(error); }
}
