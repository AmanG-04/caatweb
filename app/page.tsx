import { Landing } from "@/components/landing";
import { faqPageSchema, jsonLd } from "@/lib/seo";

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(faqPageSchema),
        }}
      />
      <Landing />
    </>
  );
}
