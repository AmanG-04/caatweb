import type { Metadata } from "next";
import { SeoPage } from "@/components/seo-page";
import { SubsidyProgramDetails } from "@/components/subsidy-program-details";

export const metadata: Metadata = {
  title: "Solar Subsidy Guidance in Delhi NCR | CAAT PowerBot",
  description: "Understand how solar subsidy and net-metering steps may apply to your rooftop solar project in Delhi NCR. Eligibility is confirmed during the project process.",
  alternates: { canonical: "/solar-subsidy-delhi-ncr" },
};

export default function SolarSubsidyPage() {
  return (
    <SeoPage
      eyebrow="Solar subsidy guidance"
      title="Understand the solar paperwork before you begin."
      description="Subsidy and net-metering processes depend on your property, system choice, local requirements and current programme rules. CAAT helps you understand the steps relevant to your project."
      benefits={[
        "An estimate that shows a potential subsidy component",
        "Guidance on the documents and project steps",
        "Support navigating net-metering and installation stages",
        "Clear reminder that final eligibility is confirmed by the applicable authorities",
      ]}
      sections={[
        { title: "Eligibility is not one-size-fits-all", body: "Subsidy availability and eligibility can vary by consumer category, system configuration, location and the current rules. Treat online figures as an estimate until the project is reviewed." },
        { title: "Net metering is a separate process", body: "Net metering typically involves your electricity connection and local approval process. It should be planned alongside system design rather than after installation." },
        { title: "Keep your details ready", body: "Your electricity bill, property information and connection details make it easier to review the relevant path and prepare a realistic estimate." },
        { title: "Confirm before committing", body: "A final site review and the applicable programme requirements determine the project scope, documentation and any benefit that may apply." },
      ]}
      supplementaryContent={<SubsidyProgramDetails />}
      faq={[
        { question: "Is subsidy guaranteed?", answer: "No. Eligibility and the final amount depend on the applicable programme rules and approval process. A displayed amount is an estimate, not a guarantee." },
        { question: "Do I need net metering?", answer: "It depends on your system type and electricity arrangement. Discuss it during the consultation so the project is designed around the correct process." },
      ]}
    />
  );
}
