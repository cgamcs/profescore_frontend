import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReCAPTCHA from 'react-google-recaptcha';
import api from '../api';

interface RatingForm {
  general: number;
  explanation: number;
  accessibility: number;
  difficulty: number;
  attendance: number;
  wouldRetake: boolean;
  comment: string;
  subject: string;
}

const ProfessorRating = () => {
  const { facultyId, professorId } = useParams<{ facultyId: string; professorId: string }>();
  const [subjects, setSubjects] = useState<Array<{ _id: string, name: string }>>([]);
  const navigate = useNavigate();
  const [professor, setProfessor] = useState<{ name: string } | null>(null);
  const [formData, setFormData] = useState<RatingForm>({
    general: 5,
    explanation: 3,
    accessibility: 3,
    difficulty: 3,
    attendance: 3,
    wouldRetake: true,
    comment: '',
    subject: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [captchaValue, setCaptchaValue] = useState('');
  const [captchaError, setCaptchaError] = useState('');

  const SITE_KEY = import.meta.env.VITE_SITE_KEY || '';

  if (!SITE_KEY) {
    console.error('La clave del sitio de reCAPTCHA no está configurada.');
  }

  console.log('Clave del sitio de reCAPTCHA:', SITE_KEY);

  useEffect(() => {
    if (facultyId) {
      api.get(`/faculties/${facultyId}/subjects`)
        .then(response => {
          setSubjects(response.data);
        })
        .catch(err => {
          console.error('Error al cargar las materias:', err);
        });
    }
  }, [facultyId]);

  useEffect(() => {
    api.get(`/faculties/${facultyId}/professors/${professorId}`)
      .then(response => setProfessor(response.data))
      .catch(() => setError('No se pudo cargar la información del profesor'));
  }, [facultyId, professorId]);

  const handleRatingChange = (field: keyof RatingForm, value: number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, subject: e.target.value }));
  };

  const handleWouldRetakeChange = (value: boolean) => {
    setFormData(prev => ({ ...prev, wouldRetake: value }));
  };

  const handleCaptchaChange = (value: string | null) => {
    if (value) {
      setCaptchaValue(value);
      setCaptchaError('');
    } else {
      setCaptchaValue('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.subject) {
      setError('Por favor selecciona una materia');
      return;
    }

    if (!captchaValue) {
      setCaptchaError('Por favor completa el CAPTCHA');
      return;
    }

    setLoading(true);

    try {
      const ratingData = {
        ...formData,
        professor: professorId,
        captcha: captchaValue
      };

      console.log('Datos a enviar:', ratingData);

      const response = await api.post(`/faculties/${facultyId}/professors/${professorId}/ratings`, ratingData);

      if (response.status === 201) {
        navigate(`/facultad/${facultyId}/maestro/${professorId}`);
      }
    } catch (error) {
      console.log(error);
      setError('Error al enviar la calificación. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return <p className="text-red-600 text-center">{error}</p>;
  }

  const renderRatingButtons = (field: keyof RatingForm) => {
    return [1, 2, 3, 4, 5].map(value => (
      <div key={`${field}-${value}`} className="flex flex-col items-center">
        <button
          type="button"
          onClick={() => handleRatingChange(field, value)}
          className={`w-10 h-10 rounded-full flex items-center justify-center cursor-pointer ${formData[field] === value ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
        >
          {value}
        </button>
        {(value === 1 && field === 'general') && <span className="text-xs mt-1">Malo</span>}
        {(value === 5 && field === 'general') && <span className="text-xs mt-1">Excelente</span>}
      </div>
    ));
  };

  return (
    <div className="bg-white min-h-screen">
      <main className="container mx-auto px-4 py-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Calificar a {professor?.name}</h1>

          <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Calificación General</label>
              <div className="flex space-x-2">
                {renderRatingButtons('general')}
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700">Materia</label>
              <select
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleSubjectChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="" disabled>Selecciona una materia</option>
                {subjects.map(subject => (
                  <option key={subject._id} value={subject._id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Explicación</label>
              <div className="flex space-x-2">
                {renderRatingButtons('explanation')}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Accesibilidad</label>
              <div className="flex space-x-2">
                {renderRatingButtons('accessibility')}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Dificultad</label>
              <div className="flex space-x-2">
                {renderRatingButtons('difficulty')}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Asistencia</label>
              <div className="flex space-x-2">
                {renderRatingButtons('attendance')}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">¿Tomarías clase con este profesor nuevamente?</label>
              <div className="flex space-x-4">
                <div className="flex items-center">
                  <input
                    id="wouldTakeAgain-yes"
                    name="wouldTakeAgain"
                    type="radio"
                    checked={formData.wouldRetake === true}
                    onChange={() => handleWouldRetakeChange(true)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  />
                  <label htmlFor="wouldTakeAgain-yes" className="ml-2 block text-sm text-gray-700">Sí</label>
                </div>
                <div className="flex items-center">
                  <input
                    id="wouldTakeAgain-no"
                    name="wouldTakeAgain"
                    type="radio"
                    checked={formData.wouldRetake === false}
                    onChange={() => handleWouldRetakeChange(false)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  />
                  <label htmlFor="wouldTakeAgain-no" className="ml-2 block text-sm text-gray-700">No</label>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="comment" className="block text-sm font-medium text-gray-700">Comentario</label>
              <textarea
                id="comment"
                name="comment"
                placeholder="Comparte tu experiencia con este profesor..."
                rows={5}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={formData.comment}
                onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
              ></textarea>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Verificación CAPTCHA</label>
              <ReCAPTCHA
                sitekey={SITE_KEY}
                onChange={handleCaptchaChange}
              />
              {captchaError && <p className="text-red-600 text-sm mt-1">{captchaError}</p>}
            </div>

            <div className="pt-4 flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:cursor-pointer hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium hover:cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Enviando...' : 'Enviar Calificación'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default ProfessorRating;