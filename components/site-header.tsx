"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { ArrowUpRight, MessageCircle } from "lucide-react";
import logo from "../companyinfo/caatlogo-96.webp";
import { defaultWhatsappMessage, site } from "@/lib/site";
import { MobileNavMenu } from "./mobile-nav-menu";
import { buttonStyles } from "./ui";

type SiteHeaderProps = {
  context?: string;
  fixed?: boolean;
};

const navigationLinks = [
  { label: "About us", href: "/about-us" },
  { label: "Solutions", href: "/solutions" },
  { label: "Testimonials", href: "/testimonials" },
  { label: "BlogBot", href: "/blogbot" },
  { label: "Contact", href: "/contact" },
];

function isCurrentPath(pathname: string, href: string) {
  return pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));
}

export function SiteHeader({ context, fixed = false }: SiteHeaderProps) {
  const pathname = usePathname();
  const isEstimatePage = pathname === "/quote" || pathname.startsWith("/quote/");

  return (
    <nav className={`site-header container-wide z-50 flex items-center justify-between gap-3 bg-cream/95 py-2.5 backdrop-blur-md sm:gap-6 sm:py-3 ${fixed ? "site-header-fixed" : ""}`} aria-label="Primary navigation">
      <a href="/" className={`flex min-w-0 items-center gap-2 sm:gap-2.5 ${pathname === "/" ? "site-header-home-active" : ""}`} aria-label="CAAT PowerBot LLP home" aria-current={pathname === "/" ? "page" : undefined}>
        <Image src={logo} alt="CAAT PowerBot logo" width={56} height={56} className="h-9 w-9 shrink-0 object-contain sm:h-12 sm:w-12" priority />
        <span className="truncate text-[13px] font-bold tracking-tight sm:text-lg">CAAT PowerBot <span className="hidden text-teal sm:inline">LLP</span></span>
      </a>
      <div className="site-header-links hidden gap-4 text-md font-semibold text-ink/80 lg:flex">
        {navigationLinks.map(({ label, href }) => {
          const active = isCurrentPath(pathname, href);
          return <a key={href} href={href} aria-current={active ? "page" : undefined}>{label}</a>;
        })}
      </div>
      {context ? <span className="site-header-context text-xs font-bold uppercase tracking-[.14em] text-ink/50">{context}</span> : <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <MobileNavMenu />
        <a href={site.whatsapp(defaultWhatsappMessage)} target="_blank" rel="noopener noreferrer" className={buttonStyles("outline", "site-header-consultation hidden min-h-9 gap-1.5 px-3 text-xs sm:min-h-10 sm:px-4 sm:text-sm lg:inline-flex")}><MessageCircle size={15} />Consultation</a>
        <a href="/quote" className={buttonStyles("primary", `site-header-cta min-h-8 gap-1 px-2.5 text-[11px] sm:min-h-9 sm:gap-1.5 sm:px-4 sm:text-sm ${isEstimatePage ? "site-header-cta-active" : ""}`)} aria-current={isEstimatePage ? "page" : undefined}><span className="sm:hidden">Estimate</span><span className="hidden sm:inline">Get estimate</span><ArrowUpRight size={14} /></a>
      </div>}
    </nav>
  );
}
