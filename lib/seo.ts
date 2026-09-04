import { site } from "@/lib/site";

const siteUrl = "https://caatpowerbot.com";

export const faqItems = [
  {
    question: "How much subsidy do I actually get?",
    answer: "The applicable amount depends on the current programme rules, your system capacity and approval. CAAT PowerBot prepares and files the application as part of every residential project.",
  },
  {
    question: "How much roof space do I need?",
    answer: "Plan on roughly 60 sq ft of shadow-free roof per kW. A typical 3 kW home system needs about 180 sq ft, subject to a site shadow analysis.",
  },
  {
    question: "What happens during monsoon and at night?",
    answer: "At night the grid supplies you as usual. In monsoon, panels still generate 40 to 60 percent of their sunny-day output from diffused light. Net-metering credits exported units against units drawn later in the billing cycle.",
  },
  {
    question: "How much maintenance does a system need?",
    answer: "Panels need cleaning every 2 to 4 weeks in dusty months, and the inverter, wiring and earthing need an annual health check. Dust can reduce generation by 10 to 15 percent.",
  },
  {
    question: "What is the payback period?",
    answer: "For a typical residential system after subsidy, 3 to 4 years is realistic at current Delhi NCR tariffs. Commercial systems paying higher tariffs can often see 3 years or less.",
  },
  {
    question: "Will my panels work during a power cut?",
    answer: "A standard grid-tied system shuts off during an outage as an anti-islanding safety measure. Hybrid systems with a battery can keep selected critical loads running.",
  },
] as const;

export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": ["LocalBusiness", "ElectricalContractor"],
  name: site.name,
  url: siteUrl,
  logo: `${siteUrl}/icon.png`,
  image: `${siteUrl}/icon.png`,
  email: site.email,
  telephone: site.phoneDisplay,
  areaServed: ["Delhi", "Gurgaon", "Noida", "Greater Noida", "Ghaziabad", "Faridabad"],
  sameAs: [
    "https://www.instagram.com/caat.powerbot/",
    "https://www.linkedin.com/company/caat-powerbot-llp/",
    "https://www.facebook.com/people/CAAT-PowerBot-LLP/100093259755204/",
  ],
  knowsAbout: [
    "Rooftop solar installation",
    "Solar water heating",
    "Battery energy storage systems",
    "EV charging infrastructure",
    "Generator installation",
    "Electrical contracting",
  ],
};

export const faqPageSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqItems.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
};

export function jsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
