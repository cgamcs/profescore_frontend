import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';

interface ISubject {
  _id: string;
  name: string;
  department: string[];
  professors: string[];
}

interface IProfessor {
  _id: string;
  name: string;
  department: string[];
  subjects: string[];
  ratingStats: {
    averageGeneral: number;
    totalRatings: number;
  };
}

const SubjectsPage = () => {
  const { facultyId } = useParams();
  const [subjects, setSubjects] = useState<ISubject[]>([]);
  const [professors, setProfessors] = useState<IProfessor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const subjectsRes = await api.get(`/faculties/${facultyId}/subjects`);
        const professorsRes = await api.get(`/faculties/${facultyId}/professors`);
        setSubjects(subjectsRes.data);
        setProfessors(professorsRes.data);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Error al cargar la información');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [facultyId]);

  const filteredSubjects = subjects.filter(subject =>
    searchQuery === '' || subject.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredProfessors = professors.filter(professor =>
    searchQuery !== '' && professor.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <div className="text-center py-4">Cargando datos...</div>;
  if (error) return <div className="text-red-500 text-center py-4">{error}</div>;

  return (
    <main className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Materias y Profesores</h1>
      </div>

      {/* Barra de búsqueda */}
      <div className="relative max-w-2xl mx-auto mb-8">
        <input
          type="text"
          placeholder="Buscar por nombre del maestro o materia..."
          className="w-full border border-gray-200 px-4 py-3 rounded-xl shadow-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Lista de materias y profesores */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <ul className="divide-y divide-gray-200">
          {/* Mostrar materias filtradas */}
          {filteredSubjects.map(subject => (
            <li key={subject._id}>
              <Link to={`/facultad/${facultyId}/materia/${subject._id}`} className="block hover:bg-gray-50 p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-medium text-indigo-600">{subject.name}</h3>
                    <p className="text-sm text-gray-500">{subject.department}</p>
                  </div>
                  <div className="text-sm text-gray-500">
                    {subject.professors.length} profesor{subject.professors.length !== 1 && 'es'}
                  </div>
                </div>
              </Link>
            </li>
          ))}

          {/* Mostrar profesores filtrados si la búsqueda coincide con ellos */}
          {filteredProfessors.map(professor => (
            <li key={professor._id}>
              <Link to={`/facultad/${facultyId}/profesor/${professor._id}`} className="block hover:bg-gray-50 p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-medium text-indigo-600">{professor.name}</h3>
                    <p className="text-sm text-gray-500">{professor.department}</p>
                  </div>
                  <div className="text-sm text-gray-500">
                    {professor.ratingStats.totalRatings} reseña{professor.ratingStats.totalRatings !== 1 && 's'}
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
};

export default SubjectsPage;
