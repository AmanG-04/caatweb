import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, MessageCircle } from "lucide-react";
import logo from "../companyinfo/caatlogo.webp";
import { defaultWhatsappMessage, site } from "@/lib/site";
import { buttonStyles } from "./ui";

type SiteHeaderProps = {
  context?: string;
  fixed?: boolean;
};

export function SiteHeader({ context, fixed = false }: SiteHeaderProps) {
  return (
    <nav className={`site-header container-wide z-50 flex items-center justify-between gap-3 bg-cream/95 py-3 backdrop-blur-md sm:gap-6 sm:py-4 ${fixed ? "site-header-fixed" : ""}`} aria-label="Primary navigation">
      <Link href="/" className="flex min-w-0 items-center gap-2.5" aria-label="CAAT PowerBot home">
        <Image src={logo} alt="CAAT PowerBot logo" width={48} height={48} className="h-9 w-9 shrink-0 object-contain sm:h-11 sm:w-11" priority />
        <span className="truncate text-sm font-black tracking-tight sm:text-lg">CAAT PowerBot <span className="hidden text-teal sm:inline">LLP</span></span>
      </Link>
      <div className="hidden gap-5 text-sm font-semibold lg:flex">
        <Link href="/residential-solar">Residential</Link>
        <Link href="/commercial-solar">Commercial</Link>
        <Link href="/solar-subsidy-delhi-ncr">Subsidy</Link>
        <Link href="/projects">Projects</Link>
        <Link href="/contact">Contact</Link>
      </div>
      {context ? <span className="site-header-context text-xs font-bold uppercase tracking-[.14em] text-ink/50">{context}</span> : <div className="flex shrink-0 items-center gap-2"><a href={site.whatsapp(defaultWhatsappMessage)} target="_blank" rel="noopener noreferrer" className={buttonStyles("outline", "min-h-10 gap-1.5 px-3 text-xs sm:min-h-11 sm:px-4 sm:text-sm")}><MessageCircle size={15} /><span className="sm:hidden">Consult</span><span className="hidden sm:inline">onsultation</span></a><Link href="/quote" className={buttonStyles("primary", "site-header-cta min-h-10 gap-1.5 px-3 text-xs sm:min-h-11 sm:px-4 sm:text-sm")}><span className="sm:hidden">Estimate</span><span className="hidden sm:inline">Get estimate</span><ArrowUpRight size={15} /></Link></div>}
    </nav>
  );
}
