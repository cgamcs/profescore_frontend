import { useEffect, useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, Link, useLocation, useSearchParams } from 'react-router-dom';
import { ProfessorPageLoader } from './SkeletonLoader';
import AddProfessorModal from './AddProfessorModal'; // Importa el modal
import api from '../api';
import useViewTransition from './useViewTransition';

interface IProfessor {
    _id: string;
    name: string;
    department?: string;
    subjects: string[];
    ratingStats: {
        averageGeneral: number;
        totalRatings: number;
    };
}

interface ISubject {
    _id: string;
    name: string;
}

const STALE_TIME = 5 * 60 * 1000; // 5 minutos

const ProfessorsPage = () => {
    const { facultyId } = useParams<{ facultyId: string }>(); // Asegúrate de que facultyId sea una cadena
    const location = useLocation();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchParams] = useSearchParams();
    const addSuccess = searchParams.get('addSuccess') === 'true';
    const [showSuccessMessage, setShowSuccessMessage] = useState(addSuccess);
    const [isModalOpen, setIsModalOpen] = useState(false); // Estado para el modal
    const { handleLinkClick } = useViewTransition();

    const { data: professors = [], isLoading: professorsLoading } = useQuery({
        queryKey: ['professors', facultyId],
        queryFn: () => api.get(`/faculties/${facultyId}/professors`).then(res => res.data),
        staleTime: STALE_TIME,
        select: (data) => data.map((prof: IProfessor) => ({
            _id: prof._id,
            name: prof.name,
            department: prof.department,
            subjects: prof.subjects,
            ratingStats: {
                averageGeneral: prof.ratingStats.averageGeneral,
                totalRatings: prof.ratingStats.totalRatings
            }
        }))
    });

    const { data: subjects = [], isLoading: subjectsLoading } = useQuery({
        queryKey: ['subjects', facultyId],
        queryFn: () => api.get(`/faculties/${facultyId}/subjects`).then(res => res.data),
        staleTime: STALE_TIME,
        select: (data) => data.map((subj: ISubject) => ({
            _id: subj._id,
            name: subj.name
        }))
    });

    const isLoading = professorsLoading || subjectsLoading;

    // En ambos componentes, añadir este useEffect
    useEffect(() => {
        document.title = "ProfeScore - Maestros";

        const mainElement = document.getElementById('main-content');
        if (mainElement) {
            mainElement.style.viewTransitionName = 'main-content';
            mainElement.style.contain = 'layout';
        }

        return () => {
            const mainElement = document.getElementById('main-content');
            if (mainElement) {
                mainElement.style.viewTransitionName = '';
                mainElement.style.contain = '';
            }
        };
    }, []);

    useEffect(() => {
        const urlParams = new URLSearchParams(location.search);
        if (urlParams.get('success') === 'true') {
            setShowSuccessMessage(true);
            const timer = setTimeout(() => {
                setShowSuccessMessage(false);
            }, 8000);
            return () => clearTimeout(timer);
        }
    }, [location.search]);

    useEffect(() => {
        if (addSuccess) {
            const timer = setTimeout(() => {
                setShowSuccessMessage(false);
            }, 5000); // Ocultar el mensaje después de 5 segundos

            return () => clearTimeout(timer);
        }
    }, [addSuccess]);

    // Función para normalizar el texto (eliminar acentos y convertir a minúsculas)
    const normalizeText = (text: string) => {
        return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    };

    // Memoizar el filtrado de profesores
    const filteredProfessors = useMemo(() => {
        if (!searchQuery) return professors;

        const query = normalizeText(searchQuery);
        return professors.filter((professor: IProfessor) => {
            const nameMatches = normalizeText(professor.name).includes(query);
            const subjectMatches = professor.subjects.some((subjectId: string) => {
                const subject = subjects.find((s: ISubject) => s._id === subjectId);
                return subject && normalizeText(subject.name).includes(query);
            });
            return nameMatches || subjectMatches;
        });
    }, [professors, subjects, searchQuery]);

    // Memoizar el filtrado de materias
    const filteredSubjects = useMemo(() => {
        if (!searchQuery) return [];

        const query = normalizeText(searchQuery);
        return subjects.filter((subject: ISubject) => {
            const nameMatches = normalizeText(subject.name).includes(query);
            const hasProfessor = professors.some((professor: IProfessor) =>
                professor.subjects.includes(subject._id)
            );
            return nameMatches && !hasProfessor;
        });
    }, [subjects, professors, searchQuery]);

    // Memoizar el renderizado de estrellas
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

    if (isLoading) return <ProfessorPageLoader />;

    return (
        <main id="main-content" data-view-transition className="container mx-auto px-4 py-6">
            {showSuccessMessage && (
                <div className="fixed top-15 right-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg notification">
                    Profesor agregado correctamente
                </div>
            )}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl dark:text-white font-bold">Maestros</h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium hover:cursor-pointer"
                >
                    Agregar Maestro
                </button>
            </div>

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

            {/* Professors Table */}
            <div className="bg-white dark:bg-[#202024] rounded-lg border border-gray-200 dark:border-[#202024] shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-[#383939]">
                        <thead className="bg-gray-50 dark:bg-indigo-600">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">Nombre</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">Materias</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">Calificación</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-[#202024] divide-y divide-gray-200 dark:divide-[#383939]">
                            {filteredProfessors.map((professor: IProfessor) => (
                                <tr key={professor._id} className="hover:bg-gray-50 dark:hover:bg-[#ffffff0d]">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <Link
                                            to={`/facultad/${facultyId}/maestro/${professor._id}`}
                                            onClick={(e) => handleLinkClick(`/facultad/${facultyId}/maestro/${professor._id}`, e)}
                                            className="text-indigo-600 dark:text-white font-medium"
                                        >
                                            {professor.name}
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        <div className="flex flex-wrap gap-1">
                                            {professor.subjects?.slice(0, 2).map((subjectId: string) => {
                                                const subject = subjects.find((s: ISubject) => s._id === subjectId);
                                                return subject ? (
                                                    <span
                                                        key={subjectId}
                                                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 dark:bg-indigo-600 text-indigo-800 dark:text-white"
                                                    >
                                                        {subject.name}
                                                    </span>
                                                ) : null;
                                            })}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <span className="bg-indigo-100 dark:bg-[#646464] text-indigo-800 dark:text-white font-bold rounded px-2 py-1 text-sm mr-2">
                                                {professor.ratingStats.averageGeneral.toFixed(1)}
                                            </span>
                                            {renderStars(professor.ratingStats.averageGeneral)}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredSubjects.map((subject: ISubject) => (
                                <tr key={subject._id} className="hover:bg-gray-50 dark:hover:bg-[#ffffff0d]">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-gray-500 dark:text-gray-400 font-medium">
                                            Sin maestro
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        <div className="flex flex-wrap gap-1">
                                            <span
                                                key={subject._id}
                                                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 dark:bg-indigo-400/70 text-indigo-800 dark:text-white"
                                            >
                                                {subject.name}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <span className="bg-gray-100 dark:bg-[#646464] text-gray-800 dark:text-white font-bold rounded px-2 py-1 text-sm mr-2">
                                                N/A
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && facultyId && (
                <AddProfessorModal
                    facultyId={facultyId}
                    subjects={subjects}
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={() => setShowSuccessMessage(true)} // Pasamos la función de callback
                />
            )}
        </main>
    );
};

export default ProfessorsPage;
