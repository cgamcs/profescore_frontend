import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

interface IFaculty {
    _id: string;
    name: string;
}

interface IProfessor {
    _id: string;
    name: string;
    faculty: string;
    subjects: string[];
    ratingStats: {
        averageGeneral: number;
        totalRatings: number;
    };
}

const AdminProfessors: React.FC = () => {
    const [professors, setProfessors] = useState<IProfessor[]>([]);
    const [faculties, setFaculties] = useState<IFaculty[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [professorToDelete, setProfessorToDelete] = useState<IProfessor | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedFaculty, setSelectedFaculty] = useState('');
    const [confirmName, setConfirmName] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfessors = async () => {
            try {
                const response = await axios.get('http://localhost:4000/api/admin/professors', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                setProfessors(response.data);
            } catch (error) {
                console.error('Error fetching professors:', error);
            }
        };

        const fetchFaculties = async () => {
            try {
                const response = await axios.get('http://localhost:4000/api/admin/faculty', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                setFaculties(response.data);
            } catch (error) {
                console.error('Error fetching faculties:', error);
            }
        };

        fetchProfessors();
        fetchFaculties();
    }, []);

    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
    };

    const normalizeString = (str: string) => {
        return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    };

    const filteredProfessors = professors.filter(professor =>
        normalizeString(professor.name).includes(normalizeString(searchTerm)) ||
        normalizeString(professor.faculty).includes(normalizeString(searchTerm)) ||
        professor.subjects.some(subject => normalizeString(subject).includes(normalizeString(searchTerm)))
    );

    const handleDelete = async (professor: IProfessor) => {
        if (confirmName === professor.name) {
            const faculty = faculties.find(f => f.name === professor.faculty);
            if (faculty) {
                try {
                    await axios.delete(`http://localhost:4000/api/admin/faculty/${faculty._id}/professor/${professor._id}`, {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        }
                    });
                    setProfessors(professors.filter(p => p._id !== professor._id));
                    setProfessorToDelete(null);
                    setConfirmName('');
                } catch (error) {
                    console.error('Error deleting professor:', error);
                }
            } else {
                alert('No se encontró la facultad asociada al profesor.');
            }
        } else {
            alert('El nombre ingresado no coincide con el nombre del profesor.');
        }
    };

    const handleFacultySelect = (facultyId: string) => {
        setSelectedFaculty(facultyId);
    };

    const handleAddProfessor = () => {
        if (selectedFaculty) {
            navigate(`/admin/facultad/${selectedFaculty}/maestro/multiple`);
            setShowAddModal(false);
        }
    };

    const renderStars = (rating: number) => {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;

        return (
            <div className="flex">
                {[...Array(5)].map((_, index) => {
                    if (index < fullStars) {
                        return <i key={index} className="fas fa-star text-indigo-500 text-sm" />;
                    }
                    if (index === fullStars && hasHalfStar) {
                        return <i key={index} className="fas fa-star-half-alt text-indigo-500 text-sm" />;
                    }
                    return <i key={index} className="far fa-star text-gray-300 text-sm" />;
                })}
            </div>
        );
    };

    return (
        <div className="bg-white min-h-screen">
            <main className="container mx-auto px-4 py-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Administrar Profesores</h1>
                    <button
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center"
                        onClick={() => setShowAddModal(true)}
                    >
                        <i className="fas fa-plus mr-2"></i> Agregar Profesor
                    </button>
                </div>
                <div className="relative w-full max-w-md mb-6">
                    <div className="relative">
                        <input
                            type="text"
                            id="search-input"
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
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Materias</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Calificación</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredProfessors.map(professor => (
                                    <tr key={professor._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap font-medium">{professor.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{professor.faculty}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            <div className="flex flex-wrap gap-1">
                                                {professor.subjects.map((subject, index) => (
                                                    <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                                                        {subject}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <span className="bg-indigo-100 text-indigo-800 font-bold rounded px-2 py-1 text-sm mr-2">
                                                    {professor.ratingStats.averageGeneral.toFixed(1)}
                                                </span>
                                                {renderStars(professor.ratingStats.averageGeneral)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <div className="flex space-x-2">
                                                <Link to={`/editar-profesor/${professor._id}`} className="text-indigo-600 hover:text-indigo-900">
                                                    <i className="fas fa-edit h-5 w-5"></i>
                                                </Link>
                                                <button className="text-red-600 hover:text-red-900" onClick={() => setProfessorToDelete(professor)}>
                                                    <i className="fas fa-trash h-5 w-5"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {filteredProfessors.length === 0 && (
                        <div className="text-center py-4 text-gray-500">
                            No se encontraron profesores
                        </div>
                    )}
                </div>
            </main>
            {professorToDelete && (
                <div className="fixed inset-0 backdrop-brightness-50 backdrop-opacity-60 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Eliminar Profesor</h3>
                        <p className="text-sm text-gray-500 mb-6">
                            ¿Estás seguro de que deseas eliminar al profesor "{professorToDelete.name}"? Esta acción no se puede deshacer.
                        </p>
                        <div className="mb-4">
                            <label htmlFor="confirm-name" className="block text-sm font-medium text-gray-700">Escribe el nombre del profesor para confirmar:</label>
                            <input
                                type="text"
                                id="confirm-name"
                                className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                value={confirmName}
                                onChange={(e) => setConfirmName(e.target.value)}
                            />
                        </div>
                        <div className="flex justify-end space-x-4">
                            <button
                                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                                onClick={() => setProfessorToDelete(null)}
                            >
                                Cancelar
                            </button>
                            <button
                                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                                onClick={() => handleDelete(professorToDelete)}
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
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Agregar Profesor</h3>
                        <div className="mb-4">
                            <label htmlFor="faculty-select" className="block text-sm font-medium text-gray-700">Selecciona la facultad:</label>
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
                                onClick={handleAddProfessor}
                            >
                                Continuar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminProfessors;
