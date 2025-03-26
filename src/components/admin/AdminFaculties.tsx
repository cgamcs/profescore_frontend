import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

interface Faculty {
  _id: string;
  name: string;
  abbreviation: string;
  departments: string[];
}

const AdminFaculties: React.FC = () => {
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState<Faculty | null>(null);
  const [confirmationInput, setConfirmationInput] = useState('');
  const [error, setError] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  // Fetch faculties from API
  const fetchFaculties = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/admin/faculty', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Error al obtener facultades');

      const data = await response.json();
      setFaculties(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    }
  };

  useEffect(() => {
    fetchFaculties();
  }, []);

  useEffect(() => {
    if (location.state?.refresh) {
      fetchFaculties();
      navigate('.', { state: {} });
    }
  }, [location.state, navigate]);

  const normalizeString = (str: string) => {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  };

  // Handle search
  const filteredFaculties = faculties.filter(faculty =>
    normalizeString(faculty.name).includes(normalizeString(searchTerm)) ||
    normalizeString(faculty.abbreviation).includes(normalizeString(searchTerm))
  );

  // Handle deletion
  const handleDelete = async () => {
    if (!selectedFaculty) return;

    // Check if confirmation input matches exactly
    if (normalizeString(confirmationInput.trim()) !== normalizeString(selectedFaculty.name.trim())) {
      setError('El nombre ingresado no coincide');
      return;
    }

    try {
      // Send delete request to backend
      const response = await fetch(`http://localhost:4000/api/admin/faculty/${selectedFaculty._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Error al eliminar facultad');

      // Remove faculty from local state
      setFaculties(prev => prev.filter(f => f._id !== selectedFaculty._id));

      // Reset modal state
      setShowDeleteModal(false);
      setConfirmationInput('');
      setSelectedFaculty(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar');
    }
  };

  if (error) return <div className="text-red-500 text-center py-8">{error}</div>;

  return (
    <div className="bg-white min-h-screen">
      {/* Contenido principal */}
      <main className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Administrar Facultades</h1>
          <Link
            to="/admin/facultades/agregar"
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-center px-4 py-2 rounded-md text-sm font-medium flex gap-2 items-center"
          >
            <div className="hidden md:block">
              <i className="fa-solid fa-plus"></i>
            </div>
            Agregar Facultad
          </Link>
        </div>

        {/* Barra de búsqueda */}
        <div className="relative w-full max-w-md mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar por nombre o abreviatura..."
              className="w-full border border-gray-200 px-4 py-3 rounded-xl shadow-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 text-black w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Tabla de facultades */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Abreviatura</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Departamentos</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredFaculties.map(faculty => (
                  <tr key={faculty._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-medium">{faculty.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{faculty.abbreviation}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{faculty.departments.length}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-2">
                        <Link
                          to={`/admin/facultades/${faculty._id}`}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <i className="fa-solid fa-pen-to-square"></i>
                        </Link>
                        <button
                          onClick={() => {
                            setSelectedFaculty(faculty);
                            setShowDeleteModal(true);
                          }}
                          className="text-red-600 hover:text-red-900"
                        >
                          <i className="fa-solid fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredFaculties.length === 0 && (
            <div className="text-center py-4 text-gray-500">
              No se encontraron facultades
            </div>
          )}
        </div>
      </main>

      {/* Secure Delete Modal */}
      {showDeleteModal && selectedFaculty && (
        <div className="fixed inset-0 backdrop-brightness-50 backdrop-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Eliminar Facultad</h3>
            <p className="text-sm text-gray-500 mb-4">
              Estás a punto de eliminar la facultad <strong>"{selectedFaculty.name}"</strong>.
              Esta acción eliminará TODA la información relacionada, incluyendo:
              <ul className="list-disc list-inside text-sm text-gray-600 mt-2">
                <li>Departamentos</li>
                <li>Materias</li>
                <li>Profesores</li>
                <li>Calificaciones de profesores</li>
              </ul>
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Para confirmar, escribe el nombre exacto de la facultad:
            </p>
            <input
              type="text"
              placeholder={`Escribe "${selectedFaculty.name}"`}
              value={confirmationInput}
              onChange={(e) => setConfirmationInput(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 mb-4 text-sm"
            />
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setConfirmationInput('');
                  setError('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
                disabled={normalizeString(confirmationInput.trim()) !== normalizeString(selectedFaculty.name.trim())}
              >
                Eliminar Permanentemente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFaculties;