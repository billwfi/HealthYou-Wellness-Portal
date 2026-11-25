// Biometric markers. Results are for the member's own tracking: rewards are
// participation-based, so completing a screening earns points and the values never do.

export type Marker = {
  key: string;
  label: string;
  unit: string;
  /** Plausible input range; values outside are rejected as typos. */
  min: number;
  max: number;
  decimals: number;
  /** General adult reference, shown for context only (not medical advice). */
  reference?: string;
  /** Which way is usually healthier, used to suggest a target direction. */
  better: "lower" | "higher" | "range";
};

export const MARKERS: Marker[] = [
  { key: "bp_systolic", label: "Blood pressure (systolic)", unit: "mmHg", min: 60, max: 260, decimals: 0, reference: "Below 120", better: "lower" },
  { key: "bp_diastolic", label: "Blood pressure (diastolic)", unit: "mmHg", min: 30, max: 160, decimals: 0, reference: "Below 80", better: "lower" },
  { key: "total_cholesterol", label: "Total cholesterol", unit: "mg/dL", min: 50, max: 500, decimals: 0, reference: "Below 200", better: "lower" },
  { key: "hdl", label: "HDL cholesterol", unit: "mg/dL", min: 5, max: 150, decimals: 0, reference: "60 or higher", better: "higher" },
  { key: "ldl", label: "LDL cholesterol", unit: "mg/dL", min: 10, max: 400, decimals: 0, reference: "Below 100", better: "lower" },
  { key: "triglycerides", label: "Triglycerides", unit: "mg/dL", min: 10, max: 2000, decimals: 0, reference: "Below 150", better: "lower" },
  { key: "glucose", label: "Fasting glucose", unit: "mg/dL", min: 30, max: 600, decimals: 0, reference: "70 to 99", better: "range" },
  { key: "a1c", label: "A1C", unit: "%", min: 3, max: 20, decimals: 1, reference: "Below 5.7", better: "lower" },
  { key: "weight_lb", label: "Weight", unit: "lb", min: 60, max: 700, decimals: 1, better: "range" },
  { key: "bmi", label: "BMI", unit: "", min: 10, max: 80, decimals: 1, reference: "18.5 to 24.9", better: "range" },
  { key: "waist_in", label: "Waist", unit: "in", min: 15, max: 80, decimals: 1, better: "lower" },
  { key: "resting_hr", label: "Resting heart rate", unit: "bpm", min: 25, max: 220, decimals: 0, reference: "60 to 100", better: "lower" },
];

export const MARKER_BY_KEY = new Map(MARKERS.map((m) => [m.key, m]));

export const SCREENING_SOURCES = ["onsite", "lab", "physician_form", "self_reported"] as const;
export type ScreeningSource = (typeof SCREENING_SOURCES)[number];

export const SOURCE_LABELS: Record<ScreeningSource, string> = {
  onsite: "Onsite screening",
  lab: "Lab results",
  physician_form: "Physician form",
  self_reported: "Self-reported",
};

export function formatMarker(value: number, key: string) {
  const m = MARKER_BY_KEY.get(key);
  const v = m ? value.toFixed(m.decimals) : String(value);
  return m?.unit ? `${v} ${m.unit}` : v;
}

/** Validate one marker value; returns an error message or null. */
export function checkMarker(key: string, value: number): string | null {
  const m = MARKER_BY_KEY.get(key);
  if (!m) return `Unknown marker "${key}".`;
  if (!Number.isFinite(value)) return `${m.label} must be a number.`;
  if (value < m.min || value > m.max) return `${m.label} should be between ${m.min} and ${m.max}${m.unit ? ` ${m.unit}` : ""}.`;
  return null;
}

/** Is the latest value on the goal side of a member's target? */
export function meetsTarget(value: number, target: number, direction: string) {
  return direction === "above" ? value >= target : value <= target;
}

// ── CSV import ───────────────────────────────────────────────────────────────
// Header row required. Columns: email, screened_on (YYYY-MM-DD or M/D/YYYY),
// optional source, then any marker keys. Blank cells are skipped.

export type ParsedRow = {
  line: number;
  email: string;
  screenedOn: string;
  source: ScreeningSource;
  results: { marker: string; value: number }[];
};

/** Split CSV text into rows, honoring quoted fields. */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (ch === '"') quoted = false;
      else field += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ",") {
      row.push(field);
      field = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else field += ch;
  }
  if (field !== "" || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((c) => c.trim() !== ""));
}

function normalizeDate(s: string): string | null {
  const t = s.trim();
  let y: number, mo: number, d: number;
  let m = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(t);
  if (m) [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  else if ((m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(t))) [y, mo, d] = [Number(m[3]), Number(m[1]), Number(m[2])];
  else return null;
  const date = new Date(Date.UTC(y, mo - 1, d));
  if (date.getUTCFullYear() !== y || date.getUTCMonth() !== mo - 1 || date.getUTCDate() !== d) return null;
  return date.toISOString().slice(0, 10);
}

const HEADER_ALIASES: Record<string, string> = {
  email: "email",
  "e-mail": "email",
  date: "screened_on",
  screened_on: "screened_on",
  screening_date: "screened_on",
  source: "source",
  systolic: "bp_systolic",
  diastolic: "bp_diastolic",
  cholesterol: "total_cholesterol",
  weight: "weight_lb",
  waist: "waist_in",
  heart_rate: "resting_hr",
};

/** Parse an import file into rows plus per-line errors. Nothing touches the database here. */
export function parseScreeningCsv(text: string, defaultSource: ScreeningSource = "lab") {
  const [header, ...body] = parseCsv(text);
  const errors: { line: number; message: string }[] = [];
  if (!header) return { rows: [] as ParsedRow[], errors: [{ line: 1, message: "The file is empty." }] };

  const cols = header.map((h) => {
    const k = h.trim().toLowerCase().replace(/[\s-]+/g, "_");
    return HEADER_ALIASES[k] ?? k;
  });
  const iEmail = cols.indexOf("email");
  const iDate = cols.indexOf("screened_on");
  const iSource = cols.indexOf("source");
  if (iEmail < 0 || iDate < 0) {
    return { rows: [], errors: [{ line: 1, message: "The header needs an email column and a screened_on (date) column." }] };
  }
  const unknown = cols.filter((c, i) => i !== iEmail && i !== iDate && i !== iSource && c && !MARKER_BY_KEY.has(c));
  if (unknown.length) errors.push({ line: 1, message: `Ignoring unknown columns: ${unknown.join(", ")}.` });

  const rows: ParsedRow[] = [];
  body.forEach((cells, idx) => {
    const line = idx + 2;
    const email = (cells[iEmail] ?? "").trim().toLowerCase();
    const screenedOn = normalizeDate(cells[iDate] ?? "");
    const src = (iSource >= 0 ? (cells[iSource] ?? "").trim().toLowerCase() : "") || defaultSource;
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return void errors.push({ line, message: "Missing or invalid email." });
    if (!screenedOn) return void errors.push({ line, message: "Missing or invalid date (use YYYY-MM-DD or M/D/YYYY)." });
    if (!(SCREENING_SOURCES as readonly string[]).includes(src)) return void errors.push({ line, message: `Unknown source "${src}".` });

    const results: { marker: string; value: number }[] = [];
    let bad: string | null = null;
    cols.forEach((c, i) => {
      if (bad || !MARKER_BY_KEY.has(c)) return;
      const raw = (cells[i] ?? "").trim();
      if (raw === "") return;
      const value = Number(raw);
      bad = checkMarker(c, value);
      if (!bad) results.push({ marker: c, value });
    });
    if (bad) return void errors.push({ line, message: bad });
    if (!results.length) return void errors.push({ line, message: "No results on this row." });
    rows.push({ line, email, screenedOn, source: src as ScreeningSource, results });
  });
  return { rows, errors };
}
