import { NextResponse } from "next/server";
import { z } from "zod";
import { getEnv } from "@/lib/cloudflare";
import { consumeRateLimit } from "@/lib/rate-limit";
import { EMPTY_BILL_FIELDS, extractBillFieldsFromText, hasHighConfidence, type ExtractedBillFields } from "@/lib/bill-extraction";

export const runtime = "nodejs";

const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash";
const MAX_BYTES = 10 * 1024 * 1024;

const extractRequestSchema = z.object({ objectKey: z.string().regex(/^bills\/[0-9a-f-]{36}\.(pdf|png|jpg)$/) });

const geminiResponseSchema = {
  type: "OBJECT",
  properties: {
    provider: { type: "STRING", nullable: true },
    consumerName: { type: "STRING", nullable: true },
    monthlyUnits: { type: "NUMBER", nullable: true },
    pricePerUnit: { type: "NUMBER", nullable: true },
    billingMonth: { type: "STRING", nullable: true },
  },
  required: ["provider", "consumerName", "monthlyUnits", "pricePerUnit", "billingMonth"],
} as const;

const extractedFieldsSchema = z.object({
  provider: z.string().min(2).max(120).nullable().optional(),
  consumerName: z.string().min(2).max(120).nullable().optional(),
  monthlyUnits: z.coerce.number().finite().positive().max(100000).nullable().optional(),
  pricePerUnit: z.coerce.number().finite().positive().max(100).nullable().optional(),
  billingMonth: z.string().min(2).max(60).nullable().optional(),
});

type DetectedMime = "application/pdf" | "image/png" | "image/jpeg";

function detectMime(bytes: Uint8Array): DetectedMime | null {
  if (bytes.length >= 5 && String.fromCharCode(...bytes.slice(0, 5)) === "%PDF-") return "application/pdf";
  if (bytes.length >= 8 && bytes.every((value, index) => value === [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a][index])) return "image/png";
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  return null;
}

function mergeFields(primary: ExtractedBillFields, fallback: ExtractedBillFields): ExtractedBillFields {
  return {
    provider: primary.provider ?? fallback.provider,
    consumerName: primary.consumerName ?? fallback.consumerName,
    monthlyUnits: primary.monthlyUnits ?? fallback.monthlyUnits,
    pricePerUnit: primary.pricePerUnit ?? fallback.pricePerUnit,
    billingMonth: primary.billingMonth ?? fallback.billingMonth,
  };
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
    ? "This is an Indian residential or commercial electricity bill (possibly multi-page)."
    : "This is a photo or scan of an Indian electricity bill.";
  return [
    documentNote,
    "Extract these fields. Return only values printed on the bill; use null when a value is not present.",
    "monthlyUnits: total energy consumed for this billing period in kWh (NOT the cumulative meter reading).",
    "pricePerUnit: effective rupees per kWh. If slabs and amounts are listed instead of a single rate, divide the total amount payable by monthlyUnits and round to 2 decimals.",
    "provider: the electricity distribution company (DISCOM) name.",
    "consumerName: the name of the customer the bill is addressed to.",
    "billingMonth: billing period or month, e.g. \"Aug 2025\" or \"12 Jul 2025 to 11 Aug 2025\".",
    "Ignore arithmetic scratch work; do not guess.",
  ].join(" ");
}

async function extractWithGemini(bytes: Uint8Array, mime: DetectedMime): Promise<ExtractedBillFields> {
  const env = getEnv();
  const apiKey = env.GEMINI_API_KEY ?? process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_UNCONFIGURED");

  const model = env.GEMINI_MODEL ?? process.env.GEMINI_MODEL ?? DEFAULT_GEMINI_MODEL;
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
    signal: AbortSignal.timeout(30_000),
    body: JSON.stringify({
      contents: [{
        parts: [
          { text: buildGeminiPrompt(mime) },
          { inline_data: { mime_type: mime, data: Buffer.from(bytes).toString("base64") } },
        ],
      }],
      generationConfig: { temperature: 0, responseMimeType: "application/json", responseSchema: geminiResponseSchema },
    }),
  });

  if (response.status === 429) throw new Error("GEMINI_RATE_LIMITED");
  if (!response.ok) throw new Error(`GEMINI_HTTP_${response.status}`);

  const payload = JSON.parse(await response.text()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const rawText = payload.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("") ?? "";
  if (!rawText.trim()) throw new Error("GEMINI_EMPTY_RESPONSE");

  const parsed = extractedFieldsSchema.safeParse(JSON.parse(rawText));
  if (!parsed.success) throw new Error("GEMINI_INVALID_RESPONSE");

  const fields = parsed.data;
  return {
    provider: fields.provider ?? null,
    consumerName: fields.consumerName ?? null,
    monthlyUnits: fields.monthlyUnits != null ? Math.round(fields.monthlyUnits) : null,
    pricePerUnit: fields.pricePerUnit != null ? Number(fields.pricePerUnit.toFixed(2)) : null,
    billingMonth: fields.billingMonth ?? null,
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

    let textFields = EMPTY_BILL_FIELDS;
    if (file.mime === "application/pdf") {
      try {
        const { extractText, getDocumentProxy } = await import("unpdf");
        const pdf = await getDocumentProxy(new Uint8Array(file.bytes));
        const { text } = await extractText(pdf, { mergePages: true });
        textFields = extractBillFieldsFromText(text);
      } catch (parseError) {
        console.error("bill_text_parse_failed", { objectKey, error: parseError instanceof Error ? parseError.message : String(parseError) });
      }
      if (hasHighConfidence(textFields)) {
        return NextResponse.json({ success: true, data: { fields: textFields, source: "text" } });
      }
    }

    try {
      const geminiFields = await extractWithGemini(file.bytes, file.mime);
      const fields = file.mime === "application/pdf" ? mergeFields(geminiFields, textFields) : geminiFields;
      return NextResponse.json({ success: true, data: { fields, source: "gemini" } });
    } catch (geminiError) {
      const reason = geminiError instanceof Error ? geminiError.message : String(geminiError);
      if (reason === "GEMINI_RATE_LIMITED") {
        return NextResponse.json({ success: false, error: { code: "EXTRACTION_BUSY", message: "Bill reading is busy right now. Please enter the details manually." } }, { status: 429 });
      }
      if (reason !== "GEMINI_UNCONFIGURED") console.error("bill_gemini_extraction_failed", { objectKey, reason });
      const merged = file.mime === "application/pdf" ? textFields : EMPTY_BILL_FIELDS;
      return NextResponse.json({
        success: true,
        data: { fields: merged, source: hasHighConfidence(merged) ? "text" : "none" },
        meta: { message: "Could not read the bill automatically. Please enter the details manually." },
      });
    }
  } catch (error) {
    console.error("bill_extraction_failed", { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ success: false, error: { code: "EXTRACTION_FAILED", message: "The bill could not be read automatically. Please enter the details manually." } }, { status: 500 });
  }
}
