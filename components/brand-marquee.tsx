import Link from "next/link";

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
    <Link href="/solutions" prefetch={false}>
      <section className="brand-marquee cursor-pointer transition-opacity hover:opacity-80" aria-label="Products and services - click to explore solutions">
        <div className="brand-marquee-track">
          <BrandSet />
          <BrandSet />
        </div>
      </section>
    </Link>
  );
}
