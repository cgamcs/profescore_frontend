import React, { useEffect, useState } from 'react';
import { X } from 'react-feather';
import ReCAPTCHA from 'react-google-recaptcha';

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

interface ReportModalProps {
    showReportModal: boolean;
    isClosing: boolean;
    selectedComment: RatingType | null;
    captchaValue: string;
    captchaError: string;
    closeReportModal: () => void;
    handleReport: (event: React.FormEvent) => void;
    handleCaptchaChange: (value: string | null) => void;
    SITE_KEY: string;
}

const ReportModal: React.FC<ReportModalProps> = ({
    showReportModal,
    isClosing,
    selectedComment,
    captchaError,
    closeReportModal,
    handleReport,
    handleCaptchaChange,
    SITE_KEY
}) => {
    const [isVisible, setIsVisible] = useState(false);

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            closeReportModal();
        }
    };

    // Control of scroll when modal is open
    useEffect(() => {
        if (showReportModal) {
            // Block scrolling when modal is open
            document.body.style.overflow = 'hidden';
            
            // Ensure the modal is visible - scroll to top if needed
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        } else {
            // Restore scrolling when modal is closed
            document.body.style.overflow = 'auto';
        }

        // Clean effect when unmounting
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [showReportModal]);

    // ESC key handler to close modal
    useEffect(() => {
        const handleEscKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && showReportModal) {
                closeReportModal();
            }
        };

        if (showReportModal) {
            document.addEventListener('keydown', handleEscKey);
        }

        return () => {
            document.removeEventListener('keydown', handleEscKey);
        };
    }, [showReportModal, closeReportModal]);

    // Reset form when modal opens
    useEffect(() => {
        if (showReportModal) {
            // Add timeout to reset form state
            setTimeout(() => {
                if (document.getElementById('report-form')) {
                    (document.getElementById('report-form') as HTMLFormElement).reset();
                }
            }, 100);
        }
    }, [showReportModal]);

    // Animation effect when mounting component
    useEffect(() => {
        if (showReportModal) {
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    setIsVisible(true);
                });
            });
        } else {
            setIsVisible(false);
        }
    }, [showReportModal]);

    if (!showReportModal && !isClosing) return null;

    return (
        <>
            {/* Backdrop overlay */}
            <div
                className={`fixed inset-0 bg-black transition-opacity duration-300 ease-in-out z-40 
                            ${isVisible && !isClosing ? 'opacity-60' : 'opacity-0'}`}
                onClick={closeReportModal}
            />
            
            {/* Modal container - fixed position relative to viewport */}
            <div
                className={`
                    fixed inset-0 z-50 flex items-start justify-center pt-10 lg:pt-2 xl:pt-20 2xl:pt-30 px-4
                    ${isClosing ? 'pointer-events-none' : ''}
                `}
                onClick={handleBackdropClick}
            >
                {/* Modal content */}
                <div
                    className={`
                        modal-content bg-white dark:bg-[#202024] lg:text-xs xl:text-base rounded-lg shadow-xl max-w-md w-full overflow-hidden
                        transition-all duration-300 ease-in-out
                        ${isVisible && !isClosing ? 'opacity-100 transform translate-y-0 scale-100' : 'opacity-0 transform -translate-y-4 scale-95'}
                    `}
                    onClick={(e) => e.stopPropagation()}
                >
                    <button
                        onClick={closeReportModal}
                        className="absolute top-2 right-2 p-1 rounded-lg text-gray-500 hover:text-gray-700 dark:text-white dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2f2f33] transition-colors duration-200 z-10"
                    >
                        <X size={20} />
                    </button>
                    <div className="bg-indigo-600 px-4 py-3">
                        <h3 className="lg:text-xs xl:text-lg font-medium text-white">Reportar comentario</h3>
                    </div>
                    <div className="p-4">
                        <div className="mb-4">
                            <h4 className="lg:text-xs xl:text-sm font-medium text-gray-500 dark:text-white mb-2">Comentario reportado:</h4>
                            <div className="bg-gray-50 dark:bg-[#383939] p-3 rounded-md border border-gray-200 dark:border-[#202024]">
                                <p className="text-gray-700 dark:text-white lg:text-xs xl:text-sm">{selectedComment?.comment}</p>
                            </div>
                        </div>
                        <form id="report-form" onSubmit={handleReport}>
                            <div className="mb-4">
                                <label htmlFor="report-reason" className="block lg:text-xs xl:text-sm font-medium text-gray-700 dark:text-white mb-2">Motivo del reporte</label>
                                <select
                                    id="report-reason"
                                    className="w-full dark:bg-[#383939] dark:text-white border border-gray-300 dark:border-[#202024] rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                >
                                    <option value="" disabled selected>Selecciona un motivo</option>
                                    <option value="offensive">Contenido ofensivo o inapropiado</option>
                                    <option value="false">Información falsa o engañosa</option>
                                    <option value="personal">Contiene información personal</option>
                                    <option value="spam">Spam o publicidad</option>
                                    <option value="other">Otro motivo</option>
                                </select>
                            </div>
                            <div className="mb-4">
                                <label htmlFor="report-details" className="block lg:text-xs xl:text-sm font-medium text-gray-700 dark:text-white mb-2">Detalles adicionales (opcional)</label>
                                <textarea
                                    id="report-details"
                                    className="w-full dark:bg-[#383939] dark:text-white border border-gray-300 dark:border-[#202024] rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="Proporciona más información sobre por qué estás reportando este comentario..."
                                ></textarea>
                            </div>
                            <div className="mb-4">
                                <label className="block lg:text-xs xl:text-sm font-medium text-gray-700 dark:text-white mb-2">Verificación CAPTCHA</label>
                                <ReCAPTCHA
                                    sitekey={SITE_KEY}
                                    onChange={handleCaptchaChange}
                                />
                                {captchaError && <p className="text-red-600 lg:text-xs xl:text-sm mt-1">{captchaError}</p>}
                            </div>
                            <div className="bg-gray-50 dark:bg-[#363639] p-3 rounded-md border border-gray-200 dark:border-[#363639] mb-4">
                                <div className="flex items-start">
                                    <div className="flex-shrink-0">
                                        <i className="fas fa-info-circle text-indigo-500 mt-0.5"></i>
                                    </div>
                                    <div className="ml-3">
                                        <p className="lg:text-xs xl:text-sm text-gray-600 dark:text-white">
                                            Tu reporte será revisado por nuestro equipo de moderación. Los reportes ayudan a mantener nuestra comunidad segura y respetuosa.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    className="px-4 py-2 border border-gray-300 dark:border-[#202024] bg-white dark:bg-[#383939] rounded-md shadow-sm lg:text-xs xl:text-sm font-medium text-gray-700 dark:text-gray-200 hover:cursor-pointer hover:bg-gray-50 dark:hover:bg-[#ffffff0d] transition-colors duration-200"
                                    onClick={closeReportModal}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 border border-transparent rounded-md shadow-sm lg:text-xs xl:text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 hover:cursor-pointer transition-colors duration-200"
                                >
                                    Enviar reporte
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ReportModal;