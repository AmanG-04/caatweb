import { NextResponse } from "next/server";
import { inr } from "@/lib/utils";
import { getEnv } from "@/lib/cloudflare";

export const runtime = "nodejs";

type PdfInput = { customer?: { name?: string; email?: string; phone?: string }; quote?: { id?: string; systemSizeKw?: number; panelsRequired?: number; roofAreaSqFt?: number; grossCost?: number; subsidy?: number; netCost?: number; monthlySavings?: number; annualSavings?: number; twentyFiveYearSavings?: number; paybackYears?: number; co2OffsetKg?: number } };

function pdfText(value: string) { return value.replaceAll("\\", "\\\\").replaceAll("(", "\\(").replaceAll(")", "\\)").replaceAll("\n", " "); }
function pdfInr(value: number) { return inr(value).replace("₹", "INR "); }

function createPdf(lines: Array<{ value: string; x: number; y: number; size: number }>) {
  const content = lines.map(line => `BT /F1 ${line.size} Tf ${line.x} ${line.y} Td (${pdfText(line.value)}) Tj ET`).join("\n");
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [5 0 R] /Count 1 >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R >> >> /Contents 4 0 R >>",
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  for (let index = 0; index < objects.length; index++) { offsets.push(new TextEncoder().encode(pdf).length); pdf += `${index + 1} 0 obj\n${objects[index]}\nendobj\n`; }
  const xrefOffset = new TextEncoder().encode(pdf).length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let index = 1; index <= objects.length; index++) pdf += `${String(offsets[index]).padStart(10, "0")} 00000 n \n`;
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;
  return new TextEncoder().encode(pdf);
}

export async function POST(request: Request) {
  try {
    const input = await request.json() as PdfInput;
    const quote = input.quote ?? {}; const customer = input.customer ?? {};
    const siteUrl = getEnv().NEXT_PUBLIC_SITE_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? "https://caat-powerbot.10amangupta04.workers.dev";
    const lines = [
      { value: "caat powerbot", x: 40, y: 800, size: 24 }, { value: "SOLAR QUOTATION", x: 40, y: 780, size: 10 },
      { value: `Quotation ${quote.id ?? "estimate"}`, x: 390, y: 800, size: 10 }, { value: "Customer details", x: 40, y: 735, size: 16 },
      { value: customer.name ?? "Solar customer", x: 40, y: 710, size: 12 }, { value: `${customer.email ?? ""}  ${customer.phone ?? ""}`, x: 40, y: 690, size: 10 },
      { value: "System recommendation", x: 40, y: 650, size: 16 }, { value: `${quote.systemSizeKw ?? "-"} kW solar system`, x: 40, y: 625, size: 14 },
      { value: `${quote.panelsRequired ?? "-"} panels  -  ${quote.roofAreaSqFt ?? "-"} sq ft roof area`, x: 40, y: 605, size: 10 },
      { value: "Investment and savings", x: 40, y: 560, size: 16 }, { value: `Estimated system cost: ${pdfInr(quote.grossCost ?? 0)}`, x: 40, y: 535, size: 11 },
      { value: `Government subsidy: - ${pdfInr(quote.subsidy ?? 0)}`, x: 40, y: 510, size: 11 }, { value: `Estimated net cost: ${pdfInr(quote.netCost ?? 0)}`, x: 40, y: 485, size: 11 },
      { value: `Monthly savings: ${pdfInr(quote.monthlySavings ?? 0)}`, x: 40, y: 460, size: 11 }, { value: `Annual savings: ${pdfInr(quote.annualSavings ?? 0)}`, x: 40, y: 435, size: 11 },
      { value: `25-year savings: ${pdfInr(quote.twentyFiveYearSavings ?? 0)}`, x: 40, y: 410, size: 11 }, { value: `Payback period: ${quote.paybackYears ?? "-"} years`, x: 40, y: 385, size: 11 },
      { value: `CO2 offset: ${(quote.co2OffsetKg ?? 0).toLocaleString("en-IN")} kg per year`, x: 40, y: 345, size: 11 },
      { value: `View quotation: ${siteUrl}/quote/result?id=${quote.id ?? "estimate"}`, x: 40, y: 100, size: 8 },
      { value: "Estimate only. Final pricing and subsidy eligibility are confirmed after site survey.", x: 40, y: 75, size: 8 },
    ];
    const bytes = createPdf(lines);
    return new Response(bytes, { headers: { "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="caat-powerbot-${quote.id ?? "quotation"}.pdf"`, "Content-Length": String(bytes.byteLength) } });
  } catch (error) {
    console.error("pdf_generation_failed", { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ success: false, error: { code: "PDF_GENERATION_FAILED", message: "The quotation PDF could not be generated." } }, { status: 500 });
  }
}
