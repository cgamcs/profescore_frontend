import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { FacultyListLoader } from './SkeletonLoader';
import api from '../api';

const FacultyList: React.FC = () => {
  const { data: faculties = [], isLoading, error } = useQuery({
    queryKey: ['faculties'],
    queryFn: () => api.get('/faculties').then(res => res.data.faculties),
    staleTime: 5 * 60 * 1000 // 5 minutos
  });

  if (isLoading) return <FacultyListLoader />;
  if (error) return <div className="text-center text-red-500 py-10">Error al cargar las facultades</div>;

  return (
    <section className="pb-12 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-300/90 mb-2">Lista de Facultades</h2>
          <p className="text-gray-600 dark:text-gray-300">Selecciona tu facultad</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {Array.isArray(faculties) && faculties.map((faculty) => (
            <Link
              key={faculty._id}
              to={`/facultad/${faculty._id}`}
              className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4 text-center hover:bg-indigo-600 hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              <h3 className="dark:text-white font-bold text-lg mb-1">{faculty.abbreviation}</h3>
              <p className="dark:text-white text-xs opacity-80 line-clamp-2">{faculty.name}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FacultyList;