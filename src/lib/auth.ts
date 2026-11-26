import "server-only";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/db";

const microsoftConfigured = Boolean(process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_SECRET);

export const auth = betterAuth({
  appName: "Reach Your Peak",
  database: prismaAdapter(db, { provider: "sqlserver", transaction: true }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 10,
  },
  // City SSO: set MICROSOFT_* env vars to enable "Sign in with Microsoft".
  socialProviders: microsoftConfigured
    ? {
        microsoft: {
          clientId: process.env.MICROSOFT_CLIENT_ID!,
          clientSecret: process.env.MICROSOFT_CLIENT_SECRET!,
          tenantId: process.env.MICROSOFT_TENANT_ID ?? "common",
        },
      }
    : undefined,
  user: {
    additionalFields: {
      firstName: { type: "string", required: false },
      lastName: { type: "string", required: false },
      role: { type: "string", required: false, defaultValue: "member", input: false },
    },
  },
  session: {
    cookieCache: { enabled: true, maxAge: 5 * 60 },
  },
  plugins: [nextCookies()], // must stay last
});

export type Session = typeof auth.$Infer.Session;
export const isMicrosoftSsoEnabled = microsoftConfigured;
