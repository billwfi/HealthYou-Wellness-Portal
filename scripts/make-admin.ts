// Usage: npm run make-admin -- someone@example.com
// With no email, promotes the only account if exactly one exists (first setup).
import { db } from "./db";

async function main() {
  let email = process.argv[2]?.trim().toLowerCase();
  if (!email) {
    const users = await db.user.findMany({ select: { email: true }, take: 2 });
    if (users.length !== 1) {
      console.error(
        users.length === 0
          ? "No accounts yet. Sign up first, then rerun."
          : "More than one account exists: pass the email to promote.",
      );
      process.exitCode = 1;
      return;
    }
    email = users[0].email;
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
