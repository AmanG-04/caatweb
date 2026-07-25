import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "CAAT PowerBot LLP | Rooftop Solar in Delhi", description: "Calculate your rooftop solar savings in 2 minutes with CAAT PowerBot LLP. Solar design, installation, maintenance, and energy solutions in Delhi.", openGraph: { title: "Clean Energy Made Simple | CAAT PowerBot LLP", description: "Rooftop solar systems for homes and businesses in Delhi.", type: "website" } };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en-IN" data-scroll-behavior="smooth"><body>{children}</body></html>; }
