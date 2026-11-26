import { requireAdmin } from "@/lib/session";
import { MARKER_BY_KEY } from "@/lib/biometrics";
import { toCsv, type GroupRow } from "@/lib/reports";
import { audit } from "@/server/audit";
import { getProgramReport, reportYears } from "@/server/reports";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const iso = (d: Date) => d.toISOString().slice(0, 10);

const groupCsv = (label: string, rows: GroupRow[]) =>
  toCsv(
    [label, "Members", "Onboarded %", "Took part %", "Median points", "Combined groups"],
    rows.map((r) => [r.group, r.members, r.onboardedPct, r.activePct, r.medianPoints, r.pooled ? String(r.pooled.length) : ""]),
  );

/** De-identified CSV of one report table. Same suppression as the page. */
export async function GET(request: Request) {
  const admin = await requireAdmin();
  const params = new URL(request.url).searchParams;
  const years = await reportYears();
  const year = years.includes(Number(params.get("year"))) ? Number(params.get("year")) : years[0];
  const table = params.get("table") ?? "";
  const r = await getProgramReport(year);

  let csv: string;
  switch (table) {
    case "monthly":
      csv = toCsv(["Month", "Members taking part"], r.monthly.filter((m) => !m.future).map((m) => [`${MONTHS[m.month - 1]} ${year}`, m.members]));
      break;
    case "departments":
      csv = groupCsv("Department", r.departments);
      break;
    case "member-types":
      csv = groupCsv("Member type", r.memberTypes);
      break;
    case "challenges":
      csv = toCsv(
        ["Challenge", "Start", "End", "Joined", "Of members %", "Reached goal %"],
        r.challenges.map((c) => [c.name, iso(c.startDate), iso(c.endDate), c.enrolled, c.participationPct, c.completedPct === undefined ? "n/a" : c.completedPct]),
      );
      break;
    case "health":
      csv = toCsv(
        ["Measure", "Reference", "Screened", "In range %", "Same members", `In range % ${year - 1}`, `In range % ${year}`],
        r.health.map((h) => {
          const m = MARKER_BY_KEY.get(h.marker)!;
          return [m.label, m.reference ?? "", h.screened, h.inRangePct, h.cohort, h.cohortBeforePct, h.cohortAfterPct];
        }),
      );
      break;
    case "rewards":
      csv = toCsv(
        ["Tier", "Points needed", "Members reached"],
        r.rewards.tiers.map((t) => [t.label, t.threshold, t.members]),
      );
      break;
    default:
      return new Response("Unknown report table.", { status: 400 });
  }

  await audit(admin.id, "report.export", "report", null, { year, table });
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="reach-your-peak-${table}-${year}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
