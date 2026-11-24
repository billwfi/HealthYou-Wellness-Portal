import type { Metadata } from "next";
import Link from "next/link";
import { isMicrosoftSsoEnabled } from "@/lib/auth";
import { MicrosoftButton } from "@/components/auth/microsoft-button";
import { SignUpForm } from "./sign-up-form";

export const metadata: Metadata = { title: "Create account" };

export default function SignUpPage() {
  return (
    <>
      <h1 className="text-2xl font-extrabold tracking-tight text-ink">Join Reach Your Peak</h1>
      <p className="mt-1 mb-8 text-ink-muted">Create your account to start earning points.</p>
      {isMicrosoftSsoEnabled && <MicrosoftButton next="/" />}
      <SignUpForm />
      <p className="mt-6 text-center text-sm text-ink-muted">
        Already have an account?{" "}
        <Link href="/sign-in" className="font-semibold text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </>
  );
}
