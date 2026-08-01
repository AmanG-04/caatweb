const brands = [
  "Solar Panels",
  "Solar Water Heaters",
  "Inverters",
  "Generators",
  "EV Chargers",
  "Electrical Contracts",
];

function BrandSet() {
  return (
    <div className="brand-marquee-set" aria-hidden="true" style={{ textAlign: 'center' }}>
      {brands.map((brand) => (
        <span className="brand-marquee-item" style={{ textAlign: 'center' }} key={brand}>
          <span className="brand-marquee-mark" >
            ⚡
          </span>
          {brand}
        </span>
      ))}
    </div>
  );
}

export function BrandMarquee() {
  return (
    <section className="brand-marquee" aria-label="Products and services">
      <div className="brand-marquee-track">
        <BrandSet />
        <BrandSet />
      </div>
    </section>
  );
}
