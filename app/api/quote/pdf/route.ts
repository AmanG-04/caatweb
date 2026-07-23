import { NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import QRCode from "qrcode";
import { inr } from "@/lib/utils";

export const runtime = "edge";

export async function POST(request: Request) {
  const input = await request.json() as { customer?: { name?: string; email?: string; phone?: string }; quote?: { id?: string; systemSizeKw?: number; panelsRequired?: number; roofAreaSqFt?: number; grossCost?: number; subsidy?: number; netCost?: number; monthlySavings?: number; annualSavings?: number; twentyFiveYearSavings?: number; paybackYears?: number; co2OffsetKg?: number } };
  const quote = input.quote ?? {}; const customer = input.customer ?? {};
  const pdf = await PDFDocument.create(); const page = pdf.addPage([595, 842]); const font = await pdf.embedFont(StandardFonts.Helvetica); const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const teal = rgb(0.06, 0.46, 0.43); const ink = rgb(0.06, 0.16, 0.16); const lime = rgb(0.85, 0.95, 0.42);
  page.drawRectangle({ x: 0, y: 780, width: 595, height: 62, color: ink }); page.drawText("caat powerbot", { x: 40, y: 806, size: 24, font: bold, color: lime }); page.drawText("SOLAR QUOTATION", { x: 40, y: 788, size: 9, font, color: rgb(1, 1, 1) });
  page.drawText(`Quotation ${quote.id ?? "estimate"}`, { x: 390, y: 807, size: 10, font, color: rgb(1, 1, 1) });
  let y = 735; const text = (value: string, size = 11, useBold = false, color = ink) => { page.drawText(value, { x: 40, y, size, font: useBold ? bold : font, color }); y -= size + 10; };
  text("Customer details", 16, true, teal); text(customer.name ?? "Solar customer", 12, true); text(`${customer.email ?? ""}  ${customer.phone ?? ""}`, 10); y -= 12;
  text("System recommendation", 16, true, teal); text(`${quote.systemSizeKw ?? "—"} kW solar system`, 14, true); text(`${quote.panelsRequired ?? "—"} panels  •  ${quote.roofAreaSqFt ?? "—"} sq ft roof area`, 10); y -= 12;
  text("Investment and savings", 16, true, teal); const rows = [["Estimated system cost", inr(quote.grossCost ?? 0)], ["Government subsidy", `- ${inr(quote.subsidy ?? 0)}`], ["Estimated net cost", inr(quote.netCost ?? 0)], ["Monthly savings", inr(quote.monthlySavings ?? 0)], ["Annual savings", inr(quote.annualSavings ?? 0)], ["25-year savings", inr(quote.twentyFiveYearSavings ?? 0)], ["Payback period", `${quote.paybackYears ?? "—"} years`]]; for (const [label, value] of rows) { page.drawText(label, { x: 40, y, size: 11, font }); page.drawText(value, { x: 390, y, size: 11, font: bold, color: label.includes("subsidy") ? teal : ink }); y -= 24; }
  y -= 18; text("Environmental impact", 16, true, teal); text(`${(quote.co2OffsetKg ?? 0).toLocaleString("en-IN")} kg estimated CO₂ offset per year`, 11); y -= 20;
  page.drawText("This quotation is an estimate. Final system design, subsidy eligibility and pricing are confirmed after site survey.", { x: 40, y: 90, size: 9, font, color: rgb(0.35, 0.4, 0.4), maxWidth: 350 });
  const qr = await QRCode.toDataURL(`${process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com"}/quote/result?id=${quote.id ?? "estimate"}`); page.drawImage(await pdf.embedPng(qr), { x: 440, y: 45, width: 90, height: 90 });
  const pdfBytes = await pdf.save();
  const body = pdfBytes.buffer.slice(pdfBytes.byteOffset, pdfBytes.byteOffset + pdfBytes.byteLength) as ArrayBuffer;
  return new NextResponse(body, { headers: { "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="caat-powerbot-${quote.id ?? "quotation"}.pdf"` } });
}
