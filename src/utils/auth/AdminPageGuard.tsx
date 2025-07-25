import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

interface AdminPageGuardProps {
  children: ReactNode;
  fallbackUrl?: string;
}

/**
 * Componente de validación completa para páginas admin
 * Realiza verificación segura de sesión y rol de administrador
 */
export async function AdminPageGuard({ 
  children, 
  fallbackUrl = "/auth/signin" 
}: AdminPageGuardProps) {
  try {
    // Verificación completa de sesión (Nivel 3)
    const session = await auth.api.getSession({
      headers: await headers()
    });

    // Verificar si existe sesión y usuario
    if (!session?.user) {
      console.log("❌ No valid session found, redirecting to signin");
      redirect(fallbackUrl);
    }

    // Verificar rol de administrador
    if (session.user.role !== 'admin') {
      console.log(`❌ User ${session.user.email} is not admin (role: ${session.user.role})`);
      redirect("/unauthorized");
    }

    console.log(`✅ Admin access validated for: ${session.user.email}`);
    return <>{children}</>;
    
  } catch (error) {
    console.error("❌ Error validating admin session:", error);
    redirect(fallbackUrl);
  }
}

/**
 * Hook para obtener la sesión validada en páginas admin
 * Solo usar después de AdminPageGuard
 */
export async function getValidatedAdminSession() {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session?.user || session.user.role !== 'admin') {
      throw new Error("Invalid admin session");
    }

    return session;
  } catch (error) {
    console.error("Error getting validated admin session:", error);
    throw error;
  }
}