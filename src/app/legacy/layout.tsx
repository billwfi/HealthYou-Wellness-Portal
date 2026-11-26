import Link from "next/link";
import Navbar from "@/components/legacy/Navbar";
import { requireUser } from "@/lib/session";

/** The original May 2026 UI, kept as a feature reference during the rebuild. */
export default async function LegacyLayout({ children }: { children: React.ReactNode }) {
  await requireUser();
  return (
    <div className="legacy min-h-screen flex flex-col bg-white text-gray-900" style={{ fontFamily: "Arial, Helvetica, sans-serif" }}>
      <div className="bg-amber-100 text-amber-900 text-xs text-center py-1.5">
        Legacy reference UI — being rebuilt. <Link href="/" className="underline font-semibold">Go to the new portal</Link>
      </div>
      <Navbar />
      <main className="flex-1">{children}</main>
      <footer className="bg-gray-100 border-t text-center text-xs text-gray-500 py-3 mt-8">
        © 2026 City of Colorado Springs — Reach Your Peak Wellness Program
      </footer>
    </div>
  );
}
