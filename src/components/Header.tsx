import { useEffect, useState } from 'react';
import { Link, NavLink, useParams } from 'react-router-dom';
import { HiComputerDesktop } from "react-icons/hi2";
import { IoSunnyOutline } from "react-icons/io5";
import { FaRegMoon } from "react-icons/fa";

const themeKeys = {
    system: "system",
    light: "light",
    dark: "dark"
} as const;

type ThemeKey = keyof typeof themeKeys;

const Header = () => {
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const { facultyId } = useParams<{ facultyId?: string }>(); // Obtener facultyId de la URL
    const [theme, setTheme] = useState<ThemeKey>(localStorage.getItem('theme') as ThemeKey || 'system');

    useEffect(() => {
        const root = document.documentElement;
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

        const applyThem = () => {
            root.classList.toggle(
                'dark',
                theme === themeKeys.dark ||
                (theme === themeKeys.system && mediaQuery.matches)
            )

            localStorage.setItem("theme", theme)
        };

        applyThem();

        mediaQuery.addEventListener("change", applyThem)

        return () => {
            mediaQuery.removeEventListener("change", applyThem)
        };
    }, [theme]);

    return (
        <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                <Link
                    to={facultyId ? `/` : "/"}
                    className="text-xl font-bold text-black dark:text-white"
                >
                    ProfeScore
                </Link>

                {/* Menú móvil */}
                <div className="md:hidden hover:cursor-pointer hover:text-gray-700 dark:text-white dark:hover:text-gray-200">
                    <i className="fa-solid fa-bars md:hidden " onClick={() => setShowMobileMenu(!showMobileMenu)} ></i>
                </div>

                <nav className="hidden md:flex items-center space-x-6">
                    <NavLink
                        end
                        to={facultyId ? `/facultad/${facultyId}` : "/"}
                        className={({ isActive }) =>
                            `text-sm ${isActive ? 'text-indigo-600 dark:text-indigo-400 font-medium' : 'text-gray-600 dark:text-white'}`
                        }
                    >
                        Inicio
                    </NavLink>
                    <NavLink
                        to={facultyId ? `/facultad/${facultyId}/materias` : "/materias"}
                        className={({ isActive }) =>
                            `text-sm ${isActive ? 'text-indigo-600 dark:text-indigo-400 font-medium' : 'text-gray-600 dark:text-white'}`
                        }
                    >
                        Materias
                    </NavLink>
                    <NavLink
                        to={facultyId ? `/facultad/${facultyId}/maestros` : "/maestros"}
                        className={({ isActive }) =>
                            `text-sm ${isActive ? 'text-indigo-600 dark:text-indigo-400 font-medium' : 'text-gray-600 dark:text-white'}`
                        }
                    >
                        Maestros
                    </NavLink>

                </nav>

                <div className="hidden md:flex gap-2 rounded-full bg-gray-100 dark:bg-gray-800 p-1">
                    {Object.keys(themeKeys).map((key) => (
                        <button
                            className={`rounded-full p-1 text-black dark:text-white ${theme === key ? 'bg-gray-300 dark:bg-gray-400' : 'bg-transparent'}`}
                            key={key}
                            onClick={() => setTheme(key as ThemeKey)}
                        >
                            {key === 'system' ? <HiComputerDesktop /> : key === 'light' ? <IoSunnyOutline /> : <FaRegMoon />}
                        </button>
                    ))}
                </div>
                {/* <div className="hidden md:block">
                    <Link
                        to="/admin/login"
                        className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-550 text-white px-4 py-2 rounded-md text-sm font-medium"
                    >
                        Iniciar Sesión
                    </Link>
                </div> */}
            </div>

            {/* Menú móvil */}
            {showMobileMenu && (
                <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-600 py-2">
                    <nav className="container mx-auto px-4 flex flex-col space-y-3">
                        <NavLink
                            end
                            to={facultyId ? `/facultad/${facultyId}` : "/"}
                            className={({ isActive }) =>
                                `text-sm ${isActive ? 'text-indigo-600 dark:text-indigo-400 font-medium' : 'text-gray-600 dark:text-white'}`
                            }
                        >
                            Inicio
                        </NavLink>
                        <NavLink
                            to={facultyId ? `/facultad/${facultyId}/materias` : "/materias"}
                            className={({ isActive }) =>
                                `text-sm ${isActive ? 'text-indigo-600 dark:text-indigo-400 font-medium' : 'text-gray-600 dark:text-white'}`
                            }
                        >
                            Materias
                        </NavLink>
                        <NavLink
                            to={facultyId ? `/facultad/${facultyId}/maestros` : "/maestros"}
                            className={({ isActive }) =>
                                `text-sm ${isActive ? 'text-indigo-600 dark:text-indigo-400 font-medium' : 'text-gray-600 dark:text-white'}`
                            }
                        >
                            Maestros
                        </NavLink>

                        <div className="flex gap-2 w-fit rounded-full bg-gray-100 dark:bg-gray-800 p-1">
                            {Object.keys(themeKeys).map((key) => (
                                <button
                                    className={`rounded-full p-1 text-black dark:text-white ${theme === key ? 'bg-gray-300 dark:bg-gray-400' : 'bg-transparent'}`}
                                    key={key}
                                    onClick={() => setTheme(key as ThemeKey)}
                                >
                                    {key === 'system' ? <HiComputerDesktop /> : key === 'light' ? <IoSunnyOutline /> : <FaRegMoon />}
                                </button>
                            ))}
                        </div>
                        {/* <div className="hidden md:block">
                            <Link
                                to="/admin/login"
                                className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-550 text-white px-4 py-2 rounded-md text-sm font-medium w-full"
                            >
                                Iniciar Sesión
                            </Link>
                        </div> */}
                    </nav>
                </div>
            )}
        </header>
    );
};

export default Header;