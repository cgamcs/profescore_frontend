import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

interface Faculty {
  _id: string;
  name: string;
  abbreviation: string;
}

const FacultyList: React.FC = () => {
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    api.get('/faculties')
      .then(response => {
        console.log('Respuesta de la API:', response.data); // Verifica que la API responde bien
  
        // Acceder correctamente al array de facultades
        if (Array.isArray(response.data.faculties)) {
          setFaculties(response.data.faculties);
        } else {
          console.error('La API no devolvió un array en `faculties`:', response.data);
          setFaculties([]); // Evita errores en el render
        }
        
        setLoading(false);
      })
      .catch(err => {
        console.error('Error al obtener facultades:', err);
        setError('Error al cargar las facultades');
        setLoading(false);
      });
  }, []);
  

  if (loading) {
    return <div className="text-center py-10">Cargando...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 py-10">{error}</div>;
  }

  return (
    <section className="pb-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Lista de Facultades</h2>
          <p className="text-gray-600">Selecciona tu facultad</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {Array.isArray(faculties) && faculties.map((faculty) => (
            <Link
              key={faculty._id}
              to={`/facultad/${faculty._id}`}
              className="bg-white border border-gray-200 rounded-lg p-4 text-center hover:bg-indigo-600 hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              <h3 className="font-bold text-lg mb-1">{faculty.abbreviation}</h3>
              <p className="text-xs opacity-80 line-clamp-2">{faculty.name}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FacultyList;