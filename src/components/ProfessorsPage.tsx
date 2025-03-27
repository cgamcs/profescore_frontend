import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';

interface IProfessor {
    _id: string;
    name: string;
    department: string;
    subjects: string[];
    ratingStats: {
        averageGeneral: number;
        totalRatings: number;
    };
}

interface IDepartment {
    _id: string;
    name: string;
}

const ProfessorsPage = () => {
    const { facultyId } = useParams();
    const [professors, setProfessors] = useState<IProfessor[]>([]);
    const [subjects, setSubjects] = useState<{ [key: string]: string }>({});
    const [departments, setDepartments] = useState<{ [key: string]: string }>({});
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [professorsRes, subjectsRes, departmentsRes] = await Promise.all([
                    api.get(`/faculties/${facultyId}/professors`),
                    api.get(`/faculties/${facultyId}/subjects`),
                    api.get(`/faculties/${facultyId}/departments`)
                ]);

                const subjectsMap = subjectsRes.data.reduce((acc: { [key: string]: string }, subject: any) => {
                    acc[subject._id] = subject.name;
                    return acc;
                }, {});

                const departmentsMap = departmentsRes.data.reduce((acc: { [key: string]: string }, department: IDepartment) => {
                    acc[department._id] = department.name;
                    return acc;
                }, {});

                setSubjects(subjectsMap);
                setDepartments(departmentsMap);
                setProfessors(professorsRes.data);
            } catch (error) {
                console.error('Error fetching data:', error);
                setError('Error al cargar los datos');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [facultyId]);

    // Función para normalizar el texto (eliminar acentos y convertir a minúsculas)
    const normalizeText = (text: string) => {
        return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    };

    // Filtrado: si no hay búsqueda se muestran todos; de lo contrario, se filtra por nombre del maestro
    // o por alguna materia que imparte (utilizando el nombre de la materia obtenido de subjects)
    const filteredProfessors = professors.filter(professor => {
        if (searchQuery === '') return true;
        const query = normalizeText(searchQuery);
        const nameMatches = normalizeText(professor.name).includes(query);
        const subjectMatches = professor.subjects.some(subjectId => {
            const subjectName = normalizeText(subjects[subjectId] || '');
            return subjectName.includes(query);
        });
        return nameMatches || subjectMatches;
    });

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

    if (error) return <div className="text-red-500 text-center py-4">{error}</div>;
    if (loading) return <div className="text-center py-10">Cargando maestros...</div>;

    return (
        <main className="container mx-auto px-4 py-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Maestros</h1>
                <Link
                    to={`/facultad/${facultyId}/maestros/agregar-maestro`}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                    Agregar Maestro
                </Link>
            </div>

            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto mb-8">
                <input
                    type="text"
                    placeholder="Buscar por nombre del maestro o materia..."
                    className="w-full border border-gray-200 px-4 py-3 rounded-xl shadow-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 text-black w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </div>

            {/* Professors Table */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 bg-indigo-600 text-white">
                    <h2 className="font-medium">Maestros</h2>
                </div>
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Departamento</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Materias</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Calificación</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredProfessors.map((professor) => (
                            <tr key={professor._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <Link
                                        to={`/facultad/${facultyId}/maestro/${professor._id}`}
                                        className="text-indigo-600 font-medium"
                                    >
                                        {professor.name}
                                    </Link>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {departments[professor.department] || 'Cargando...'}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                    <div className="flex flex-wrap gap-1">
                                        {professor.subjects?.slice(0, 2).map((subjectId) => (
                                            <span
                                                key={subjectId}
                                                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800"
                                            >
                                                {subjects[subjectId] || 'Cargando...'}
                                            </span>
                                        ))}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <span className="bg-indigo-100 text-indigo-800 font-bold rounded px-2 py-1 text-sm mr-2">
                                            {professor.ratingStats.averageGeneral.toFixed(1)}
                                        </span>
                                        {renderStars(professor.ratingStats.averageGeneral)}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </main>
    );
};

export default ProfessorsPage;