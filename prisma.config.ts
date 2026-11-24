import { config } from "dotenv";
import { defineConfig } from "prisma/config";
import { mssqlUrl } from "./src/lib/db-config";

config({ path: ".env.local", quiet: true });
config({ quiet: true });

const hasDb = Boolean(process.env.DB_SERVER && process.env.DB_NAME);

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx scripts/seed.ts",
  },
  // `prisma generate` doesn't need a database; migrate/studio do.
  ...(hasDb ? { datasource: { url: mssqlUrl() } } : {}),
});
