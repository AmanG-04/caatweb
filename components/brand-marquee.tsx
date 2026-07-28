const brands = [
  "Waaree Energies",
  "Vikram Solar",
  "Adani Solar",
  "Jinko Solar",
  "Saatvik Solar",
  "Jakson Solar",
];

function BrandSet() {
  return (
    <div className="brand-marquee-set" aria-hidden="true">
      {brands.map((brand) => (
        <span className="brand-marquee-item" key={brand}>
          <span className="brand-marquee-mark">✦</span>
          {brand}
        </span>
      ))}
    </div>
  );
}

export function BrandMarquee() {
  return (
    <section className="brand-marquee" aria-label="Solar panel brands available through CAAT PowerBot">
      <div className="brand-marquee-track">
        <BrandSet />
        <BrandSet />
      </div>
    </section>
  );
}
