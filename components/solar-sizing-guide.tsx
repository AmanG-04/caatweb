const sizingRows = [
  { size: "3 kW", generation: "12-15 units", roof: "180 sq ft", savings: "Rs. 2,500-Rs. 3,500" },
  { size: "5 kW", generation: "20-25 units", roof: "300 sq ft", savings: "Rs. 4,500-Rs. 6,000" },
  { size: "10 kW", generation: "40-50 units", roof: "600 sq ft", savings: "Rs. 9,500-Rs. 12,000" },
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
            Most homes need about 1 kW of solar capacity for every 80 to 100 monthly electricity units, plus roughly 60 sq ft of shadow-free roof per kW. The table below gives planning ranges before a site survey and bill review.
          </p>
        </div>
        <div className="mx-auto mt-10 max-w-5xl overflow-x-auto rounded-3xl border border-ink/10 shadow-soft">
          <table className="w-full min-w-[44rem] border-collapse text-left">
            <thead className="bg-night text-white">
              <tr>
                <th scope="col" className="px-5 py-4 text-sm font-black">System size</th>
                <th scope="col" className="border-l border-white/10 px-5 py-4 text-sm font-black">Daily generation</th>
                <th scope="col" className="border-l border-white/10 px-5 py-4 text-sm font-black">Recommended roof area</th>
                <th scope="col" className="border-l border-white/10 px-5 py-4 text-sm font-black">Typical monthly savings</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {sizingRows.map((row) => (
                <tr key={row.size} className="border-t border-ink/10">
                  <th scope="row" className="bg-cream/70 px-5 py-5 text-base font-black text-ink">{row.size}</th>
                  <td className="border-l border-ink/10 px-5 py-5 text-sm font-semibold text-ink/75">{row.generation} per day</td>
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
