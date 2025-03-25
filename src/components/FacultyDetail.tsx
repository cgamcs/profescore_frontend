import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';

interface ISubject {
    _id: string;
    name: string;
    credits: number;
    department: {
        _id: string
        name: string
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
    const [subjects, setSubjects] = useState<ISubject[]>([]);
    const [professors, setProfessors] = useState<IProfessor[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Filtrado de materias y profesores según el término de búsqueda
    const filteredSubjects = subjects.filter(subject =>
        subject.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const filteredProfessors = professors.filter(professor =>
        professor.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    useEffect(() => {
        const fetchData = async () => {
            try {
                const subjectsRes = await api.get(`/faculties/${facultyId}/subjects`);
                const professorsRes = await api.get(`/faculties/${facultyId}/professors`);

                console.log('Subjects Response:', subjectsRes.data);
                console.log('Professors Response:', professorsRes.data);

                setSubjects(subjectsRes.data);
                setProfessors(professorsRes.data);
                setLoading(false);
            } catch (error) {
                console.error(error);
                setError('Error al cargar la información');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [facultyId]);

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

    if (loading) return <div className="text-center py-4">Cargando...</div>;
    if (error) return <div className="text-red-500 text-center py-4">{error}</div>;

    return (
        <main className="container mx-auto px-4 py-6">
            <h1 className="text-2xl font-bold text-black text-center mb-6">Tu Guía Académica</h1>

            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto mb-8">
                <input
                    type="text"
                    placeholder="Buscar por nombre de materia o profesor..."
                    className="w-full border border-gray-200 px-4 py-3 rounded-xl shadow-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 text-black w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </div>

            {/* Sección de Materias */}
            <section className="mb-12">
                <h2 className="text-xl font-semibold mb-4">Tabla de Materias</h2>
                <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Materia</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Departamento</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Créditos</th>
                            </tr>
                        </thead>
                        {filteredSubjects.map((subject) => (
                            <tbody key={subject._id} className="bg-white divide-y divide-gray-200">
                                <tr className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">
                                        <Link to={`materia/${subject._id}`}>{subject.name}</Link>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{subject.department?.name || 'Sin departamento'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{subject.credits}</td>
                                </tr>
                            </tbody>
                        ))}
                    </table>
                </div>
            </section>

            {/* Sección de Profesores Destacados */}
            <section>
                <h2 className="text-xl font-semibold mb-4">Maestros Mejor Calificados</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {filteredProfessors.map((professor) => (
                        <Link key={professor._id} to={`/facultad/${facultyId}/maestro/${professor._id}`} className="block">
                            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
                                <h3 className="font-medium text-lg mb-1">{professor.name}</h3>
                                <p className="text-gray-500 text-sm mb-3">{professor.department}</p>
                                <div className="flex items-center">
                                    <div className="flex items-center">
                                        <span className="bg-indigo-100 text-indigo-800 font-bold rounded px-2 py-1 text-sm mr-2">
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