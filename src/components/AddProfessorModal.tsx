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
    subject: string;
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
}

const AddProfessorModal: React.FC<AddProfessorModalProps> = ({ facultyId, subjects, onClose }) => {
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
    const [isOpen, setIsOpen] = useState(false);
    const [isClosing, setIsClosing] = useState(false);

    const { mutate, isPending } = useMutation({
        mutationFn: (newProfessor: ProfessorFormData & { captcha: string }) =>
            api.post(`/faculties/${facultyId}/professors`, newProfessor),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['professors', facultyId]
            });
            handleClose();
        },
        onError: (error: any) => {
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
        }
    });

    const SITE_KEY = import.meta.env.VITE_SITE_KEY || '';

    if (!SITE_KEY) {
        console.error('La clave del sitio de reCAPTCHA no está configurada.');
    }

    // Efecto para la animación de entrada al montar el componente
    useEffect(() => {
        // Pequeño retraso para asegurar que la animación se ejecute correctamente
        const timeout = setTimeout(() => {
            setIsOpen(true);
        }, 10);
        
        return () => clearTimeout(timeout);
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

        if (formData.subject.length === 0) {
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

        try {
            const payload = {
                name: formData.name,
                department: formData.department,
                subject: formData.subject,
                captcha: captchaValue
            };

            mutate(payload);
        } catch (error) {
            console.error('Error adding professor:', error);
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

    return (
        <div className="fixed inset-0 backdrop-brightness-50 backdrop-opacity-60 flex items-center justify-center z-50 transition-opacity duration-300 ease-in-out"
             style={{ opacity: isOpen && !isClosing ? 1 : 0 }}>
            <div className={`bg-white dark:bg-[#202024] rounded-lg border border-gray-200 dark:border-[#202024] shadow-sm p-6 w-full max-w-md transition-all duration-300 ease-in-out ${
                isOpen && !isClosing 
                    ? 'opacity-100 transform translate-y-0 scale-100'
                    : 'opacity-0 transform -translate-y-4 scale-95'
            }`}>
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
                            onClick={handleClose}
                            className="px-4 py-2 border border-gray-300 dark:border-[#202024] bg-white dark:bg-[#383939] rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 hover:cursor-pointer hover:bg-gray-50 dark:hover:bg-[#ffffff0d]"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md hover:cursor-pointer text-sm font-medium"
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