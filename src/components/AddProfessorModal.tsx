import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import api from '../api';

interface ISubject {
    _id: string;
    name: string;
}

interface AddProfessorModalProps {
    facultyId: string;
    subjects: ISubject[];
    onClose: () => void;
    onSuccess: () => void;
}

const AddProfessorModal: React.FC<AddProfessorModalProps> = ({ facultyId, subjects, onClose, onSuccess }) => {
    const queryClient = useQueryClient();
    const [isLoading, setIsLoading] = useState(false);
    const [professorName, setProfessorName] = useState('');
    const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validación
        const newErrors: { [key: string]: string } = {};
        if (!professorName.trim()) newErrors.name = 'Nombre requerido';
        if (selectedSubjects.length === 0) newErrors.subjects = 'Selecciona al menos una materia';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            setIsLoading(true);
            
            // Preparar los datos para la API
            const payload = {
                name: professorName,
                facultyId: facultyId,
                subjects: selectedSubjects
            };

            // Llamar a la API
            await api.post(`/faculties/${facultyId}/professors`, payload);
            
            // Invalidar consultas para refrescar los datos
            queryClient.invalidateQueries({ queryKey: ['professors', facultyId] });
            
            // Cerrar modal y mostrar mensaje de éxito
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error al agregar profesor:', error);
            setErrors({ form: 'Error al agregar profesor. Inténtalo de nuevo.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubjectToggle = (subjectId: string) => {
        setSelectedSubjects(prev => 
            prev.includes(subjectId)
                ? prev.filter(id => id !== subjectId)
                : [...prev, subjectId]
        );
        
        // Limpiar error de materias si hay al menos una seleccionada
        if (errors.subjects && !selectedSubjects.includes(subjectId)) {
            setErrors(prev => ({ ...prev, subjects: '' }));
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-[#202024] rounded-lg w-full max-w-md mx-4 p-6 shadow-xl">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold dark:text-white">Agregar Maestro</h2>
                    <button 
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Nombre del profesor */}
                    <div className="space-y-2">
                        <label htmlFor="professorName" className="block text-sm font-medium dark:text-white">
                            Nombre Completo
                        </label>
                        <input
                            id="professorName"
                            type="text"
                            value={professorName}
                            onChange={(e) => setProfessorName(e.target.value)}
                            className={`w-full border ${errors.name ? 'border-red-500' : 'border-gray-300 dark:border-[#383939]'} dark:bg-[#383939] dark:text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                            placeholder="Ej. Juan Pérez González"
                        />
                        {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
                    </div>

                    {/* Selector de materias */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium dark:text-white">
                            Materias
                        </label>
                        <div className={`border ${errors.subjects ? 'border-red-500' : 'border-gray-300 dark:border-[#383939]'} rounded-md p-3 max-h-60 overflow-y-auto`}>
                            {subjects.length > 0 ? (
                                subjects.map((subject) => (
                                    <div key={subject._id} className="flex items-center mb-2">
                                        <input
                                            type="checkbox"
                                            id={`subject-${subject._id}`}
                                            checked={selectedSubjects.includes(subject._id)}
                                            onChange={() => handleSubjectToggle(subject._id)}
                                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                        />
                                        <label htmlFor={`subject-${subject._id}`} className="ml-2 block text-sm dark:text-white">
                                            {subject.name}
                                        </label>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 dark:text-gray-400 text-sm">No hay materias disponibles</p>
                            )}
                        </div>
                        {errors.subjects && <p className="text-red-500 text-sm">{errors.subjects}</p>}
                    </div>

                    {/* Error general del formulario */}
                    {errors.form && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                            {errors.form}
                        </div>
                    )}

                    {/* Botones */}
                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 dark:border-[#383939] rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#282828] focus:outline-none"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-medium focus:outline-none disabled:opacity-70"
                        >
                            {isLoading ? 'Guardando...' : 'Guardar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddProfessorModal;