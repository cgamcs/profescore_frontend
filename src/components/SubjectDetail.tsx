import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { SubjectDetailLoader } from './SkeletonLoader';
import api from '../api';

interface IProfessor {
  _id: string;
  name: string;
  ratingStats: {
    averageGeneral: number;
    totalRatings: number;
  };
}

const SubjectDetail = () => {
  const { facultyId, subjectId } = useParams();
  const [error] = useState('');

  const { data: subjectData, isLoading: subjectLoading } = useQuery({
    queryKey: ['subject', facultyId, subjectId],
    queryFn: () => api.get(`/faculties/${facultyId}/subjects/${subjectId}`).then(res => res.data),
  });

  const { data: professorsData, isLoading: professorsLoading } = useQuery({
    queryKey: ['subjectProfessors', facultyId, subjectId],
    queryFn: () => api.get(`/faculties/${facultyId}/subjects/${subjectId}/professors`).then(res => res.data),
  });

  const isLoading = subjectLoading || professorsLoading;

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    return (
      <div className="flex">
        {[...Array(5)].map((_, index) => {
          if (index < fullStars) {
            return <i key={index} className="fas fa-star text-indigo-500 dark:text-[#646464] text-sm" />;
          }
          if (index === fullStars && hasHalfStar) {
            return <i key={index} className="fas fa-star-half-alt text-indigo-500 dark:text-[#646464] text-sm" />;
          }
          return <i key={index} className="far fa-star text-gray-300 text-sm" />;
        })}
      </div>
    );
  };

  if (isLoading) return <SubjectDetailLoader />;
  if (error) return <div className="text-red-500 text-center py-4">{error}</div>;
  if (!subjectData) return <div className="text-center py-4">No se encontró la materia</div>;

  return (
    <>
      <main className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl dark:text-white font-bold">{subjectData.name}</h1>
        </div>

        {/* Subject Info */}
        <div className="bg-white dark:bg-[#181818] rounded-lg border border-gray-200 dark:border-[#383939] shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-[#979797]">Departamento</h3>
              <p className="dark:text-white">{subjectData.department?.name || 'Sin departamento'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-[#979797]">Créditos</h3>
              <p className="dark:text-white">{subjectData.credits}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-[#979797]">Profesores</h3>
              <p className="dark:text-white">{professorsData?.length || 0}</p>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-[#979797] mb-1">Descripción</h3>
            <p className="text-gray-700 dark:text-white">{subjectData.description || 'Sin descripción'}</p>
          </div>
        </div>

        {/* Teachers List */}
        <h2 className="text-xl dark:text-white font-semibold mb-4">Profesores que imparten esta materia</h2>
        <div className="space-y-4">
          {professorsData?.map((professor: IProfessor) => (
            <Link
              key={professor._id}
              to={`/facultad/${facultyId}/maestro/${professor._id}`}
              className="block bg-white dark:bg-[#181818] rounded-lg border border-gray-200 dark:border-[#383939] shadow-sm p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-center gap-1">
                <h3 className="font-medium text-lg dark:text-white">{professor.name}</h3>
                <div className="flex items-center md:gap-2 space-x-4">
                  <div className="flex items-center">
                    <span className="bg-indigo-100 dark:bg-[#646464] text-indigo-800 dark:text-white font-bold rounded px-2 py-1 text-sm mr-2">
                      {professor.ratingStats.averageGeneral.toFixed(1)}
                    </span>
                    {renderStars(professor.ratingStats.averageGeneral)}
                  </div>
                  <span className="text-gray-500 dark:text-[#979797] text-sm text-center">
                    {professor.ratingStats.totalRatings} reseñas
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
};

export default SubjectDetail;
