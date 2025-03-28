import { Link, Outlet } from 'react-router-dom';
import Header from './Header';

const LayoutWithHeader = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <Outlet />
      </main>
      <footer className="bg-white py-8 border-t border-gray-200 flex justify-center">
        <div className="px-4 text-center text-gray-600 flex flex-col gap-4 md:flex-row">
          <p>&copy; ProfeScore - {new Date().getFullYear()}</p>
          <Link to="/faq" className="link">Preguntas Frecuentes</Link>
          <Link to="/privacity" className="link">Términos de Privacidad</Link>
        </div>
      </footer>
    </div>
  );
};

export default LayoutWithHeader;