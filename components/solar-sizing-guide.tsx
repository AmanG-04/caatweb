const sizingRows = [
  { size: "3 kW", generation: "3600-4200 units", roof: "150 sq ft", savings: "Rs. 21,500-Rs. 25,000" },
  { size: "5 kW", generation: "6000-7000 units", roof: "250 sq ft", savings: "Rs. 36,000-Rs. 42,000" },
  { size: "10 kW", generation: "12000-14000 units", roof: "500 sq ft", savings: "Rs. 72,500-Rs. 84,000" },
] as const;

export function SolarSizingGuide() {
  return (
    <section className="bg-white py-14 sm:py-18" aria-labelledby="solar-sizing-title">
      <div className="container-wide">
        <div className="mx-auto max-w-3xl text-center">
          <p className="section-kicker">Solar planning data</p>
          <h2 id="solar-sizing-title" className="section-title mx-auto">
            What size rooftop solar system do I need for my home in Delhi NCR?
          </h2>
          <p className="section-copy mx-auto">
            Most homes need about 1 kW of solar capacity for every 1200 to 1400 yearly electricity units, plus roughly 50-60 sq ft of shadow-free roof per kW. The table below gives planning ranges before a site survey and bill review.
          </p>
        </div>
        <div className="mx-auto mt-10 max-w-5xl overflow-x-auto rounded-3xl border border-ink/10 shadow-soft">
          <table className="w-full min-w-[44rem] border-collapse text-left">
            <thead className="bg-night text-white">
              <tr>
                <th scope="col" className="px-5 py-4 text-sm font-black">System size</th>
                <th scope="col" className="border-l border-white/10 px-5 py-4 text-sm font-black">Yearly generation</th>
                <th scope="col" className="border-l border-white/10 px-5 py-4 text-sm font-black">Recommended roof area</th>
                <th scope="col" className="border-l border-white/10 px-5 py-4 text-sm font-black">Typical annual savings</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {sizingRows.map((row) => (
                <tr key={row.size} className="border-t border-ink/10">
                  <th scope="row" className="bg-cream/70 px-5 py-5 text-base font-black text-ink">{row.size}</th>
                  <td className="border-l border-ink/10 px-5 py-5 text-sm font-semibold text-ink/75">{row.generation} per year</td>
                  <td className="border-l border-ink/10 px-5 py-5 text-sm font-semibold text-ink/75">{row.roof}</td>
                  <td className="border-l border-ink/10 px-5 py-5 text-sm font-semibold text-ink/75">{row.savings}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mx-auto mt-4 max-w-5xl text-center text-xs leading-5 text-ink/55">
          Generation and savings vary with shade, orientation, season, system design, electricity tariff, net-metering terms and actual consumption. Final capacity and pricing require a site survey and electricity-bill review.
        </p>
      </div>
    </section>
  );
}
