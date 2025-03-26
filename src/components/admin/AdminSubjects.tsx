import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

interface IFaculty {
  _id: string;
  name: string;
}

interface ISubject {
  _id: string;
  name: string;
  credits: number;
  department: string[];
  professors: string[];
  faculty: IFaculty;
}

const AdminSubjects: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [materias, setMaterias] = useState<ISubject[]>([]);
  const [faculties, setFaculties] = useState<IFaculty[]>([]);
  const [materiaIdToDelete, setMateriaIdToDelete] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState<string | null>(null);
  const [confirmationInput, setConfirmationInput] = useState('');
  const [confirmationError, setConfirmationError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Obtener todas las materias desde la API
    const fetchMaterias = async () => {
      try {
        const response = await axios.get('http://localhost:4000/api/admin/subjects', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        setMaterias(response.data);
      } catch (error) {
        console.error('Error al obtener las materias:', error);
      }
    };

    // Obtener todas las facultades desde la API
    const fetchFaculties = async () => {
      try {
        const response = await axios.get('http://localhost:4000/api/admin/faculty', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        setFaculties(response.data);
      } catch (error) {
        console.error('Error al obtener las facultades:', error);
      }
    };

    fetchMaterias();
    fetchFaculties();
  }, []);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleDeleteClick = (id: string, name: string) => {
    setMateriaIdToDelete(id);
    setShowModal(true);
  };

  const handleCancelDelete = () => {
    setShowModal(false);
    setMateriaIdToDelete(null);
    setConfirmationInput('');
    setConfirmationError('');
  };

  const handleConfirmDelete = async () => {
    if (materiaIdToDelete !== null) {
      const materiaToDelete = materias.find(m => m._id === materiaIdToDelete);
      if (materiaToDelete && normalizeString(confirmationInput) === normalizeString(materiaToDelete.name)) {
        try {
          await axios.delete(`http://localhost:4000/api/admin/faculty/${materiaToDelete.faculty._id}/subject/${materiaIdToDelete}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          setMaterias(materias.filter(materia => materia._id !== materiaIdToDelete));
          setShowModal(false);
          setMateriaIdToDelete(null);
          setConfirmationInput('');
          setConfirmationError('');
        } catch (error) {
          console.error('Error al eliminar la materia:', error);
        }
      } else {
        setConfirmationError('El nombre no coincide. Por favor, inténtalo de nuevo.');
      }
    }
  };

  const handleAddMateriaClick = () => {
    setShowAddModal(true);
  };

  const handleFacultySelect = (facultyId: string) => {
    setSelectedFaculty(facultyId);
  };

  const handleNextClick = () => {
    if (selectedFaculty) {
      navigate(`/admin/facultad/${selectedFaculty}/materia/agregar`);
      setShowAddModal(false);
    }
  };

  const normalizeString = (str: string) => {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  };

  const filteredMaterias = materias.filter(materia =>
    normalizeString(materia.name).includes(normalizeString(searchTerm)) ||
    normalizeString(materia.faculty.name).includes(normalizeString(searchTerm))
  );

  return (
    <div className="bg-white min-h-screen">
      <main className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Administrar Materias</h1>
          <button
            onClick={handleAddMateriaClick}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center"
          >
            <i className="fas fa-plus mr-2"></i> Agregar Materia
          </button>
        </div>

        <div className="relative w-full max-w-md mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar por nombre o facultad..."
              className="w-full border border-gray-200 px-4 py-3 rounded-xl shadow-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
              value={searchTerm}
              onChange={handleSearch}
            />
            <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 text-black w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Facultad</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Créditos</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profesores</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMaterias.map(materia => (
                  <tr key={materia._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-medium">{materia.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{materia.faculty.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{materia.credits}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{materia.professors.length}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-2">
                        <Link to={`/admin/facultad/${materia.faculty._id}/materia/${materia._id}`} className="text-indigo-600 hover:text-indigo-900">
                          <i className="fas fa-edit h-5 w-5"></i>
                        </Link>
                        <button
                          className="text-red-600 hover:text-red-900 hover:cursor-pointer"
                          onClick={() => handleDeleteClick(materia._id, materia.name)}
                        >
                          <i className="fas fa-trash h-5 w-5"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredMaterias.length === 0 && (
            <div className="text-center py-4 text-gray-500">
              No se encontraron materias
            </div>
          )}
        </div>
      </main>

      {showModal && (
        <div className="fixed inset-0 backdrop-brightness-50 backdrop-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Eliminar Materia</h3>
            <p className="text-sm text-gray-500 mb-6">
              ¿Estás seguro de que deseas eliminar esta materia? Esta acción no se puede deshacer.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Escribe el nombre de la materia para confirmar:</label>
              <input
                type="text"
                className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={confirmationInput}
                onChange={(e) => setConfirmationInput(e.target.value)}
              />
              {confirmationError && <p className="text-red-500 text-sm mt-1">{confirmationError}</p>}
            </div>
            <div className="flex justify-end space-x-4">
              <button
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                onClick={handleCancelDelete}
              >
                Cancelar
              </button>
              <button
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                onClick={handleConfirmDelete}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 backdrop-brightness-50 backdrop-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Agregar Materia</h3>
            <div className="mb-4">
              <label htmlFor="faculty-select" className="block text-sm font-medium text-gray-700">Selecciona una facultad:</label>
              <select
                id="faculty-select"
                className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                onChange={(e) => handleFacultySelect(e.target.value)}
                value={selectedFaculty || ''}
              >
                <option value="" disabled>Selecciona una facultad</option>
                {faculties.map(faculty => (
                  <option key={faculty._id} value={faculty._id}>
                    {faculty.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end space-x-4">
              <button
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                onClick={() => setShowAddModal(false)}
              >
                Cancelar
              </button>
              <button
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                onClick={handleNextClick}
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSubjects;