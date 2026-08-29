"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

const steps = [
  ["01", "Online consultation", "Share your electricity bill, property details and goals with our expert on WhatsApp/Estimate Generator. We assess your needs, answer questions and outline the right solution with estimate.", "DAY 0 · ONLINE"],
  ["02", "Site visit & Design finalization", "After estimate approval, site is visited and a firm quotation is agreed upon. It encapsulates panel make and wattage, inverter model, structure spec, wiring, and a generation estimate for your exact roof. NO ASSUMPTIONS.", "2–3 DAYS"],
  ["03", "Supply, Installation & commissioning", "After Payment - Structure, panels, inverter, earthing and cabling are installed - typically in a few days, with your roof left clean. Then the DISCOM inspects, the net meter goes in, and we switch on.", "DEPENDING ON SYSTEM RATING"],
  ["04", "Subsidy & net-metering paperwork", "If applicable, we file your PM Surya Ghar subsidy application and the net-metering request with your DISCOM, and follow up until both are sanctioned. You sign; we chase.", "2–4 WEEKS · WE HANDLE IT"],
  ["05", "After-sales support", "You watch real generation live on the inverter app. If any issues arise, our support team is available to assist you promptly.", "ONGOING"],
] as const;

export function ProjectTimeline() {
  const viewportRef = useRef<HTMLDivElement>(null);
  const scrollLockRef = useRef(false);
  const activeStepRef = useRef(0);
  const isProgrammaticScrollRef = useRef(false);
  const scrollFrameRef = useRef<number | null>(null);
  const scrollSettleTimerRef = useRef<number | null>(null);
  const [activeStep, setActiveStep] = useState(0);

  const setCurrentStep = (step: number) => {
    if (activeStepRef.current === step) return;
    activeStepRef.current = step;
    setActiveStep(step);
  };

  const moveToStep = (nextStep: number) => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const target = Math.max(0, Math.min(steps.length - 1, nextStep));

    isProgrammaticScrollRef.current = true;
    setCurrentStep(target);
    viewport.scrollTo({ top: viewport.clientHeight * target, behavior: "smooth" });

    if (scrollSettleTimerRef.current) window.clearTimeout(scrollSettleTimerRef.current);
    scrollSettleTimerRef.current = window.setTimeout(() => {
      isProgrammaticScrollRef.current = false;
      setCurrentStep(Math.round(viewport.scrollTop / viewport.clientHeight));
    }, 700);
  };

  const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    if (window.matchMedia("(max-width: 767px)").matches) return;

    const direction = Math.sign(event.deltaY);
    const currentStep = activeStepRef.current;
    if (!direction || (direction < 0 && currentStep === 0) || (direction > 0 && currentStep === steps.length - 1)) return;
    event.preventDefault();
    if (scrollLockRef.current) return;
    scrollLockRef.current = true;
    moveToStep(currentStep + direction);
    window.setTimeout(() => { scrollLockRef.current = false; }, 600);
  };

  const handleScroll = () => {
    if (isProgrammaticScrollRef.current || scrollFrameRef.current !== null) return;
    scrollFrameRef.current = window.requestAnimationFrame(() => {
      const viewport = viewportRef.current;
      scrollFrameRef.current = null;
      if (!viewport) return;
      setCurrentStep(Math.max(0, Math.min(steps.length - 1, Math.round(viewport.scrollTop / viewport.clientHeight))));
    });
  };

  useEffect(() => {
    return () => {
      if (scrollFrameRef.current) window.cancelAnimationFrame(scrollFrameRef.current);
      if (scrollSettleTimerRef.current) window.clearTimeout(scrollSettleTimerRef.current);
    };
  }, []);

  return (
    <section id="process" className="project-timeline">
      <div className="container-wide">
        <div className="text-center">
          <p className="section-kicker">How a project runs</p>
        </div>
        <div className="project-timeline-layout mt-0 grid gap-10 lg:gap-16">
          <div className="project-timeline-intro-column xl:max-w-none">
<h3 className="section-title !mt-4 !max-w-none">
  Consultation&nbsp;to commissioning, handled.
</h3>          <p className="section-copy">Five steps, one accountable team. Each scroll moves through one clear stage of your project.</p>
          <p className="project-timeline-hint" aria-hidden="true">SCROLL THROUGH THE STEPS <span>→</span></p>
        </div>
          <div className="project-timeline-experience">
          <div className="project-timeline-rail" aria-label="Choose a project delivery step">
            {steps.map(([number, title], index) => (
              <button
                type="button"
                key={number}
                className={index === activeStep ? "is-active" : ""}
                aria-label={`View step ${number}: ${title}`}
                aria-current={index === activeStep ? "step" : undefined}
                onClick={() => moveToStep(index)}
              >
                {number}
              </button>
            ))}
          </div>
          <div ref={viewportRef} className="project-timeline-viewport" aria-label="Project delivery steps" onScroll={handleScroll} onWheel={handleWheel}>
            {steps.map(([number, title, body, duration], index) => (
              <article className={`project-timeline-step ${index === activeStep ? "is-active" : ""}`} data-step={index} key={number}>
                <div className="project-timeline-content">
                  <p className="project-timeline-counter">STEP {number} / {String(steps.length).padStart(2, "0")}</p>
                  <h3>{title}</h3>
                  <p>{body}</p>
                  <span>{duration}</span>
                </div>
                {index === activeStep && index < steps.length - 1 ? (
                  <button
                    type="button"
                    className="project-timeline-next"
                    onClick={() => moveToStep(index + 1)}
                    aria-label={`Scroll to step ${steps[index + 1][0]}: ${steps[index + 1][1]}`}
                  >
                    <span className="sr-only">Scroll for next step</span>
                    <ChevronDown size={18} aria-hidden="true" />
                  </button>
                ) : null}
              </article>
            ))}
          </div>
          </div>
        </div>
      </div>
    </section>
  );
}
