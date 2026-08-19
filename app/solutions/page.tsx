import type { Metadata } from "next";
import { PublicPage } from "@/components/public-page";
import { SolutionsShowcase } from "@/components/solutions-showcase";

export const metadata: Metadata = {
  title: "Solar Solutions | CAAT PowerBot",
  description: "Explore rooftop solar, hybrid power, battery backup and support services from CAAT PowerBot in Delhi NCR.",
  alternates: { canonical: "/solutions" },
};

export default function SolutionsPage() {
  return (
    <PublicPage gridLines={false}>
      <SolutionsShowcase />
    </PublicPage>
  );
}
