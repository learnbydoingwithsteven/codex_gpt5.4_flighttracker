import type { FlightPanelStat } from "../../types/flight";

interface StatsStripProps {
  stats: FlightPanelStat[];
}

export function StatsStrip({ stats }: StatsStripProps) {
  return (
    <div className="stats-strip">
      {stats.map((stat) => (
        <article className={`stat-card ${stat.tone ?? "neutral"}`} key={stat.label}>
          <span>{stat.label}</span>
          <strong>{stat.value}</strong>
        </article>
      ))}
    </div>
  );
}

