import { Outlet } from 'react-router-dom';
import AdminHeader from './AdminHeader';

const AdminWithHeader = () => {
  return (
    <div className="min-h-screen bg-white">
      <AdminHeader />
      <main>
        <Outlet />
      </main>
      <footer className="bg-white py-8 border-t border-gray-200 flex justify-center">
        <div className="px-4 text-center text-gray-600 flex flex-col gap-4 md:flex-row">
          <p>&copy; ProfeScore - {new Date().getFullYear()}</p>
          <a href="#" className="hover:text-indigo-600 hover:font-bold transition-all">FAQ</a>
          <a href="#" className="hover:text-indigo-600 hover:font-bold transition-all">Términos de Privacidad</a>
        </div>
      </footer>
    </div>
  );
};

export default AdminWithHeader;