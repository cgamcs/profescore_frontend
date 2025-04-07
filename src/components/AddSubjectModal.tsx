import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import ReCAPTCHA from 'react-google-recaptcha';
import api from '../api';
import Portal from './Portal';

interface Subject {
    _id: string;
    name: string;
}

interface FormData {
    name: string;
    credits: number;
    description: string;
    department?: string;
    professors?: string[];
    captcha: string; // Nuevo campo para el CAPTCHA
}

interface FormErrors {
    name: string;
    credits: string;
    description: string;
    department?: string;
    captcha: string; // Nuevo campo para el CAPTCHA
}

interface AddSubjectModalProps {
    facultyId: string;
    subjects: Subject[];
    onClose: () => void;
    onSuccess: () => void; // Nueva propiedad para el callback de éxito
}

const AddSubjectModal: React.FC<AddSubjectModalProps> = ({ facultyId, onClose, onSuccess }) => {
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState<FormData>({
        name: '',
        credits: 0,
        description: '',
        department: '',
        professors: [],
        captcha: '' // Inicializar el campo de CAPTCHA
    });
    const [errors, setErrors] = useState<FormErrors>({
        name: '',
        credits: '',
        description: '',
        captcha: '' // Inicializar el campo de errores para el CAPTCHA
    });
    // Estados para la animación
    const [isVisible, setIsVisible] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const { mutate } = useMutation({
        mutationFn: (newSubject: FormData) =>
            api.post(`/faculties/${facultyId}/subjects`, newSubject),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['subjects', facultyId]
            });
            onSuccess(); // Llamar al callback de éxito
            handleClose();
        },
        onError: (error: any) => {
            // Desactivar estado de guardando
            setIsSaving(false);

            console.error('Error response:', error.response);
            if (error.response && error.response.data) {
                if (error.response.data.errors) {
                    setErrors(error.response.data.errors);
                } else if (error.response.data.error) {
                    // Si el error viene como un solo mensaje
                    setErrors({
                        name: error.response.data.error,
                        credits: '',
                        description: '',
                        captcha: ''
                    });
                }
            } else {
                setErrors({
                    name: '',
                    credits: '',
                    description: 'Error al enviar el formulario. Por favor, inténtalo de nuevo.',
                    captcha: ''
                });
            }
        }
    });

    // Efecto para la animación de entrada al montar el componente
    useEffect(() => {
        // Usamos requestAnimationFrame para asegurar que los estilos iniciales estén aplicados
        // antes de iniciar la transición
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                setIsVisible(true);
            });
        });

        return () => {
            document.body.style.overflow = 'auto';
        };
    }, []);

    // Función para manejar el cierre con animación
    const handleClose = () => {
        setIsClosing(true);
        // Esperamos a que termine la animación antes de cerrar el modal
        setTimeout(() => {
            onClose();
        }, 300); // Duración de la animación
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: name === 'credits' ? parseInt(value) || 0 : value
        });
    };

    const handleCaptchaChange = (value: string | null) => {
        if (value) {
            setFormData({ ...formData, captcha: value });
            setErrors({ ...errors, captcha: '' });
        } else {
            setFormData({ ...formData, captcha: '' });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        let isValid = true;
        const newErrors: FormErrors = {
            name: '',
            credits: '',
            description: '',
            captcha: ''
        };

        if (!formData.name.trim()) {
            newErrors.name = 'El nombre es obligatorio';
            isValid = false;
        }

        if (!formData.credits || formData.credits < 1 || formData.credits > 22) {
            newErrors.credits = 'Los créditos deben estar entre 1 y 22';
            isValid = false;
        }

        if (formData.description && formData.description.length > 500) {
            newErrors.description = 'La descripción no puede exceder 500 caracteres';
            isValid = false;
        }

        if (!formData.captcha) {
            newErrors.captcha = 'Por favor completa el CAPTCHA';
            isValid = false;
        }

        if (!isValid) {
            setErrors(newErrors);
            return;
        }

        // Activar estado de guardando
        setIsSaving(true);

        try {
            mutate(formData);
        } catch (error) {
            console.error('Error adding subject:', error);
            // Desactivar estado de guardando en caso de error
            setIsSaving(false);
        }
    };

    // Bloqueamos el desplazamiento del body mientras el modal está abierto
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, []);

    const SITE_KEY = import.meta.env.VITE_SITE_KEY || '';

    if (!SITE_KEY) {
        console.error('La clave del sitio de reCAPTCHA no está configurada.');
    }

    return (
        <Portal>
            <div
                className="fixed inset-0 z-50 flex items-center justify-center"
                aria-modal="true"
                role="dialog"
            >
                {/* Overlay con transición sincronizada */}
                <div
                    className={`absolute inset-0 bg-black transition-opacity duration-300 ease-in-out ${isVisible && !isClosing ? 'opacity-60' : 'opacity-0'
                        }`}
                    onClick={handleClose}
                />

                {/* Contenido del modal con transición sincronizada */}
                <div
                    className={`relative bg-white dark:bg-[#202024] rounded-lg border border-gray-200 dark:border-[#202024] shadow-sm p-6 w-full max-w-md transition-all duration-300 ease-in-out ${isVisible && !isClosing
                        ? 'opacity-100 transform translate-y-0 scale-100'
                        : 'opacity-0 transform -translate-y-4 scale-95'
                        }`}
                >
                    <h2 className="text-xl font-bold mb-4 dark:text-white">Agregar Nueva Materia</h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-white">
                                Nombre de la Materia
                            </label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                className={`w-full dark:text-white px-3 py-2 dark:bg-[#383939] border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${errors.name ? 'border-red-500' : 'border-gray-300 dark:border-[#202024]'}`}
                                placeholder="Ej. Cálculo Diferencial"
                                value={formData.name}
                                onChange={handleChange}
                            />
                            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="credits" className="block text-sm font-medium text-gray-700 dark:text-white">
                                Créditos
                            </label>
                            <input
                                id="credits"
                                name="credits"
                                type="number"
                                min="1"
                                max="22"
                                className={`w-full dark:text-white px-3 py-2 dark:bg-[#383939] border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${errors.credits ? 'border-red-500' : 'border-gray-300 dark:border-[#202024]'}`}
                                placeholder="Ej. 5"
                                value={formData.credits}
                                onChange={handleChange}
                            />
                            {errors.credits && <p className="text-red-500 text-sm mt-1">{errors.credits}</p>}
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-white">
                                Descripción (opcional)
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                className={`w-full dark:text-white px-3 py-2 dark:bg-[#383939] border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${errors.description ? 'border-red-500' : 'border-gray-300 dark:border-[#202024]'}`}
                                placeholder="Describe brevemente el contenido de la materia..."
                                value={formData.description}
                                onChange={handleChange}
                            ></textarea>
                            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-white">Verificación CAPTCHA</label>
                            <ReCAPTCHA
                                sitekey={SITE_KEY}
                                onChange={handleCaptchaChange}
                            />
                            {errors.captcha && <p className="text-red-500 text-sm mt-1">{errors.captcha}</p>}
                        </div>

                        <div className="pt-4 flex justify-end space-x-4">
                            <button
                                type="button"
                                onClick={handleClose}
                                className="px-4 py-2 border border-gray-300 dark:border-[#202024] bg-white dark:bg-[#383939] rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 hover:cursor-pointer hover:bg-gray-50 dark:hover:bg-[#ffffff0d] disabled:opacity-50"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md hover:cursor-pointer text-sm font-medium disabled:opacity-50"
                            >
                                {isSaving ? 'Guardando...' : 'Guardar Materia'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Portal>
    );
};

export default AddSubjectModal;