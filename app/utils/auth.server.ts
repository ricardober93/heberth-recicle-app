import { db } from "~/db";
import { users } from "~/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export async function getUserByEmail(email: string) {
  return await db.select().from(users).where(eq(users.email, email)).limit(1);
}

export async function verifyLogin(email: string, password: string) {
  const user = await getUserByEmail(email);
  if (!user || user.length === 0) return null;

  const isValid = await bcrypt.compare(password, user[0].passwordHash);
  if (!isValid) return null;

  return user[0];
}

export async function createUser(email: string, password: string) {
  const passwordHash = await bcrypt.hash(password, 10);
  const newUser = await db.insert(users).values({ email, passwordHash }).returning();
  return newUser[0];
}