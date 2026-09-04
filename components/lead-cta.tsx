import { ArrowUpRight, PanelsTopLeft, MessageCircle } from "lucide-react";
import { buttonStyles } from "@/components/ui";
import { defaultWhatsappMessage, site } from "@/lib/site";

export default function LeadCta() {
  return (
    <section className="bg-paper px-5 py-14 sm:px-8 sm:py-20" aria-labelledby="lead-cta-title">
      <div className="container-wide overflow-hidden rounded-[2rem] bg-night px-6 py-10 text-center text-white shadow-[0_28px_80px_rgba(16,42,42,.2)] sm:px-10 lg:px-14 lg:py-12">
        <div className="mx-auto max-w-2xl">
          <p className="section-kicker section-kicker-dark">Your next step</p>
          <h2 id="lead-cta-title" className="mt-5 text-3xl font-black leading-tight tracking-[-.035em] sm:text-4xl">
            Have an electricity bill? Turn it into a practical solar estimate.
          </h2>
          <p className="mx-auto mt-4 max-w-xl leading-7 text-white/70">
            See the recommended system size, estimated subsidy, investment and savings before you decide what to do next.
          </p>
        </div>
        <div className="mx-auto mt-8 flex max-w-max flex-col gap-3 sm:flex-row">
          <a href="/quote" className={buttonStyles("primary", "energy-ring-cta gap-2 px-6")}>
            Get my solar estimate <ArrowUpRight size={17} />
          </a>
          <a href="/solutions" className={buttonStyles("outline", "gap-2 border-white/25 bg-white/10 text-white hover:bg-white/15")}>
            <PanelsTopLeft size={17} /> Explore solutions
          </a>
          <a
            href={site.whatsapp(defaultWhatsappMessage)}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonStyles("outline", "gap-2 border-white/25 bg-white/10 text-white hover:bg-white/15")}
          >
            <MessageCircle size={17} /> Online consultation
          </a>
        </div>
      </div>
    </section>
  );
}
