import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams, Link, useNavigate } from 'react-router-dom';
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

const ProfessorAdd = () => {
    const queryClient = useQueryClient();
    const { facultyId } = useParams();
    const navigate = useNavigate();
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

    const { mutate, isPending } = useMutation({
        mutationFn: (newProfessor: ProfessorFormData & { captcha: string }) =>
            api.post(`/faculties/${facultyId}/professors`, newProfessor),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['professors', facultyId]
            });
            navigate(`/facultad/${facultyId}/maestros?addSuccess=true`);
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

    const { data: subjects = [], isLoading: subjectsLoading } = useQuery({
        queryKey: ['subjects', facultyId],
        queryFn: () => api.get(`/faculties/${facultyId}/subjects`).then(res =>
            res.data.sort((a: Subject, b: Subject) => a.name.localeCompare(b.name))
        ),
    });

    const isLoading = subjectsLoading;
    const SITE_KEY = import.meta.env.VITE_SITE_KEY || '';

    if (!SITE_KEY) {
        console.error('La clave del sitio de reCAPTCHA no está configurada.');
    }

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

    if (isLoading) return <div className="dark:text-white text-center py-8">Cargando...</div>;

    return (
        <div className="bg-white dark:bg-[#0A0A0A] min-h-screen">
            <main className="container mx-auto px-4 py-6">
                <div className="max-w-2xl mx-auto">
                    <h1 className="dark:text-white text-2xl font-bold mb-6">Agregar Nuevo Maestro</h1>

                    <div className="bg-white dark:bg-[#202024] rounded-lg border border-gray-200 dark:border-[#202024] shadow-sm p-6">
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
                                <Link
                                    to={`/facultad/${facultyId}/maestros`}
                                    className="px-4 py-2 border border-gray-300 dark:border-[#202024] bg-white dark:bg-[#383939] rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 hover:cursor-pointer hover:bg-gray-50 dark:hover:bg-[#ffffff0d]"
                                >
                                    Cancelar
                                </Link>
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
            </main>
        </div>
    );
};

export default ProfessorAdd;