import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';

interface ISubject {
  _id: string;
  name: string;
  department: {
    _id: string;
    name: string;
  };
  credits: number;
  description: string;
  professorsCount: number;
}

interface IProfessor {
  _id: string;
  name: string;
  ratingStats: {
    averageGeneral: number;
    totalRatings: number;
  };
}

const SubjectDetail = () => {
  const { facultyId, subjectId } = useParams<{ facultyId: string; subjectId: string }>();
  const [subject, setSubject] = useState<ISubject | null>(null);
  const [professors, setProfessors] = useState<IProfessor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSubjectDetails = async () => {
      try {
        const subjectRes = await api.get(`/faculties/${facultyId}/subjects/${subjectId}`);
        const professorsRes = await api.get(`/faculties/${facultyId}/subjects/${subjectId}/professors`);

        // Actualizar el número de profesores en el objeto subject
        const updatedSubject = {
          ...subjectRes.data,
          professorsCount: professorsRes.data.length
        };

        setSubject(updatedSubject);
        setProfessors(professorsRes.data);
      } catch (err) {
        console.error(err);
        setError('Error al cargar los detalles de la materia');
      } finally {
        setLoading(false);
      }
    };

    fetchSubjectDetails();
  }, [facultyId, subjectId]);

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    return (
      <div className="flex">
        {[...Array(5)].map((_, index) => {
          if (index < fullStars) {
            return <i key={index} className="fas fa-star text-indigo-500 text-sm" />;
          }
          if (index === fullStars && hasHalfStar) {
            return <i key={index} className="fas fa-star-half-alt text-indigo-500 text-sm" />;
          }
          return <i key={index} className="far fa-star text-gray-300 text-sm" />;
        })}
      </div>
    );
  };

  if (loading) return <div className="text-center py-4">Cargando detalles de la materia...</div>;
  if (error) return <div className="text-red-500 text-center py-4">{error}</div>;
  if (!subject) return <div className="text-center py-4">No se encontró la materia</div>;

  return (
    <>
      <main className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">{subject.name}</h1>
        </div>

        {/* Subject Info */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Departamento</h3>
              <p>{subject.department.name}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Créditos</h3>
              <p>{subject.credits}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Profesores</h3>
              <p>{subject.professorsCount}</p>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Descripción</h3>
            <p className="text-gray-700">{subject.description}</p>
          </div>
        </div>

        {/* Teachers List */}
        <h2 className="text-xl font-semibold mb-4">Profesores que imparten esta materia</h2>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Profesor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Calificación
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reseñas
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {professors.map(prof => (
                <tr key={prof._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link to={`/facultad/${facultyId}/maestro/${prof._id}`} className="text-indigo-600 font-medium">
                      {prof.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="bg-indigo-100 text-indigo-800 font-bold rounded px-2 py-1 text-sm mr-2">
                        {prof.ratingStats.averageGeneral.toFixed(1)}
                      </span>
                      {renderStars(prof.ratingStats.averageGeneral)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {prof.ratingStats.totalRatings}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
};

export default SubjectDetail;
