import { NextResponse } from "next/server";
import { getEnv } from "@/lib/cloudflare";

export const runtime = "nodejs";

type PdfInput = { customer?: { name?: string; email?: string; phone?: string }; quote?: { id?: string; systemSizeKw?: number; panelsRequired?: number; roofAreaSqFt?: number; grossCost?: number; subsidy?: number; netCost?: number; monthlySavings?: number; annualSavings?: number; twentyFiveYearSavings?: number; paybackYears?: number; co2OffsetKg?: number } };

function pdfText(value: string) { return value.replaceAll("\\", "\\\\").replaceAll("(", "\\(").replaceAll(")", "\\)").replaceAll("\n", " "); }
function pdfInr(value: number) { return `INR ${Math.round(value).toLocaleString("en-IN")}`; }

function createPdf(lines: Array<{ value: string; x: number; y: number; size: number; bold?: boolean }>) {
  const content = ["q 0.06 0.16 0.16 rg 0 760 595 82 re f Q", "q 0.85 0.95 0.42 rg 0 0 595 8 re f Q", "q 0.96 0.97 0.95 rg 36 620 523 105 re f Q", "q 0.96 0.97 0.95 rg 36 450 523 145 re f Q", "q 0.96 0.97 0.95 rg 36 165 523 95 re f Q", "q 0.06 0.46 0.43 RG 36 605 m 559 605 l S 36 435 m 559 435 l S 36 145 m 559 145 l S Q", "1 1 1 rg", ...lines.slice(0, 4).map(line => `BT /${line.bold ? "F2" : "F1"} ${line.size} Tf ${line.x} ${line.y} Td (${pdfText(line.value)}) Tj ET`), "0.06 0.16 0.16 rg", ...lines.slice(4).map(line => `BT /${line.bold ? "F2" : "F1"} ${line.size} Tf ${line.x} ${line.y} Td (${pdfText(line.value)}) Tj ET`)].join("\n");
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [6 0 R] /Count 1 >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>",
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents 5 0 R >>",
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
      { value: "CAAT PowerBot LLP", x: 40, y: 805, size: 22, bold: true }, { value: "SOLAR QUOTATION", x: 40, y: 785, size: 9 },
      { value: `Quotation ID  ${quote.id ?? "estimate"}`, x: 375, y: 805, size: 9 }, { value: "ESTIMATE", x: 485, y: 785, size: 9, bold: true },
      { value: "CUSTOMER DETAILS", x: 48, y: 700, size: 10, bold: true }, { value: customer.name ?? "Solar customer", x: 48, y: 675, size: 13, bold: true },
      { value: `${customer.email ?? ""}  |  ${customer.phone ?? ""}`, x: 48, y: 653, size: 9 },
      { value: "SYSTEM RECOMMENDATION", x: 48, y: 570, size: 10, bold: true }, { value: `${quote.systemSizeKw ?? "-"} kW solar system`, x: 48, y: 535, size: 18, bold: true },
      { value: `${quote.panelsRequired ?? "-"} panels   |   ${quote.roofAreaSqFt ?? "-"} sq ft roof area`, x: 300, y: 538, size: 10 },
      { value: "INVESTMENT & SAVINGS", x: 48, y: 405, size: 10, bold: true },
      { value: "Estimated system cost", x: 48, y: 378, size: 10 }, { value: pdfInr(quote.grossCost ?? 0), x: 420, y: 378, size: 10, bold: true },
      { value: "Government subsidy", x: 48, y: 353, size: 10 }, { value: `- ${pdfInr(quote.subsidy ?? 0)}`, x: 420, y: 353, size: 10 },
      { value: "Estimated net cost", x: 48, y: 328, size: 11, bold: true }, { value: pdfInr(quote.netCost ?? 0), x: 420, y: 328, size: 11, bold: true },
      { value: "Monthly savings", x: 48, y: 285, size: 10 }, { value: pdfInr(quote.monthlySavings ?? 0), x: 420, y: 285, size: 10, bold: true },
      { value: "Annual savings", x: 48, y: 260, size: 10 }, { value: pdfInr(quote.annualSavings ?? 0), x: 420, y: 260, size: 10, bold: true },
      { value: "25-year savings", x: 48, y: 235, size: 10 }, { value: pdfInr(quote.twentyFiveYearSavings ?? 0), x: 420, y: 235, size: 10, bold: true },
      { value: "Payback period", x: 48, y: 205, size: 10 }, { value: `${quote.paybackYears ?? "-"} years`, x: 420, y: 205, size: 10, bold: true },
      { value: `CO2 offset: ${(quote.co2OffsetKg ?? 0).toLocaleString("en-IN")} kg per year`, x: 48, y: 185, size: 10 },
      { value: `View quotation: ${siteUrl}/quote/result?id=${quote.id ?? "estimate"}`, x: 48, y: 48, size: 7 },
      { value: "Estimate only. Final pricing, design and subsidy eligibility are confirmed after site survey.", x: 48, y: 28, size: 7 },
    ];
    const bytes = createPdf(lines);
    const bucket = getEnv().BILLS_BUCKET;
    if (bucket && quote.id) {
      try { await bucket.put(`quotes/${quote.id}.pdf`, bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer, { httpMetadata: { contentType: "application/pdf", contentDisposition: `attachment; filename="caat-powerbot-${quote.id}.pdf"` } }); }
      catch (storageError) { console.error("quote_pdf_storage_failed", { quoteId: quote.id, error: storageError instanceof Error ? storageError.message : String(storageError) }); }
    }
    return new Response(bytes, { headers: { "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="caat-powerbot-${quote.id ?? "quotation"}.pdf"`, "Content-Length": String(bytes.byteLength) } });
  } catch (error) {
    console.error("pdf_generation_failed", { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ success: false, error: { code: "PDF_GENERATION_FAILED", message: "The quotation PDF could not be generated." } }, { status: 500 });
  }
}
