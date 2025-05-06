
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import { user } from "./schema";
import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";
import { seed } from "drizzle-seed";

config({ path: ".env" }); // or .env

async function main() {
  console.log("Start seeding ...");

  const sql = neon(process.env.DATABASE_URL!);

  const db = drizzle(sql, { schema });

  const adminUsername = process.env.ADMIN_USERNAME || "admin";
  const adminPassword = process.env.ADMIN_PASSWORD || "";

  const saltRounds = 12;
  const hashedPassword = await bcrypt.hash(adminPassword, saltRounds);
  console.log(`Hashed password for ${adminUsername}`);

  try {
    // Seed database with admin user
    await seed(db, { user: schema.user }).refine( (db) => ({
      
        user: {
          count: 1,
        columns: {
          username: db.default({
            defaultValue: adminUsername,
          }),
          password: db.default({
            defaultValue: hashedPassword,
          }),
          createdAt: db.timestamp(),
          updatedAt: db.timestamp()
        }
        }
      
    }));
    console.log(`Admin user ${adminUsername} created or updated successfully`);
  } catch (error) {
    console.error("Error seeding admin user:", error);
    throw error;
  }

  console.log("Seeding finished.");
}

main();
