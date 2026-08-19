import type { ReactNode } from "react";
import Footer from "@/components/footer";
import { SiteHeader } from "@/components/site-header";

type PublicPageProps = {
  eyebrow?: string;
  title?: string;
  description?: string;
  children: ReactNode;
  gridLines?: boolean;
};

export function PublicPage({ eyebrow, title, description, children, gridLines = true }: PublicPageProps) {
  const hasHeader = Boolean(eyebrow && title && description);

  return (
    <main className={`${gridLines ? "grid-lines " : ""}min-h-screen`}>
      <SiteHeader fixed />
      <div className="landing-header-space" aria-hidden="true" />
      {hasHeader ? (
        <section className="hero-flow border-b border-ink/10 bg-cream/80">
          <div className="container-wide py-16 sm:py-24">
            <p className="section-kicker">{eyebrow}</p>
            <h1 className="page-title mt-5 max-w-4xl">{title}</h1>
            <p className="section-copy mt-6 max-w-2xl">{description}</p>
          </div>
        </section>
      ) : null}
      {children}
      <Footer />
    </main>
  );
}
