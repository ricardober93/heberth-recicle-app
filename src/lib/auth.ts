import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { customSession } from "better-auth/plugins";
import { adminClient } from "better-auth/client/plugins"
import { db } from "../utils/db";
import { user as userSchema, session, account, verification } from "../models/schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      userSchema,
      session,
      account,
      verification,
    },
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Cambiar a true en producción
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 días
    updateAge: 60 * 60 * 24, // actualizar cada día
  },
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.BETTER_AUTH_URL!,
  plugins: [
    customSession(async ({ user, session }) => {
      return {
        user: {
          ...user,
          role: user.role, // Expose user role directly
        },
        session,
      };
    }),
  ],
});

export type Session = typeof auth.$Infer.Session;