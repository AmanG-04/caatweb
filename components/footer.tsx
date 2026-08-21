import Image from "next/image";
import logo from "../companyinfo/caatlogo-96.webp";
import { defaultWhatsappMessage, site } from "@/lib/site";

const quickLinks = [
  { label: "About us", href: "/about-us" },
  { label: "Solutions", href: "/solutions" },
  { label: "Testimonials", href: "/testimonials" },
  { label: "BlogBot", href: "/blogbot" },
  { label: "Contact", href: "/contact" },
  { label: "Savings estimate", href: "/quote" },
  { label: "Online consultation", href: site.whatsapp(defaultWhatsappMessage), external: true },
];

const serviceList = [
  "Rooftop solar installation",
  "Solar water heaters","BESS with Lithium-ion batteries",
  "EV charger",
  "Diesel & Gas generators","Maintenance & AMC",
];

const socialLinks = [
  { label: "Instagram", href: "https://www.instagram.com/caat.powerbot/", platform: "instagram" },
  { label: "LinkedIn", href: "https://www.linkedin.com/company/caat-powerbot-llp/", platform: "linkedin" },
  { label: "Facebook", href: "https://www.facebook.com/people/CAAT-PowerBot-LLP/100093259755204/", platform: "facebook" },
] as const;

type SocialPlatform = "instagram" | "linkedin" | "facebook";

function SocialLogo({ platform }: { platform: SocialPlatform }) {
  if (platform === "instagram") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
      </svg>
    );
  }

  if (platform === "linkedin") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
        <path d="M5.1 8.7h3.2V19H5.1V8.7Zm1.6-5a1.9 1.9 0 1 1 0 3.8 1.9 1.9 0 0 1 0-3.8ZM10.8 8.7h3v1.4h.1c.4-.8 1.5-1.7 3.1-1.7 3.3 0 3.9 2.2 3.9 5.1V19h-3.2v-4.9c0-1.2 0-2.8-1.7-2.8s-2 1.3-2 2.7V19h-3.2V8.7Z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
      <path d="M13.6 21v-8h2.7l.4-3h-3.1V8.1c0-.9.3-1.5 1.6-1.5h1.7V3.9c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.2V10H7.3v3h2.8v8h3.5Z" />
    </svg>
  );
}

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
            <div className="mt-6">
              <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-gold">
                Follow our work
              </p>
              <nav aria-label="Social media links" className="mt-3 flex gap-2.5">
                {socialLinks.map(({ label, href, platform }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`CAAT PowerBot on ${label}`}
                    className="group inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/75 transition-all duration-200 hover:-translate-y-1 hover:border-gold hover:bg-gold hover:text-night focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                  >
                    <SocialLogo platform={platform} />
                  </a>
                ))}
              </nav>
            </div>
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
                  Online consultation
                </a>
              </li>
              {/* <li>
                <a
                  href={`tel:+${site.phoneRaw}`}
                  className="font-mono text-sm text-white/70 transition-colors hover:text-gold-soft"
                >
                  {site.phoneDisplay}
                </a>
              </li> */}
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
              Mon–Fri, 10 am – 5 pm IST. 
            </p>
            <a href="/brochures" className="mt-6 inline-flex items-center gap-2 rounded-xl border border-gold/35 bg-gold/10 px-4 py-3 font-mono text-[10px] font-bold uppercase tracking-[.14em] text-gold transition-colors hover:border-gold hover:bg-gold hover:text-night">
              Brochures & technical docs
            </a>
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
