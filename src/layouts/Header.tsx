import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { HiComputerDesktop } from "react-icons/hi2";
import { IoSunnyOutline } from "react-icons/io5";
import { FaRegMoon } from "react-icons/fa";
import useViewTransition from '../layouts/useViewTransition';

const themeKeys = {
    system: "system",
    light: "light",
    dark: "dark"
} as const;

type ThemeKey = keyof typeof themeKeys;

const Header = () => {
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const { facultyId } = useParams<{ facultyId?: string }>();
    const [theme, setTheme] = useState<ThemeKey>(localStorage.getItem('theme') as ThemeKey || 'system');
    const { handleLinkClick } = useViewTransition();

    useEffect(() => {
        const root = document.documentElement;
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

        const applyTheme = () => {
            root.classList.toggle(
                'dark',
                theme === themeKeys.dark ||
                (theme === themeKeys.system && mediaQuery.matches)
            )

            localStorage.setItem("theme", theme)
        };

        applyTheme();

        mediaQuery.addEventListener("change", applyTheme)

        // Set view transition name for header
        const headerElement = document.getElementById('site-header');
        if (headerElement) {
            headerElement.style.viewTransitionName = 'site-header';
        }

        return () => {
            mediaQuery.removeEventListener("change", applyTheme)
        };
    }, [theme]);

    return (
        <header id="site-header" data-view-transition className="bg-white dark:bg-[#0A0A0A] border-b border-gray-200 dark:border-[#202024]">
            <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                <a
                    href={facultyId ? `/` : "/"}
                    className="text-xl font-bold text-black dark:text-white site-logo"
                    onClick={(e) => handleLinkClick(facultyId ? '/' : '/', e)}
                >
                    ProfeScore
                </a>

                {/* Menú móvil */}
                <div className="md:hidden hover:cursor-pointer hover:text-gray-700 dark:text-white dark:hover:text-gray-200">
                    <i className="fa-solid fa-bars md:hidden" onClick={() => setShowMobileMenu(!showMobileMenu)} ></i>
                </div>

                <nav className="hidden md:flex items-center space-x-6">
                    <a
                        href={facultyId ? `/facultad/${facultyId}` : "/"}
                        className={`text-sm ${window.location.pathname === (facultyId ? `/facultad/${facultyId}` : "/") ? 'text-indigo-600 dark:text-indigo-400 font-medium' : 'text-gray-600 dark:text-white'}`}
                        onClick={(e) => handleLinkClick(facultyId ? `/facultad/${facultyId}` : "/", e)}
                    >
                        Inicio
                    </a>
                    <a
                        href={facultyId ? `/facultad/${facultyId}/materias` : "/materias"}
                        className={`text-sm ${window.location.pathname.includes('/materias') ? 'text-indigo-600 dark:text-indigo-400 font-medium' : 'text-gray-600 dark:text-white'}`}
                        onClick={(e) => handleLinkClick(facultyId ? `/facultad/${facultyId}/materias` : "/materias", e)}
                    >
                        Materias
                    </a>
                    <a
                        href={facultyId ? `/facultad/${facultyId}/maestros` : "/maestros"}
                        className={`text-sm ${window.location.pathname.includes('/maestros') ? 'text-indigo-600 dark:text-indigo-400 font-medium' : 'text-gray-600 dark:text-white'}`}
                        onClick={(e) => handleLinkClick(facultyId ? `/facultad/${facultyId}/maestros` : "/maestros", e)}
                    >
                        Maestros
                    </a>
                </nav>

                {/* Sección de botones de tema para escritorio */}
                <div className="hidden md:flex gap-2 rounded-full bg-gray-100 dark:bg-[#383939] p-1 relative theme-switcher">
                    {/* Indicador móvil */}
                    <div
                        className={`absolute top-1 left-1 h-8 transition-all duration-300 ease-out rounded-full bg-gray-300 dark:bg-[#1A1A1A]
                            ${theme === 'system' ? 'translate-x-0' :
                                theme === 'light' ? 'translate-x-[calc(100%+0.5rem)]' :
                                    'translate-x-[calc(200%+1rem)]'}`}
                        style={{ width: '2rem' }}
                    ></div>

                    {Object.keys(themeKeys).map((key) => (
                        <button
                            className={`relative rounded-full p-2 transition-all duration-300 ${theme === key ? 'text-black dark:text-white' : 'text-gray-500 dark:text-gray-300'}`}
                            key={key}
                            onClick={() => setTheme(key as ThemeKey)}
                            style={{ width: '2rem', height: '2rem' }}
                        >
                            {key === 'system' ? <HiComputerDesktop /> :
                                key === 'light' ? <IoSunnyOutline /> : <FaRegMoon />}
                        </button>
                    ))}
                </div>
            </div>

            {/* Menú móvil */}
            {showMobileMenu && (
                <div className="md:hidden bg-white dark:bg-[#0A0A0A] border-t border-gray-200 dark:border-[#202024] py-2 mobile-menu">
                    <nav className="container mx-auto px-4 flex flex-col space-y-3">
                        <a
                            href={facultyId ? `/facultad/${facultyId}` : "/"}
                            className={`text-sm ${window.location.pathname === (facultyId ? `/facultad/${facultyId}` : "/") ? 'text-indigo-600 dark:text-indigo-400 font-medium' : 'text-gray-600 dark:text-white'}`}
                            onClick={(e) => handleLinkClick(facultyId ? `/facultad/${facultyId}` : "/", e)}
                        >
                            Inicio
                        </a>
                        <a
                            href={facultyId ? `/facultad/${facultyId}/materias` : "/materias"}
                            className={`text-sm ${window.location.pathname.includes('/materias') ? 'text-indigo-600 dark:text-indigo-400 font-medium' : 'text-gray-600 dark:text-white'}`}
                            onClick={(e) => handleLinkClick(facultyId ? `/facultad/${facultyId}/materias` : "/materias", e)}
                        >
                            Materias
                        </a>
                        <a
                            href={facultyId ? `/facultad/${facultyId}/maestros` : "/maestros"}
                            className={`text-sm ${window.location.pathname.includes('/maestros') ? 'text-indigo-600 dark:text-indigo-400 font-medium' : 'text-gray-600 dark:text-white'}`}
                            onClick={(e) => handleLinkClick(facultyId ? `/facultad/${facultyId}/maestros` : "/maestros", e)}
                        >
                            Maestros
                        </a>

                        {/* Sección de botones de tema para móvil */}
                        <div className="flex gap-2 w-fit rounded-full bg-gray-100 dark:bg-[#383939] p-1 relative">
                            {/* Indicador móvil */}
                            <div
                                className={`absolute top-1 left-1 h-6 transition-all duration-300 ease-out rounded-full bg-gray-300 dark:bg-[#1A1A1A]
                                    ${theme === 'system' ? 'translate-x-0' :
                                        theme === 'light' ? 'translate-x-[calc(100%+0.5rem)]' :
                                            'translate-x-[calc(200%+1rem)]'}`}
                                style={{ width: '1.5rem' }}
                            ></div>

                            {Object.keys(themeKeys).map((key) => (
                                <button
                                    className={`relative rounded-full p-1 transition-all duration-300 ${theme === key ? 'text-black dark:text-white' : 'text-gray-500 dark:text-gray-300'}`}
                                    key={key}
                                    onClick={() => setTheme(key as ThemeKey)}
                                    style={{ width: '1.5rem', height: '1.5rem' }}
                                >
                                    {key === 'system' ? <HiComputerDesktop /> :
                                        key === 'light' ? <IoSunnyOutline /> : <FaRegMoon />}
                                </button>
                            ))}
                        </div>
                    </nav>
                </div>
            )}
        </header>
    );
};

export default Header;
