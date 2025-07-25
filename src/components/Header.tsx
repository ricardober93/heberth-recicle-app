'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from '@/lib/auth-client';
import { useUserRole } from '@/hooks/useUserRole';
import Button from './Button';

const Header = () => {
  const pathname = usePathname();
  const { data: session, isPending } = useSession();
  const { userRole, isLoading: roleLoading } = useUserRole();

  const publicNavItems = [
    { name: 'Inicio', path: '/' },
  ];

  const adminNavItems = [
    { name: 'Inicio', path: '/' },
    { name: 'Grados', path: '/admin/grado' },
    { name: 'Salones', path: '/admin/salon' },
    { name: 'Estudiantes', path: '/admin/estudiante' },
    { name: 'Reciclaje', path: '/admin/reciclaje' },
  ];

  const navItems = userRole === 'admin' ? adminNavItems : publicNavItems;


  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/';
  };

  return (
    <header className="bg-green-600 text-white shadow-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="text-xl font-bold">Reciclaje Escolar</div>
          <div className="flex items-center space-x-6">
            <nav>
              <ul className="flex space-x-6">
                {navItems.map((item) => (
                  <li key={item.path}>
                    <Link 
                      href={item.path}
                      className={`hover:text-green-200 transition-colors ${pathname === item.path ? 'font-bold underline' : ''}`}
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="flex items-center space-x-4">
              {isPending ? (
                <div className="text-sm">Cargando...</div>
              ) : session ? (
                <div className="flex items-center space-x-4">
                  <div className="text-sm">
                    <span className="font-medium">{session.user.name}</span>
                    {userRole === 'admin' && (
                      <span className="ml-2 px-2 py-1 bg-green-500 text-xs rounded-full">
                        Admin
                      </span>
                    )}
                  </div>
                  <Button
                    onClick={handleSignOut}
                    variant="danger"
                    size="sm"
                    className="text-white border-white hover:bg-white hover:text-green-600"
                  >
                    Cerrar Sesión
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link href="/auth/signin">
                    <Button
                      variant="primary"
                      size="sm"
                     
                    >
                      Iniciar Sesión
                    </Button>
                  </Link>
                  <Link href="/auth/signup">
                        <Button
                          variant="primary"
                      size="sm"
                      
                    >
                      Registrarse
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;