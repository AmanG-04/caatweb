"use client";

import { useEffect, useRef, useState } from "react";

const steps = [
  ["01", "Free online consultation", "Share your electricity bill, property details and goals with our solar team on WhatsApp/Estimate Generator. We assess your needs, answer questions and outline the right next steps.", "DAY 0 · ONLINE"],
  ["02", "System design & transparent estimate", "You get a line-item estimate: panel make and wattage, inverter model, structure spec, wiring, and a generation estimate for your exact roof. No lump-sum mystery pricing.", "2–3 DAYS"],
  ["03", "Installation & commissioning", "After your approval, Structure, panels, inverter, earthing and cabling go up — typically in a few days, with your roof left clean. Then the DISCOM inspects, the net meter goes in, and we switch on.", "DEPENDING ON QUOTE"],
  ["04", "Subsidy & net-metering paperwork", "We file your PM Surya Ghar subsidy application and the net-metering request with your DISCOM, and follow up until both are sanctioned. You sign; we chase.", "2–4 WEEKS · WE HANDLE IT"],
  ["05", "Monitoring, cleaning & AMC", "You watch generation live on the inverter app. We come back on schedule for cleaning and health checks, so year five performs like year one.", "ONGOING"],
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
      <div className="container-wide project-timeline-layout">
        <div className="project-timeline-intro-column">
          <p className="section-kicker">How a project runs</p>
          <h2 className="section-title">Consultation to commissioning, handled.</h2>
          <p className="section-copy">Five steps, one accountable team. Each scroll moves through one clear stage of your project.</p>
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
                {/* <div className="project-timeline-number">{number}</div> */}
                <div className="project-timeline-content">
                  <p className="project-timeline-counter">STEP {number} / {String(steps.length).padStart(2, "0")}</p>
                  <h3>{title}</h3>
                  <p>{body}</p>
                  <span>{duration}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
