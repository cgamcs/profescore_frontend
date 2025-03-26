import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';

interface Subject {
    _id?: string;
    id?: string;
    name: string;
}

interface Department {
    _id?: string;
    id?: string;
    name: string;
}

const AddProfessor: React.FC = () => {
    const { facultyId } = useParams<{ facultyId: string }>();
    const [name, setName] = useState('');
    const [departmentId, setDepartmentId] = useState('');
    const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([]);
    const [biography, setBiography] = useState('');
    const [departments, setDepartments] = useState<Department[]>([]);
    const [allSubjects, setAllSubjects] = useState<Subject[]>([]);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const response = await axios.get(`http://localhost:4000/api/admin/faculty/${facultyId}/departments`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                console.log('Respuesta completa de Deparments', response.data)

                const processedDepartments = response.data.map((department: Department) => ({
                    id: department._id || department.id || '',
                    name: department.name
                }));

                console.log('Deparments procesados:', processedDepartments);

                setDepartments(processedDepartments);
            } catch (error) {
                console.error('Error fetching departments:', error);
            }
        };

        const fetchSubjects = async () => {
            try {
                const response = await axios.get(`http://localhost:4000/api/admin/faculty/${facultyId}/subjects`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                // Depuración: Imprimir la respuesta completa
                console.log('Respuesta completa de subjects:', response.data);

                // Manipular los datos para asegurar que tenemos un ID
                const processedSubjects = response.data.map((subject: Subject) => ({
                    id: subject._id || subject.id || '', // Priorizar _id, luego id
                    name: subject.name
                }));

                console.log('Subjects procesados:', processedSubjects);

                setAllSubjects(processedSubjects);
            } catch (error) {
                console.error('Error fetching subjects:', error);
            }
        };

        fetchDepartments();
        fetchSubjects();
    }, [facultyId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        let isValid = true;
        const newErrors: { [key: string]: string } = {};

        if (!name.trim()) {
            newErrors.name = 'El nombre es obligatorio';
            isValid = false;
        }

        if (!departmentId) {
            newErrors.department = 'El departamento es obligatorio';
            isValid = false;
        }

        if (selectedSubjectIds.length === 0) {
            newErrors.subjects = 'Debe seleccionar al menos una materia';
            isValid = false;
        }

        if (!biography.trim()) {
            newErrors.biography = 'La biografía es obligatoria';
            isValid = false;
        }

        if (!isValid) {
            setErrors(newErrors);
            return;
        }

        try {
            const payload = {
                name,
                department: departmentId, // Enviamos el ID del departamento
                biography,
                subjects: selectedSubjectIds,
            };

            console.log('Payload being sent:', payload);

            const endpoint = selectedSubjectIds.length > 1 ? 'multiple' : '';
            const response = await axios.post(`http://localhost:4000/api/admin/faculty/${facultyId}/professor/${endpoint}`, payload, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            console.log('Server response:', response.data);
            window.location.href = '/admin/maestros';
        } catch (error) {
            console.error('Error adding professor:', error);
            // Aquí podrías agregar lógica adicional para manejar errores específicos y mostrar mensajes al usuario
        }
    };

    return (
        <div className="bg-white min-h-screen">
            <main className="flex-1 flex flex-col items-center justify-center px-4 py-6">
                <h1 className="text-2xl font-bold mb-6">Agregar Nuevo Maestro</h1>
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 w-full max-w-md">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
                                Nombre Completo
                            </label>
                            <input
                                id="nombre"
                                name="nombre"
                                type="text"
                                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                                placeholder="Ej. Dr. Juan Martínez"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="departamento" className="block text-sm font-medium text-gray-700">
                                Departamento
                            </label>
                            <select
                                id="departamento"
                                name="departamento"
                                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 ${errors.department ? 'border-red-500' : 'border-gray-300'}`}
                                value={departmentId}
                                onChange={(e) => setDepartmentId(e.target.value)}
                            >
                                <option value="">Selecciona un departamento</option>
                                {departments.map(dept => (
                                    <option key={dept.id} value={dept.id}>
                                        {dept.name}
                                    </option>
                                ))}
                            </select>
                            {errors.department && <p className="text-red-500 text-sm mt-1">{errors.department}</p>}
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="materias" className="block text-sm font-medium text-gray-700">
                                Materias que imparte
                            </label>
                            <p className="text-xs text-gray-500 mb-1">Mantén presionado Ctrl (o Command en Mac) para seleccionar múltiples materias</p>
                            <select
                                id="materias"
                                name="materias"
                                multiple
                                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 ${errors.subjects ? 'border-red-500' : 'border-gray-300'}`}
                                value={selectedSubjectIds}
                                onChange={(e) => {
                                    const selectedIds = Array.from(e.target.selectedOptions,
                                        option => option.value);
                                    setSelectedSubjectIds(selectedIds);
                                }}
                            >
                                {allSubjects.map(subject => (
                                    <option key={subject.id} value={subject.id}>
                                        {subject.name}
                                    </option>
                                ))}
                            </select>
                            {errors.subjects && <p className="text-red-500 text-sm mt-1">{errors.subjects}</p>}
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="biografia" className="block text-sm font-medium text-gray-700">
                                Biografía
                            </label>
                            <textarea
                                id="biografia"
                                name="biografia"
                                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 ${errors.biography ? 'border-red-500' : 'border-gray-300'}`}
                                placeholder="Información sobre la formación académica y experiencia del profesor..."
                                value={biography}
                                onChange={(e) => setBiography(e.target.value)}
                            ></textarea>
                            {errors.biography && <p className="text-red-500 text-sm mt-1">{errors.biography}</p>}
                        </div>
                        <div className="pt-4 flex justify-end space-x-4">
                            <Link to="/admin/maestros" className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                                Cancelar
                            </Link>
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

export default AddProfessor;