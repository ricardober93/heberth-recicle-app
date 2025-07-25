import { createAuthClient } from "better-auth/react";
import { customSessionClient } from "better-auth/client/plugins";
import type { auth } from "@/lib/auth";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000",
  plugins: [customSessionClient<typeof auth>()],
});

export const {
  signIn,
  signUp,
  signOut,
  useSession,
  getSession,
} = authClient;