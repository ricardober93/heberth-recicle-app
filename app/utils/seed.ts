import { db } from "~/db";
import { users } from "~/db/schema";
import bcrypt from "bcryptjs";
import 'dotenv/config';

async function seed() {
  const email = process.env.ADMIN_EMAIL || "admin@example.com";
  const password = process.env.ADMIN_PASSWORD || "adminpassword";

  const passwordHash = await bcrypt.hash(password, 10);

  await db.insert(users).values({ email, passwordHash }).onConflictDoNothing();

  console.log(`Admin user ${email} seeded successfully.`);
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    // await db.end(); // Drizzle doesn't have a direct `end` method for the pool
  });