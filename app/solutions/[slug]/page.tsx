import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicPage } from "@/components/public-page";
import { SolutionsShowcase, type SolutionId } from "@/components/solutions-showcase";

type PageProps = {
  params: Promise<{ slug: string }>;
};

const solutionPages = [
  { id: "solar", title: "Solar", description: "On-grid, off-grid and hybrid solar solutions for homes, businesses and institutions." },
  { id: "water-heating", title: "Solar Water Heating", description: "Solar water-heating solutions including ETC and FPC systems." },
  { id: "bess", title: "Battery Energy Storage", description: "Lithium battery energy storage solutions for critical loads and solar integration." },
  { id: "ev-charging", title: "EV Charging", description: "EV charging infrastructure for homes, workplaces, fleets and shared parking." },
  { id: "generators", title: "Generators", description: "Diesel and gas generator solutions for reliable backup power." },
  { id: "maintenance", title: "Maintenance & AMC", description: "Maintenance and annual support for solar and electrical energy assets." },
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
      <SolutionsShowcase initialSolutionId={solution.id as SolutionId} initiallyExpanded />
    </PublicPage>
  );
}
