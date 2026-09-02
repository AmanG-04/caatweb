"use client";
import { useEffect, useState } from "react";
import { ArrowUpRight, Leaf, MessageCircle, PanelsTopLeft, WalletCards } from "lucide-react";
import { Button, buttonStyles, Card } from "@/components/ui";
import { inr } from "@/lib/utils";
import { site } from "@/lib/site";
import { SiteHeader } from "@/components/site-header";
type Q = {
  id?: string;
  systemSizeKw: number;
  panelsRequired: number;
  roofAreaSqFt: number;
  grossCost?: number;
  netCost: number;
  subsidy: number;
  monthlySavings: number;
  annualSavings: number;
  twentyFiveYearSavings: number;
  co2OffsetKg: number;
  treesEquivalent: number;
  paybackYears: number;
  irr: number;
};
type Customer = {
  name?: string; email?: string; phone?: string; address?: string; city?: string; state?: string; pincode?: string;
  propertyType?: string; roofType?: string; ownership?: string; systemType?: string; batteryRequired?: string;
  monthlyUnits?: number; pricePerUnit?: number; provider?: string;
};
export default function Result() {
  const [q, setQ] = useState<Q | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [customer, setCustomer] = useState<Customer>({});
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    const raw = localStorage.getItem("solar_quote");
    if (raw) {
      const value = JSON.parse(raw);
      setQ(value.quote);
      setCustomer(value);
    }
    setLoaded(true);
  }, []);
  const downloadPdf = async () => {
    if (!q) return;
    setDownloading(true);
    setError("");
    try {
      const response = await fetch("/api/quote/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quote: q, customer }),
      });
      if (!response.ok)
        throw new Error(
          "The estimate PDF could not be generated. Please try again.",
        );
      const blob = await response.blob();
      if (blob.type !== "application/pdf")
        throw new Error("The server returned an invalid PDF.");
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `caat-powerbot-${q.id ?? "estimate"}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (downloadError) {
      setError(
        downloadError instanceof Error
          ? downloadError.message
          : "The estimate PDF could not be generated.",
      );
    } finally {
      setDownloading(false);
    }
  };
  if (!loaded)
    return (
      <div className="container-wide py-20">Loading your solar estimate…</div>
    );
  if (!q)
    return (
      <main className="min-h-screen bg-paper py-8">
        <SiteHeader context="Solar estimate" />
        <div className="grid min-h-[calc(100vh-9rem)] place-items-center p-5">
          <Card className="max-w-lg border border-ink/10 p-8 text-center sm:p-10">
            <p className="section-kicker">Solar estimate</p>
              <h1 className="text-3xl font-black leading-[1.02] tracking-[-.045em]">No estimate found on this device.</h1>
            <p className="mt-4 leading-7 text-ink/65">Complete the calculator first and your result will appear here.</p>
            <a href="/quote" className={buttonStyles("primary", "mt-7 gap-2")}>
              Calculate my savings <ArrowUpRight size={16} />
            </a>
          </Card>
        </div>
      </main>
    );
  return (
    <main className="quote-flow relative min-h-screen overflow-hidden py-8">
      <div className="relative z-10">
      <SiteHeader context="Your solar estimate" />
      <div className="container-wide">
        <div className="py-16">
          <p className="section-kicker">
            Your solar snapshot
          </p>
          <h1 className="section-title">
            A brighter bill starts here.
          </h1>
          <p className="section-copy">
            This estimate is based on the information you shared. A final site
            assessment will validate the design before installation.
          </p>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            <Card className="bg-ink text-cream">
              <PanelsTopLeft className="text-lime" />
              <p className="mt-8 text-sm text-cream/60">Recommended system</p>
              <b className="text-4xl leading-none tracking-[-.045em]">{q.systemSizeKw} kW</b>
              <p className="mt-2 text-sm text-cream/60">
                {q.panelsRequired} panels · {q.roofAreaSqFt} sq ft
              </p>
            </Card>
            <Card>
              <WalletCards className="text-teal" />
              <p className="mt-8 text-sm text-ink/50">Monthly savings</p>
              <b className="text-4xl leading-none tracking-[-.045em]">{inr(q.monthlySavings)}</b>
              <p className="mt-2 text-sm text-ink/50">
                {inr(q.annualSavings)} each year
              </p>
            </Card>
            <Card className="bg-lime">
              <Leaf className="text-teal" />
              <p className="mt-8 text-sm text-ink/60">25-year value</p>
              <b className="text-4xl leading-none tracking-[-.045em]">{inr(q.twentyFiveYearSavings)}</b>
              <p className="mt-2 text-sm text-ink/60">
                {q.co2OffsetKg.toLocaleString("en-IN")} kg CO₂ offset
              </p>
            </Card>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Card>
              <h2 className="text-xl font-black">Investment breakdown</h2>
              <div className="mt-6 space-y-4 text-sm">
                <Row
                  label="Estimated system cost"
                  value={inr(q.grossCost ?? q.netCost + q.subsidy)}
                />
                <Row
                  label="Government subsidy"
                  value={`− ${inr(q.subsidy)}`}
                  green
                />
                <Row label="Estimated net cost" value={inr(q.netCost)} bold />
              </div>
            </Card>
            <Card>
              <h2 className="text-xl font-black">What this means</h2>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <Metric
                  label="Payback period"
                  value={`${q.paybackYears} years`}
                />
                <Metric label="Estimated IRR" value={`${q.irr}%`} />
                <Metric
                  label="Trees equivalent"
                  value={q.treesEquivalent.toLocaleString("en-IN")}
                />
                <Metric
                  label="25-year savings"
                  value={inr(q.twentyFiveYearSavings)}
                />
              </div>
            </Card>
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <a
              href={site.whatsapp("Hi CAAT Powerbot, I'd like to discuss my solar estimate.")}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonStyles("primary", "gap-2")}
            >
              <MessageCircle size={17} /> Discuss estimate on WhatsApp
            </a>
            <Button variant="outline" onClick={downloadPdf} disabled={downloading}>
              {downloading ? "Creating PDF…" : "Download PDF"}{" "}
              <ArrowUpRight className="ml-1 inline" size={16} />
            </Button>
          </div>
          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
        </div>
      </div>
      </div>
    </main>
  );
}
const Row = ({
  label,
  value,
  green,
  bold,
}: {
  label: string;
  value: string;
  green?: boolean;
  bold?: boolean;
}) => (
  <div
    className={`flex justify-between ${green ? "text-teal" : ""} ${bold ? "border-t border-ink/10 pt-4 font-black" : ""}`}
  >
    <span>{label}</span>
    <span>{value}</span>
  </div>
);
const Metric = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-2xl bg-cream p-4">
    <b>{value}</b>
    <p className="mt-1 text-xs text-ink/55">{label}</p>
  </div>
);
