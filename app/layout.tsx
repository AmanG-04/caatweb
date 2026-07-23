import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "caat powerbot | Solar savings, made simple", description: "Calculate your solar savings in 2 minutes with caat powerbot.", openGraph: { title: "Calculate Your Solar Savings in 2 Minutes", description: "A smarter way to switch to solar.", type: "website" } };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en-IN" data-scroll-behavior="smooth"><body>{children}</body></html>; }
