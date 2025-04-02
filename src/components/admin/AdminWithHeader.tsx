import { Link, Outlet } from 'react-router-dom';
import AdminHeader from './AdminHeader';

const AdminWithHeader = () => {
  return (
    <div className="min-h-screen bg-white">
      <AdminHeader />
      <main>
        <Outlet />
      </main>
      <footer className="bg-white border-t border-gray-200">
        <div className='container mx-auto px-4 py-3 flex items-center justify-between'>
          <p>&copy; ProfeScore - {new Date().getFullYear()}</p>

          <div className="flex gap-4">
            <Link to="/faq" className="link">Preguntas Frecuentes</Link>
            <Link to="/privacity" className="link">Términos de Privacidad</Link>
          </div>

        </div>
      </footer>
    </div>
  );
};

export default AdminWithHeader;