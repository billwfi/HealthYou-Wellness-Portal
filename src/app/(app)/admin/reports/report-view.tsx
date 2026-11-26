import Link from "next/link";
import { ArrowLeft, Download, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { MARKER_BY_KEY } from "@/lib/biometrics";
import { MIN_GROUP, SUPPRESSED, type GroupRow } from "@/lib/reports";
import type { ProgramReport } from "@/server/reports";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { ColumnChart } from "@/components/charts/column-chart";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const fmtDay = (d: Date) => new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" }).format(d);

/** A number, a percentage, or the small-group label. */
function Val({ v, suffix = "" }: { v: number | null | undefined; suffix?: string }) {
  if (v === undefined) return <span className="text-ink-subtle">n/a</span>;
  if (v === null) return <span className="whitespace-nowrap text-xs text-ink-subtle">{SUPPRESSED}</span>;
  return (
    <>
      {v.toLocaleString()}
      {suffix}
    </>
  );
}

const CSV_NAMES: Record<string, string> = {
  monthly: "monthly participation",
  departments: "departments",
  "member-types": "member types",
  challenges: "challenges",
  health: "health trends",
  rewards: "rewards",
};

function Csv({ year, table }: { year: number; table: string }) {
  return (
    <a
      href={`/admin/reports/export?year=${year}&table=${table}`}
      className="inline-flex min-h-8 items-center gap-1 rounded-full px-3 text-sm font-semibold text-primary hover:bg-primary-soft"
    >
      <Download className="size-4" aria-hidden /> CSV<span className="sr-only"> of {CSV_NAMES[table]}</span>
    </a>
  );
}

const th = "px-3 py-2 text-xs font-semibold uppercase tracking-wide text-ink-muted";
const td = "px-3 py-2.5 tabular-nums";

function GroupTable({ rows, label, caption }: { rows: GroupRow[]; label: string; caption: string }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-xl text-left text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-b border-border">
            <th scope="col" className={th}>{label}</th>
            <th scope="col" className={cn(th, "text-right")}>Members</th>
            <th scope="col" className={cn(th, "text-right")}>Onboarded</th>
            <th scope="col" className={cn(th, "text-right")}>Took part</th>
            <th scope="col" className={cn(th, "text-right")}>Median points</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.group} className="border-b border-border last:border-0">
              <th scope="row" className="px-3 py-2.5 font-medium text-ink">
                {r.group}
                {r.pooled && <span className="block text-xs font-normal text-ink-muted">{r.pooled.length} smaller group{r.pooled.length === 1 ? "" : "s"}</span>}
              </th>
              <td className={cn(td, "text-right")}><Val v={r.members} /></td>
              <td className={cn(td, "text-right")}><Val v={r.onboardedPct} suffix="%" /></td>
              <td className={cn(td, "text-right")}><Val v={r.activePct} suffix="%" /></td>
              <td className={cn(td, "text-right")}><Val v={r.medianPoints} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Stat({ label, value, suffix, note }: { label: string; value: number | null; suffix?: string; note?: string }) {
  return (
    <Card className="p-4">
      <p className="text-sm font-semibold text-ink-muted">{label}</p>
      <p className="mt-1 text-2xl font-extrabold tabular-nums text-ink">
        <Val v={value} suffix={suffix} />
      </p>
      {note && <p className="mt-0.5 text-xs text-ink-muted">{note}</p>}
    </Card>
  );
}

/** The reports page body; takes the already de-identified report. */
export function ReportView({ r, years }: { r: ProgramReport; years: number[] }) {
  const year = r.year;
  const months = r.monthly.filter((m) => !m.future);

  return (
    <>
      <Link href="/admin" className="inline-flex items-center gap-1 text-sm font-semibold text-ink-muted hover:text-primary">
        <ArrowLeft className="size-4" aria-hidden /> Admin
      </Link>
      <PageHeader
        eyebrow="Admin"
        title={`Program reports ${year}`}
        description="Participation, challenges, health trends and rewards for the whole program, with no individual members shown."
        action={
          years.length > 1 && (
            <nav aria-label="Plan year" className="flex gap-1">
              {years.map((y) => (
                <Link
                  key={y}
                  href={`/admin/reports?year=${y}`}
                  aria-current={y === year ? "page" : undefined}
                  className={cn("rounded-full px-3 py-1.5 text-sm font-semibold", y === year ? "bg-primary text-on-primary" : "text-ink-muted hover:bg-surface-muted")}
                >
                  {y}
                </Link>
              ))}
            </nav>
          )
        }
      />

      <p className="mb-6 flex items-start gap-2 rounded-xl bg-primary-soft px-4 py-3 text-sm text-ink">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
        <span>
          {`Safe to share with the City. Every figure covers at least ${MIN_GROUP} members: smaller departments are combined, and anything still under ${MIN_GROUP} shows as “${SUPPRESSED}”. Health figures use verified screenings only and never affect anyone's rewards.`}
        </span>
      </p>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Stat label="Members" value={r.headline.members} />
        <Stat label="Finished onboarding" value={r.headline.onboardedPct} suffix="%" />
        <Stat label="Took part" value={r.headline.activePct} suffix="%" note={`At least once in ${year}`} />
        {r.isCurrentYear && <Stat label="Active, last 30 days" value={r.headline.active30Pct} suffix="%" />}
        <Stat label="Screened" value={r.headline.screenedPct} suffix="%" note="Verified screening this year" />
      </div>

      <Card className="mt-6">
        <CardHeader title="Members taking part by month" description="Members who logged activity, checked a habit, read content or earned points" action={<Csv year={year} table="monthly" />} />
        <CardBody>
          <ColumnChart
            title={`Members taking part by month, ${year}`}
            unit="Members"
            periodLabel="Month"
            data={months.map((m) => ({
              key: String(m.month),
              label: MONTHS[m.month - 1],
              value: m.members ?? 0,
              display: m.members == null ? SUPPRESSED : undefined,
              tooltip: `${MONTHS[m.month - 1]} ${year}: ${m.members == null ? SUPPRESSED.toLowerCase() : m.members.toLocaleString()} members`,
            }))}
          />
        </CardBody>
      </Card>

      <div className="mt-6 grid gap-6">
        <Card>
          <CardHeader title="By department" description="Took part = did anything in the program this year" action={<Csv year={year} table="departments" />} />
          <CardBody className="px-2 pt-3">
            <GroupTable rows={r.departments} label="Department" caption={`Participation by department, ${year}`} />
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="By member type" action={<Csv year={year} table="member-types" />} />
          <CardBody className="px-2 pt-3">
            <GroupTable rows={r.memberTypes} label="Member type" caption={`Participation by member type, ${year}`} />
          </CardBody>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader title="Challenges" description="Share of all members who joined, and for goal challenges, who reached the goal" action={<Csv year={year} table="challenges" />} />
        <CardBody className="px-2 pt-3">
          {r.challenges.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-xl text-left text-sm">
                <caption className="sr-only">Challenge participation, {year}</caption>
                <thead>
                  <tr className="border-b border-border">
                    <th scope="col" className={th}>Challenge</th>
                    <th scope="col" className={th}>Dates</th>
                    <th scope="col" className={cn(th, "text-right")}>Joined</th>
                    <th scope="col" className={cn(th, "text-right")}>Of members</th>
                    <th scope="col" className={cn(th, "text-right")}>Reached goal</th>
                  </tr>
                </thead>
                <tbody>
                  {r.challenges.map((c) => (
                    <tr key={c.name + c.startDate.toISOString()} className="border-b border-border last:border-0">
                      <th scope="row" className="px-3 py-2.5 font-medium text-ink">{c.name}</th>
                      <td className="px-3 py-2.5 text-ink-muted">
                        {fmtDay(c.startDate)} to {fmtDay(c.endDate)}
                      </td>
                      <td className={cn(td, "text-right")}><Val v={c.enrolled} /></td>
                      <td className={cn(td, "text-right")}><Val v={c.participationPct} suffix="%" /></td>
                      <td className={cn(td, "text-right")}><Val v={c.completedPct} suffix="%" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="px-3 pb-2 text-sm text-ink-muted">No published challenges ran in {year}.</p>
          )}
        </CardBody>
      </Card>

      <Card className="mt-6">
        <CardHeader
          title="Health trends"
          description="Share of screened members within the general adult reference range, from each member's latest verified result"
          action={<Csv year={year} table="health" />}
        />
        <CardBody className="px-2 pt-3">
          <div className="overflow-x-auto">
            <table className="w-full min-w-2xl text-left text-sm">
              <caption className="sr-only">Health trends, {year}</caption>
              <thead>
                <tr className="border-b border-border">
                  <th scope="col" className={th}>Measure</th>
                  <th scope="col" className={th}>Reference</th>
                  <th scope="col" className={cn(th, "text-right")}>Screened</th>
                  <th scope="col" className={cn(th, "text-right")}>In range</th>
                  <th scope="col" className={cn(th, "text-right")}>
                    Same members, {year - 1} → {year}
                  </th>
                </tr>
              </thead>
              <tbody>
                {r.health.map((h) => {
                  const m = MARKER_BY_KEY.get(h.marker)!;
                  const change = h.cohortAfterPct != null && h.cohortBeforePct != null ? h.cohortAfterPct - h.cohortBeforePct : null;
                  return (
                    <tr key={h.marker} className="border-b border-border last:border-0">
                      <th scope="row" className="px-3 py-2.5 font-medium text-ink">{m.label}</th>
                      <td className="px-3 py-2.5 text-ink-muted">{m.reference}</td>
                      <td className={cn(td, "text-right")}><Val v={h.screened} /></td>
                      <td className={cn(td, "text-right")}><Val v={h.inRangePct} suffix="%" /></td>
                      <td className={cn(td, "text-right")}>
                        {h.cohort == null ? (
                          <Val v={null} />
                        ) : (
                          <>
                            {h.cohortBeforePct}% → {h.cohortAfterPct}%{" "}
                            <span className={cn("text-xs font-semibold", change! > 0 ? "text-success" : "text-ink-muted")}>
                              ({change! > 0 ? "+" : ""}
                              {change} pts, {h.cohort} members)
                            </span>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="px-3 pt-3 text-xs text-ink-muted">
            The last column follows only members screened in both years, so it shows change rather than who happened to be screened.
          </p>
        </CardBody>
      </Card>

      <Card className="mt-6">
        <CardHeader title="Rewards" description="Members whose points reached each tier" action={<Csv year={year} table="rewards" />} />
        <CardBody>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {r.rewards.tiers.map((t) => (
              <li key={t.label} className="rounded-xl bg-surface-muted p-4">
                <p className="text-sm font-semibold text-ink-muted">
                  {t.label} · {t.threshold.toLocaleString()} pts
                </p>
                <p className="mt-1 text-xl font-extrabold tabular-nums text-ink">
                  <Val v={t.members} />
                </p>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-ink-muted">
            Reward requests: <Val v={r.rewards.fulfilled} /> fulfilled, <Val v={r.rewards.pending} /> waiting.
          </p>
        </CardBody>
      </Card>
    </>
  );
}
