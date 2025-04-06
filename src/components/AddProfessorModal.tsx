import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import ReCAPTCHA from 'react-google-recaptcha';
import api from '../api';

interface Subject {
    _id: string;
    name: string;
}

interface ProfessorFormData {
    name: string;
    department: string;
    subject: string; // Mantenemos subject como string para mantener consistencia con el backend
}

interface FormErrors {
    name: string;
    department: string;
    subject: string;
    captcha: string;
}

interface AddProfessorModalProps {
    facultyId: string;
    subjects: Subject[];
    onClose: () => void;
    onSuccess: () => void; // Nueva propiedad para el callback de éxito
}

const AddProfessorModal: React.FC<AddProfessorModalProps> = ({ facultyId, subjects, onClose, onSuccess }) => {
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState<ProfessorFormData>({
        name: '',
        department: '',
        subject: ''
    });
    const [captchaValue, setCaptchaValue] = useState('');
    const [errors, setErrors] = useState<FormErrors>({
        name: '',
        department: '',
        subject: '',
        captcha: ''
    });
    // Estados para la animación
    const [isVisible, setIsVisible] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const [, setIsSaving] = useState(false);

    const { mutate, isPending } = useMutation({
        mutationFn: (newProfessor: ProfessorFormData & { captcha: string }) => {
            console.log("Datos a enviar:", newProfessor);
            console.log("URL de la API:", `/faculties/${facultyId}/professors`);
            return api.post(`/faculties/${facultyId}/professors`, newProfessor);
        },
        onSuccess: () => {
            // Invalidamos la query
            queryClient.invalidateQueries({
                queryKey: ['professors', facultyId]
            });
            // Llamamos al callback de éxito
            onSuccess();
            // Iniciamos el cierre del modal
            handleClose();
        },
        onError: (error: any) => {
            console.error("Error en la mutación:", error);
            if (error.response && error.response.data) {
                setErrors(error.response.data.errors);
            } else {
                setErrors({
                    name: '',
                    department: '',
                    subject: '',
                    captcha: 'Error al enviar el formulario. Por favor, inténtalo de nuevo.'
                });
            }
            setIsSaving(false);
        }
    });

    const SITE_KEY = import.meta.env.VITE_SITE_KEY || '';

    if (!SITE_KEY) {
        console.error('La clave del sitio de reCAPTCHA no está configurada.');
    }

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        let isValid = true;
        const newErrors: FormErrors = {
            name: '',
            department: '',
            subject: '',
            captcha: ''
        };

        if (!formData.name.trim()) {
            newErrors.name = 'El nombre es obligatorio';
            isValid = false;
        }

        if (!formData.subject) { // Verificar que se haya seleccionado una materia
            newErrors.subject = 'Debe seleccionar al menos una materia';
            isValid = false;
        }

        if (!captchaValue) {
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
            // Creamos el payload exactamente igual que en el componente original
            const payload = {
                name: formData.name,
                department: formData.department,
                subject: formData.subject,
                captcha: captchaValue
            };

            console.log("Enviando datos:", payload);
            mutate(payload);
        } catch (error) {
            console.error('Error al enviar el formulario:', error);
            // Desactivar estado de guardando en caso de error
            setIsSaving(false);
        }
    };

    const handleCaptchaChange = (value: string | null) => {
        if (value) {
            setCaptchaValue(value);
            setErrors({ ...errors, captcha: '' });
        } else {
            setCaptchaValue('');
        }
    };

    // Evitamos que se cierre el modal si estamos en medio de un envío
    const triggerClose = () => {
        if (!isPending) {
            handleClose();
        }
    };

    // Bloqueamos el desplazamiento del body mientras el modal está abierto
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, []);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            aria-modal="true"
            role="dialog"
        >
            {/* Overlay con transición sincronizada */}
            <div
                className={`absolute inset-0 bg-black transition-opacity duration-300 ease-in-out 
                            ${isVisible && !isClosing ? 'opacity-60' : 'opacity-0'}`}
                onClick={handleClose}
            />

            {/* Contenido del modal con transición sincronizada */}
            <div
                className={`relative bg-white dark:bg-[#202024] rounded-lg border border-gray-200 dark:border-[#202024] shadow-sm p-6 w-full max-w-md transition-all duration-300 ease-in-out ${isVisible && !isClosing
                        ? 'opacity-100 transform translate-y-0 scale-100'
                        : 'opacity-0 transform -translate-y-4 scale-95'
                    }`}
            >
                <h2 className="text-xl font-bold mb-4 dark:text-white">Agregar Nuevo Maestro</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-white">Nombre completo</label>
                        <input
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Ej. Juan Pérez Rodríguez"
                            className="w-full px-3 py-2 dark:text-white dark:bg-[#383939] border border-gray-300 dark:border-[#202024] rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-white">Materia que imparte</label>
                        <select
                            required
                            value={formData.subject}
                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                            className="w-full px-3 py-2 dark:text-white dark:bg-[#383939] border border-gray-300 dark:border-[#202024] rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            <option value="">Selecciona una materia</option>
                            {subjects.map((subj: Subject) => (
                                <option key={subj._id} value={subj._id}>{subj.name}</option>
                            ))}
                        </select>
                        {errors.subject && <p className="text-red-600 text-sm mt-1">{errors.subject}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-white">Verificación CAPTCHA</label>
                        <ReCAPTCHA
                            sitekey={SITE_KEY}
                            onChange={handleCaptchaChange}
                        />
                        {errors.captcha && <p className="text-red-600 text-sm mt-1">{errors.captcha}</p>}
                    </div>

                    <div className="pt-4 flex justify-end space-x-4">
                        <button
                            type="button"
                            onClick={triggerClose}
                            disabled={isPending}
                            className="px-4 py-2 border border-gray-300 dark:border-[#202024] bg-white dark:bg-[#383939] rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 hover:cursor-pointer hover:bg-gray-50 dark:hover:bg-[#ffffff0d] disabled:opacity-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md hover:cursor-pointer text-sm font-medium disabled:opacity-50"
                        >
                            {isPending ? 'Guardando...' : 'Guardar Maestro'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddProfessorModal;