import Image from "next/image";
import logo from "../companyinfo/caatlogo-96.webp";
import { defaultWhatsappMessage, site } from "@/lib/site";

const quickLinks = [
  { label: "Residential solar", href: "/residential-solar" },
  { label: "Commercial solar", href: "/commercial-solar" },
  { label: "Solar subsidy guidance", href: "/solar-subsidy-delhi-ncr" },
  { label: "Solar panel cost", href: "/solar-panel-cost" },
  { label: "Projects", href: "/projects" },
  { label: "Contact", href: "/contact" },
  { label: "Savings estimate", href: "/quote" },
  { label: "Free online consultation", href: site.whatsapp(defaultWhatsappMessage), external: true },
];

const serviceList = [
  "Rooftop solar installation",
  "Solar water heaters",
  "Maintenance & AMC",
  "Energy audits & net metering",
  "EV charging points",
  "Emergency generators",
];

function SunDivider() {
  return (
    <div className="flex items-center gap-4" aria-hidden="true">
      <span className="h-px flex-1 bg-white/10" />
      <svg
        width="22"
        height="22"
        viewBox="0 0 22 22"
        fill="none"
        stroke="var(--color-gold)"
        strokeWidth="1.4"
        strokeLinecap="round"
      >
        <circle cx="11" cy="11" r="3.5" />
        <path d="M11 2v2.5M11 17.5V20M2 11h2.5M17.5 11H20M4.6 4.6l1.8 1.8M15.6 15.6l1.8 1.8M17.4 4.6l-1.8 1.8M6.4 15.6l-1.8 1.8" />
      </svg>
      <span className="h-px flex-1 bg-white/10" />
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="border-t-2 border-gold bg-night">
      <div className="mx-auto max-w-none 2xl:px-16 px-5 py-16 sm:px-8 sm:py-20">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div>
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl bg-white p-1">
                <Image
                  src={logo}
                  alt={`${site.name} logo`}
                  width={44}
                  height={44}
                  className="h-full w-full rounded-lg object-contain"
                />
              </span>
              <span className="font-display text-lg font-bold tracking-tight text-white">
                {site.name}
              </span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/60">
              Solar EPC for homes, housing societies and industry — from
              estimate to switch-on, with support after installation.
            </p>
          </div>

          <nav aria-label="Footer quick links">
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-gold">
              Explore
            </p>
            <ul className="mt-5 space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target={link.external ? "_blank" : undefined}
                    rel={link.external ? "noopener noreferrer" : undefined}
                    className="text-sm text-white/70 transition-colors hover:text-gold-soft"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-gold">
              Services
            </p>
            <ul className="mt-5 space-y-3">
              {serviceList.map((service) => (
                <li key={service} className="text-sm text-white/60">
                  {service}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-gold">
              Talk to us
            </p>
            <ul className="mt-5 space-y-3">
              <li>
                <a
                  href={site.whatsapp(defaultWhatsappMessage)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-white/70 transition-colors hover:text-gold-soft"
                >
                  Free online consultation
                </a>
              </li>
              <li>
                <a
                  href={`tel:+${site.phoneRaw}`}
                  className="font-mono text-sm text-white/70 transition-colors hover:text-gold-soft"
                >
                  {site.phoneDisplay}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${site.email}`}
                  className="break-all text-sm text-white/70 transition-colors hover:text-gold-soft"
                >
                  {site.email}
                </a>
              </li>
            </ul>
            <p className="mt-5 max-w-[220px] text-xs leading-relaxed text-white/60">
              Mon–Fri, 10 am – 5 pm IST. Free online consultations via WhatsApp.
            </p>
          </div>
        </div>

        <div className="mt-14">
          <SunDivider />
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-center text-xs text-white/50">
            © 2026 CAAT Powerbot LLP · All rights reserved
          </p>
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-gold/70">
            Solar · EV · Power
          </p>
        </div>
      </div>
    </footer>
  );
}
