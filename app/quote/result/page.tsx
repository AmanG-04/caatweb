"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Leaf, PanelsTopLeft, WalletCards } from "lucide-react";
import { buttonStyles, Card } from "@/components/ui";
import { SiteHeader } from "@/components/site-header";
import { site } from "@/lib/site";

type Quote = {
  systemSizeKw: 3 | 5 | 10;
  yearlyGenerationRange: string;
  roofAreaSqFt: number;
  annualSavingsRange: string;
  investmentRange: string;
};

type Customer = {
  city?: string;
  state?: string;
};

export default function Result() {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [customer, setCustomer] = useState<Customer>({});

  useEffect(() => {
    const saved = localStorage.getItem("solar_quote");
    if (saved) {
      const parsed = JSON.parse(saved) as Customer & { quote: Quote };
      setQuote(parsed.quote);
      setCustomer(parsed);
    }
  }, []);

  if (!quote) {
    return (
      <main className="min-h-screen bg-paper py-8">
        <SiteHeader context="Solar estimate" />
        <div className="grid min-h-[calc(100vh-9rem)] place-items-center p-5">
          <Card className="max-w-lg border border-ink/10 p-8 text-center sm:p-10">
            <p className="section-kicker">Solar estimate</p>
            <h1 className="mt-5 text-3xl font-black tracking-tight">No estimate found on this device.</h1>
            <p className="mt-4 leading-7 text-ink/65">Complete the calculator first and your result will appear here.</p>
            <Link href="/quote" className={buttonStyles("primary", "mt-7 gap-2")}>
              Start my estimate
              <ArrowUpRight size={16} />
            </Link>
          </Card>
        </div>
      </main>
    );
  }

  const location = [customer.city, customer.state].filter(Boolean).join(", ") || "my location";
  const whatsappMessage = `Hi CAAT PowerBot, I would like to discuss my ${quote.systemSizeKw} kW solar estimate for ${location}.`;

  return (
    <main className="quote-flow min-h-screen py-8">
      <SiteHeader context="Your solar estimate" />
      <div className="container-wide py-12 sm:py-16">
        <p className="section-kicker">Your solar starting point</p>
        <h1 className="section-title">A practical system size for your roof.</h1>
        <p className="section-copy">This is a general guide based on your electricity use. A site survey confirms the final design, equipment and price.</p>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          <Card className="bg-ink text-cream">
            <PanelsTopLeft className="text-lime" />
            <p className="mt-8 text-sm text-cream/60">Recommended system size</p>
            <b className="text-5xl tracking-tight">{quote.systemSizeKw} kW</b>
            <p className="mt-3 text-sm text-cream/70">A practical starting size before site assessment.</p>
          </Card>
          <Card>
            <WalletCards className="text-teal" />
            <p className="mt-8 text-sm text-ink/50">Typical investment</p>
            <b className="text-4xl tracking-tight">{quote.investmentRange}</b>
            <p className="mt-3 text-sm text-ink/60">A broad installed-cost range; final scope determines the quote.</p>
          </Card>
          <Card className="bg-lime">
            <Leaf className="text-teal" />
            <p className="mt-8 text-sm text-ink/60">Typical annual savings</p>
            <b className="text-3xl tracking-tight">{quote.annualSavingsRange}</b>
            <p className="mt-3 text-sm text-ink/65">Based on typical generation and electricity use.</p>
          </Card>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Card>
            <h2 className="text-xl font-black">What this system can support</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-cream p-5">
                <p className="text-xs font-bold uppercase tracking-[.14em] text-ink/50">Yearly generation</p>
                <p className="mt-2 text-xl font-black">{quote.yearlyGenerationRange}</p>
              </div>
              <div className="rounded-2xl bg-cream p-5">
                <p className="text-xs font-bold uppercase tracking-[.14em] text-ink/50">Recommended roof area</p>
                <p className="mt-2 text-xl font-black">{quote.roofAreaSqFt} sq ft</p>
              </div>
            </div>
          </Card>
          <Card>
            <h2 className="text-xl font-black">Before you decide</h2>
            <p className="mt-4 leading-7 text-ink/70">Panel make, shading, roof condition, sanctioned load, system type and local approvals can change the final design and cost. We confirm these in a site survey.</p>
            <a href={site.whatsapp(whatsappMessage)} target="_blank" rel="noopener noreferrer" className={buttonStyles("outline", "mt-6 gap-2")}>
              Discuss this estimate
              <ArrowUpRight size={16} />
            </a>
          </Card>
        </div>
      </div>
    </main>
  );
}
