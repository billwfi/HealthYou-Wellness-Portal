// SQL Server connection settings, shared by the app (src/db), CLI scripts and
// prisma.config.ts. Credentials are separate env vars so passwords with special
// characters (? ; { }) never need escaping.

// `next build` constructs (but never queries) the client, so allow empty values then.
const isBuild = process.env.NEXT_PHASE === "phase-production-build";

function required(name: string) {
  const value = process.env[name];
  if (!value) {
    if (isBuild) return "";
    throw new Error(`${name} is not set. Copy .env.example to .env.local.`);
  }
  return value;
}

export function mssqlConfig() {
  return {
    server: required("DB_SERVER"),
    port: Number(process.env.DB_PORT ?? 1433),
    database: required("DB_NAME"),
    user: required("DB_USER"),
    password: required("DB_PASSWORD"),
    options: {
      encrypt: process.env.DB_ENCRYPT !== "false",
      trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === "true",
    },
    pool: { max: 10, min: 0, idleTimeoutMillis: 30_000 },
  };
}

/** Wrap a connection-string value in braces, escaping closing braces. */
const braced = (v: string) => `{${v.replace(/}/g, "}}")}}`;

/** Prisma CLI connection string (sqlserver://host:port;key=value;...). */
export function mssqlUrl() {
  const c = mssqlConfig();
  return [
    `sqlserver://${c.server}:${c.port}`,
    `database=${braced(c.database!)}`,
    `user=${braced(c.user!)}`,
    `password=${braced(c.password!)}`,
    `encrypt=${c.options?.encrypt ? "true" : "false"}`,
    `trustServerCertificate=${c.options?.trustServerCertificate ? "true" : "false"}`,
  ].join(";");
}
