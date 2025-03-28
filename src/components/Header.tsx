import { useState } from 'react';
import { Link, NavLink, useParams } from 'react-router-dom';

const Header = () => {
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const { facultyId } = useParams<{ facultyId?: string }>(); // Obtener facultyId de la URL

    return (
        <header className="bg-white border-b border-gray-200">
            <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                <Link
                    to={facultyId ? `/` : "/"}
                    className="text-xl font-bold text-black"
                >
                    ProfeScore
                </Link>

                {/* Menú móvil */}
                <div className="md:hidden hover:text-gray-700">
                    <i className="fa-solid fa-bars md:hidden " onClick={() => setShowMobileMenu(!showMobileMenu)} ></i>
                </div>

                <nav className="hidden md:flex items-center space-x-6">
                    <NavLink
                        end
                        to={facultyId ? `/facultad/${facultyId}` : "/"}
                        className={({ isActive }) =>
                            `text-sm ${isActive ? 'text-indigo-600 font-medium' : 'text-gray-600'}`
                        }
                    >
                        Inicio
                    </NavLink>
                    <NavLink
                        to={facultyId ? `/facultad/${facultyId}/materias` : "/materias"}
                        className={({ isActive }) =>
                            `text-sm ${isActive ? 'text-indigo-600 font-medium' : 'text-gray-600'}`
                        }
                    >
                        Materias
                    </NavLink>
                    <NavLink
                        to={facultyId ? `/facultad/${facultyId}/maestros` : "/maestros"}
                        className={({ isActive }) =>
                            `text-sm ${isActive ? 'text-indigo-600 font-medium' : 'text-gray-600'}`
                        }
                    >
                        Maestros
                    </NavLink>
                </nav>

                <div className="hidden md:block">
                    <Link
                        to="/admin/login"
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                    >
                        Iniciar Sesión
                    </Link>
                </div>
            </div>

            {/* Menú móvil */}
            {showMobileMenu && (
                <div className="md:hidden bg-white border-t border-gray-200 py-2">
                    <nav className="container mx-auto px-4 flex flex-col space-y-3">
                        <NavLink
                            end
                            to={facultyId ? `/facultad/${facultyId}` : "/"}
                            className={({ isActive }) =>
                                `text-sm ${isActive ? 'text-indigo-600 font-medium' : 'text-gray-600'}`
                            }
                        >
                            Inicio
                        </NavLink>
                        <NavLink
                            to={facultyId ? `/facultad/${facultyId}/materias` : "/materias"}
                            className={({ isActive }) =>
                                `text-sm ${isActive ? 'text-indigo-600 font-medium' : 'text-gray-600'}`
                            }
                        >
                            Materias
                        </NavLink>
                        <NavLink
                            to={facultyId ? `/facultad/${facultyId}/maestros` : "/maestros"}
                            className={({ isActive }) =>
                                `text-sm ${isActive ? 'text-indigo-600 font-medium' : 'text-gray-600'}`
                            }
                        >
                            Maestros
                        </NavLink>

                        <Link
                            to="/admin/login"
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium w-full"
                        >
                            Iniciar Sesión
                        </Link>
                    </nav>
                </div>
            )}
        </header>
    );
};

export default Header