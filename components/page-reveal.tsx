"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export function PageReveal({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return <div key={pathname} className="page-reveal">{children}</div>;
}
