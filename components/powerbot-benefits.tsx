const benefits = [
  "Custom Engineering you can trust",
  "Using the best components from the best companies",
  "MNRE-Compliant Installations",
  "Reliable After-Sales Support",
];

export function PowerbotBenefits() {
  return (
    <div className="powerbot-benefits mt-20 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {benefits.map((benefit, index) => (
        <article key={benefit} className="powerbot-benefit-card flex min-h-50 flex-col p-7">
          <div className="flex items-center justify-between gap-4">
            <span className="powerbot-benefit-number">0{index + 1}</span>
            <span className="powerbot-benefit-eyebrow">PowerBot advantage</span>
          </div>
          <div className="mt-auto">
            {/* <span className="powerbot-benefit-rule" aria-hidden="true" /> */}
            <h3 className="powerbot-benefit-title mt-5 text-[1.35rem] font-black leading-[1.18] tracking-[-.025em]">{benefit}</h3>
          </div>
        </article>
      ))}
    </div>
  );
}
