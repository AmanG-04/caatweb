"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  BatteryCharging,
  Cable,
  CarFront,
  ChevronLeft,
  ChevronRight,
  FileText,
  Fuel,
  Leaf,
  PanelsTopLeft,
  Pause,
  Play,
  Wrench,
} from "lucide-react";
import { buttonStyles } from "@/components/ui";
import { defaultWhatsappMessage, site } from "@/lib/site";

const solutions = [
  {
    id: "solar",
    eyebrow: "01 / Solar EPC",
    title: "Solar power shaped around your roof and routine.",
    shortTitle: "Solar",
    description: "From the first roof assessment to commissioning, we plan a solar system around how your property uses electricity.",
    image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=2200&q=90",
    imageAlt: "Solar panels on a roof under a clear sky",
    icon: PanelsTopLeft,
    variants: ["On-grid systems", "Off-grid systems", "Hybrid systems"],
    detailHeading: "Three solar routes. One decision: how should your power behave?",
    detailIntro: "Compare the role of the grid, batteries and backup before choosing a solar system. The right answer is driven by outages, essential loads and your available roof.",
    adviceTitle: "Start with your outage requirement.",
    adviceBody: "If lower bills are the priority, on-grid may be right. If power continuity matters, compare hybrid and off-grid systems around the loads you need to keep running.",
    detailLayout: "grid-cols-1 md:grid-cols-3",
    details: "The right solar configuration depends on whether you want to reduce grid consumption, keep power available during outages, or operate independently from the grid.",
    deliverables: [
      { title: "On-grid", body: "Connects to the utility grid and reduces daytime electricity use. It switches off during a grid outage for safety." },
      { title: "Off-grid", body: "Stores solar energy in batteries and can operate without a grid connection, suited to sites with unreliable or unavailable supply." },
      { title: "Hybrid", body: "Combines solar, grid supply and batteries to reduce regular consumption while supporting essential loads during an outage." },
    ],
  },
  {
    id: "water-heating",
    eyebrow: "02 / Thermal solar",
    title: "Solar water heating for a quieter daily energy load.",
    shortTitle: "Water heating",
    description: "Use the sun directly for hot-water requirements in homes, hostels, hotels, hospitals and other facilities.",
    image: "https://plus.unsplash.com/premium_photo-1682125975211-35d55cc917ff?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    imageAlt: "Solar thermal panels installed on a roof",
    icon: Leaf,
    variants: ["ETC systems", "FPC systems"],
    detailHeading: "Hot water starts with demand, not collector type.",
    detailIntro: "A solar water heater is sized around how much hot water your building needs and when it is used. We then choose the collector and storage arrangement that fits the site.",
    adviceTitle: "ETC or FPC is a site decision.",
    adviceBody: "Tube and flat-plate collectors perform differently across water conditions, roof layouts and operating temperatures. We can help you narrow down the right technology.",
    detailLayout: "grid-cols-1 sm:grid-cols-3",
    details: "We help match the collector technology, storage capacity and installation arrangement to hot-water demand, water quality, available space and operating conditions.",
    deliverables: [
      { title: "Demand", body: "Assess daily hot-water use, occupancy and storage capacity." },
      { title: "Technology", body: "Select ETC or FPC collectors for the site's water quality and conditions." },
      { title: "Support", body: "Coordinate installation and ongoing service requirements." },
    ],
  },
  {
    id: "bess",
    eyebrow: "03 / Energy storage",
    title: "Battery storage that keeps critical loads in view.",
    shortTitle: "BESS",
    description: "Lithium-battery energy storage for properties that need a more deliberate response to outages, peak demand or solar self-use.",
    image: "https://images.unsplash.com/photo-1780445392417-68b9dccc45f2?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    imageAlt: "Modern energy storage and electrical equipment",
    icon: BatteryCharging,
    variants: ["Lithium-ion battery systems", "Solar-plus-storage", "Essential-load backup"],
    detailHeading: "Store energy for the moments when it matters most.",
    detailIntro: "Battery energy storage is not simply a larger inverter. It is a plan for which loads matter, how long they must run and how solar, grid and backup sources work together.",
    adviceTitle: "Define the loads before the battery.",
    adviceBody: "A storage system becomes useful when it is designed around priority circuits, expected outage duration and the future energy plan for the property.",
    detailLayout: "grid-cols-1 md:grid-cols-[1.25fr_.75fr_.75fr]",
    details: "A BESS can be configured alongside solar, grid supply and existing backup equipment. We begin with the loads that matter, the required autonomy and the property's electrical architecture.",
    deliverables: [
      { title: "Critical loads", body: "Identify the equipment that must remain available." },
      { title: "Storage sizing", body: "Match battery and inverter capacity to autonomy requirements." },
      { title: "Integration", body: "Plan the relationship between solar, grid and existing backup." },
    ],
  },
  {
    id: "ev-charging",
    eyebrow: "04 / Mobility power",
    title: "EV charging built into the electrical plan.",
    shortTitle: "EV charging",
    description: "Charging infrastructure for homes, workplaces, fleets and shared parking locations, planned around the site's available capacity.",
    image: "https://images.unsplash.com/photo-1639302610362-4c86747e8680?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    imageAlt: "Electric vehicle connected to a charging station",
    icon: CarFront,
    variants: ["Home charging", "Workplace charging", "Fleet and shared parking"],
    detailHeading: "Charging works best when it is planned around parking and power.",
    detailIntro: "A dependable EV charging setup considers where vehicles sit, how long they dwell, what the electrical system can supply and how demand may grow over time.",
    adviceTitle: "Think beyond the charger unit.",
    adviceBody: "Cable routes, protection, capacity management and future bays are often the decisions that make a charging installation simple to operate rather than difficult to expand.",
    detailLayout: "grid-cols-1 sm:grid-cols-3",
    details: "The charger is only one part of the decision. We consider parking layout, load capacity, cable routes, protection and future expansion before recommending the right setup.",
    deliverables: [
      { title: "Capacity review", body: "Check available electrical capacity before adding charging demand." },
      { title: "Equipment", body: "Select suitable chargers, cabling and protection." },
      { title: "Installation", body: "Coordinate parking layout, cable routes and future expansion." },
    ],
  },
  {
    id: "generators",
    eyebrow: "05 / Backup generation",
    title: "Generator solutions for power when continuity matters.",
    shortTitle: "Generators",
    description: "Diesel and gas generator solutions for essential backup requirements across residential, commercial and institutional sites.",
    image: "https://images.unsplash.com/photo-1636867759143-c28c1e909bd3?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    imageAlt: "Industrial power equipment in a technical facility",
    icon: Fuel,
    variants: ["Diesel generators", "Gas generators", "Generator integration"],
    detailHeading: "Backup generation begins with the load that cannot stop.",
    detailIntro: "Generator capacity, fuel choice and installation requirements are shaped by your critical load, run time, starting current, ventilation and the way the site is operated.",
    adviceTitle: "Size for the operating reality.",
    adviceBody: "The right generator is not just a kVA number. We look at what must start, what must continue running and how the equipment will integrate with the property.",
    detailLayout: "grid-cols-1 md:grid-cols-3",
    details: "We work from the real operating load, starting method, run-time need, space, ventilation and connection requirements rather than recommending capacity in isolation.",
    deliverables: [
      { title: "Load assessment", body: "Define the power and runtime required for essential operations." },
      { title: "Equipment", body: "Compare diesel and gas options against site conditions." },
      { title: "Integration", body: "Plan ventilation, installation and electrical connection requirements." },
    ],
  },
  {
    id: "maintenance",
    eyebrow: "06 / Long-term care",
    title: "Maintenance that protects the system after switch-on.",
    shortTitle: "Maintenance & AMC",
    description: "Practical maintenance and annual support for solar and electrical-energy assets that need dependable operation over time.",
    image: "https://images.unsplash.com/photo-1726221062287-fda475b85493?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    imageAlt: "Engineer reviewing equipment in a technical facility",
    icon: Wrench,
    variants: ["Solar maintenance", "Annual maintenance contracts", "System health checks"],
    detailHeading: "Commissioning is the beginning of reliable performance.",
    detailIntro: "Maintenance keeps energy equipment safe, observable and dependable. The right service plan reflects the system type, operating environment and the impact of downtime.",
    adviceTitle: "Make service part of the system plan.",
    adviceBody: "Regular checks can surface performance loss and safety concerns before they become disruptions. AMC scope can be tailored around the assets that need attention most.",
    detailLayout: "grid-cols-1 sm:grid-cols-3",
    details: "Support can include scheduled inspection, cleaning guidance, performance review, fault response and practical recommendations to help assets continue operating as intended.",
    deliverables: [
      { title: "Inspect", body: "Schedule checks around the condition of critical equipment." },
      { title: "Review", body: "Monitor performance and safety indicators over time." },
      { title: "Support", body: "Respond to faults and recommend practical corrective action." },
    ],
  },
] as const;

export function SolutionsShowcase() {
  const [hasSelectedSolution, setHasSelectedSolution] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const autoplay = useRef(Autoplay({ delay: 5000, stopOnInteraction: true, stopOnMouseEnter: false }));
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: "center", containScroll: false, loop: true, skipSnaps: true }, [autoplay.current]);
  const activeSolution = solutions[activeIndex];
  const ActiveIcon = activeSolution.icon;

  useEffect(() => {
    if (!emblaApi) {
      return;
    }

    const onSelect = () => setActiveIndex(emblaApi.selectedScrollSnap());
    const onPointerDown = () => {
      autoplay.current.stop();
      setIsAutoPlaying(false);
    };

    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    emblaApi.on("pointerDown", onPointerDown);

    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
      emblaApi.off("pointerDown", onPointerDown);
    };
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) {
      return;
    }

    const parallaxLayers = emblaApi.slideNodes().map((slideNode) => slideNode.querySelector<HTMLElement>("[data-parallax-layer]"));
    const scrollSnaps = emblaApi.scrollSnapList();
    const tweenFactor = 0.2 * scrollSnaps.length;

    const updateParallax = () => {
      const engine = emblaApi.internalEngine();
      const scrollProgress = emblaApi.scrollProgress();
      const slidesInView = emblaApi.slidesInView();

      scrollSnaps.forEach((scrollSnap, snapIndex) => {
        let differenceToTarget = scrollSnap - scrollProgress;
        const slidesInSnap = engine.slideRegistry[snapIndex];

        slidesInSnap.forEach((slideIndex) => {
          if (!slidesInView.includes(slideIndex)) {
            return;
          }

          engine.slideLooper.loopPoints.forEach((loopPoint) => {
            const target = loopPoint.target();

            if (slideIndex === loopPoint.index && target !== 0) {
              const direction = Math.sign(target);
              differenceToTarget = direction === -1 ? scrollSnap - (1 + scrollProgress) : scrollSnap + (1 - scrollProgress);
            }
          });

          const parallaxLayer = parallaxLayers[slideIndex];
          if (parallaxLayer) {
            const translate = differenceToTarget * (-1 * tweenFactor) * 100;
            parallaxLayer.style.transform = `translate3d(${translate}%, 0, 0)`;
          }
        });
      });
    };

    updateParallax();
    emblaApi.on("scroll", updateParallax);
    emblaApi.on("reInit", updateParallax);

    return () => {
      emblaApi.off("scroll", updateParallax);
      emblaApi.off("reInit", updateParallax);
    };
  }, [emblaApi]);

  const showSolution = useCallback((offset: number) => {
    if (!emblaApi) {
      return;
    }

    autoplay.current.stop();
    setIsAutoPlaying(false);
    offset < 0 ? emblaApi.scrollPrev() : emblaApi.scrollNext();
  }, [emblaApi]);

  function pauseAutoPlay() {
    autoplay.current.stop();
    setIsAutoPlaying(false);
  }

  function selectSolution() {
    autoplay.current.stop();
    setIsAutoPlaying(false);
    setHasSelectedSolution(true);
    window.setTimeout(() => {
      document.getElementById("solution-details")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }

  return (
    <>
      <section className="overflow-hidden py-8 sm:py-12" style={{ backgroundColor: "#f7f8f2" }} aria-labelledby="solutions-explorer-title" aria-roledescription="carousel">
        <div ref={emblaRef} className="overflow-hidden py-1">
          <div className="flex touch-pan-y">
            {solutions.map((solution, index) => {
            const isActive = index === activeIndex;
            const Icon = solution.icon;

            return (
              <div key={solution.id} className="min-w-0 flex-[0_0_94%] pl-3 sm:flex-[0_0_82%] sm:pl-5 lg:flex-[0_0_72%]">
                <button type="button" onClick={() => { pauseAutoPlay(); if (isActive) { selectSolution(); } else { emblaApi?.scrollTo(index); } }} aria-label={isActive ? `Explore ${solution.shortTitle}` : `Show ${solution.shortTitle}`} aria-current={isActive ? "true" : undefined} className={`group relative h-[min(74svh,47rem)] min-h-[32rem] w-full overflow-hidden rounded-[2rem] border bg-night text-left transition-opacity duration-500 ease-out motion-reduce:transition-none ${isActive ? "border-teal/30 opacity-100" : "border-ink/10 opacity-45"}`}>
                  <span className="absolute inset-0 overflow-hidden rounded-[inherit]" aria-hidden="true">
                    <span data-parallax-layer className="relative flex h-full w-full justify-center will-change-transform motion-reduce:transform-none">
                      <img src={solution.image} alt="" className="h-full w-full max-w-none object-cover" />
                    </span>
                  </span>
                  <span className="absolute inset-0 bg-gradient-to-t from-[#071d20]/95 via-[#071d20]/14 to-[#071d20]/10" aria-hidden="true" />
                  <span className="sr-only">{isActive ? solution.imageAlt : ""}</span>
                  {isActive ? <span className="absolute right-5 top-5 rounded-full border border-white/20 bg-[#071d20]/65 px-3 py-2 font-mono text-[10px] font-bold tracking-[.18em] text-white backdrop-blur-sm sm:right-7 sm:top-7">0{activeIndex + 1} / 0{solutions.length}</span> : null}
                  <span className="absolute inset-x-0 bottom-0 block p-6 text-white sm:p-9">
                    <span className="flex items-center gap-3">
                      <span className="grid h-10 w-10 place-items-center rounded-xl bg-gold text-ink">
                        <Icon size={20} aria-hidden="true" />
                      </span>
                      <span className="font-mono text-[10px] font-bold uppercase tracking-[.24em] text-gold">{solution.eyebrow}</span>
                    </span>
                    <span id={isActive ? "solutions-explorer-title" : undefined} className="mt-5 block text-4xl font-black leading-none tracking-[-.055em] sm:text-5xl">{solution.shortTitle}</span>
                    {isActive ? <span className="mt-4 block font-mono text-[10px] font-bold uppercase tracking-[.22em] text-white/70">Tap to know more</span> : null}
                  </span>
                </button>
              </div>
            );
          })}
          </div>
        </div>

        <div className="container-wide mt-6 flex items-center justify-center gap-3 sm:mt-8">
          <button type="button" onClick={() => { pauseAutoPlay(); showSolution(-1); }} className="grid h-11 w-11 place-items-center rounded-full border border-ink/15 bg-white text-ink transition hover:border-teal hover:bg-teal hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2" aria-label="Previous solution">
            <ChevronLeft size={19} aria-hidden="true" />
          </button>
          <div className="flex gap-2" aria-label="Solution slide progress">
            {solutions.map((solution, index) => (
              <button key={solution.id} type="button" onClick={() => { pauseAutoPlay(); emblaApi?.scrollTo(index); }} aria-label={`Show ${solution.shortTitle}`} aria-current={index === activeIndex ? "true" : undefined} className={`h-1.5 overflow-hidden rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2 ${index === activeIndex ? "w-10 bg-ink/15" : "w-3 bg-ink/20 hover:bg-ink/50"}`}>
                {index === activeIndex ? <span key={`${activeIndex}-${isAutoPlaying}`} className={`block h-full bg-teal ${isAutoPlaying ? "solution-autoplay-progress" : "w-full"}`} /> : null}
              </button>
            ))}
          </div>
          <button type="button" onClick={() => showSolution(1)} className="grid h-11 w-11 place-items-center rounded-full border border-ink/15 bg-white text-ink transition hover:border-teal hover:bg-teal hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2" aria-label="Next solution">
            <ChevronRight size={19} aria-hidden="true" />
          </button>
          <button type="button" onClick={() => { if (isAutoPlaying) { autoplay.current.stop(); } else { autoplay.current.play(); } setIsAutoPlaying((currentValue) => !currentValue); }} className="grid h-11 w-11 place-items-center rounded-full border border-ink/15 bg-white text-ink transition hover:border-teal hover:bg-teal hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2" aria-label={isAutoPlaying ? "Pause slide rotation" : "Start slide rotation"}>
            {isAutoPlaying ? <Pause size={17} aria-hidden="true" /> : <Play size={17} aria-hidden="true" />}
          </button>
        </div>
      </section>

      {hasSelectedSolution ? <>
      <section id="solution-details" className="bg-white py-16 sm:py-24" aria-labelledby="solution-details-title">
        <div className="container-wide">
          <div className="mx-auto max-w-3xl text-center">
            <p className="section-kicker mx-auto !flex w-max justify-center">{activeSolution.shortTitle}</p>
            <h2 id="solution-details-title" className="section-title mx-auto">{activeSolution.detailHeading}</h2>
            <p className="section-copy mx-auto">{activeSolution.detailIntro}</p>
          </div>
          {activeSolution.id === "solar" ? <div className="mx-auto mt-10 max-w-5xl overflow-hidden rounded-[1.75rem] border border-ink/10 bg-cream p-3 sm:p-4">
            <Image src="/solutions/solarcompare.png" alt="Comparison of on-grid, off-grid and hybrid solar power systems" width={1600} height={900} className="h-auto w-full rounded-[1.25rem]" />
          </div> : null}
          <div className={`mx-auto mt-10 grid max-w-5xl gap-4 ${activeSolution.detailLayout}`}>
            {activeSolution.deliverables.map((deliverable) => (
              <div key={deliverable.title} className="rounded-[1.5rem] border border-ink/10 bg-cream p-6 text-center sm:p-7">
                <h3 className="text-2xl font-black tracking-tight text-ink">{deliverable.title}</h3>
                <p className="mt-4 text-base leading-7 text-ink/65">{deliverable.body}</p>
              </div>
            ))}
          </div>
          <div className="mx-auto mt-5 flex max-w-5xl flex-col items-center rounded-[1.5rem] bg-night p-6 text-center text-white sm:p-7">
            <Cable className="text-gold" size={22} aria-hidden="true" />
            <div className="mt-4 max-w-2xl">
              <h3 className="font-black tracking-tight">{activeSolution.adviceTitle}</h3>
               <p className="mt-2 text-base leading-7 text-white/75">{activeSolution.adviceBody}</p>
            </div>
            <a href={site.whatsapp(defaultWhatsappMessage)} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex rounded-full bg-gold px-5 py-3 text-xs font-black text-ink transition hover:bg-gold-soft">Ask us</a>
          </div>
        </div>
      </section>

      <section className="bg-paper py-16 sm:py-24" aria-labelledby="brochure-title">
        <div className="container-wide grid gap-8 lg:grid-cols-[.8fr_1.2fr] lg:items-center">
          <div>
            <p className="section-kicker">Equipment literature</p>
            <h2 id="brochure-title" className="section-title">Relevant manufacturer brochures, when the equipment shortlist is clear.</h2>
          </div>
          <div className="rounded-[1.75rem] border border-ink/10 bg-white p-7 shadow-soft sm:p-9">
            <FileText size={27} className="text-teal" aria-hidden="true" />
            <p className="mt-5 text-lg font-black tracking-tight">Brochures will be added for verified equipment partners.</p>
             <p className="mt-3 max-w-xl text-base leading-7 text-ink/65">We will publish product literature only after confirming the model range and the manufacturer-approved public link. This avoids presenting out-of-date specifications as a recommendation.</p>
          </div>
        </div>
      </section>

      <section className="bg-night px-5 py-16 text-center text-white sm:px-8 sm:py-20" aria-labelledby="solutions-cta-title">
        <div className="mx-auto max-w-2xl">
          <p className="section-kicker section-kicker-dark mx-auto !flex w-max justify-center">Start with the requirement</p>
          <h2 id="solutions-cta-title" className="mt-5 text-3xl font-black leading-tight tracking-[-.035em] sm:text-4xl">Tell us what needs power. We will help define the right next step.</h2>
          <p className="mx-auto mt-4 max-w-xl leading-7 text-white/70">For a solar estimate, start with your electricity bill. For another solution, start a consultation and tell us about the site.</p>
          <div className="mx-auto mt-8 flex max-w-max flex-col gap-3 sm:flex-row">
            <Link href="/quote" className={buttonStyles("primary", "gap-2 px-6")}>
              Get a solar estimate
              <ArrowUpRight size={17} aria-hidden="true" />
            </Link>
            <a href={site.whatsapp(defaultWhatsappMessage)} target="_blank" rel="noopener noreferrer" className={buttonStyles("outline", "gap-2 border-white/25 bg-white/10 text-white hover:bg-white/15")}>
              Discuss a project
              <ArrowUpRight size={17} aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>
      </> : null}
    </>
  );
}
