import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

interface Faculty {
  name: string;
  abbreviation: string;
  departments: Department[];
}

interface Department {
  _id?: string;
  name: string;
}

const EditFaculty: React.FC = () => {
  const { facultyId } = useParams();
  const [ _faculty, setFaculty ] = useState<Faculty>({
    name: '',
    abbreviation: '',
    departments: [],
  });
  const [ nombre, setNombre ] = useState('');
  const [ abreviatura, setAbreviatura ] = useState('');
  const [ departamentos, setDepartamentos ] = useState<Department[]>([]);
  const [ isEditing, setIsEditing ] = useState(false);
  const [ nombreError, setNombreError ] = useState(false);
  const [ abreviaturaError, setAbreviaturaError]  = useState(false);
  const [ departamentosError, setDepartamentosError ] = useState(false);

  useEffect(() => {
    const fetchFacultyData = async () => {
      if (facultyId) {
        setIsEditing(true);
        try {
          const response = await axios.get(`${import.meta.env.VITE_API_URL}/admin/faculty/${facultyId}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          });
          const facultyData = response.data;
          setFaculty(facultyData);
          setNombre(facultyData.name);
          setAbreviatura(facultyData.abbreviation);
          setDepartamentos(facultyData.departments);
        } catch (error) {
          console.error('Error al obtener los datos de la facultad:', error);
        }
      }
    };

    fetchFacultyData();
  }, [facultyId]);

  const handleAddDepartamento = () => {
    setDepartamentos([...departamentos, { name: '' }]);
  };

  const handleRemoveDepartamento = (index: number) => {
    const newDepartamentos = [...departamentos];
    newDepartamentos.splice(index, 1);
    setDepartamentos(newDepartamentos);
  };

  const handleDepartamentoChange = (index: number, value: string) => {
    const newDepartamentos = [...departamentos];
    newDepartamentos[index].name = value;
    setDepartamentos(newDepartamentos);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let isValid = true;

    if (!nombre.trim()) {
      setNombreError(true);
      isValid = false;
    } else {
      setNombreError(false);
    }

    if (!abreviatura.trim()) {
      setAbreviaturaError(true);
      isValid = false;
    } else {
      setAbreviaturaError(false);
    }

    if (departamentos.every(dep => !dep.name.trim())) {
      setDepartamentosError(true);
      isValid = false;
    } else {
      setDepartamentosError(false);
    }

    if (isValid) {
      const updatedFaculty = {
        name: nombre,
        abbreviation: abreviatura,
        departments: departamentos
      };

      try {
        await axios.put(
          `${import.meta.env.VITE_API_URL}/admin/faculty/${facultyId}`,
          updatedFaculty,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
        // Redirigir a la lista de facultades o mostrar un mensaje de éxito
        window.location.href = '/admin/facultades';
      } catch (error) {
        console.error('Error al actualizar la facultad:', error);
      }
    }
  };

  return (
    <div className="bg-white min-h-screen">
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">{isEditing ? 'Editar Facultad' : 'Agregar Nueva Facultad'}</h1>
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 w-full max-w-md">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
                Nombre de la Facultad
              </label>
              <input
                id="nombre"
                name="nombre"
                type="text"
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${nombreError ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Ej. Facultad de Ingeniería"
                value={nombre}
                onChange={(e) => { setNombre(e.target.value); setNombreError(false); }}
              />
              {nombreError && <p className="text-red-500 text-sm mt-1">El nombre es obligatorio</p>}
            </div>
            <div className="space-y-2">
              <label htmlFor="abreviatura" className="block text-sm font-medium text-gray-700">
                Abreviatura
              </label>
              <input
                id="abreviatura"
                name="abreviatura"
                type="text"
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${abreviaturaError ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Ej. FI"
                maxLength={10}
                value={abreviatura}
                onChange={(e) => { setAbreviatura(e.target.value); setAbreviaturaError(false); }}
              />
              {abreviaturaError && <p className="text-red-500 text-sm mt-1">La abreviatura es obligatoria</p>}
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Departamentos
              </label>
              <div className="flex flex-col space-y-2">
                {departamentos.map((dep, index) => (
                  <div key={index} className="departamento-item flex items-center space-x-2">
                    <input
                      type="text"
                      className="departamento-input flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Nombre del departamento"
                      value={dep.name}
                      onChange={(e) => handleDepartamentoChange(index, e.target.value)}
                    />
                    <button type="button" className="remove-departamento text-red-500 hover:text-red-700" onClick={() => handleRemoveDepartamento(index)}>
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleAddDepartamento}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <i className="fas fa-plus mr-2"></i> Agregar Departamento
                </button>
              </div>
              {departamentosError && <p className="text-red-500 text-sm mt-1">Debe agregar al menos un departamento</p>}
            </div>
            <div className="pt-4 flex justify-end space-x-4">
              <a href="/admin/facultades" className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                Cancelar
              </a>
              <button type="submit" className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 hover:cursor-pointer">
                Guardar
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default EditFaculty;