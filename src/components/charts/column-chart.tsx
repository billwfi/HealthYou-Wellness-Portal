import { columnPath, niceTicks, tickLabel } from "./chart-utils";

type Datum = { key: string; label: string; value: number; tooltip: string };

const W = 640;
const H = 200;
const PAD = { top: 22, right: 8, bottom: 26, left: 44 };

/**
 * Single-series column chart (server-rendered SVG). One color, no legend: the
 * card title names the series. Hover a column for its tooltip; a table view
 * below carries every value.
 */
export function ColumnChart({ data, title, unit }: { data: Datum[]; title: string; unit: string }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const ticks = niceTicks(0, max, 4);
  const top = ticks[ticks.length - 1];
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const band = innerW / data.length;
  const barW = Math.min(24, band * 0.6);
  const y = (v: number) => PAD.top + innerH - (v / top) * innerH;
  const last = data[data.length - 1];

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
        {data.map((d, i) => {
          const cx = PAD.left + band * i + band / 2;
          const h = (d.value / top) * innerH;
          return (
            <g key={d.key} className="group">
              <title>{d.tooltip}</title>
              {/* Hit target: the whole band, bigger than the mark. */}
              <rect x={PAD.left + band * i} y={PAD.top} width={band} height={innerH} className="fill-transparent group-hover:fill-surface-muted" />
              <path d={columnPath(cx - barW / 2, y(d.value), barW, h)} className="fill-chart-1" />
              <text x={cx} y={H - 8} textAnchor="middle" className="fill-ink-subtle text-[11px]">
                {d.label}
              </text>
            </g>
          );
        })}
        {last && last.value > 0 && (
          <text x={PAD.left + band * (data.length - 1) + band / 2} y={y(last.value) - 6} textAnchor="middle" className="fill-ink text-[11px] font-semibold">
            {tickLabel(last.value)}
          </text>
        )}
      </svg>
      <details className="mt-2 text-xs text-ink-muted">
        <summary className="cursor-pointer font-semibold hover:text-ink">Show as table</summary>
        <table className="mt-2 w-full text-left">
          <thead>
            <tr>
              <th scope="col" className="py-1 font-semibold">Week of</th>
              <th scope="col" className="py-1 text-right font-semibold">{unit}</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d) => (
              <tr key={d.key} className="border-t border-border">
                <td className="py-1">{d.label}</td>
                <td className="py-1 text-right tabular-nums">{d.value.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}
