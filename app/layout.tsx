import type { Metadata } from "next";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { PageReveal } from "@/components/page-reveal";
export const metadata: Metadata = {
  metadataBase: new URL("https://caatpowerbot.com"),
  title: "CAAT PowerBot LLP | Rooftop Solar in Delhi NCR",
  description: "Calculate your rooftop solar savings in 2 minutes with CAAT PowerBot LLP. Solar design, installation, maintenance, and energy solutions in Delhi NCR.",
  alternates: { canonical: "/" },
  icons: { icon: "/icon.png" },
  openGraph: { title: "Access to green energy made simple | CAAT PowerBot LLP", description: "Rooftop solar systems for homes and businesses in Delhi NCR.", type: "website" },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en" className={GeistMono.variable} data-scroll-behavior="smooth"><body><PageReveal>{children}</PageReveal></body></html>; }
