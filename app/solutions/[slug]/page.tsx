import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicPage } from "@/components/public-page";
import { SolutionsShowcase, type SolutionId } from "@/components/solutions-showcase";
import { SolarSizingGuide } from "@/components/solar-sizing-guide";
import { jsonLd } from "@/lib/seo";

type PageProps = {
  params: Promise<{ slug: string }>;
};

const solutionPages = [
  { id: "solar", title: "Solar", description: "On-grid, off-grid and hybrid rooftop solar systems for homes, businesses and institutions in Delhi NCR, from design through commissioning." },
  { id: "water-heating", title: "Solar Water Heating", description: "ETC and FPC solar water-heating systems for homes, businesses and institutions in Delhi NCR, sized around daily hot-water demand." },
  { id: "bess", title: "Battery Energy Storage", description: "Lithium battery energy storage for critical loads, solar integration and backup power across homes, offices and commercial sites." },
  { id: "ev-charging", title: "EV Charging", description: "EV charging infrastructure for homes, workplaces, fleets and shared parking, planned around electrical capacity and future use." },
  { id: "generators", title: "Generators", description: "Diesel and gas generator solutions for homes, offices, commercial buildings and institutions that need dependable backup power." },
  { id: "maintenance", title: "Maintenance & AMC", description: "Solar and electrical maintenance, health checks and annual support plans that help energy assets stay safe and dependable." },
] as const;

export function generateStaticParams() {
  return solutionPages.map((solution) => ({ slug: solution.id }));
}

function findSolution(slug: string) {
  return solutionPages.find((solution) => solution.id === slug);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const solution = findSolution((await params).slug);

  if (!solution) {
    return {
      title: "Solution not found | CAAT PowerBot",
    };
  }

  return {
    title: `${solution.title} | CAAT PowerBot Solutions`,
    description: solution.description,
    alternates: {
      canonical: `/solutions/${solution.id}`,
    },
  };
}

export default async function SolutionPage({ params }: PageProps) {
  const slug = (await params).slug;
  const solution = findSolution(slug);

  if (!solution) {
    notFound();
  }

  return (
    <PublicPage gridLines={false}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd({
            "@context": "https://schema.org",
            "@type": "Product",
            name: `${solution.title} by CAAT PowerBot`,
            description: solution.description,
            brand: { "@type": "Brand", name: "CAAT PowerBot" },
            category: "Energy equipment and installation service",
            areaServed: ["Delhi", "Gurgaon", "Noida", "Greater Noida", "Ghaziabad", "Faridabad"],
            url: `https://caatpowerbot.com/solutions/${solution.id}`,
          }),
        }}
      />
      <SolutionsShowcase initialSolutionId={solution.id as SolutionId} initiallyExpanded />
      {solution.id === "solar" ? <SolarSizingGuide /> : null}
    </PublicPage>
  );
}
