import React, { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { FaRegStar, FaStar, FaStarHalfAlt, FaHeart, FaRegHeart } from 'react-icons/fa';
import ReCAPTCHA from 'react-google-recaptcha';
import api from '../api';
import { ProfessorDetailLoader } from './SkeletonLoader'; // Importa el SkeletonLoader

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
    const { facultyId, professorId } = useParams();
    const queryClient = useQueryClient();
    const [userId, setUserId] = useState<string>('');
    const [showReportModal, setShowReportModal] = useState(false);
    const [selectedComment, setSelectedComment] = useState<RatingType | null>(null);
    const [reportSent, setReportSent] = useState(false);
    const [captchaValue, setCaptchaValue] = useState('');
    const [captchaError, setCaptchaError] = useState('');
    const [, setError] = useState('');
    const [searchParams] = useSearchParams();
    const ratingSuccess = searchParams.get('ratingSuccess') === 'true';
    const addSuccess = searchParams.get('addSuccess') === 'true';
    const [showSuccessMessage, setShowSuccessMessage] = useState(ratingSuccess || addSuccess);

    const SITE_KEY = import.meta.env.VITE_SITE_KEY || '';

    const { data: professor, isLoading: professorLoading } = useQuery({
        queryKey: ['professor', facultyId, professorId],
        queryFn: () => api.get(`/faculties/${facultyId}/professors/${professorId}`).then(res => res.data),
        staleTime: 5 * 60 * 1000
    });

    const { data: ratings = [], isLoading: ratingsLoading } = useQuery({
        queryKey: ['ratings', facultyId, professorId],
        queryFn: () => api.get(`/faculties/${facultyId}/professors/${professorId}/ratings`).then(res => res.data),
    });

    const isLoading = professorLoading || ratingsLoading;

    if (!SITE_KEY) {
        console.error('La clave del sitio de reCAPTCHA no está configurada.');
    }

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
        if (ratingSuccess || addSuccess) {
            queryClient.invalidateQueries({
                queryKey: ['professor', facultyId, professorId]
            });

            const timer = setTimeout(() => {
                setShowSuccessMessage(false);
            }, 5000); // Ocultar el mensaje después de 5 segundos

            return () => clearTimeout(timer);
        }
    }, [ratingSuccess, addSuccess, queryClient, facultyId, professorId]);

    const renderStars = (rating: number) => {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;

        return (
            <div className="flex">
                {[...Array(fullStars)].map((_, i) => (
                    <FaStar key={i} className="text-white dark:text-[#646464]" />
                ))}
                {hasHalfStar && <FaStarHalfAlt className="text-white dark:text-[#646464]" />}
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
                    <FaStar key={i} className="text-indigo-500 dark:text-[#646464]" />
                ))}
                {hasHalfStar && <FaStarHalfAlt className="text-indigo-500 dark:text-[#646464]" />}
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
                { type: 1, userId: userId, captcha: captchaValue }
            );

            if (res.status === 200) {
                const updatedRatings = ratings.map((rating: RatingType) =>
                    rating._id === ratingId ? res.data : rating
                );
                queryClient.setQueryData(['ratings', facultyId, professorId], updatedRatings);
                setCaptchaValue('');
            }
        } catch (error) {
            console.error('Error votando:', error);
        }
    };

    const handleCaptchaChange = (value: string | null) => {
        if (value) {
            setCaptchaValue(value);
            setCaptchaError('');
        } else {
            setCaptchaValue('');
        }
    };

    const openReportModal = (comment: RatingType) => {
        setSelectedComment(comment);
        setShowReportModal(true);
    };

    const closeReportModal = () => {
        setSelectedComment(null);
        setShowReportModal(false);
        setCaptchaValue('');
    };

    const handleReport = async (event: React.FormEvent) => {
        event.preventDefault();
        const reason = (document.getElementById('report-reason') as HTMLSelectElement).value;
        const details = (document.getElementById('report-details') as HTMLTextAreaElement).value;

        if (!reason) {
            setError('Por favor selecciona un motivo de reporte');
            return;
        }

        if (!captchaValue) {
            setCaptchaError('Por favor completa el CAPTCHA');
            return;
        }

        try {
            const res = await api.post(
                `/faculties/${facultyId}/professors/${professorId}/ratings/${selectedComment?._id}/report`,
                { commentId: selectedComment?._id, reasons: [reason], reportComment: details || undefined, captcha: captchaValue }
            );

            if (res.status === 201) {
                setReportSent(true);
                setTimeout(() => setReportSent(false), 8000);
                closeReportModal();
            }
        } catch (error) {
            console.error('Error al enviar el reporte:', error);
        }
    };

    if (isLoading) return <ProfessorDetailLoader />;
    if (!professor) return <div className='text-center text-red-500 py-4'>Profesor no encontrado</div>;

    return (
        <div className="bg-white dark:bg-[#0A0A0A] min-h-screen">
            <main className="container mx-auto px-4 py-6">
                {showSuccessMessage && (
                    <div className="fixed top-15 right-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg notification">
                        {addSuccess ? 'Profesor agregado correctamente' : 'Calificación enviada correctamente'}
                    </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-1">
                        <div className="bg-indigo-600 dark:bg-[#181818] text-white p-6 rounded-lg shadow-md mb-6">
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

                        <div className="bg-white dark:bg-[#181818] rounded-lg border border-gray-200 dark:border-[#383939] shadow-sm p-6 mb-6">
                            <div className="mb-1 dark:text-white font-medium">Explicación</div>
                            <div className="w-full bg-gray-200 dark:bg-[#383939] rounded-full h-1.5 mb-4">
                                <div
                                    className="bg-indigo-600 h-1.5 rounded-full"
                                    style={{ width: `${(professor.ratingStats.averageExplanation / 5) * 100}%` }}
                                ></div>
                            </div>

                            <div className="mb-1 dark:text-white font-medium">Accesible</div>
                            <div className="w-full bg-gray-200 dark:bg-[#383939] rounded-full h-1.5 mb-4">
                                <div
                                    className="bg-indigo-600 h-1.5 rounded-full"
                                    style={{ width: `${(professor.ratingStats.averageAccessibility / 5) * 100}%` }}
                                ></div>
                            </div>

                            <div className="mb-1 dark:text-white font-medium">Dificultad</div>
                            <div className="w-full bg-gray-200 dark:bg-[#383939] rounded-full h-1.5 mb-4">
                                <div
                                    className="bg-indigo-600 h-1.5 rounded-full"
                                    style={{ width: `${(professor.ratingStats.averageDifficulty / 5) * 100}%` }}
                                ></div>
                            </div>

                            <div className="mb-1 dark:text-white font-medium">Asistencia</div>
                            <div className="w-full bg-gray-200 dark:bg-[#383939] rounded-full h-1.5 mb-4">
                                <div
                                    className="bg-indigo-600 h-1.5 rounded-full"
                                    style={{ width: `${(professor.ratingStats.averageAttendance / 5) * 100}%` }}
                                ></div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-[#181818] rounded-lg border border-gray-200 dark:border-[#383939] shadow-sm p-6">
                            <h2 className="dark:text-white font-semibold text-lg mb-4">Información del Profesor</h2>
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Nombre</h3>
                                    <p className='dark:text-white'>{professor.name}</p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Materias</h3>
                                    <ul className="list-disc list-inside text-sm">
                                        {professor.subjects?.slice(0).map((subject: Subject) => (
                                            <li className='dark:text-white' key={subject._id}>
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

                    <div className="md:col-span-2">
                        <h2 className="dark:text-white font-semibold text-lg mb-4">Reseñas de Estudiantes</h2>
                        <div className="space-y-4">
                            {ratings.map((rating: RatingType) => (
                                <div key={rating._id} className="bg-white dark:bg-[#181818] rounded-lg border border-gray-200 dark:border-[#383939] shadow-sm p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            {renderCommentStars(rating.general)}
                                            <p className="text-sm text-gray-500 dark:text-gray-300/70 mt-1">
                                                {rating.subject?.name || 'Materia no encontrada'}
                                            </p>
                                        </div>
                                        <div className="text-sm text-gray-500 dark:text-white">
                                            {new Date(rating.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <p className="text-gray-700 dark:text-white mb-2">{rating.comment}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-300/70 mb-2">A {rating.likes.length} personas les resultó útil</p>
                                    <div className="flex items-center gap-5">
                                        <button
                                            className="flex items-center gap-2 border border-gray-200 dark:border-[#979797] rounded-full py-2 px-4 hover:cursor-pointer"
                                            onClick={() => handleLike(rating._id)}
                                        >
                                            {
                                                rating.likes.includes(userId) ? (
                                                    <FaHeart className="text-indigo-600 dark:text-indigo-400" />
                                                ) : (
                                                    <FaRegHeart className="text-gray-500 dark:text-[#979797]" />
                                                )
                                            }
                                            <span className="text-sm text-gray-500 dark:text-[#979797]">Me gusta</span>
                                        </button>

                                        <div className="border-l border-gray-200 dark:border-[#979797] pl-5">
                                            <div className="flex items-center gap-2">
                                                <a href="#" className="text-sm text-gray-500 dark:text-[#979797] hover:cursor-pointer" onClick={() => openReportModal(rating)}>Reportar</a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>

            {showReportModal && (
                <div className="fixed inset-0 backdrop-brightness-50 backdrop-opacity-60 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-[#181818] rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden">
                        <div className="bg-indigo-600 px-4 py-3 flex justify-between items-center">
                            <h3 className="text-lg font-medium text-white">Reportar comentario</h3>
                            <button className="text-white hover:text-gray-200 focus:outline-none hover:cursor-pointer" onClick={closeReportModal}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="p-4">
                            <div className="mb-4">
                                <h4 className="text-sm font-medium text-gray-500 dark:text-white mb-2">Comentario reportado:</h4>
                                <div className="bg-gray-50 dark:bg-[#383939] p-3 rounded-md border border-gray-200 dark:border-[#383939]">
                                    <p className="text-gray-700 dark:text-white text-sm">{selectedComment?.comment}</p>
                                </div>
                            </div>
                            <form id="report-form" onSubmit={handleReport}>
                                <div className="mb-4">
                                    <label htmlFor="report-reason" className="block text-sm font-medium text-gray-700 dark:text-white  mb-2">Motivo del reporte</label>
                                    <select id="report-reason" className="w-full dark:bg-[#383939] dark:text-white border border-gray-300 dark:border-[#383939] rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                                        <option value="" disabled>Selecciona un motivo</option>
                                        <option value="offensive">Contenido ofensivo o inapropiado</option>
                                        <option value="false">Información falsa o engañosa</option>
                                        <option value="personal">Contiene información personal</option>
                                        <option value="spam">Spam o publicidad</option>
                                        <option value="other">Otro motivo</option>
                                    </select>
                                </div>
                                <div className="mb-4">
                                    <label htmlFor="report-details" className="block text-sm font-medium text-gray-700 dark:text-white  mb-2">Detalles adicionales (opcional)</label>
                                    <textarea
                                        id="report-details"
                                        className="w-full dark:bg-[#383939] dark:text-white border border-gray-300 dark:border-[#383939] rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="Proporciona más información sobre por qué estás reportando este comentario..."
                                    ></textarea>
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">Verificación CAPTCHA</label>
                                    <ReCAPTCHA
                                        sitekey={SITE_KEY}
                                        onChange={handleCaptchaChange}
                                    />
                                    {captchaError && <p className="text-red-600 text-sm mt-1">{captchaError}</p>}
                                </div>
                                <div className="bg-gray-50 dark:bg-[#363639] p-3 rounded-md border border-gray-200 dark:border-[#363639] mb-4">
                                    <div className="flex items-start">
                                        <div className="flex-shrink-0">
                                            <i className="fas fa-info-circle text-indigo-500 mt-0.5"></i>
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm text-gray-600 dark:text-white">
                                                Tu reporte será revisado por nuestro equipo de moderación. Los reportes ayudan a mantener nuestra comunidad segura y respetuosa.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-end space-x-3">
                                    <button type="button" className="px-4 py-2 border border-gray-300 dark:border-[#383939] bg-white dark:bg-[#383939] rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 hover:cursor-pointer hover:bg-gray-50 dark:hover:bg-[#ffffff0d]" onClick={closeReportModal}>
                                        Cancelar
                                    </button>
                                    <button type="submit" className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 hover:cursor-pointer">
                                        Enviar reporte
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {reportSent && (
                <div className="fixed top-15 right-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg notification">
                    Reporte enviado exitosamente
                </div>
            )}
        </div>
    );
};

export default ProfessorDetail;