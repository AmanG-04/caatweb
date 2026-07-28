const steps = [
  ["01", "Free site survey & shadow analysis", "An engineer visits your roof, measures usable area, checks the structure and maps shadows across the day — because a water tank's shadow at 3 pm can cost you 15% of generation for 25 years.", "DAY 0 · 45 MIN VISIT"],
  ["02", "System design & transparent estimate", "You get a line-item estimate: panel make and wattage, inverter model, structure spec, wiring, and a generation estimate for your exact roof. No lump-sum mystery pricing.", "2–3 DAYS"],
  ["03", "Subsidy & net-metering paperwork", "We file your PM Surya Ghar subsidy application and the net-metering request with your DISCOM, and follow up until both are sanctioned. You sign; we chase.", "2–4 WEEKS · WE HANDLE IT"],
  ["04", "Installation & commissioning", "Structure, panels, inverter, earthing and cabling go up — typically in two to three days, with your roof left clean. Then the DISCOM inspects, the net meter goes in, and we switch on.", "2–3 DAYS ON SITE"],
  ["05", "Monitoring, cleaning & AMC", "You watch generation live on the inverter app. We come back on schedule for cleaning and health checks, so year five performs like year one.", "ONGOING · QUARTERLY VISITS"],
] as const;

export function ProjectTimeline() {
  return (
    <section id="project-process" className="project-timeline">
      <div className="container-wide">
        <p className="project-timeline-kicker">How a project runs</p>
        <h2>Survey to switch-on, handled.</h2>
        <p className="project-timeline-intro">Five steps, one accountable team. Most residential systems go from first call to first unit in four to six weeks.</p>
        <div className="project-timeline-list">
          {steps.map(([number, title, body, duration]) => (
            <article className="project-timeline-step" key={number}>
              <div className="project-timeline-number">{number}</div>
              <div>
                <h3>{title}</h3>
                <p>{body}</p>
                <span>{duration}</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
