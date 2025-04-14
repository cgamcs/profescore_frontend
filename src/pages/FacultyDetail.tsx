import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { FacultyDetailLoader } from '../layouts/SkeletonLoader';
import api from '../api';
import useViewTransition from '../layouts/useViewTransition';

interface ISubject {
    _id: string;
    name: string;
    credits: number;
    department: {
        _id: string;
        name: string;
    };
    professors: string[];
}

interface IProfessor {
    _id: string;
    name: string;
    subjects: string[];
    department: string[];
    ratingStats: {
        averageGeneral: number;
        totalRatings: number;
    };
}

const FacultyDetails = () => {
    const { facultyId } = useParams();
    const [searchQuery, setSearchQuery] = useState('');
    const { handleLinkClick } = useViewTransition();
    const subjectsContainerRef = useRef<HTMLTableElement>(null);
    const professorsContainerRef = useRef<HTMLDivElement>(null);
    const [subjectsHeight, setSubjectsHeight] = useState<number | null>(null);
    const [professorsHeight, setProfessorsHeight] = useState<number | null>(null);

    const { data: subjects = [], isLoading: subjectsLoading } = useQuery({
        queryKey: ['subjects', facultyId],
        queryFn: () => api.get(`/faculties/${facultyId}/subjects`).then(res => res.data),
    });

    const { data: professors = [], isLoading: professorsLoading } = useQuery({
        queryKey: ['professors', facultyId],
        queryFn: () => api.get(`/faculties/${facultyId}/professors`).then(res => res.data),
    });

    useEffect(() => {
        document.title = "ProfeScore - Facultad";

        const prepareTransition = () => {
          const root = document.documentElement;
          root.style.viewTransitionName = 'root';
          root.style.animation = 'none'; // Resetear animaciones

          const mainElement = document.getElementById('main-content');
          if (mainElement) {
            mainElement.style.viewTransitionName = 'main-content';
            mainElement.style.contain = 'layout';
          }
        };

        prepareTransition();

        return () => {
          const root = document.documentElement;
          root.style.viewTransitionName = '';

          const mainElement = document.getElementById('main-content');
          if (mainElement) {
            mainElement.style.viewTransitionName = '';
            mainElement.style.contain = '';
          }
        };
      }, []);

    // Almacenar las alturas una vez que los datos se han cargado
    useEffect(() => {
        if (!subjectsLoading && !professorsLoading) {
            if (subjectsContainerRef.current) {
                setSubjectsHeight(subjectsContainerRef.current.offsetHeight);
            }
            if (professorsContainerRef.current) {
                setProfessorsHeight(professorsContainerRef.current.offsetHeight);
            }
        }
    }, [subjectsLoading, professorsLoading, subjects, professors]);

    const isLoading = subjectsLoading || professorsLoading;

    // Función para normalizar el texto (eliminar acentos y convertir a minúsculas)
    const normalizeText = (text: string) => {
        return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    };

    // Filtrado de materias y profesores según el término de búsqueda
    const filteredSubjects = subjects.filter((subject: ISubject) =>
        normalizeText(subject.name).includes(normalizeText(searchQuery))
    );
    const filteredProfessors = professors.filter((professor: IProfessor) =>
        normalizeText(professor.name).includes(normalizeText(searchQuery))
    );

    // Determinar si se está buscando un profesor
    const isSearchingProfessor = filteredProfessors.length > 0 && searchQuery.trim() !== '';

    // Limitar la cantidad de materias y profesores mostrados
    const displayedSubjects = isSearchingProfessor ? [] : filteredSubjects.slice(0, 6);
    const displayedProfessors = filteredProfessors.slice(0, 3);

    const renderStars = (rating: number) => {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;

        return (
            <div className="flex">
                {[...Array(5)].map((_, index) => {
                    if (index < fullStars) {
                        return <i key={index} className="fas fa-star text-indigo-500 dark:text-[#83838B] text-sm" />;
                    }
                    if (index === fullStars && hasHalfStar) {
                        return <i key={index} className="fas fa-star-half-alt text-indigo-500 dark:text-[#83838B] text-sm" />;
                    }
                    return <i key={index} className="far fa-star text-gray-300 text-sm" />;
                })}
            </div>
        );
    };

    if (isLoading) return <FacultyDetailLoader />;

    return (
        <main id="root-main" data-view-transition className="container mx-auto px-4 py-6">
            <h1 className="text-2xl font-bold text-black dark:text-white text-center mb-6">Tu Guía Académica</h1>

            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto mb-8">
                <input
                    type="text"
                    placeholder="Buscar por nombre del maestro o materia..."
                    className="w-full border dark:text-white border-gray-200 dark:border-[#2B2B2D] px-4 py-3 rounded-xl shadow-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 text-black dark:text-[#383939] w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </div>

            {/* Sección de Materias */}
            {!isSearchingProfessor && (
                <section className="mb-12">
                    <h2 className="dark:text-white text-xl font-semibold mb-4">Tabla de Materias</h2>
                    <div
                        className="overflow-x-auto rounded-lg border border-gray-200 dark:border-[#202024] shadow-sm transition-all"
                        style={{
                            minHeight: subjectsHeight ? `${subjectsHeight}px` : '200px'
                        }}
                    >
                        <table
                            ref={subjectsContainerRef}
                            className="min-w-full divide-y divide-gray-200 dark:divide-[#383939]"
                        >
                            <thead className="bg-gray-50 dark:bg-indigo-600">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">Materia</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">Créditos</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-[#202024] divide-y divide-gray-200 dark:divide-[#383939]">
                                {displayedSubjects.map((subject: ISubject) => (
                                    <tr key={subject._id} className="hover:bg-gray-50 dark:hover:bg-[#ffffff0d]">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600 dark:text-white">
                                            <a
                                                href={`/facultad/${facultyId}/materia/${subject._id}`}
                                                onClick={(e) => handleLinkClick(`/facultad/${facultyId}/materia/${subject._id}`, e)}
                                            >
                                                {subject.name}
                                            </a>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{subject.credits}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            )}

            {/* Sección de Profesores Destacados */}
            <section>
                <h2 className="text-xl dark:text-white font-semibold mb-4">Maestros Mejor Calificados</h2>
                <div
                    ref={professorsContainerRef}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 transition-all"
                    style={{
                        minHeight: professorsHeight ? `${professorsHeight}px` : '150px'
                    }}
                >
                    {displayedProfessors.map((professor: IProfessor) => (
                        <a
                            key={professor._id}
                            href={`/facultad/${facultyId}/maestro/${professor._id}`}
                            onClick={(e) => handleLinkClick(`/facultad/${facultyId}/maestro/${professor._id}`, e)}
                            className="block"
                        >
                            <div className="bg-white dark:bg-[#202024] rounded-lg border border-gray-200 dark:border-[#202024] shadow-sm p-6 hover:shadow-md transition-shadow">
                                <h3 className="font-medium dark:text-white text-lg mb-1">{professor.name}</h3>
                                <div className="flex items-center">
                                    <div className="flex items-center">
                                        <span className="bg-indigo-100 dark:bg-[#646464] text-indigo-800 dark:text-white font-bold rounded px-2 py-1 text-sm mr-2">
                                            {professor.ratingStats.averageGeneral.toFixed(1)}
                                        </span>
                                        {renderStars(professor.ratingStats.averageGeneral)}
                                    </div>
                                </div>
                            </div>
                        </a>
                    ))}
                </div>
            </section>
        </main>
    );
};

export default FacultyDetails;
