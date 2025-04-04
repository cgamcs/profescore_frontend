import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { FacultyDetailLoader } from './SkeletonLoader';
import api from '../api';

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

    const { data: subjects = [], isLoading: subjectsLoading } = useQuery({
        queryKey: ['subjects', facultyId],
        queryFn: () => api.get(`/faculties/${facultyId}/subjects`).then(res => res.data),
    });

    const { data: professors = [], isLoading: professorsLoading } = useQuery({
        queryKey: ['professors', facultyId],
        queryFn: () => api.get(`/faculties/${facultyId}/professors`).then(res => res.data),
    });

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
                        return <i key={index} className="fas fa-star text-indigo-500 text-sm" />;
                    }
                    if (index === fullStars && hasHalfStar) {
                        return <i key={index} className="fas fa-star-half-alt text-indigo-500 text-sm" />;
                    }
                    return <i key={index} className="far fa-star text-gray-300 text-sm" />;
                })}
            </div>
        );
    };

    if (isLoading) return <FacultyDetailLoader />;

    return (
        <main className="container mx-auto px-4 py-6">
            <h1 className="text-2xl font-bold text-black dark:text-white text-center mb-6">Tu Guía Académica</h1>

            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto mb-8">
                <input
                    type="text"
                    placeholder="Buscar por nombre de materia o profesor..."
                    className="w-full border dark:text-white border-gray-200 dark:border-gray-600 px-4 py-3 rounded-xl shadow-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 text-black dark:text-gray-600 w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </div>

            {/* Sección de Materias */}
            {!isSearchingProfessor && (
                <section className="mb-12">
                    <h2 className="dark:text-white text-xl font-semibold mb-4">Tabla de Materias</h2>
                    <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-400">
                            <thead className="bg-gray-50 dark:bg-gray-500">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">Materia</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">Créditos</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-700 divide-y divide-gray-200 dark:divide-gray-600">
                                {displayedSubjects.map((subject: ISubject) => (
                                    <tr key={subject._id} className="hover:bg-gray-50 dark:hover:bg-gray-600">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600 dark:text-indigo-400">
                                            <Link to={`materia/${subject._id}`}>{subject.name}</Link>
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {displayedProfessors.map((professor: IProfessor) => (
                        <Link key={professor._id} to={`/facultad/${facultyId}/maestro/${professor._id}`} className="block">
                            <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm p-6 hover:shadow-md transition-shadow">
                                <h3 className="font-medium dark:text-white text-lg mb-1">{professor.name}</h3>
                                <div className="flex items-center">
                                    <div className="flex items-center">
                                        <span className="bg-indigo-100 dark:bg-indigo-600 text-indigo-800 dark:text-indigo-100 font-bold rounded px-2 py-1 text-sm mr-2">
                                            {professor.ratingStats.averageGeneral.toFixed(1)}
                                        </span>
                                        {renderStars(professor.ratingStats.averageGeneral)}
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>
        </main>
    );
};

export default FacultyDetails;