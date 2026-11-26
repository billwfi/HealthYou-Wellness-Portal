import type { Metadata } from "next";
import Link from "next/link";
import { isMicrosoftSsoEnabled } from "@/lib/auth";
import { MicrosoftButton } from "@/components/auth/microsoft-button";
import { safeNext } from "@/components/auth/field";
import { SignInForm } from "./sign-in-form";

export const metadata: Metadata = { title: "Sign in" };

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const next = safeNext((await searchParams).next);
  return (
    <>
      <h1 className="text-2xl font-extrabold tracking-tight text-ink">Welcome back</h1>
      <p className="mt-1 mb-8 text-ink-muted">Sign in to keep reaching your peak.</p>
      {isMicrosoftSsoEnabled && <MicrosoftButton next={next} />}
      <SignInForm next={next} />
      <p className="mt-6 text-center text-sm text-ink-muted">
        New to Reach Your Peak?{" "}
        <Link href="/sign-up" className="font-semibold text-primary hover:underline">
          Create an account
        </Link>
      </p>
    </>
  );
}
