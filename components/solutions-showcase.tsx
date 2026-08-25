"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowUpRight,
  BatteryCharging,
  Cable,
  CarFront,
  ChevronLeft,
  ChevronRight,
  Fuel,
  Leaf,
  PanelsTopLeft,
  Pause,
  Play,
  Wrench,
} from "lucide-react";
import { buttonStyles } from "@/components/ui";
import { defaultWhatsappMessage, site } from "@/lib/site";

export const solutions = [
  {
    id: "solar",
    eyebrow: "01 / Solar EPC",
    title: "Solar power shaped around your roof and routine.",
    shortTitle: "Solar",
    description: "From the first roof assessment to commissioning, we plan a solar system around how your property uses electricity.",
    image: "/solutions/solar.jpeg",
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
    title: "Cut your geyser bills. Enjoy free hot water from the sun.",
    shortTitle: "Water heating",
    description: "A solar water heater is a one-time investment that delivers hot water for years using clean solar energy, reducing dependence on electricity and gas.",
    image: "/solutions/heater.jpeg",
    imageAlt: "Solar thermal panels installed on a roof",
    icon: Leaf,
    variants: ["ETC systems", "FPC systems"],
    detailHeading: "Hot water without the winter bill shock.",
    detailIntro: "For homes and businesses in Delhi, solar water heating turns available sunlight into a reliable daily utility. We size the system around your demand, roof and water conditions.",
    adviceTitle: "Choose a system that keeps working for years.",
    adviceBody: "ETC and FPC technologies suit different water conditions, roof layouts and operating temperatures. We help you select a durable, low-maintenance arrangement for the site.",
    detailLayout: "grid-cols-1 sm:grid-cols-2",
    details: "We help match the collector technology, storage capacity and installation arrangement to hot-water demand, water quality, available space and operating conditions.",
    deliverables: [
      { title: "Massive savings", body: "Drastically reduce reliance on expensive electricity or gas for everyday water heating." },
      { title: "Reliable hot water", body: "Enjoy a dependable supply of hot water, including during power outages when electric geysers cannot operate." },
      { title: "Built to last", body: "We install corrosion-resistant systems designed for long service life with minimal upkeep." },
      { title: "A cleaner daily utility", body: "Lower the carbon impact of water heating while using renewable energy available on your own roof." },
    ],
  },
  {
    id: "bess",
    eyebrow: "03 / Energy storage",
    title: "Battery storage that keeps critical loads in view.",
    shortTitle: "BESS",
    description: "Lithium-battery energy storage for properties that need a more deliberate response to outages, peak demand or solar self-use.",
    image: "/solutions/bess.jpeg",
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
    title: "Charge your EV at home. Fast, safe and convenient.",
    shortTitle: "EV charging",
    description: "Make charging as easy as charging your phone with a dedicated EV charger professionally installed at your home, office or parking location.",
    image: "https://images.unsplash.com/photo-1639302610362-4c86747e8680?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    imageAlt: "Electric vehicle connected to a charging station",
    icon: CarFront,
    variants: ["Home charging", "Workplace charging", "Fleet and shared parking"],
    detailHeading: "A dedicated charge point, ready when you are.",
    detailIntro: "Skip public-charger queues and wake up to a vehicle ready for the day. CAAT PowerBot plans the charger, capacity, protection and installation around your parking and electrical setup.",
    adviceTitle: "Bring charging home or build it into your workplace.",
    adviceBody: "We review the available electrical capacity, cable route and future expansion needs so the installation is convenient today and practical to grow later.",
    detailLayout: "grid-cols-1 sm:grid-cols-2",
    details: "The charger is only one part of the decision. We consider parking layout, load capacity, cable routes, protection and future expansion before recommending the right setup.",
    deliverables: [
      { title: "Charge on your schedule", body: "Charge overnight in your own garage or dedicated parking spot instead of waiting at public stations." },
      { title: "Safe, certified installation", body: "Our electricians install the charger with the required protection and electrical safety standards for your vehicle and property." },
      { title: "Compatible across EV brands", body: "We install AC and DC charging options suited to major electric vehicle models available in India." },
      { title: "Future-ready property", body: "A dedicated charge point improves everyday convenience and adds appeal to homes, workplaces and commercial buildings." },
    ],
  },
  {
    id: "generators",
    eyebrow: "05 / Backup generation",
    title: "Never be in the dark again.",
    shortTitle: "Generators",
    description: "Reliable diesel and gas generating sets for homes, offices, commercial buildings and institutions that need dependable backup power.",
    image: "https://images.unsplash.com/photo-1636867759143-c28c1e909bd3?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    imageAlt: "Industrial power equipment in a technical facility",
    icon: Fuel,
    variants: ["Diesel generators", "Gas generators", "Generator integration"],
    detailHeading: "Reliable backup power, selected around your real requirement.",
    detailIntro: "In Delhi, a power cut should not interrupt essential work, comfort or safety. CAAT PowerBot helps you choose and install a diesel or gas genset that keeps the right loads running when grid supply is unavailable.",
    adviceTitle: "Choose the genset for the way your site actually operates.",
    adviceBody: "We assess the loads that must remain available, expected runtime, starting current, available space and installation requirements before recommending a suitable system.",
    detailLayout: "grid-cols-1 sm:grid-cols-2",
    details: "We work from the real operating load, starting method, run-time need, space, ventilation and connection requirements rather than recommending capacity in isolation.",
    deliverables: [
      { title: "Instant backup", body: "Automatic changeover can bring the generator online during an outage, helping essential loads continue with minimal interruption." },
      { title: "Trusted, compliant equipment", body: "We supply and install low-noise, low-emission gensets from established Indian manufacturers, selected for the application." },
      { title: "A fit for your scale", body: "From compact systems for homes and small offices to higher-capacity units for commercial buildings, the configuration follows your requirement." },
      { title: "End-to-end support", body: "We manage installation and commissioning, with annual maintenance contract options for long-term reliability." },
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

export type SolutionId = (typeof solutions)[number]["id"];

export function SolutionsShowcase({ initialSolutionId, initiallyExpanded = false }: { initialSolutionId?: SolutionId; initiallyExpanded?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const initialIndex = Math.max(0, solutions.findIndex((solution) => solution.id === initialSolutionId));
  const [hasSelectedSolution, setHasSelectedSolution] = useState(initiallyExpanded);
  const [isAutoPlaying, setIsAutoPlaying] = useState(!initiallyExpanded);
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const autoplay = useRef(Autoplay({ delay: 3500, stopOnInteraction: true, stopOnMouseEnter: false }));
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: "center", containScroll: false, loop: true, skipSnaps: true, startIndex: initialIndex }, [autoplay.current]);
  const activeSolution = solutions[activeIndex];
  const detailSolution = initiallyExpanded ? solutions[initialIndex] : activeSolution;
  const ActiveIcon = activeSolution.icon;

  useEffect(() => {
    if (!emblaApi) {
      return;
    }

    emblaApi.scrollTo(initialIndex, true);

    if (initiallyExpanded) {
      autoplay.current.stop();
    }
  }, [emblaApi, initialIndex, initiallyExpanded]);

  useEffect(() => {
    if (!initiallyExpanded || window.location.hash !== "#solution-details") {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      document.getElementById("solution-details")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 150);

    return () => window.clearTimeout(timeoutId);
  }, [initiallyExpanded]);

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

    if (pathname === "/solutions" || activeSolution.id !== detailSolution.id) {
      router.push(`/solutions/${activeSolution.id}#solution-details`, { scroll: false });
      return;
    }

    setHasSelectedSolution(true);
    window.setTimeout(() => {
      document.getElementById("solution-details")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }

  return (
    <>
      <section className="overflow-hidden py-8 sm:py-12" style={{ backgroundColor: "#f7f8f2" }} aria-labelledby="solutions-explorer-title" aria-roledescription="carousel">
        <div ref={emblaRef} className="relative overflow-hidden py-1">
          <div className="flex touch-pan-y">
            {solutions.map((solution, index) => {
            const isActive = index === activeIndex;
            const Icon = solution.icon;

            return (
              <div key={solution.id} className="min-w-0 flex-[0_0_94%] pl-3 sm:flex-[0_0_82%] sm:pl-5 lg:flex-[0_0_72%]">
                <button type="button" onClick={() => { pauseAutoPlay(); if (isActive) { selectSolution(); } else { emblaApi?.scrollTo(index); } }} aria-label={isActive ? `Explore ${solution.shortTitle}` : `Show ${solution.shortTitle}`} aria-current={isActive ? "true" : undefined} className={`group relative h-[min(74svh,47rem)] min-h-[32rem] w-full cursor-pointer overflow-hidden rounded-[2rem] border bg-night text-left transition-opacity duration-500 ease-out motion-reduce:transition-none ${isActive ? "border-teal/30 opacity-100" : "border-ink/10 opacity-45"}`}>
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
          <div className="absolute inset-x-0 bottom-6 z-20 flex justify-center px-5 sm:bottom-8">
            <div className="flex items-center justify-center gap-3 rounded-full border border-white/20 bg-[#071d20]/80 px-3 py-2 shadow-[0_12px_28px_rgba(7,29,32,.22)] backdrop-blur-md">
              <button type="button" onPointerDown={(event) => event.stopPropagation()} onClick={(event) => { event.stopPropagation(); pauseAutoPlay(); showSolution(-1); }} className="grid h-9 w-9 place-items-center rounded-full border border-white/20 bg-white/10 text-white transition hover:border-gold hover:bg-gold hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-night" aria-label="Previous solution">
                <ChevronLeft size={17} aria-hidden="true" />
              </button>
              <div className="flex gap-2" aria-label="Solution slide progress">
                {solutions.map((solution, index) => (
                  <button key={solution.id} type="button" onPointerDown={(event) => event.stopPropagation()} onClick={(event) => { event.stopPropagation(); pauseAutoPlay(); emblaApi?.scrollTo(index); }} aria-label={`Show ${solution.shortTitle}`} aria-current={index === activeIndex ? "true" : undefined} className={`h-1.5 overflow-hidden rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-night ${index === activeIndex ? "w-10 bg-white/30" : "w-3 bg-white/35 hover:bg-white/70"}`}>
                    {index === activeIndex ? <span key={`${activeIndex}-${isAutoPlaying}`} className={`block h-full bg-gold ${isAutoPlaying ? "solution-autoplay-progress" : "w-full"}`} /> : null}
                  </button>
                ))}
              </div>
              <button type="button" onPointerDown={(event) => event.stopPropagation()} onClick={(event) => { event.stopPropagation(); showSolution(1); }} className="grid h-9 w-9 place-items-center rounded-full border border-white/20 bg-white/10 text-white transition hover:border-gold hover:bg-gold hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-night" aria-label="Next solution">
                <ChevronRight size={17} aria-hidden="true" />
              </button>
              <button type="button" onPointerDown={(event) => event.stopPropagation()} onClick={(event) => { event.stopPropagation(); if (isAutoPlaying) { autoplay.current.stop(); } else { autoplay.current.play(); } setIsAutoPlaying((currentValue) => !currentValue); }} className="grid h-9 w-9 place-items-center rounded-full border border-white/20 bg-white/10 text-white transition hover:border-gold hover:bg-gold hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-night" aria-label={isAutoPlaying ? "Pause slide rotation" : "Start slide rotation"}>
                {isAutoPlaying ? <Pause size={15} aria-hidden="true" /> : <Play size={15} aria-hidden="true" />}
              </button>
            </div>
          </div>
        </div>
      </section>

      {hasSelectedSolution ? <>
      <section id="solution-details" className="bg-white py-16 sm:py-24" aria-labelledby="solution-details-title">
        <div className="container-wide">
          <div className="mx-auto max-w-3xl text-center">
            <p className="section-kicker mx-auto !flex w-max justify-center">{detailSolution.shortTitle}</p>
            <h2 id="solution-details-title" className="section-title mx-auto">{detailSolution.detailHeading}</h2>
            <p className="section-copy mx-auto">{detailSolution.detailIntro}</p>
          </div>
          {detailSolution.id === "solar" ? <div className="mx-auto mt-10 max-w-5xl overflow-hidden rounded-[1.75rem] border border-ink/10 bg-cream p-3 sm:p-4">
            <Image src="/solutions/solarcompare.png" alt="Comparison of on-grid, off-grid and hybrid solar power systems" width={1600} height={900} className="h-auto w-full rounded-[1.25rem]" />
          </div> : null}
          <div className={`mx-auto mt-10 grid max-w-5xl gap-4 ${detailSolution.detailLayout}`}>
            {detailSolution.deliverables.map((deliverable, index) => {
              const generatorFeature = detailSolution.id === "generators";
              const featured = generatorFeature && index === 0;
              const generatorCardStyle = [
                "border-night bg-night text-white",
                "border-lime bg-lime text-ink",
                "border-ink/10 bg-white text-ink",
                "border-teal bg-teal text-white",
              ][index];
              const generatorNumberStyle = ["text-white/20", "text-teal/40", "text-ink/10", "text-white/20"][index];

              return (
              <div key={deliverable.title} className={`rounded-[1.5rem] border p-6 text-left sm:p-8 ${generatorFeature ? generatorCardStyle : featured ? "sm:col-span-2 border-night bg-night text-white sm:px-10 sm:py-9" : "border-ink/10 bg-cream text-ink"}`}>
                <div className="flex items-start justify-between gap-4">
                  <p className={`font-mono text-[10px] font-bold uppercase tracking-[.2em] ${generatorFeature || featured ? "text-gold" : "text-teal"}`}>{generatorFeature ? `0${index + 1}` : featured ? "Power continuity" : `0${index + 1}`}</p>
                  {generatorFeature ? <span className={`text-5xl font-black leading-none tracking-[-.1em] ${generatorNumberStyle}`}>{String(index + 1).padStart(2, "0")}</span> : null}
                </div>
                <h3 className={`mt-8 text-3xl font-black leading-[.95] tracking-[-.055em] ${generatorFeature ? "" : featured ? "sm:text-3xl" : "text-ink"}`}>{deliverable.title}</h3>
                <p className={`mt-5 text-base leading-7 ${generatorFeature ? "text-current/70" : featured ? "mx-auto max-w-2xl text-white/70" : "text-ink/65"}`}>{deliverable.body}</p>
              </div>
              );
            })}
          </div>
          <div className="mx-auto mt-5 flex max-w-5xl flex-col items-center rounded-[1.5rem] bg-night p-6 text-center text-white sm:p-7">
            <Cable className="text-gold" size={22} aria-hidden="true" />
            <div className="mt-4 max-w-2xl">
              <h3 className="font-black tracking-tight">{detailSolution.adviceTitle}</h3>
                <p className="mt-2 text-base leading-7 text-white/75">{detailSolution.adviceBody}</p>
            </div>
            <a href={site.whatsapp(defaultWhatsappMessage)} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex rounded-full bg-gold px-5 py-3 text-xs font-black text-ink transition hover:bg-gold-soft">Ask us</a>
          </div>
        </div>
      </section>

      <section className="bg-night px-5 py-16 text-center text-white sm:px-8 sm:py-20" aria-labelledby="solutions-cta-title">
        <div className="mx-auto max-w-2xl">
          <p className="section-kicker section-kicker-dark mx-auto !flex w-max justify-center">Start with the requirement</p>
          <h2 id="solutions-cta-title" className="mt-5 text-3xl font-black leading-tight tracking-[-.035em] sm:text-4xl">Tell us what needs power. We will help define the right next step.</h2>
          <p className="mx-auto mt-4 max-w-xl leading-7 text-white/70">For a solar estimate, start with your electricity bill. For another solution, start a consultation and tell us about the site.</p>
          <div className="mx-auto mt-8 flex max-w-max flex-col gap-3 sm:flex-row">
            <Link href="/quote" prefetch={false} className={buttonStyles("primary", "gap-2 px-6")}>
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
