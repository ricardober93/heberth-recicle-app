import React from "react";
import Link from "next/link";

const Header = () => {
  return (
    <header className="bg-primary text-foreground p-4">
      <nav className="container mx-auto flex justify-between">
        <div className="flex items-center">
          <Link href="/" className="text-xl font-bold">
            Inicio
          </Link>
        </div>
        <div className="flex space-x-4">
          <Link href="/admin" className="hover:underline">
            Administración
          </Link>
          <Link href="/recycling" className="hover:underline">
            Reciclaje
          </Link>
        </div>
      </nav>
    </header>
  );
};

export default Header;
