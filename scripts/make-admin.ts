// Usage: npm run make-admin -- someone@example.com
import { db } from "./db";

async function main() {
  const email = process.argv[2]?.trim().toLowerCase();
  if (!email) {
    console.error("Usage: npm run make-admin -- <email>");
    process.exitCode = 1;
    return;
  }
  const { count } = await db.user.updateMany({ where: { email }, data: { role: "admin" } });
  if (count === 0) {
    console.error(`No user with email ${email}. Sign up first, then rerun.`);
    process.exitCode = 1;
    return;
  }
  console.log(`${email} is now an admin.`);
}

main().finally(() => db.$disconnect());
