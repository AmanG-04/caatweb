import { Home, PanelsTopLeft, Sun, Zap } from "lucide-react";

const stages = [
  ["01", "Sunlight", "Photons strike the silicon cells on your roof — free fuel, roughly 300 days a year in most of India.", Sun],
  ["02", "Panels make DC", "Each panel generates direct current. Strings of panels add up to your system's kilowatt rating.", PanelsTopLeft],
  ["03", "Inverter converts", "The inverter turns DC into 230 V AC — the same current every appliance in your home runs on.", Zap],
  ["04", "Home + grid export", "Your home uses what it needs; extra units flow out through the net meter and spin your bill backwards.", Home],
] as const;

export function SolarProcess() {
  return (
    <section className="solar-process" aria-labelledby="solar-process-title">
      <div className="container-wide">
        <p className="solar-process-kicker">THE PHYSICS, SIMPLY</p>
        <h2 id="solar-process-title">From sunlight to switchboard.</h2>
        <p className="solar-process-intro">No black box. Four stages between the sun and your ceiling fan — here is exactly<br className="hidden md:block" /> what each one does.</p>
        <div className="solar-process-grid">
          {stages.map(([number, title, description, Icon]) => (
            <article className="solar-process-card" key={number}>
              <div className="solar-process-icon"><Icon size={27} strokeWidth={1.8} /></div>
              <p className="solar-process-number">{number}</p>
              <h3>{title}</h3>
              <p className="solar-process-description">{description}</p>
            </article>
          ))}
        </div>
        <p className="solar-process-footer">DC IN · AC OUT · SURPLUS EXPORTED VIA NET METER</p>
      </div>
    </section>
  );
}
