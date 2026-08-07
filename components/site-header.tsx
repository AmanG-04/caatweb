import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, MessageCircle } from "lucide-react";
import logo from "../companyinfo/caatlogo-96.webp";
import { defaultWhatsappMessage, site } from "@/lib/site";
import { MobileNavMenu } from "./mobile-nav-menu";
import { buttonStyles } from "./ui";

type SiteHeaderProps = {
  context?: string;
  fixed?: boolean;
};

export function SiteHeader({ context, fixed = false }: SiteHeaderProps) {
  return (
    <nav className={`site-header container-wide z-50 flex items-center justify-between gap-3 bg-cream/95 py-3 backdrop-blur-md sm:gap-6 sm:py-4 ${fixed ? "site-header-fixed" : ""}`} aria-label="Primary navigation">
      <Link href="/" className="flex min-w-0 items-center gap-2 sm:gap-2.5" aria-label="CAAT PowerBot LLP home">
        <Image src={logo} alt="CAAT PowerBot logo" width={48} height={48} className="h-8 w-8 shrink-0 object-contain sm:h-11 sm:w-11" priority />
        <span className="truncate text-[13px] font-black tracking-tight sm:text-lg">CAAT PowerBot <span className="hidden text-teal sm:inline">LLP</span></span>
      </Link>
      <div className="hidden gap-5 text-sm font-semibold lg:flex">
        <Link href="/residential-solar">Residential</Link>
        <Link href="/commercial-solar">Commercial</Link>
        <Link href="/solar-subsidy-delhi-ncr">Subsidy</Link>
        <Link href="/projects">Projects</Link>
        <Link href="/contact">Contact</Link>
      </div>
      {context ? <span className="site-header-context text-xs font-bold uppercase tracking-[.14em] text-ink/50">{context}</span> : <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
        <MobileNavMenu />
        <a href={site.whatsapp(defaultWhatsappMessage)} target="_blank" rel="noopener noreferrer" className={buttonStyles("outline", "site-header-consultation hidden min-h-10 gap-1.5 px-3 text-xs sm:min-h-11 sm:px-4 sm:text-sm lg:inline-flex")}><MessageCircle size={15} />Consultation</a>
        <Link href="/quote" className={buttonStyles("primary", "site-header-cta min-h-9 gap-1 px-2.5 text-[11px] sm:min-h-11 sm:gap-1.5 sm:px-4 sm:text-sm")}><span className="sm:hidden">Estimate</span><span className="hidden sm:inline">Get estimate</span><ArrowUpRight size={14} /></Link>
      </div>}
    </nav>
  );
}
