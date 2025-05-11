import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

config({ path: ".env" }); // Asegúrate de que tu archivo .env esté en la raíz del proyecto y contenga DATABASE_URL

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("La variable de entorno DATABASE_URL não está configurada.");
  throw new Error("La variable de entorno DATABASE_URL não está configurada. Por favor, verifica tu archivo .env.");
}

const sql = neon(databaseUrl);

export const db = drizzle(sql, { schema });

export default db;