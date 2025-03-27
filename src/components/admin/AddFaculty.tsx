import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';

interface Faculty {
  _id?: string;
  name: string;
  abbreviation: string;
  departments: string[];
}

const AddFaculty: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const [faculty, setFaculty] = useState<Faculty>({
    name: '',
    abbreviation: '',
    departments: []
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (id) {
      // Fetch faculty data for editing
      const fetchFaculty = async () => {
        try {
          const response = await axios.get(`${import.meta.env.VITE_API_URL}/admin/faculty/${id}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          });
          setFaculty(response.data);
        } catch (error) {
          console.error('Error fetching faculty data:', error);
        }
      };
      fetchFaculty();
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFaculty(prev => ({ ...prev, [name]: value }));
  };

  const handleAddDepartment = () => {
    setFaculty(prev => ({ ...prev, departments: [...prev.departments, ''] }));
  };

  const handleDepartmentChange = (index: number, value: string) => {
    const newDepartments = [...faculty.departments];
    newDepartments[index] = value;
    setFaculty(prev => ({ ...prev, departments: newDepartments }));
  };

  const handleRemoveDepartment = (index: number) => {
    const newDepartments = [...faculty.departments];
    newDepartments.splice(index, 1);
    setFaculty(prev => ({ ...prev, departments: newDepartments }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors: { [key: string]: string } = {};

    if (!faculty.name.trim()) {
      validationErrors.name = 'El nombre es obligatorio';
    }
    if (!faculty.abbreviation.trim()) {
      validationErrors.abbreviation = 'La abreviatura es obligatoria';
    }
    if (faculty.departments.length === 0 || faculty.departments.some(dep => !dep.trim())) {
      validationErrors.departments = 'Debe agregar al menos un departamento';
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      if (id) {
        // Update faculty
        await axios.put(`${import.meta.env.VITE_API_URL}/admin/faculty/${id}`, faculty, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
      } else {
        // Add new faculty
        await axios.post(`${import.meta.env.VITE_API_URL}/admin/faculty`, faculty, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
      }
      navigate('/admin/facultades');
    } catch (error) {
      console.error('Error saving faculty data:', error);
    }
  };

  return (
    <div className="bg-white min-h-screen">
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">{id ? 'Editar Facultad' : 'Agregar Nueva Facultad'}</h1>
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 w-full max-w-md">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Nombre de la Facultad
              </label>
              <input
                id="name"
                name="name"
                type="text"
                className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${errors.name ? 'border-red-500' : ''}`}
                placeholder="Ej. Facultad de Ingeniería"
                value={faculty.name}
                onChange={handleChange}
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>
            <div className="space-y-2">
              <label htmlFor="abbreviation" className="block text-sm font-medium text-gray-700">
                Abreviatura
              </label>
              <input
                id="abbreviation"
                name="abbreviation"
                type="text"
                className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${errors.abbreviation ? 'border-red-500' : ''}`}
                placeholder="Ej. FI"
                maxLength={10}
                value={faculty.abbreviation}
                onChange={handleChange}
              />
              {errors.abbreviation && <p className="text-red-500 text-sm mt-1">{errors.abbreviation}</p>}
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Departamentos
              </label>
              <div className="flex flex-col space-y-2">
                <div id="departamentos-container">
                  {faculty.departments.map((dep, index) => (
                    <div key={index} className="departamento-item flex items-center space-x-2 mt-2">
                      <input
                        type="text"
                        className="departamento-input flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Nombre del departamento"
                        value={dep}
                        onChange={(e) => handleDepartmentChange(index, e.target.value)}
                      />
                      <button type="button" className="remove-departamento text-red-500 hover:text-red-700" onClick={() => handleRemoveDepartment(index)}>
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  id="add-departamento"
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  onClick={handleAddDepartment}
                >
                  <i className="fas fa-plus mr-2"></i> Agregar Departamento
                </button>
              </div>
              {errors.departments && <p className="text-red-500 text-sm mt-1">{errors.departments}</p>}
            </div>
            <div className="pt-4 flex justify-end space-x-4">
              <Link to="/admin/facultades" className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                Cancelar
              </Link>
              <button type="submit" className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
                Guardar
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default AddFaculty;