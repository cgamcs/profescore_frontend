import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';

const AdminHeader = () => {
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const navigate = useNavigate();


    return (
        <>
            {/* Header */}
            <header className="bg-white border-b border-gray-200">
                <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                    <Link to="/admin" className="text-xl font-bold text-black">
                        ProfeScore <span className="text-indigo-600 text-sm ml-2">Admin</span>
                    </Link>

                    {/* Menú móvil */}
                    <div className="md:hidden hover:text-gray-700">
                        <i className="fa-solid fa-bars md:hidden " onClick={() => setShowMobileMenu(!showMobileMenu)} ></i>
                    </div>


                    {/* Navegación desktop */}
                    <nav className="hidden md:flex items-center space-x-6">
                        <NavLink 
                            to="/admin/facultades"
                            className={({ isActive }) =>
                                `text-sm ${isActive ? 'text-indigo-600 font-medium' : 'text-gray-600'}`
                            }
                        >Facultades</NavLink>
                        <NavLink 
                            to="/admin/materias" 
                            className={({ isActive }) =>
                                `text-sm ${isActive ? 'text-indigo-600 font-medium' : 'text-gray-600'}`
                            }
                        >Materias</NavLink>
                        <NavLink 
                            to="/admin/maestros" 
                            className={({ isActive }) =>
                                `text-sm ${isActive ? 'text-indigo-600 font-medium' : 'text-gray-600'}`
                            }
                        >Profesores</NavLink>
                        <NavLink 
                            to="/" 
                            className="text-sm text-gray-600"
                        >Volver al sitio</NavLink>
                    </nav>

                    <div className="hidden md:block">
                        <button
                            onClick={() => {
                                localStorage.removeItem('token');
                                navigate('/admin/login');
                            }}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium hover:cursor-pointer"
                        >
                            Cerrar Sesión
                        </button>
                    </div>
                </div>

                {/* Menú móvil */}
                {showMobileMenu && (
                    <div className="md:hidden bg-white border-t border-gray-200 py-2">
                        <nav className="container mx-auto px-4 flex flex-col space-y-3">
                            <NavLink to="/admin/facultades" className="text-sm text-indigo-600 font-medium">Facultades</NavLink>
                            <NavLink to="/admin/materias" className="text-sm text-gray-600">Materias</NavLink>
                            <NavLink to="/admin/profesores" className="text-sm text-gray-600">Profesores</NavLink>
                            <NavLink to="/" className="text-sm text-gray-600">Volver al sitio</NavLink>
                            <button
                                onClick={() => {
                                    localStorage.removeItem('token');
                                    navigate('/admin/login');
                                }}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium w-full"
                            >
                                Cerrar Sesión
                            </button>
                        </nav>
                    </div>
                )}
            </header>
        </>
    );
};

export default AdminHeader