"use server";
import bcrypt from "bcrypt";
import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";

async function main() {
  console.log("Start seeding ...");

  const adminUsername = process.env.ADMIN_USERNAME! || "admin";
  const adminPassword = process.env.ADMIN_PASSWORD! || "";

  const saltRounds = 12;
  const hashedPassword = await bcrypt.hash(adminPassword, saltRounds);
  console.log(`Hashed password for ${adminUsername}`);

  const sql = neon(process.env.DATABASE_URL!);
  const users = await sql` SELECT * FROM "Users"`;
  console.log(users);
  
  if (users.length > 0) {
    console.log("Users already seeded");
    return;
  }

  await sql`INSERT INTO "Users" (username, password) VALUES (${adminUsername}, ${hashedPassword})`;
  console.log("Seeding done");
  
}

main();
