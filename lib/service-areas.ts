export type ServiceArea = {
  slug: string;
  name: string;
  state: string;
  districtLabel: string;
  discoms: string[];
  description: string;
  localities: string[];
  projects: string[];
};

export const serviceAreas: ServiceArea[] = [
  {
    slug: "delhi",
    name: "Delhi",
    state: "Delhi",
    districtLabel: "Delhi",
    discoms: ["BSES Rajdhani (BRPL)", "BSES Yamuna (BYPL)", "Tata Power Delhi (TPDDL)"],
    description: "CAAT PowerBot designs, installs and maintains rooftop solar for homes, housing societies, institutions and businesses across Delhi. We also guide the net-metering process with the applicable distribution company.",
    localities: ["Karkardooma", "Navjeevan Vihar", "Chattarpur", "Dwarka", "Rohini", "Vasant Kunj"],
    projects: ["35 kWp rooftop solar for Abhinandan Jan Kalyan Society, Karkardooma", "25 kWp solar with battery backup for Bhritii Healthcare", "Turnkey electrical modernisation at VNA Hospital, Navjeevan Vihar"],
  },
  {
    slug: "noida",
    name: "Noida",
    state: "Uttar Pradesh",
    districtLabel: "Noida and Gautam Buddha Nagar",
    discoms: ["Noida Power Company (NPCL)", "UPPCL (VVNL)"],
    description: "We serve homes, factories and institutions across Noida with rooftop solar, battery storage, solar water heating and long-term maintenance. Our team supports the relevant connection and net-metering steps alongside the installation.",
    localities: ["Sector 62", "Sector 107", "Sector 128", "Sector 150", "Harola", "Chaura Raghunathpur"],
    projects: ["30 kWp hybrid system with 40 kWh emergency BESS for Nelumbo Technologies R&D Centre", "27,000 LPD solar water-heating system at County 107"],
  },
  {
    slug: "greater-noida",
    name: "Greater Noida",
    state: "Uttar Pradesh",
    districtLabel: "Greater Noida and Gautam Buddha Nagar",
    discoms: ["UPPCL (VVNL)"],
    description: "CAAT PowerBot provides practical solar design, installation and ongoing support for villas, societies, farmhouses and institutions across Greater Noida. Every recommendation starts with the property and its actual energy use.",
    localities: ["Knowledge Park", "Pari Chowk", "Omega", "Alpha", "Beta", "Gamma"],
    projects: ["18 kWp concealed-elevation solar system at Coco County", "Switchgear replacement and DG AMF conversion at HIMT College"],
  },
  {
    slug: "gurgaon",
    name: "Gurgaon",
    state: "Haryana",
    districtLabel: "Gurgaon",
    discoms: ["Dakshin Haryana Bijli Vitran Nigam (DHBVN)"],
    description: "For Gurgaon homes, commercial rooftops and workplaces, CAAT PowerBot sizes solar systems from real electricity use and supports the DHBVN process alongside design, installation and maintenance.",
    localities: ["Golf Course Road", "Sohna Road", "Sector 56", "Sector 82", "DLF Phase 1-5", "Udyog Vihar"],
    projects: [],
  },
  {
    slug: "ghaziabad",
    name: "Ghaziabad",
    state: "Uttar Pradesh",
    districtLabel: "Ghaziabad",
    discoms: ["Paschimanchal Vidyut Vitran Nigam (PVVNL)"],
    description: "We help Ghaziabad households and businesses plan rooftop solar around their roof, consumption and connection requirements, including guidance through PVVNL net metering where applicable.",
    localities: ["Indirapuram", "Vaishali", "Kaushambi", "Raj Nagar Extension", "Crossing Republik", "Vasundhara"],
    projects: [],
  },
  {
    slug: "faridabad",
    name: "Faridabad",
    state: "Haryana",
    districtLabel: "Faridabad",
    discoms: ["Dakshin Haryana Bijli Vitran Nigam (DHBVN)"],
    description: "CAAT PowerBot serves Faridabad homes and industrial sites with bill-based solar estimates, site-aware design, installation and help navigating the DHBVN connection process.",
    localities: ["Greater Faridabad", "Sector 15", "Sector 21", "Ballabgarh", "Old Faridabad"],
    projects: [],
  },
];

export function getServiceArea(slug: string) {
  return serviceAreas.find((area) => area.slug === slug);
}
