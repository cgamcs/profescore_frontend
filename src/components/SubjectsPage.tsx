import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { SubjectPageLoader } from './SkeletonLoader';
import api from '../api';

interface ISubject {
  _id: string;
  name: string;
  department?: {
    _id: string;
    name: string;
  };
  professors: {
    _id: string;
    name: string;
  }[];
}

interface IProfessor {
  _id: string;
  name: string;
  department: string | string[];
  subjects: string[];
  ratingStats: {
    averageGeneral: number;
    totalRatings: number;
  };
}

const SubjectsPage = () => {
  const { facultyId } = useParams();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: subjects = [], isLoading: subjectsLoading } = useQuery({
    queryKey: ['subjects', facultyId],
    queryFn: () => api.get(`/faculties/${facultyId}/subjects`).then(res => res.data),
  });

  const { data: professors = [], isLoading: professorsLoading } = useQuery({
    queryKey: ['professors', facultyId],
    queryFn: () => api.get(`/faculties/${facultyId}/professors`).then(res => res.data),
  });

  const isLoading = subjectsLoading || professorsLoading;

  // Función para normalizar el texto (eliminar acentos y convertir a minúsculas)
  const normalizeText = (text: string) => {
    return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  };

  const filteredSubjects = subjects.filter((subject: ISubject) =>
    searchQuery === '' || normalizeText(subject.name).includes(normalizeText(searchQuery))
  );

  const filteredProfessors = professors.filter((professor: IProfessor) =>
    searchQuery !== '' && normalizeText(professor.name).includes(normalizeText(searchQuery))
  );

  if (isLoading) return <SubjectPageLoader />;

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
        <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 text-black w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {/* Lista de materias y profesores */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <ul className="divide-y divide-gray-200">
          {/* Mostrar materias filtradas */}
          {filteredSubjects.map((subject: ISubject) => (
            <li key={subject._id}>
              <Link to={`/facultad/${facultyId}/materia/${subject._id}`} className="block hover:bg-gray-50 p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-medium text-indigo-600">{subject.name}</h3>
                  </div>
                  <div className="text-sm text-gray-500">
                    {subject.professors.length} profesor{subject.professors.length !== 1 && 'es'}
                  </div>
                </div>
              </Link>
            </li>
          ))}

          {/* Mostrar profesores filtrados si la búsqueda coincide con ellos */}
          {filteredProfessors.map((professor: IProfessor) => (
            <li key={professor._id}>
              <Link to={`/facultad/${facultyId}/profesor/${professor._id}`} className="block hover:bg-gray-50 p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-medium text-indigo-600">{professor.name}</h3>
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