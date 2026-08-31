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
  primaryImageLandscape?: boolean;
};

const projectImage = (fileName: string) => `/testimonials/${fileName}`;

// Project descriptions are summarized only from the written project details in
// Profile CAAT PowerBot LLP-Solar.pptx. The images are supporting project media.
const projects: readonly ProjectReference[] = [
  {
    client: "Amrita Hospital",
    category: "Solar water heating",
    system: "25,000 LPD solar water-heating system",
    location: "Faridabad",
    date: "Jun 2026",
    scope: "Successful completion of a large-scale solar water-heating project for a healthcare facility, including supply of 84 FPC solar water-heater panels, repair of the old system, and structural reinforcement for safety and long-term performance.",
    equipment: "84 FPC solar water-heater panels · structural reinforcement · system repair and handover",
    images: [projectImage("amrita-solar-water-heater.jpeg")],
  },
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
    system: "90 kWp rooftop solar power system",
    location: "Karkardooma, Delhi",
    date: "Apr 2025",
    scope: "90 kWp rooftop solar power system for a residential society, with a focus on maximizing energy generation and reducing electricity costs.",
    equipment: "Jakson N-Type 585 Wp solar panels · K-Solare inverter",
    images: [projectImage("abhinandan-rooftop.png"), projectImage("abhinandan-site.png")],
    primaryImageLandscape: true,
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
    primaryImageLandscape: true,
  },
  {
    client: "Coco County",
    category: "Solar power system",
    system: "18 kWp solar power system",
    location: "Greater Noida",
    date: "Jan 2023",
    scope: "The customer did not want to see the solar plates or structure in the elevation, even from a far distance.",
    images: [projectImage("coco-county-rooftop.png"), projectImage("coco-county-building.png")],
    primaryImageLandscape: true,
  },
  {
    client: "County 107",
    category: "Solar water heating",
    system: "27,000 LPD solar water-heating system",
    location: "Noida",
    date: "Jun 2024",
    scope: "Solar water-heating system for County Group.",
    images: [projectImage("county-107-water-heating.png"), projectImage("county-107-site.png")],
    primaryImageLandscape: true,
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
    images: [projectImage("himt-after.png") ],
  },
];

function ProjectMedia({ project }: { project: ProjectReference }) {
  const [primaryImage, secondaryImage] = project.images;
  const landscape = project.primaryImageLandscape ?? false;

  return (
    <div className={`flex flex-col gap-4 sm:relative ${landscape ? "sm:aspect-[1.32] sm:min-h-[23rem] lg:min-h-[33rem]" : "sm:min-h-[20rem] lg:min-h-[31rem]"}`}>
      <div className="relative overflow-hidden rounded-[1.75rem] bg-teal shadow-[0_22px_55px_rgba(16,42,42,.18)] sm:absolute sm:inset-y-0 sm:left-0 sm:w-[83%]">
        <div className={`${landscape ? "aspect-[1.32] sm:aspect-auto" : "aspect-[1.1] sm:aspect-auto"} min-h-[17rem] sm:min-h-full`}>
          <Image src={primaryImage} alt={`${project.client} project installation`} fill sizes="(min-width: 1024px) 52vw, 86vw" className={primaryImage.endsWith("nelumbo-inverters.png") ? "object-contain bg-teal" : "object-cover"} unoptimized />
        </div>
      </div>
      {secondaryImage ? (
        <div className="relative overflow-hidden rounded-[1.25rem] border-4 border-paper bg-white shadow-[0_16px_40px_rgba(16,42,42,.22)] sm:absolute sm:right-[-1.75rem] sm:bottom-[-2.25rem] sm:z-10 sm:border-[6px] sm:h-[66%] sm:w-[55%] sm:shadow-[0_16px_40px_rgba(16,42,42,.22)]">
          <div className={`${landscape ? "aspect-[1.2] sm:aspect-auto" : "aspect-[1.25] sm:aspect-auto"} min-h-[12rem] sm:min-h-full`}>
            <Image src={secondaryImage} alt={`${project.client} project detail`} fill sizes="(min-width: 1024px) 27vw, 43vw" className="object-cover" unoptimized />
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Project({ project, index }: { project: ProjectReference; index: number }) {
  const reversed = index % 2 === 1;

  return (
    <article className="grid items-center gap-10 lg:grid-cols-[1.2fr_.8fr] lg:gap-16 xl:gap-24">
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
        <div className="mb-14 text-center sm:mb-20">
          <h1 className="hero-title-highlight inline-block px-2 pb-1 text-2xl font-black leading-[1.15] tracking-[-.05em] sm:text-5xl">Testimonials</h1>
        </div>
        <div className="space-y-20 sm:space-y-28">
          {projects.map((project, index) => <Project key={project.client} project={project} index={index} />)}
        </div>
      </div>
    </section>
  );
}
