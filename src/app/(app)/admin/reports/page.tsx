import type { Metadata } from "next";
import { requireAdmin } from "@/lib/session";
import { getProgramReport, reportYears } from "@/server/reports";
import { ReportView } from "./report-view";

export const metadata: Metadata = { title: "Admin: Reports" };

export default async function ReportsPage({ searchParams }: { searchParams: Promise<{ year?: string }> }) {
  await requireAdmin();
  const years = await reportYears();
  const asked = Number((await searchParams).year);
  const year = years.includes(asked) ? asked : years[0];
  return <ReportView r={await getProgramReport(year)} years={years} />;
}
