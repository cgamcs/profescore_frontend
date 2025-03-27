import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

interface IDepartment {
  _id: string;
  name: string;
}

interface ISubject {
  _id: string;
  name: string;
  credits: number;
  description: string;
  department: string;
  faculty: string;
}

const EditSubject: React.FC = () => {
  const { facultyId } = useParams<{ facultyId: string }>();
  const { subjectId } = useParams<{ subjectId: string }>();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<ISubject>({
    _id: '',
    name: '',
    credits: 0,
    description: '',
    department: '',
    faculty: facultyId || ''
  });

  const [departments, setDepartments] = useState<IDepartment[]>([]);
  const [errors, setErrors] = useState({
    name: '',
    department: '',
    credits: '',
    description: ''
  });

  useEffect(() => {
    const fetchSubject = async () => {
      try {
        if (subjectId) {
          const response = await axios.get(`${import.meta.env.VITE_API_URL}/admin/faculty/${facultyId}/subject/${subjectId}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          setFormData(response.data);
        }
      } catch (error) {
        console.error('Error al obtener la materia:', error);
      }
    };

    const fetchDepartments = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/admin/faculty/${facultyId}/departments`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        console.log(response.data)
        setDepartments(response.data);
      } catch (error) {
        console.error('Error al obtener los departamentos:', error);
      }
    };

    fetchSubject();
    fetchDepartments();
  }, [subjectId, facultyId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let isValid = true;
    const newErrors = { ...errors };

    // Validar nombre
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es obligatorio';
      isValid = false;
    } else {
      newErrors.name = '';
    }

    // Validar departamento
    if (!formData.department) {
      newErrors.department = 'El departamento es obligatorio';
      isValid = false;
    } else {
      newErrors.department = '';
    }

    // Validar créditos
    if (!formData.credits) {
      newErrors.credits = 'Los créditos son obligatorios';
      isValid = false;
    } else if (isNaN(Number(formData.credits)) || Number(formData.credits) <= 0) {
      newErrors.credits = 'Los créditos deben ser un número positivo';
      isValid = false;
    } else {
      newErrors.credits = '';
    }

    // Validar descripción
    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es obligatoria';
      isValid = false;
    } else {
      newErrors.description = '';
    }

    setErrors(newErrors);

    if (isValid) {
      try {
        if (subjectId) {
          await axios.put(`${import.meta.env.VITE_API_URL}/admin/faculty/${facultyId}/subject/${subjectId}`, formData, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
        } else {
          await axios.post(`${import.meta.env.VITE_API_URL}/admin/faculty/${facultyId}/subject`, formData, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
        }
        navigate('/admin/materias');
      } catch (error) {
        console.error('Error al guardar la materia:', error);
      }
    }
  };

  return (
    <div className="bg-white min-h-screen">
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">{subjectId ? 'Editar Materia' : 'Agregar Nueva Materia'}</h1>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 w-full max-w-md">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Nombre de la Materia
              </label>
              <input
                id="name"
                name="name"
                type="text"
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Ej. Cálculo Diferencial"
                value={formData.name}
                onChange={handleChange}
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="department" className="block text-sm font-medium text-gray-700">
                Departamento
              </label>
              <select
                id="department"
                name="department"
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${errors.department ? 'border-red-500' : 'border-gray-300'}`}
                value={formData.department}
                onChange={handleChange}
              >
                <option value="">Selecciona un departamento</option>
                {departments.map(department => (
                  <option key={department._id} value={department._id}>
                    {department.name}
                  </option>
                ))}
              </select>
              {errors.department && <p className="text-red-500 text-sm mt-1">{errors.department}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="credits" className="block text-sm font-medium text-gray-700">
                Créditos
              </label>
              <input
                id="credits"
                name="credits"
                type="number"
                min="1"
                max="10"
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${errors.credits ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Ej. 5"
                value={formData.credits}
                onChange={handleChange}
              />
              {errors.credits && <p className="text-red-500 text-sm mt-1">{errors.credits}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Descripción
              </label>
              <textarea
                id="description"
                name="description"
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Describe brevemente el contenido de la materia..."
                value={formData.description}
                onChange={handleChange}
              ></textarea>
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
            </div>

            <div className="pt-4 flex justify-end space-x-4">
              <a
                href="/admin/materias"
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancelar
              </a>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Guardar
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default EditSubject;