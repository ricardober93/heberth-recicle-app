"use client";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";

interface AdminPageGuardProps {
  children: ReactNode;
  fallbackUrl?: string;
}

/**
 * Componente de validación completa para páginas admin
 * Realiza verificación segura de sesión y rol de administrador del lado del cliente
 */
export function AdminPageGuard({ 
  children, 
  fallbackUrl = "/auth/signin" 
}: AdminPageGuardProps) {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (isPending) return; // Esperar a que cargue la sesión

    // Verificar si existe sesión y usuario
    if (!session?.user) {
      console.log("❌ No valid session found, redirecting to signin");
      router.push(fallbackUrl);
      return;
    }

    // Verificar rol de administrador
    if (session.user.role !== 'admin') {
      console.log(`❌ User ${session.user.email} is not admin (role: ${session.user.role})`);
      router.push("/unauthorized");
      return;
    }

    console.log(`✅ Admin access validated for: ${session.user.email}`);
  }, [session, isPending, router, fallbackUrl]);

  // Mostrar loading mientras se valida
  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Validando acceso...</div>
      </div>
    );
  }

  // Mostrar contenido solo si la validación es exitosa
  if (session?.user?.role === 'admin') {
    return <>{children}</>;
  }

  // No mostrar nada mientras se redirige
  return null;
}

/**
 * Hook para obtener la sesión validada en páginas admin
 * Solo usar después de AdminPageGuard
 */
export function useValidatedAdminSession() {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return { session: null, isPending: true };
  }

  if (!session?.user || session.user.role !== 'admin') {
    throw new Error("Invalid admin session");
  }

  return { session, isPending: false };
}