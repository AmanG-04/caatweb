import { BatteryCharging, MapPin, Sun } from "lucide-react";

type Reference = {
  client: string;
  system: string;
  location: string;
  type: string;
  equipment: string;
};

const references: Reference[] = [
  { client: "HIMT College", system: "22 kWp rooftop solar with LT panel modifications", location: "Greater Noida", type: "Educational institute", equipment: "Vikram Solar panels · Sungrow inverter" },
  { client: "County Group, Coco County", system: "18 kWp rooftop solar at 28th floor", location: "Greater Noida West", type: "Residential development", equipment: "Jinko Solar panels · Sofar inverter" },
  { client: "Bhritii Healthcare", system: "25 kWp rooftop solar with 12 kW lithium battery backup", location: "Sainik Vihar, near Rohini", type: "Medical facility", equipment: "Saatvik panels · K-Solare inverter · Invergy+OGO Energy battery" },
  { client: "Mr. Chirag Jain", system: "10 kWp residential rooftop solar", location: "Gurgaon", type: "Residential", equipment: "Vikram Solar panels · K-Solare inverter" },
  { client: "Rajeev Kapoor / Vivek Kapoor", system: "20 kWp residential rooftop solar with BPE 5 kVA lithium battery", location: "Noida", type: "Residential", equipment: "Vikram Solar panels · Sungrow inverter" },
  { client: "Mr. Ravindra Goel residence", system: "10 kWp rooftop solar system", location: "Noida", type: "Residential", equipment: "Vikram Solar panels · Sungrow inverter" },
  { client: "Mr. Bansal residence", system: "10 kWp rooftop solar system", location: "Greater Noida", type: "Residential", equipment: "Jakson Solar panels · K-Solar inverter" },
  { client: "Mr. Ritesh Vasudeva", system: "3 kWp commercial rooftop solar with battery", location: "Anand Parbat, Delhi", type: "Advertising hoarding", equipment: "Luminous" },
  { client: "Mr. Dhruv Gupta residence", system: "3 × 4 kWp rooftop solar system with subsidy", location: "East Delhi", type: "Residential", equipment: "Adani Solar panels · Sungrow inverter" },
  { client: "Mr. Yogesh Mittal residence", system: "5 kWp rooftop solar system with subsidy", location: "Greater Noida", type: "Residential", equipment: "Adani Solar panels · Sungrow inverter" },
  { client: "Mr. Pravin Singla residence", system: "3 kWp solar system with subsidy", location: "Rohini, Delhi", type: "Residential", equipment: "Adani Solar panels · Sungrow inverter" },
  { client: "Abhinandan Jan Kalyan Society", system: "90 kWp rooftop solar on insulated sheet roof", location: "Karkardooma, Delhi", type: "Cancer hospital", equipment: "Vikram Solar N-type TOPCon panels · K-Solare inverter" },
  { client: "Mr. Maheshwari residence", system: "2 × 7.4 kWp solar system with subsidy", location: "Noida", type: "Residential", equipment: "Adani Solar panels · K-Solare inverter" },
  { client: "Nelumbo Icona Controls", system: "2 × 20 kWh lithium battery with 2 × 15 kW hybrid inverter", location: "Noida", type: "Office and workshop", equipment: "Joulecube batteries · Deye hybrid inverters · online monitoring" },
  { client: "Mr. Aman Aggarwal residence", system: "10 kW rooftop solar with superstructure", location: "Roopnagar, Delhi", type: "Residential", equipment: "Vikram Solar bifacial N-type 620 W panels · Deye hybrid inverter · 2 × 5 kWh Joulecube batteries" },
];

const columns = [references.slice(0, 5), references.slice(5, 10), references.slice(10)];

function ReferenceCard({ reference }: { reference: Reference }) {
  const hasBattery = /battery|lithium/i.test(`${reference.system} ${reference.equipment}`);
  return (
    <article className="reference-card rounded-3xl border border-ink/10 bg-white p-6 shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-lime text-teal">
          {hasBattery ? <BatteryCharging size={19} /> : <Sun size={19} />}
        </span>
        <span className="rounded-full bg-cream px-3 py-1 text-[10px] font-bold uppercase tracking-[.12em] text-teal">{reference.type}</span>
      </div>
      <h3 className="mt-5 text-lg font-black tracking-tight">{reference.client}</h3>
       <p className="mt-2 text-base font-semibold leading-7 text-ink/80">{reference.system}</p>
      <p className="mt-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[.1em] text-ink/50"><MapPin size={14} className="text-teal" /> {reference.location}</p>
      <p className="mt-4 border-t border-ink/10 pt-4 text-xs leading-5 text-ink/55">{reference.equipment}</p>
    </article>
  );
}

export function ClientReferences() {
  return (
    <section id="references" className="reference-section overflow-hidden bg-paper py-14">
      <div className="container-wide">
        <div className="mx-auto max-w-3xl text-center">
          <p className="section-kicker">Client references</p>
          <h2 className="section-title mx-auto">Real systems. Real places. Real work.</h2>
          <p className="section-copy mx-auto">A selection of solar, storage, and hybrid power projects delivered by CAAT PowerBot across Delhi NCR.</p>
        </div>
        <div className="reference-columns mt-12 grid max-h-[760px] grid-cols-1 gap-5 overflow-hidden md:grid-cols-2 lg:grid-cols-3">
          {columns.map((column, columnIndex) => (
            <div key={columnIndex} className={`reference-column ${columnIndex === 1 ? "reference-column-slow" : ""} ${columnIndex === 2 ? "hidden lg:block" : ""}`}>
              {[...column, ...column].map((reference, index) => <ReferenceCard key={`${reference.client}-${index}`} reference={reference} />)}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
