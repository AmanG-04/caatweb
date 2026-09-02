"use client";

import { ChevronDown, MessageCircle } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { defaultWhatsappMessage, site } from "@/lib/site";

export function MobileNavMenu() {
  const pathname = usePathname();
  const menuRef = useRef<HTMLDetailsElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  const isCurrentPath = (href: string) => pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));

  const closeMenu = () => {
    menuRef.current?.removeAttribute("open");
    setIsOpen(false);
  };

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node) && !panelRef.current?.contains(event.target as Node)) closeMenu();
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
    <details ref={menuRef} className="site-header-menu lg:hidden" onToggle={(event) => setIsOpen(event.currentTarget.open)}>
      <summary aria-label="Open navigation menu"><span>Menu</span><ChevronDown size={14} aria-hidden="true" /></summary>
      {isOpen && createPortal(
      <div ref={panelRef} className="site-header-menu-panel" onClick={closeMenu}>
        <a href="/about-us" aria-current={isCurrentPath("/about-us") ? "page" : undefined}>About us</a>
        <a href="/solutions" aria-current={isCurrentPath("/solutions") ? "page" : undefined}>Solutions</a>
        <a href="/testimonials" aria-current={isCurrentPath("/testimonials") ? "page" : undefined}>Testimonials</a>
        <a href="/blogbot" aria-current={isCurrentPath("/blogbot") ? "page" : undefined}>BlogBot</a>
        <a href="/contact" aria-current={isCurrentPath("/contact") ? "page" : undefined}>Contact</a>
        <a href={site.whatsapp(defaultWhatsappMessage)} target="_blank" rel="noopener noreferrer"><MessageCircle size={16} /> Online consultation</a>
      </div>,
      document.body,
      )}
    </details>
  );
}
