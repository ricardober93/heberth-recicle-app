const Footer = () => {
  return (
    <footer className="bg-green-700 text-white py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h3 className="text-lg font-semibold">Reciclaje Escolar</h3>
            <p className="text-sm mt-1">Cuidando el planeta desde la escuela</p>
          </div>
          <div className="text-sm">
            &copy; {new Date().getFullYear()} Todos los derechos reservados
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;