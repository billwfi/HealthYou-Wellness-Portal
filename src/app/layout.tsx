import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Reach Your Peak — Colorado Springs",
  description: "Colorado Springs employee wellness program",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-white text-gray-900">
        <Navbar />
        <main className="flex-1">{children}</main>
        <footer className="bg-gray-100 border-t text-center text-xs text-gray-500 py-3 mt-8">
          © 2026 City of Colorado Springs — Reach Your Peak Wellness Program
        </footer>
      </body>
    </html>
  );
}
