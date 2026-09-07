"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Leaf, PanelsTopLeft } from "lucide-react";
import { buttonStyles, Card } from "@/components/ui";
import { SiteHeader } from "@/components/site-header";
import { site } from "@/lib/site";

type Quote = {
  systemSizeKw: number;
  yearlyGenerationRange: string;
  roofAreaSqFt: number;
  annualSavingsRange: string;
  targetSavingsPercent: number;
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
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="bg-ink text-cream">
            <PanelsTopLeft className="text-lime" />
            <p className="mt-5 text-sm text-cream/60">System size</p>
            <b className="mt-1 block text-5xl tracking-tight">{quote.systemSizeKw} kW</b>
          </Card>
          <Card>
            <PanelsTopLeft className="text-teal" />
            <p className="mt-5 text-sm text-ink/50">Target saving</p>
            <b className="mt-1 block text-5xl tracking-tight">{quote.targetSavingsPercent}%</b>
          </Card>
          <Card className="bg-lime">
            <Leaf className="text-teal" />
            <p className="mt-5 text-sm text-ink/60">Annual savings</p>
            <b className="mt-1 block text-3xl tracking-tight">{quote.annualSavingsRange}</b>
          </Card>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Card className="flex items-center justify-between gap-4">
            <p className="text-sm text-ink/55">Annual generation</p>
            <b className="text-xl text-ink">{quote.yearlyGenerationRange}</b>
          </Card>
          <Card className="flex items-center justify-between gap-4">
            <p className="text-sm text-ink/55">Roof area</p>
            <b className="text-xl text-ink">{quote.roofAreaSqFt} sq ft</b>
          </Card>
        </div>
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-night p-5 text-white">
          <p className="text-sm text-white/75">Consult us for the final estimate.</p>
          <a href={site.whatsapp(whatsappMessage)} target="_blank" rel="noopener noreferrer" className={buttonStyles("primary", "gap-2")}>
            Consult us
            <ArrowUpRight size={16} />
          </a>
        </div>
      </div>
    </main>
  );
}
