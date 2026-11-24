import type { Metadata } from "next";
import { Settings } from "lucide-react";
import { requireAdmin } from "@/lib/session";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata: Metadata = { title: "Admin" };

export default async function AdminPage() {
  await requireAdmin();
  return (
    <>
      <PageHeader eyebrow="Admin" title="Program administration" />
      <Card>
        <EmptyState icon={Settings} title="Admin console">
          Challenge builder, content and tags, points rules and aggregate reports arrive with Phases 1–4.
        </EmptyState>
      </Card>
    </>
  );
}
