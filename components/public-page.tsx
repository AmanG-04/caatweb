import type { ReactNode } from "react";
import Footer from "@/components/footer";
import { SiteHeader } from "@/components/site-header";

type PublicPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
};

export function PublicPage({ eyebrow, title, description, children }: PublicPageProps) {
  return (
    <main className="grid-lines min-h-screen">
      <SiteHeader fixed />
      <div className="landing-header-space" aria-hidden="true" />
      <section className="hero-flow border-b border-ink/10 bg-cream/80">
        <div className="container-wide py-16 sm:py-24">
          <p className="section-kicker">{eyebrow}</p>
          <h1 className="mt-5 max-w-4xl text-4xl font-black leading-[1.02] tracking-[-.05em] sm:text-6xl">{title}</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-ink/70">{description}</p>
        </div>
      </section>
      {children}
      <Footer />
    </main>
  );
}
