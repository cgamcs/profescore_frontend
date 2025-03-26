import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FaRegStar, FaStar, FaStarHalfAlt, FaHeart, FaRegHeart } from 'react-icons/fa';
import api from '../api';

interface Professor {
    _id: string;
    name: string;
    department: {
        _id: string;
        name: string;
    };
    biography: string;
    subjects: Subject[];
    ratingStats: {
        totalRatings: number;
        averageGeneral: number;
        averageExplanation: number;
        averageAccessibility: number;
        averageDifficulty: number;
        averageAttendance: number;
    };
}

interface RatingType {
    _id: string;
    general: number;
    comment: string;
    subject: Subject;
    createdAt: string;
    likes: string[];
}

interface Subject {
    _id: string;
    name: string;
}

const ProfessorDetail = () => {
    const { facultyId, professorId } = useParams<{ facultyId: string; professorId: string }>();
    const [professor, setProfessor] = useState<Professor | null>(null);
    const [ratings, setRatings] = useState<RatingType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProfessorDetails = async () => {
            try {
                const [professorRes, ratingsRes] = await Promise.all([
                    api.get(`/faculties/${facultyId}/professors/${professorId}?populate=subjects`),
                    api.get(`/faculties/${facultyId}/professors/${professorId}/ratings`)
                ]);

                setProfessor(professorRes.data);
                setRatings(ratingsRes.data);
            } catch (error) {
                console.error('Error fetching data:', error);
                setError('Error al cargar los detalles del profesor');
            } finally {
                setLoading(false);
            }
        };

        fetchProfessorDetails();
    }, [facultyId, professorId]);

    const renderStars = (rating: number) => {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;

        return (
            <div className="flex">
                {[...Array(fullStars)].map((_, i) => (
                    <FaStar key={i} className="text-white" />
                ))}
                {hasHalfStar && <FaStarHalfAlt className="text-white" />}
                {[...Array(5 - fullStars - (hasHalfStar ? 1 : 0))].map((_, i) => (
                    <FaRegStar key={i + fullStars} className="text-white" />
                ))}
            </div>
        );
    };

    const renderCommentStars = (rating: number) => {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;

        return (
            <div className="flex">
                {[...Array(fullStars)].map((_, i) => (
                    <FaStar key={i} className="text-indigo-500" />
                ))}
                {hasHalfStar && <FaStarHalfAlt className="text-indigo-500" />}
                {[...Array(5 - fullStars - (hasHalfStar ? 1 : 0))].map((_, i) => (
                    <FaRegStar key={i + fullStars} className="text-gray-300" />
                ))}
            </div>
        );
    };

    const handleLike = async (ratingId: string) => {
        try {
            const res = await api.post(
                `/faculties/${facultyId}/professors/${professorId}/ratings/${ratingId}/vote`,
                { type: 1 }
            );

            if (res.status === 200) {
                setRatings(prev =>
                    prev.map(r =>
                        r._id === ratingId
                            ? {
                                ...r, // Mantener datos existentes
                                ...res.data, // Sobreescribir campos actualizados
                                subject: res.data.subject || r.subject // Preservar subject si no viene
                              }
                            : r
                    )
                );
            }
        } catch (error) {
            console.error('Error votando:', error);
        }
    };

    if (loading) return <div className='text-center py-4'>Cargando...</div>;
    if (error) return <div className="text-red-500 text-center py-4">{error}</div>;
    if (!professor) return <div className='text-center text-red-500 py-4'>Profesor no encontrado</div>;

    return (
        <div className="bg-white min-h-screen">
            <main className="container mx-auto px-4 py-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Columna izquierda */}
                    <div className="md:col-span-1">
                        <div className="bg-indigo-600 text-white p-6 rounded-lg shadow-md mb-6">
                            <div className="text-3xl font-bold mb-2">
                                {professor.ratingStats.averageGeneral.toFixed(1)}
                            </div>
                            <div className="mb-3">
                                {renderStars(professor.ratingStats.averageGeneral)}
                            </div>
                            <div className="text-sm">
                                Basado en {professor.ratingStats.totalRatings} reseñas
                            </div>
                        </div>

                        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
                            <div className="mb-1 font-medium">Explicación</div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5 mb-4">
                                <div
                                    className="bg-indigo-600 h-1.5 rounded-full"
                                    style={{ width: `${(professor.ratingStats.averageExplanation / 5) * 100}%` }}
                                ></div>
                            </div>

                            <div className="mb-1 font-medium">Accesible</div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5 mb-4">
                                <div
                                    className="bg-indigo-600 h-1.5 rounded-full"
                                    style={{ width: `${(professor.ratingStats.averageAccessibility / 5) * 100}%` }}
                                ></div>
                            </div>

                            <div className="mb-1 font-medium">Dificultad</div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5 mb-4">
                                <div
                                    className="bg-indigo-600 h-1.5 rounded-full"
                                    style={{ width: `${(professor.ratingStats.averageDifficulty / 5) * 100}%` }}
                                ></div>
                            </div>

                            <div className="mb-1 font-medium">Asistencia</div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5 mb-4">
                                <div
                                    className="bg-indigo-600 h-1.5 rounded-full"
                                    style={{ width: `${(professor.ratingStats.averageAttendance / 5) * 100}%` }}
                                ></div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                            <h2 className="font-semibold text-lg mb-4">Información del Profesor</h2>
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Nombre</h3>
                                    <p>{professor.name}</p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Departamento</h3>
                                    <p>{professor.department.name}</p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Materias</h3>
                                    <ul className="list-disc list-inside text-sm">
                                        {professor.subjects?.slice(0, 2).map((subject) => (
                                            <li key={subject._id}>
                                                {subject.name}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6">
                            <Link to={`/facultad/${facultyId}/maestro/${professorId}/calificar`} className="block w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium text-center">
                                Calificar Profesor
                            </Link>
                        </div>
                    </div>

                    {/* Columna derecha */}
                    <div className="md:col-span-2">
                        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
                            <h2 className="font-semibold text-lg mb-4">Biografía</h2>
                            <p className="text-gray-700 mb-4">{professor.biography}</p>
                        </div>

                        <div>
                            <h2 className="font-semibold text-lg mb-4">Reseñas de Estudiantes</h2>
                            <div className="space-y-4">
                                {ratings.map(rating => (
                                    <div key={rating._id} className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                {renderCommentStars(rating.general)}
                                                <p className="text-sm text-gray-500 mt-1">
                                                    {rating.subject?.name || 'Materia no encontrada'}
                                                </p>
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {new Date(rating.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <p className="text-gray-700 mb-2">{rating.comment}</p>
                                        <p className="text-sm text-gray-500 mb-2">A {rating.likes.length} personas les resultó útil</p>
                                        <div className="flex items-center gap-5">
                                            <button
                                                className="flex items-center gap-2 border border-gray-200 rounded-full py-2 px-4 hover:cursor-pointer"
                                                onClick={() => handleLike(rating._id)}
                                            >
                                                {rating.likes.length > 0 ? (
                                                    <FaHeart className="text-indigo-600" />
                                                ) : (
                                                    <FaRegHeart className="text-gray-500" />
                                                )}
                                                <span className="text-sm text-gray-500">Me gusta</span>
                                            </button>

                                            <div className="border-l border-gray-200 pl-5">
                                                <div className="flex items-center gap-2">
                                                    <a href="#" className="text-sm text-gray-500 hover:cursor-pointer">Reportar</a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ProfessorDetail;