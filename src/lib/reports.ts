// De-identified reporting rules, shared by the admin reports page and its CSV export.
//
// No report shows a group of fewer than MIN_GROUP members. Small departments (or
// member types) are pooled into one "Other" row; if that pool is still too small
// it is hidden too. Rates are computed only for shown groups.

export const MIN_GROUP = 10;

export const SUPPRESSED = `Fewer than ${MIN_GROUP}`;

export type GroupMember = {
  group: string;
  onboarded: boolean;
  active: boolean;
  points: number;
};

export type GroupRow = {
  group: string;
  /** null when hidden for being smaller than MIN_GROUP. */
  members: number | null;
  onboardedPct: number | null;
  activePct: number | null;
  medianPoints: number | null;
  pooled?: string[];
};

export const pct = (part: number, whole: number) => (whole ? Math.round((part / whole) * 100) : 0);

export function median(values: number[]): number {
  if (!values.length) return 0;
  const s = [...values].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : Math.round(((s[mid - 1] + s[mid]) / 2) * 10) / 10;
}

function summarize(group: string, rows: GroupMember[], pooled?: string[]): GroupRow {
  if (rows.length < MIN_GROUP) return { group, members: null, onboardedPct: null, activePct: null, medianPoints: null, pooled };
  return {
    group,
    members: rows.length,
    onboardedPct: pct(rows.filter((r) => r.onboarded).length, rows.length),
    activePct: pct(rows.filter((r) => r.active).length, rows.length),
    medianPoints: median(rows.map((r) => r.points)),
    pooled,
  };
}

/**
 * One row per group of at least MIN_GROUP members (largest first), then one
 * "Other" row pooling every smaller group. Blank groups count as "Not set".
 */
export function groupReport(members: GroupMember[], otherLabel = "Other (combined)"): GroupRow[] {
  const by = new Map<string, GroupMember[]>();
  for (const m of members) {
    const key = m.group.trim() || "Not set";
    by.set(key, [...(by.get(key) ?? []), m]);
  }
  const big = [...by.entries()].filter(([, rows]) => rows.length >= MIN_GROUP).sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]));
  const small = [...by.entries()].filter(([, rows]) => rows.length < MIN_GROUP);
  const out = big.map(([group, rows]) => summarize(group, rows));
  if (small.length) {
    const names = small.map(([g]) => g).sort();
    out.push(summarize(otherLabel, small.flatMap(([, rows]) => rows), names));
  }
  return out;
}

/** A count that is shown only if it is at least MIN_GROUP (0 is shown as 0). */
export function safeCount(n: number): number | null {
  return n === 0 || n >= MIN_GROUP ? n : null;
}

export type MarkerOutcome = {
  marker: string;
  /** Members with a verified result this year. */
  screened: number | null;
  inRangePct: number | null;
  /** Members with verified results in both years: share in range last year vs this year. */
  cohort: number | null;
  cohortBeforePct: number | null;
  cohortAfterPct: number | null;
};

/**
 * Share of members within the reference range, from each member's latest
 * verified value per year. `current` and `previous` map userId → in range.
 */
export function markerOutcome(marker: string, current: Map<string, boolean>, previous: Map<string, boolean>): MarkerOutcome {
  const screened = current.size;
  const both = [...current.keys()].filter((id) => previous.has(id));
  const showNow = screened >= MIN_GROUP;
  const showCohort = both.length >= MIN_GROUP;
  return {
    marker,
    screened: showNow ? screened : null,
    inRangePct: showNow ? pct([...current.values()].filter(Boolean).length, screened) : null,
    cohort: showCohort ? both.length : null,
    cohortBeforePct: showCohort ? pct(both.filter((id) => previous.get(id)).length, both.length) : null,
    cohortAfterPct: showCohort ? pct(both.filter((id) => current.get(id)).length, both.length) : null,
  };
}

/** CSV text from a header and rows; null cells become the suppression label. */
export function toCsv(header: string[], rows: (string | number | null)[][]): string {
  const cell = (v: string | number | null) => {
    const s = v == null ? SUPPRESSED : String(v);
    return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [header, ...rows].map((r) => r.map(cell).join(",")).join("\r\n") + "\r\n";
}
