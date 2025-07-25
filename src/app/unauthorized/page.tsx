'use client'
import Card from '@/components/Card';
import Button from '@/components/Button';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Acceso Denegado
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            No tienes permisos para acceder a esta página
          </p>
        </div>
        <Card className="p-8 text-center">
          <div className="mb-6">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <svg
                className="h-6 w-6 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Permisos Insuficientes
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            Necesitas permisos de administrador para acceder al panel de administración.
            Contacta al administrador del sistema si crees que esto es un error.
          </p>
          <div className="space-y-3">
            <Button
              onClick={() => window.history.back()}
              variant="secondary"
              className="w-full"
            >
              Volver Atrás
            </Button>
            <Button
              onClick={() => window.location.href = '/'}
              className="w-full"
            >
              Ir al Inicio
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}