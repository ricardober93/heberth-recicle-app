'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Header = () => {
  const pathname = usePathname();

  const navItems = [
    { name: 'Inicio', path: '/' },
    { name: 'Grados', path: '/admin/grado' },
    { name: 'Salones', path: '/admin/salon' },
    { name: 'Estudiantes', path: '/admin/estudiante' },
  ];

  return (
    <header className="bg-green-600 text-white shadow-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="text-xl font-bold">Reciclaje Escolar</div>
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
        </div>
      </div>
    </header>
  );
};

export default Header;