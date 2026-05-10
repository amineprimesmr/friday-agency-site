interface Stats {
  appsTracked: number;
  countriesTracked: number;
  topGain: number;
  newToday: number;
}

function Metric({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string;
  sub: string;
  color: string;
}) {
  return (
    <div className="flex flex-col gap-0.5 px-5 py-3">
      <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/35">
        {label}
      </p>
      <p className={`text-lg font-bold tabular-nums ${color}`}>{value}</p>
      <p className="text-[11px] text-white/45">{sub}</p>
    </div>
  );
}

export function MetricsBar({ stats }: { stats: Stats }) {
  return (
    <div className="border-b border-white/[0.06] bg-black/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl divide-x divide-white/[0.06] overflow-x-auto">
        <Metric
          label="APPS SUIVIES"
          value={`${stats.appsTracked.toLocaleString()}`}
          sub="apps suivies"
          color="text-white"
        />
        <Metric
          label="MARCHÉS"
          value={String(stats.countriesTracked)}
          sub="marchés couverts"
          color="text-white/90"
        />
        <Metric
          label="TOP CROSS-MKT"
          value={stats.topGain > 0 ? `+${stats.topGain}` : "—"}
          sub="mover US → UK"
          color="text-white/85"
        />
        <Metric
          label="RÉCENTES"
          value={stats.newToday > 0 ? `${stats.newToday}` : "—"}
          sub="apps récentes en top"
          color="text-white/75"
        />
      </div>
    </div>
  );
}
