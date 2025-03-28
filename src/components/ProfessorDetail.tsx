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
    const [userId, setUserId] = useState<string>('');
    const [showReportModal, setShowReportModal] = useState(false);
    const [selectedComment, setSelectedComment] = useState<RatingType | null>(null);
    const [reportSent, setReportSent] = useState(false);

    // Generar o recuperar userId al cargar el componente
    useEffect(() => {
        const storedUserId = localStorage.getItem('userId');
        if (!storedUserId) {
            const newUserId = Math.random().toString(36).substring(2, 15);
            localStorage.setItem('userId', newUserId);
            setUserId(newUserId);
        } else {
            setUserId(storedUserId);
        }
    }, []);

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
                { type: 1, userId: userId }
            );

            if (res.status === 200) {
                setRatings(prev =>
                    prev.map(r =>
                        r._id === ratingId ? res.data : r
                    )
                );
            }
        } catch (error) {
            console.error('Error votando:', error);
        }
    };

    const openReportModal = (comment: RatingType) => {
        setSelectedComment(comment);
        setShowReportModal(true);
    };

    const closeReportModal = () => {
        setSelectedComment(null);
        setShowReportModal(false);
    };

    const handleReport = async (event: React.FormEvent) => {
        event.preventDefault();
        const reason = (document.getElementById('report-reason') as HTMLSelectElement).value;
        const details = (document.getElementById('report-details') as HTMLTextAreaElement).value;

        // Enviar el reporte al backend
        try {
            const res = await api.post(
                `/faculties/${facultyId}/professors/${professorId}/ratings/${selectedComment?._id}/report`,
                { commentId: [selectedComment?._id], reasons: [reason], reportComment: details }
            );

            if (res.status === 201) {
                console.log('Reporte enviado exitosamente:', res.data);
                setReportSent(true);
                setTimeout(() => setReportSent(false), 3000); // Ocultar la notificación después de 3 segundos
                closeReportModal();
            }
        } catch (error) {
            console.error('Error al enviar el reporte:', error);
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
                                                {
                                                    rating.likes.includes(userId) ? (
                                                        <FaHeart className="text-indigo-600" />
                                                    ) : (
                                                        <FaRegHeart className="text-gray-500" />
                                                    )
                                                }
                                                <span className="text-sm text-gray-500">Me gusta</span>
                                            </button>

                                            <div className="border-l border-gray-200 pl-5">
                                                <div className="flex items-center gap-2">
                                                    <a href="#" className="text-sm text-gray-500 hover:cursor-pointer" onClick={() => openReportModal(rating)}>Reportar</a>
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

            {/* Modal de Reporte */}
            {showReportModal && (
                <div className="fixed inset-0 backdrop-brightness-50 backdrop-opacity-60 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden">
                        <div className="bg-indigo-600 px-6 py-4 flex justify-between items-center">
                            <h3 className="text-lg font-medium text-white">Reportar comentario</h3>
                            <button className="text-white hover:text-gray-200 focus:outline-none" onClick={closeReportModal}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="p-6">
                            <div className="mb-6">
                                <h4 className="text-sm font-medium text-gray-500 mb-2">Comentario reportado:</h4>
                                <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                                    <p className="text-gray-700 text-sm">{selectedComment?.comment}</p>
                                </div>
                            </div>
                            <form id="report-form" onSubmit={handleReport}>
                                <div className="mb-6">
                                    <label htmlFor="report-reason" className="block text-sm font-medium text-gray-700 mb-2">Motivo del reporte</label>
                                    <select id="report-reason" className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                                        <option value="" disabled>Selecciona un motivo</option>
                                        <option value="offensive">Contenido ofensivo o inapropiado</option>
                                        <option value="false">Información falsa o engañosa</option>
                                        <option value="personal">Contiene información personal</option>
                                        <option value="spam">Spam o publicidad</option>
                                        <option value="other">Otro motivo</option>
                                    </select>
                                </div>
                                <div className="mb-6">
                                    <label htmlFor="report-details" className="block text-sm font-medium text-gray-700 mb-2">Detalles adicionales (opcional)</label>
                                    <textarea
                                        id="report-details"
                                        className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="Proporciona más información sobre por qué estás reportando este comentario..."
                                    ></textarea>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-md border border-gray-200 mb-6">
                                    <div className="flex items-start">
                                        <div className="flex-shrink-0">
                                            <i className="fas fa-info-circle text-indigo-500 mt-0.5"></i>
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm text-gray-600">
                                                Tu reporte será revisado por nuestro equipo de moderación. Los reportes ayudan a mantener nuestra comunidad segura y respetuosa.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-end space-x-3">
                                    <button type="button" className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500" onClick={closeReportModal}>
                                        Cancelar
                                    </button>
                                    <button type="submit" className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                        Enviar reporte
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Notificación de reporte enviado */}
            {reportSent && (
                <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg">
                    Reporte enviado exitosamente
                </div>
            )}
        </div>
    );
};

export default ProfessorDetail;