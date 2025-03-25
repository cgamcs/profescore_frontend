import React, { useEffect, useState } from 'react';
import api from '../api';

interface Professor {
  _id: string;
  name: string;
  faculty: { _id: string; abbreviation: string };
  subjects: { _id: string; name: string }[];
  ratingStats: {
    averageGeneral: number;
    totalRatings: number;
  };
}

const TopRatedProfessors: React.FC = () => {
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/faculties');
        setProfessors(response.data.topProfessors);
      } catch (err) {
        setError('Error al cargar los profesores');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="text-center py-10">Cargando...</div>;
  if (error) return <div className="text-center text-red-500 py-10">{error}</div>;

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Maestros Mejor Calificados</h2>
          <p className="text-gray-600">Descubre a los maestros con las mejores calificaciones</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {professors.map((professor) => (
            <div key={professor._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-lg text-gray-900">{professor.name}</h3>
                  <p className="text-indigo-600 text-sm">{professor.faculty.abbreviation}</p>
                </div>
                <div className="bg-indigo-100 text-indigo-800 font-bold rounded px-2 py-1 text-sm">
                  {professor.ratingStats.averageGeneral.toFixed(1)}
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                {professor.subjects.length > 0 ? professor.subjects[0].name : 'Sin materia asignada'}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex">
                  {[...Array(5)].map((_, index) => (
                    <i
                      key={index}
                      className={`fas fa-star ${index < Math.round(professor.ratingStats.averageGeneral)
                          ? 'text-indigo-500'
                          : 'text-gray-300'
                        }`}
                    ></i>
                  ))}
                </div>
                <span className="text-gray-500 text-sm">{professor.ratingStats.totalRatings} reseñas</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TopRatedProfessors;