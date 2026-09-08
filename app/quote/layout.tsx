import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Solar Estimate | CAAT PowerBot",
  description: "Get a practical rooftop solar estimate from your electricity use, property details and target bill savings in Delhi NCR.",
  alternates: { canonical: "/quote" },
};

export default function QuoteLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
