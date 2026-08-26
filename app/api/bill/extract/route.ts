import { NextResponse } from "next/server";
import { z } from "zod";
import { getEnv } from "@/lib/cloudflare";
import { consumeRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

const DEFAULT_GEMINI_MODEL = "gemini-3.7-flash";
/** Best to worst. Flash models carry ~20 req/day free; Flash-Lite tiers carry ~500/day, so they close the chain as high-volume workhorses. */
const GEMINI_FALLBACK_MODELS = [
  "gemini-3.6-flash",
  "gemini-3.5-flash",
  "gemini-3-flash",
  "gemini-2.5-flash",
  "gemini-3.5-flash-lite",
  "gemini-3.1-flash-lite",
  "gemini-2.5-flash-lite",
];
const MAX_BYTES = 10 * 1024 * 1024;

const extractRequestSchema = z.object({ objectKey: z.string().regex(/^bills\/[0-9a-f-]{36}\.(pdf|png|jpg)$/) });

const geminiResponseSchema = {
  type: "OBJECT",
  properties: {
    provider: { type: "STRING", nullable: true },
    consumerName: { type: "STRING", nullable: true },
    monthlyUnits: { type: "NUMBER", nullable: true },
    pricePerUnit: { type: "NUMBER", nullable: true },
    pricePerUnitSource: { type: "STRING", nullable: true, enum: ["printed", "calculated"] },
    billingMonth: { type: "STRING", nullable: true },
    averageMonthlyUnits: { type: "NUMBER", nullable: true },
    averageBillAmount: { type: "NUMBER", nullable: true },
    address: { type: "STRING", nullable: true },
    city: { type: "STRING", nullable: true },
    state: { type: "STRING", nullable: true },
    pincode: { type: "STRING", nullable: true },
    history: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          period: { type: "STRING", nullable: true },
          monthlyUnits: { type: "NUMBER", nullable: true },
          amountPayable: { type: "NUMBER", nullable: true },
        },
        required: ["period", "monthlyUnits", "amountPayable"],
      },
    },
  },
  required: ["provider", "consumerName", "monthlyUnits", "pricePerUnit", "billingMonth"],
} as const;

const lenientNumber = (max: number, min = 0) =>
  z.preprocess((value) => {
    if (value == null || typeof value === "number") return value;
    if (typeof value === "string") {
      const parsed = Number(value.replace(/[^0-9.\-]/g, ""));
      return Number.isFinite(parsed) && value.match(/\d/) ? parsed : value;
    }
    return value;
  }, z.number().finite().min(min).max(max));

const historyEntrySchema = z.object({
  period: z.string().max(60).nullable().optional(),
  monthlyUnits: lenientNumber(100000).nullable().optional(),
  amountPayable: lenientNumber(100000000, -100000000).nullable().optional(),
});

const extractedFieldsSchema = z.object({
  provider: z.string().min(2).max(120).nullable().optional(),
  consumerName: z.string().min(2).max(120).nullable().optional(),
  monthlyUnits: lenientNumber(100000, 1).nullable().optional(),
  pricePerUnit: lenientNumber(100, 0.5).nullable().optional(),
  pricePerUnitSource: z.preprocess(
    (value) => (typeof value === "string" ? value.trim().toLowerCase() : value),
    z.enum(["printed", "calculated"]).nullable().optional(),
  ),
  billingMonth: z.string().min(2).max(60).nullable().optional(),
  averageMonthlyUnits: lenientNumber(100000, 1).nullable().optional(),
  averageBillAmount: lenientNumber(100000000, -100000000).nullable().optional(),
  address: z.string().min(4).max(300).nullable().optional(),
  city: z.string().min(2).max(80).nullable().optional(),
  state: z.string().min(2).max(80).nullable().optional(),
  pincode: z.string().regex(/^[1-9][0-9]{5}$/).nullable().optional(),
  history: z.array(historyEntrySchema).max(24).nullable().optional(),
});

type DetectedMime = "application/pdf" | "image/png" | "image/jpeg";

function detectMime(bytes: Uint8Array): DetectedMime | null {
  if (bytes.length >= 5 && String.fromCharCode(...bytes.slice(0, 5)) === "%PDF-") return "application/pdf";
  if (bytes.length >= 8 && bytes.every((value, index) => value === [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a][index])) return "image/png";
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  return null;
}

async function readObjectBytes(objectKey: string): Promise<{ bytes: Uint8Array; mime: DetectedMime } | null> {
  const bucket = getEnv().BILLS_BUCKET;
  if (!bucket?.get) return null;
  const object = await bucket.get(objectKey);
  if (!object) return null;
  const buffer = await new Response(object.body as ReadableStream<Uint8Array>).arrayBuffer();
  const bytes = new Uint8Array(buffer);
  const mime = detectMime(bytes);
  return mime ? { bytes, mime } : null;
}

function buildGeminiPrompt(mime: DetectedMime): string {
  const documentNote = mime === "application/pdf"
    ? "Attached is an Indian residential or commercial electricity bill as a PDF (possibly multi-page; use the most recent/complete page)."
    : "Attached is a photo or scan of an Indian electricity bill.";
  return [
    documentNote,
    "Extract these fields. Return a value ONLY if you can point to it on the bill; otherwise return null. Never guess and never invent numbers.",
    "monthlyUnits: total energy consumed for this billing period in kWh (NOT the cumulative meter reading).",
    "pricePerUnit: the rupees-per-kWh rate. Two cases:",
    "(a) If an explicit per-unit rate, slab table, or average-rate figure is printed, use it and set pricePerUnitSource to \"printed\".",
    "(b) Only if no rate is printed anywhere but both the total amount payable AND monthlyUnits are clearly identified, divide amount by units, round to 2 decimals, and set pricePerUnitSource to \"calculated\".",
    "If neither case applies confidently, return null for pricePerUnit. Do NOT combine unrelated numbers from scrambled layout text.",
    "Sanity check: typical Indian domestic tariffs are between 1 and 15 rupees per unit; reject any computed value outside that range and return null instead.",
    "provider: the electricity distribution company (DISCOM) name.",
    "consumerName: the account holder's own name only — exclude relation suffixes like \"S/O\", \"W/O\", \"D/O\" and any name that follows them.",
    "address: the supply/service address exactly as printed, as a single line (building/flat/street/area). Exclude addressee name, city, state and PIN.",
    "city: the city or town from the address. state: the state. pincode: the 6-digit PIN code from the address; null if not printed.",
    "Never fill phone/email values from the bill if they are masked (e.g. contain * or XXXXXX); those fields are not part of this extraction at all.",
    "billingMonth: billing period or month, e.g. \"Aug 2025\" or \"12 Jul 2025 to 11 Aug 2025\".",
    "history: Indian bills usually contain a consumption/payment history table listing previous periods with units consumed and/or amount payable per month or billing cycle.",
    "For each history row return the period label, units consumed in kWh for that period (NOT cumulative readings), and the total amount payable for that period; use null for any value not shown on that row.",
    "Include up to the 12 most recent rows. Exclude the current billing period from history (it belongs in monthlyUnits). Do not confuse meter readings, load (kW/kVA) or days with consumption.",
    "averageMonthlyUnits: the arithmetic mean of the per-period units you found across the history rows AND the current monthlyUnits. Round to the nearest whole number. If no usable unit values exist at all, return null.",
    "averageBillAmount: the arithmetic mean of the per-period amounts payable across the history rows AND the current bill's total payable. Round to 2 decimals; null if no usable amounts exist.",
    "Ignore arithmetic scratch work, adjustment tables, rebate rows, subsidy lines and arrears when reading amounts.",
  ].join(" ");
}

async function callGemini(model: string, bytes: Uint8Array, mime: DetectedMime, apiKey: string) {
  const generationConfig: Record<string, unknown> = { temperature: 0, responseMimeType: "application/json", responseSchema: geminiResponseSchema };
  if (model.startsWith("gemini-3")) generationConfig.thinkingConfig = { thinkingLevel: "low" };
  return fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
    signal: AbortSignal.timeout(45_000),
    body: JSON.stringify({
      contents: [{
        parts: [
          { text: buildGeminiPrompt(mime) },
          { inline_data: { mime_type: mime, data: Buffer.from(bytes).toString("base64") } },
        ],
      }],
      generationConfig,
    }),
  });
}

async function extractWithGemini(bytes: Uint8Array, mime: DetectedMime) {
  const env = getEnv();
  const apiKey = env.GEMINI_API_KEY ?? process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_UNCONFIGURED");

  const override = env.GEMINI_MODEL ?? process.env.GEMINI_MODEL;
  const candidates = [...new Set([override, DEFAULT_GEMINI_MODEL, ...GEMINI_FALLBACK_MODELS].filter((model): model is string => Boolean(model)))];

  let response: Response | null = null;
  let lastError = "";
  let usedModel = "";
  for (const model of candidates) {
    let attempt: Response;
    try {
      attempt = await callGemini(model, bytes, mime, apiKey);
    } catch (callError) {
      const message = callError instanceof Error ? callError.message : String(callError);
      if (/abort|timeout/i.test(message) && model !== candidates[candidates.length - 1]) {
        lastError = `GEMINI_TIMEOUT_${model}`;
        console.info("bill_gemini_model_skipped", { model, status: "timeout" });
        continue;
      }
      throw callError;
    }
    const isLastModel = model === candidates[candidates.length - 1];
    // Advance to the next model when this one is unavailable: 404 retired/unknown, 429 quota exhausted, 503 overloaded.
    if ((attempt.status === 404 || attempt.status === 429 || attempt.status === 503) && !isLastModel) {
      lastError = `GEMINI_HTTP_${attempt.status}_${model}`;
      console.info("bill_gemini_model_skipped", { model, status: attempt.status });
      continue;
    }
    response = attempt;
    usedModel = model;
    break;
  }
  if (!response) throw new Error(lastError || "GEMINI_NO_MODEL");
  if (usedModel !== candidates[0]) console.info("bill_gemini_model_fallback", { model: usedModel });

  if (response.status === 429) throw new Error("GEMINI_RATE_LIMITED");
  if (!response.ok) throw new Error(`GEMINI_HTTP_${response.status}`);

  const payload = JSON.parse(await response.text()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const rawText = payload.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("") ?? "";
  if (!rawText.trim()) throw new Error("GEMINI_EMPTY_RESPONSE");

  const parsed = extractedFieldsSchema.safeParse(JSON.parse(rawText));
  if (!parsed.success) {
    console.error("bill_gemini_parse_failed", { raw: rawText.slice(0, 600), issues: parsed.error.issues.slice(0, 5) });
    throw new Error("GEMINI_INVALID_RESPONSE");
  }

  const fields = parsed.data;
  return {
    provider: fields.provider ?? null,
    consumerName: fields.consumerName ?? null,
    monthlyUnits: fields.monthlyUnits != null ? Math.round(fields.monthlyUnits) : null,
    pricePerUnit: fields.pricePerUnit != null ? Number(fields.pricePerUnit.toFixed(2)) : null,
    pricePerUnitSource: fields.pricePerUnitSource ?? null,
    billingMonth: fields.billingMonth ?? null,
    averageMonthlyUnits: fields.averageMonthlyUnits != null ? Math.round(fields.averageMonthlyUnits) : null,
    averageBillAmount: fields.averageBillAmount != null ? Number(fields.averageBillAmount.toFixed(2)) : null,
    address: fields.address ?? null,
    city: fields.city ?? null,
    state: fields.state ?? null,
    pincode: fields.pincode ?? null,
  };
}

export async function POST(request: Request) {
  try {
    const rate = await consumeRateLimit(request, "bill-extract", 10, 600);
    if (!rate.allowed) {
      return NextResponse.json({ success: false, error: { code: "RATE_LIMITED", message: "Too many extraction attempts. Please enter the details manually." } }, { status: 429, headers: { "Retry-After": String(Math.max(1, rate.reset - Math.floor(Date.now() / 1000))) } });
    }

    let objectKey: string;
    try {
      const parsedBody = extractRequestSchema.safeParse(JSON.parse(await request.text()));
      if (!parsedBody.success) throw new Error();
      objectKey = parsedBody.data.objectKey;
    } catch {
      return NextResponse.json({ success: false, error: { code: "INVALID_REQUEST", message: "A stored bill reference is required." } }, { status: 400 });
    }

    const file = await readObjectBytes(objectKey);
    if (!file || file.bytes.byteLength === 0 || file.bytes.byteLength > MAX_BYTES) {
      return NextResponse.json({ success: false, error: { code: "BILL_NOT_FOUND", message: "The uploaded bill could not be read. Please upload it again." } }, { status: 404 });
    }

    try {
      const fields = await extractWithGemini(file.bytes, file.mime);
      return NextResponse.json({ success: true, data: { fields, source: "gemini" } });
    } catch (geminiError) {
      const reason = geminiError instanceof Error ? geminiError.message : String(geminiError);
      console.error("bill_gemini_extraction_failed", { objectKey, reason });
      if (reason === "GEMINI_UNCONFIGURED") {
        return NextResponse.json({ success: false, error: { code: "EXTRACTION_UNCONFIGURED", message: "Automatic bill reading is not available right now. Please enter the details manually." } }, { status: 503 });
      }
      if (reason === "GEMINI_RATE_LIMITED") {
        return NextResponse.json({ success: false, error: { code: "EXTRACTION_BUSY", message: "Bill reading is busy right now. Please enter the details manually." } }, { status: 429 });
      }
      return NextResponse.json({ success: false, error: { code: "EXTRACTION_FAILED", message: "We couldn't read this bill automatically. Please enter the details manually." } }, { status: 502 });
    }
  } catch (error) {
    console.error("bill_extraction_failed", { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ success: false, error: { code: "EXTRACTION_FAILED", message: "The bill could not be read automatically. Please enter the details manually." } }, { status: 500 });
  }
}
