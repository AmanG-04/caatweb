import Image from "next/image";
import { MapPin } from "lucide-react";

type ProjectReference = {
  client: string;
  category: string;
  system: string;
  location: string;
  date?: string;
  scope: string;
  equipment?: string;
  images: readonly [string, string?];
};

const projectImage = (fileName: string) => `/testimonials/${fileName}`;

// Project descriptions are summarized only from the written project details in
// Profile CAAT PowerBot LLP-Solar.pptx. The images are supporting project media.
const projects: readonly ProjectReference[] = [
  {
    client: "Nelumbo Technologies R&D Centre",
    category: "Emergency BESS",
    system: "30 kWp hybrid inverter with 40 kWh LFP battery emergency BESS",
    location: "Noida",
    date: "Nov 2025",
    scope: "Wi-Fi-connected emergency BESS replacing a 45 kVA DG set for the factory and office complex.",
    equipment: "Deye hybrid inverter · Joulecube 51.2 V, 100 Ah battery",
    images: [projectImage("nelumbo-inverters.png"), projectImage("nelumbo-monitoring.png")],
  },
  {
    client: "Abhinandan Jan Kalyan Society",
    category: "Rooftop solar",
    system: "35 kWp rooftop solar power system",
    location: "Karkardooma, Delhi",
    date: "Apr 2025",
    scope: "Repeat order of 55 kWp under execution.",
    equipment: "Jakson N-Type 585 Wp solar panels · K-Solare inverter",
    images: [projectImage("abhinandan-rooftop.png"), projectImage("abhinandan-site.png")],
  },
  {
    client: "Bhritii Healthcare",
    category: "Rooftop solar + emergency standby",
    system: "25 kWp rooftop solar power system with 12 kWh lithium battery-pack inverter",
    location: "Delhi",
    date: "Aug 2024",
    scope: "Emergency standby power. The customer wanted a reliable, non-polluting, environment-friendly backup-power solution.",
    equipment: "Saatvik solar panel · K-Solare inverter · OGO lithium battery · Invergy hybrid inverter",
    images: [projectImage("bhritii-rooftop.png"), projectImage("bhritii-battery.png")],
  },
  {
    client: "Coco County",
    category: "Solar power system",
    system: "18 kWp solar power system",
    location: "Greater Noida",
    date: "Jan 2023",
    scope: "The customer did not want to see the solar plates or structure in the elevation, even from a far distance.",
    images: [projectImage("coco-county-rooftop.png"), projectImage("coco-county-building.png")],
  },
  {
    client: "County 107",
    category: "Solar water heating",
    system: "27,000 LPD solar water-heating system",
    location: "Noida",
    date: "Jun 2024",
    scope: "Solar water-heating system for County Group.",
    images: [projectImage("county-107-water-heating.png"), projectImage("county-107-site.png")],
  },
  
  {
    client: "VNA Hospital",
    category: "Electrical modernisation",
    system: "Turnkey electrical modernisation work for approximately 10,000 sq ft",
    location: "Navjeevan Vihar, Delhi",
    date: "Aug 2022",
    scope: "Design and engineering; internal and external wiring; supply and installation of major equipment.",
    equipment: "82.5 kVA DG set · AMF panel · main LT panel · 5 kVA UPS · copper earthing · 200 LPD solar water heater · LED lights · CCTV · intercom · Wi-Fi routers and switches · Kirloskar · Schneider · Vertiv · Phillips · Racold · Bonton · Tricolite",
    images: [projectImage("vna-hospital-modernisation.png")],
  },
  {
    client: "Risland Sky Mansion",
    category: "Genset installation",
    system: "2 × 1,010 kVA genset installation with heat exchanger",
    location: "Chattarpur, Delhi",
    date: "Aug 2022",
    scope: "Basement genset installation with a cooling tower at rooftop level and a 100 m high chimney exhaust stack.",
    images: [projectImage("risland-genset.png"), projectImage("risland-chimney.png")],
  },
  // {
  //   client: "ILC Infra",
  //   category: "DG-set installation",
  //   system: "2 × 1,010 kVA DG-set installation",
  //   location: "Sector 62, Gurgaon",
  //   scope: "DG-set installation at the ILC Infra site.",
  //   images: [projectImage("ilc-infra-generator.png"), projectImage("ilc-infra-site.png")],
  // },
  {
    client: "HIMT College",
    category: "Switchgear + DG AMF",
    system: "Replacement of old switchgear panel and DG AMF conversion",
    location: "Greater Noida",
    date: "Jul 2023",
    scope: "Frequent tripping, wire burning, blown fuses and load imbalance were addressed through a new panel, proper jointing of old cables, engineering, design, planning and execution. Complete-system shutdown was less than 12 hours, with no loss of productivity at the college.",
    images: [projectImage("himt-before.png"), projectImage("himt-after.png")],
  },
];

function ProjectMedia({ project }: { project: ProjectReference }) {
  const [primaryImage, secondaryImage] = project.images;

  return (
    <div className="relative min-h-[20rem] sm:min-h-[25rem] lg:min-h-[31rem]">
      <div className="absolute inset-y-0 left-0 w-[83%] overflow-hidden rounded-[1.75rem] bg-teal shadow-[0_22px_55px_rgba(16,42,42,.18)]">
        <Image src={primaryImage} alt={`${project.client} project installation`} fill sizes="(min-width: 1024px) 43vw, 86vw" className={primaryImage.endsWith("nelumbo-inverters.png") ? "object-contain bg-teal" : "object-cover"} unoptimized />
      </div>
      {secondaryImage ? (
        <div className="absolute right-[-1rem] bottom-[-1rem] h-[66%] w-[45%] overflow-hidden rounded-[1.25rem] border-4 border-paper bg-white shadow-[0_16px_40px_rgba(16,42,42,.22)] sm:border-[6px]">
          <Image src={secondaryImage} alt={`${project.client} project detail`} fill sizes="(min-width: 1024px) 22vw, 43vw" className="object-cover" unoptimized />
        </div>
      ) : null}
    </div>
  );
}

function Project({ project, index }: { project: ProjectReference; index: number }) {
  const reversed = index % 2 === 1;

  return (
    <article className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16 xl:gap-24">
      <div className={reversed ? "lg:order-2" : undefined}><ProjectMedia project={project} /></div>
      <div className={reversed ? "lg:order-1" : undefined}>
        <p className="font-mono text-[11px] font-black uppercase tracking-[.18em] text-teal">{String(index + 1).padStart(2, "0")} · {project.category}</p>
        <h3 className="mt-4 max-w-xl text-3xl font-black leading-[1.02] tracking-[-.045em] text-ink sm:text-4xl">{project.client}</h3>
        <p className="mt-4 max-w-xl text-lg font-bold leading-7 text-ink/80">{project.system}</p>
        <p className="mt-5 max-w-xl text-base leading-7 text-ink/65">{project.scope}</p>
        <div className="mt-6 flex flex-wrap gap-3 text-xs font-bold text-ink/65">
          <span className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white px-3 py-2"><MapPin size={14} className="text-teal" aria-hidden="true" />{project.location}</span>
          {project.date ? <span className="rounded-full border border-ink/10 bg-white px-3 py-2">{project.date}</span> : null}
        </div>
        {project.equipment ? <p className="mt-6 border-t border-ink/10 pt-5 text-sm leading-6 text-ink/60">{project.equipment}</p> : null}
      </div>
    </article>
  );
}

export function ProjectTestimonials() {
  return (
    <section id="references" className="overflow-hidden bg-paper py-16 sm:py-20">
      <div className="container-wide">
        <div className="mt-14 space-y-20 sm:mt-20 sm:space-y-28">
          {projects.map((project, index) => <Project key={project.client} project={project} index={index} />)}
        </div>
      </div>
    </section>
  );
}
