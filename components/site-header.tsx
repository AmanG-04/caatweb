import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import logo from "../companyinfo/caatlogo.webp";
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
      <div className="hidden gap-7 text-sm font-semibold md:flex">
        <Link href="/#services">Solutions</Link>
        <Link href="/#references">Projects</Link>
        <Link href="/#process">Process</Link>
        <Link href="/#faq">FAQ</Link>
      </div>
      {context ? <span className="site-header-context text-xs font-bold uppercase tracking-[.14em] text-ink/50">{context}</span> : <Link href="/quote" className={buttonStyles("primary", "site-header-cta shrink-0 gap-1.5 px-4 sm:px-5")}><span className="sm:hidden">Get estimate</span><span className="hidden sm:inline">Get solar estimate</span><ArrowUpRight size={16} /></Link>}
    </nav>
  );
}
