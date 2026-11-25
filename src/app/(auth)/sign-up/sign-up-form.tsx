"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Field, FormError } from "@/components/auth/field";

export function SignUpForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [invalid, setInvalid] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const firstName = String(form.get("firstName")).trim();
    const lastName = String(form.get("lastName")).trim();
    const email = String(form.get("email")).trim();
    const password = String(form.get("password"));
    // The form is noValidate (so errors look the same everywhere): check here and
    // point the member at the field to fix.
    const problem: [string, string] | null = !firstName
      ? ["firstName", "Enter your first name."]
      : !lastName
        ? ["lastName", "Enter your last name."]
        : !/^[^\s@]+@[^\s@]+$/.test(email)
          ? ["email", "Enter a valid email address."]
          : password.length < 10
            ? ["password", "Your password needs at least 10 characters."]
            : null;
    if (problem) {
      setInvalid(problem[0]);
      setError(problem[1]);
      document.getElementById(problem[0])?.focus();
      return;
    }
    setInvalid(null);
    setPending(true);
    setError(null);
    const { error } = await authClient.signUp.email({
      email,
      password,
      name: `${firstName} ${lastName}`.trim(),
      firstName,
      lastName,
    });
    if (error) {
      setError(error.message ?? "We couldn't create your account. Please try again.");
      setPending(false);
      return;
    }
    // Phase 1 adds /onboarding (interests + path goals) here.
    router.replace("/");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <FormError message={error} />
      <div className="grid grid-cols-2 gap-3">
        <Field label="First name" id="firstName" autoComplete="given-name" required aria-invalid={invalid === "firstName" || undefined} />
        <Field label="Last name" id="lastName" autoComplete="family-name" required aria-invalid={invalid === "lastName" || undefined} />
      </div>
      <Field label="Email" id="email" type="email" autoComplete="email" required aria-invalid={invalid === "email" || undefined} />
      <Field
        label="Password"
        id="password"
        type="password"
        autoComplete="new-password"
        minLength={10}
        hint="At least 10 characters."
        required
        aria-invalid={invalid === "password" || undefined}
      />
      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "Creating account…" : "Create account"}
      </Button>
    </form>
  );
}
