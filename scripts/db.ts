// Prisma client for CLI scripts (src/db imports "server-only", which can't load
// outside Next.js).
import { config } from "dotenv";
import { PrismaMssql } from "@prisma/adapter-mssql";
import { PrismaClient } from "../src/generated/prisma/client";
import { mssqlConfig } from "../src/lib/db-config";

config({ path: ".env.local", quiet: true });
config({ quiet: true });

export const db = new PrismaClient({ adapter: new PrismaMssql(mssqlConfig()) });
