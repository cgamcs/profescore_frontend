import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import ReCAPTCHA from 'react-google-recaptcha';
import api from '../api';

interface Department {
    _id: string;
    name: string;
}

interface Subject {
    _id: string;
    name: string;
}

const ProfessorAdd = () => {
    const { facultyId } = useParams<{ facultyId: string }>();
    const navigate = useNavigate();
    const [departments, setDepartments] = useState<Department[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        department: '',
        subject: '',
        biography: ''
    });
    const [captchaValue, setCaptchaValue] = useState('');
    const [captchaError, setCaptchaError] = useState('');

    const SITE_KEY = import.meta.env.VITE_SITE_KEY || '';

    if (!SITE_KEY) {
        console.error('La clave del sitio de reCAPTCHA no está configurada.');
    }

    console.log('Clave del sitio de reCAPTCHA:', SITE_KEY);

    // Obtener departamentos y materias
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [deptRes, subjRes] = await Promise.all([
                    api.get(`/faculties/${facultyId}/departments`),
                    api.get(`/faculties/${facultyId}/subjects`)
                ]);

                setDepartments(deptRes.data);
                setSubjects(subjRes.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [facultyId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!captchaValue) {
            setCaptchaError('Por favor completa el CAPTCHA');
            return;
        }

        try {
            await api.post(`/faculties/${facultyId}/professors`, {
                ...formData,
                subject: formData.subject,
                captcha: captchaValue
            });
            navigate(`/facultad/${facultyId}/maestros`);
        } catch (error) {
            console.error('Error creating professor:', error);
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

    if (loading) return <div className="text-center py-8">Cargando...</div>;

    return (
        <div className="bg-white min-h-screen">
            <main className="container mx-auto px-4 py-6">
                <div className="max-w-2xl mx-auto">
                    <h1 className="text-2xl font-bold mb-6">Agregar Nuevo Maestro</h1>

                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Campo Nombre */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Nombre completo</label>
                                <input
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    placeholder="Ej. Juan Pérez Rodríguez"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>

                            {/* Select Departamento */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Departamento</label>
                                <select
                                    required
                                    value={formData.department}
                                    onChange={(e) => setFormData({...formData, department: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                >
                                    <option value="">Selecciona un departamento</option>
                                    {departments.map(dept => (
                                        <option key={dept._id} value={dept._id}>{dept.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Select Materia */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Materia que imparte</label>
                                <select
                                    required
                                    value={formData.subject}
                                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                >
                                    <option value="">Selecciona una materia</option>
                                    {subjects.map(subj => (
                                        <option key={subj._id} value={subj._id}>{subj.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Biografía */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Biografía</label>
                                <textarea
                                    value={formData.biography}
                                    onChange={(e) => setFormData({...formData, biography: e.target.value})}
                                    rows={4}
                                    placeholder="Información sobre la formación académica y experiencia del profesor..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                ></textarea>
                            </div>

                            {/* Verificación CAPTCHA */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Verificación CAPTCHA</label>
                                <ReCAPTCHA
                                    sitekey={SITE_KEY}
                                    onChange={handleCaptchaChange}
                                />
                                {captchaError && <p className="text-red-600 text-sm mt-1">{captchaError}</p>}
                            </div>

                            {/* Botones */}
                            <div className="pt-4 flex justify-end space-x-4">
                                <Link
                                    to={`/facultad/${facultyId}/maestros`}
                                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                                >
                                    Cancelar
                                </Link>
                                <button
                                    type="submit"
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                                >
                                    Guardar Maestro
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
