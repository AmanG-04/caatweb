"use client";

import Link from "next/link";
import { ChevronDown, MessageCircle } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { defaultWhatsappMessage, site } from "@/lib/site";

export function MobileNavMenu() {
  const pathname = usePathname();
  const menuRef = useRef<HTMLDetailsElement>(null);

  const isCurrentPath = (href: string) => pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));

  const closeMenu = () => {
    menuRef.current?.removeAttribute("open");
  };

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) closeMenu();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMenu();
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <details ref={menuRef} className="site-header-menu lg:hidden">
      <summary aria-label="Open navigation menu"><span>Menu</span><ChevronDown size={14} aria-hidden="true" /></summary>
      <div className="site-header-menu-panel" onClick={closeMenu}>
        {/* <Link href="/">Home</Link> */}
        <Link href="/about-us" aria-current={isCurrentPath("/about-us") ? "page" : undefined}>About us</Link>
        <Link href="/solutions" aria-current={isCurrentPath("/solutions") ? "page" : undefined}>Solutions</Link>
        <Link href="/testimonials" aria-current={isCurrentPath("/testimonials") ? "page" : undefined}>Testimonials</Link>
        <Link href="/blogbot" aria-current={isCurrentPath("/blogbot") ? "page" : undefined}>BlogBot</Link>
        <Link href="/contact" aria-current={isCurrentPath("/contact") ? "page" : undefined}>Contact</Link>
        <a href={site.whatsapp(defaultWhatsappMessage)} target="_blank" rel="noopener noreferrer"><MessageCircle size={16} /> Online consultation</a>
      </div>
    </details>
  );
}
