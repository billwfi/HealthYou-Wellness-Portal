import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Check, X } from "lucide-react";
import { db } from "@/db";
import { requireAdmin } from "@/lib/session";
import { formatMarker, MARKER_BY_KEY, SOURCE_LABELS, type ScreeningSource } from "@/lib/biometrics";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import { ActionButton } from "@/components/content/action-button";
import { ImportForm } from "./import-form";
import { rejectScreening, verifyScreening } from "./actions";

export const metadata: Metadata = { title: "Admin: Screenings" };

const fmtDay = (d: Date) => new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }).format(d);

export default async function AdminScreeningsPage() {
  await requireAdmin();
  const [pending, recent, counts] = await Promise.all([
    db.biometricScreening.findMany({
      where: { verifiedAt: null },
      include: { results: true, user: { select: { name: true, email: true } } },
      orderBy: { createdAt: "asc" },
      take: 100,
    }),
    db.biometricScreening.findMany({
      where: { verifiedAt: { not: null } },
      include: { user: { select: { name: true, email: true } }, _count: { select: { results: true } } },
      orderBy: { verifiedAt: "desc" },
      take: 25,
    }),
    db.biometricScreening.groupBy({ by: ["source"], _count: { _all: true } }),
  ]);

  return (
    <>
      <Link href="/admin" className="inline-flex items-center gap-1 text-sm font-semibold text-ink-muted hover:text-primary">
        <ArrowLeft className="size-4" aria-hidden /> Admin
      </Link>
      <PageHeader
        eyebrow="Admin"
        title="Biometric screenings"
        description={`Import results and review self-reported screenings. Verified screenings earn the yearly screening points. ${counts.map((c) => `${c._count._all} ${SOURCE_LABELS[c.source as ScreeningSource]?.toLowerCase() ?? c.source}`).join(" · ")}`}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Import results" description="From an onsite event, a lab or physician forms" />
          <CardBody>
            <ImportForm />
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Awaiting review" description={`${pending.length} self-reported screening${pending.length === 1 ? "" : "s"}`} />
          {pending.length ? (
            <ul className="divide-y divide-border">
              {pending.map((s) => (
                <li key={s.id} className="px-5 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 text-sm">
                      <p className="font-semibold text-ink">{s.user.name}</p>
                      <p className="truncate text-xs text-ink-muted">
                        {s.user.email} · {fmtDay(s.screenedOn)}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <form action={verifyScreening.bind(null, s.id)}>
                        <ActionButton className={buttonClasses({ size: "sm" })} pendingLabel="…" aria-label={`Verify screening for ${s.user.name}`}>
                          <Check className="size-4" aria-hidden /> Verify
                        </ActionButton>
                      </form>
                      <form action={rejectScreening.bind(null, s.id)}>
                        <ActionButton className={buttonClasses({ size: "sm", variant: "ghost" })} pendingLabel="…" aria-label={`Reject screening for ${s.user.name}`}>
                          <X className="size-4" aria-hidden />
                        </ActionButton>
                      </form>
                    </div>
                  </div>
                  <p className="mt-1.5 text-xs text-ink-muted">
                    {s.results.map((r) => `${MARKER_BY_KEY.get(r.marker)?.label ?? r.marker} ${formatMarker(Number(r.value.toString()), r.marker)}`).join(" · ")}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <CardBody className="text-sm text-ink-muted">Nothing waiting. Self-reported screenings appear here for review.</CardBody>
          )}
        </Card>
      </div>

      <Card className="mt-6 overflow-hidden">
        <CardHeader title="Recently verified" />
        {recent.length ? (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-y border-border bg-surface-muted text-xs uppercase tracking-wide text-ink-muted">
                <tr>
                  <th scope="col" className="px-4 py-2.5 font-semibold">Member</th>
                  <th scope="col" className="px-4 py-2.5 font-semibold">Screened</th>
                  <th scope="col" className="px-4 py-2.5 font-semibold">Source</th>
                  <th scope="col" className="px-4 py-2.5 text-right font-semibold">Results</th>
                  <th scope="col" className="hidden px-4 py-2.5 font-semibold md:table-cell">Verified by</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recent.map((s) => (
                  <tr key={s.id}>
                    <td className="px-4 py-2.5">
                      <span className="font-semibold text-ink">{s.user.name}</span>
                      <span className="block text-xs text-ink-muted">{s.user.email}</span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-ink-muted">{fmtDay(s.screenedOn)}</td>
                    <td className="px-4 py-2.5">
                      <Badge>{SOURCE_LABELS[s.source as ScreeningSource] ?? s.source}</Badge>
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{s._count.results}</td>
                    <td className="hidden px-4 py-2.5 text-ink-muted md:table-cell">{s.verifiedBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <CardBody className="text-sm text-ink-muted">No verified screenings yet.</CardBody>
        )}
      </Card>
    </>
  );
}
