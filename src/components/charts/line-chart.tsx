import { niceTicks, tickLabel } from "./chart-utils";

type Point = { date: Date; value: number };

const W = 560;
const H = 180;
const PAD = { top: 22, right: 16, bottom: 26, left: 44 };
const fmt = (d: Date, year = false) =>
  new Intl.DateTimeFormat("en-US", { month: "short", ...(year ? { year: "numeric" } : { day: "numeric" }), timeZone: "UTC" }).format(d);

/**
 * One marker over time (server-rendered SVG): 2px line, ringed dots with
 * tooltips, the latest value labeled at the end, and an optional target line.
 */
export function LineChart({
  points,
  title,
  format,
  target,
}: {
  points: Point[];
  title: string;
  format: (v: number) => string;
  target?: { value: number; label: string };
}) {
  const values = points.map((p) => p.value).concat(target ? [target.value] : []);
  const lo = Math.min(...values);
  const hi = Math.max(...values);
  const span = hi - lo || Math.abs(hi) * 0.1 || 1;
  const ticks = niceTicks(lo - span * 0.15, hi + span * 0.15, 3);
  const yMin = ticks[0];
  const yMax = ticks[ticks.length - 1];
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const t0 = points[0].date.getTime();
  const t1 = points[points.length - 1].date.getTime();
  const x = (d: Date) => (t1 === t0 ? PAD.left + innerW / 2 : PAD.left + ((d.getTime() - t0) / (t1 - t0)) * innerW);
  const y = (v: number) => PAD.top + innerH - ((v - yMin) / (yMax - yMin)) * innerH;
  const multiYear = points[0].date.getUTCFullYear() !== points[points.length - 1].date.getUTCFullYear();
  const lastP = points[points.length - 1];
  const path = points.map((p, i) => `${i ? "L" : "M"}${x(p.date).toFixed(1)},${y(p.value).toFixed(1)}`).join(" ");

  return (
    <figure>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={`${title}. Values are in the table below.`}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={PAD.left} x2={W - PAD.right} y1={y(t)} y2={y(t)} className="stroke-border" strokeWidth={1} />
            <text x={PAD.left - 8} y={y(t)} dy="0.32em" textAnchor="end" className="fill-ink-subtle text-[11px]">
              {tickLabel(t)}
            </text>
          </g>
        ))}
        {target && (
          <g>
            <line x1={PAD.left} x2={W - PAD.right} y1={y(target.value)} y2={y(target.value)} className="stroke-ink-muted" strokeWidth={1} />
            <text x={PAD.left + 4} y={y(target.value) - 5} className="fill-ink-muted text-[10px] font-semibold">
              {target.label}
            </text>
          </g>
        )}
        {points.length > 1 && <path d={path} fill="none" className="stroke-chart-1" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />}
        {points.map((p) => (
          <g key={p.date.getTime()}>
            <title>{`${fmt(p.date, true)}: ${format(p.value)}`}</title>
            <circle cx={x(p.date)} cy={y(p.value)} r={12} className="fill-transparent" />
            <circle cx={x(p.date)} cy={y(p.value)} r={4.5} className="fill-chart-1 stroke-surface" strokeWidth={2} />
          </g>
        ))}
        {/* Latest value above its dot, kept inside the plot at the right edge. */}
        <text x={x(lastP.date)} y={y(lastP.value) - 10} textAnchor={points.length > 1 ? "end" : "middle"} className="fill-ink text-[11px] font-semibold">
          {format(lastP.value)}
        </text>
        <text x={points.length > 1 ? PAD.left : x(points[0].date)} y={H - 8} textAnchor={points.length > 1 ? "start" : "middle"} className="fill-ink-subtle text-[11px]">
          {fmt(points[0].date, points.length > 1 ? multiYear : true)}
        </text>
        {points.length > 1 && (
          <text x={W - PAD.right} y={H - 8} textAnchor="end" className="fill-ink-subtle text-[11px]">
            {fmt(lastP.date, multiYear)}
          </text>
        )}
      </svg>
      <details className="mt-1 text-xs text-ink-muted">
        <summary className="cursor-pointer font-semibold hover:text-ink">Show as table</summary>
        <table className="mt-2 w-full text-left">
          <thead>
            <tr>
              <th scope="col" className="py-1 font-semibold">Date</th>
              <th scope="col" className="py-1 text-right font-semibold">Value</th>
            </tr>
          </thead>
          <tbody>
            {points.map((p) => (
              <tr key={p.date.getTime()} className="border-t border-border">
                <td className="py-1">{fmt(p.date, true)}</td>
                <td className="py-1 text-right tabular-nums">{format(p.value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}
