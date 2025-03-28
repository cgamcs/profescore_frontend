import { useEffect, useState } from 'react';
import axios from 'axios';

interface Teacher {
    _id: string;
    name: string;
    biography: string;
    department: string;
}

interface Report {
    _id: string;
    commentId: string;
    ratingComment: string;
    ratingDate: string;
    teacherId: Teacher;
    subject: string;
    reasons: string[];
    reportComment?: string;
    status: 'pending' | 'rejected' | 'deleted';
    reportDate: string;
}

const AdminReports = () => {
    const [reports, setReports] = useState<Report[]>([]);
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    // Axios instance with default config
    const api = axios.create({
        baseURL: import.meta.env.VITE_API_URL,
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });

    // Fetch reports
    useEffect(() => {
        const fetchReports = async () => {
            try {
                const response = await api.get('/admin/reports');
                setReports(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error al obtener los reportes:', error);
                setError('Error al cargar los reportes');
                setLoading(false);
            }
        };

        fetchReports();
    }, []);

    // View report details
    const handleViewDetails = async (reportId: string) => {
        try {
            const response = await api.get(`/admin/reports/${reportId}`);
            console.log(response)
            setSelectedReport(response.data);
        } catch (error) {
            console.error('Error al obtener los detalles del reporte:', error);
        }
    };

    const handleDeleteReport = async (reportId: string) => {
        try {
            await api.delete(`/admin/reports/${reportId}`);
            // Update reports list
            setReports(reports.filter(report => report._id !== reportId));
            // Close modal if open
            setSelectedReport(null);
        } catch (error) {
            console.error('Error al eliminar el reporte:', error);
        }
    };
    
    const handleRejectReport = async (reportId: string) => {
        try {
            await api.put(`/admin/reports/${reportId}/reject`);
            // Update reports list
            setReports(reports.map(report =>
                report._id === reportId ? { ...report, status: 'rejected' } : report
            ));
            // Close modal if open
            setSelectedReport(null);
        } catch (error) {
            console.error('Error al rechazar el reporte:', error);
        }
    };    

    // Filter reports
    const filteredReports = reports.filter(report => {
        const matchesStatus = filterStatus === 'all' || report.status === filterStatus;
        const matchesSearch = report.ratingComment.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              report.teacherId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              report.subject.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    // Render loading state
    if (loading) return <div className='text-center py-4'>Cargando...</div>;

    // Render error state
    if (error) return <div className='text-red-500 text-center py-4'>{error}</div>;

    return (
        <div className="bg-white min-h-screen">
            <main className="container mx-auto px-4 py-6">
                {/* Header with filter and search */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Comentarios Reportados</h1>
                    <div className="flex items-center space-x-2">
                        <select
                            id="filter-status"
                            className="border border-gray-300 rounded-md text-sm px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option value="all">Todos los estados</option>
                            <option value="pending">Pendientes</option>
                            <option value="rejected">Rechazados</option>
                            <option value="deleted">Eliminados</option>
                        </select>
                        <div className="relative">
                            <input
                                type="text"
                                id="search-input"
                                placeholder="Buscar comentarios..."
                                className="border border-gray-300 rounded-md text-sm pl-9 pr-3 py-2 w-64 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <i className="fas fa-search text-gray-400"></i>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Status summary cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                        <div className="flex items-center">
                            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 mr-4">
                                <i className="fas fa-exclamation-circle"></i>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Pendientes</p>
                                <p className="text-2xl font-semibold" id="pending-count">
                                    {filteredReports.filter(report => report.status === 'pending').length}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                        <div className="flex items-center">
                            <div className="p-3 rounded-full bg-red-100 text-red-600 mr-4">
                                <i className="fas fa-trash-alt"></i>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Eliminados</p>
                                <p className="text-2xl font-semibold" id="deleted-count">
                                    {filteredReports.filter(report => report.status === 'deleted').length}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                        <div className="flex items-center">
                            <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                                <i className="fas fa-check-circle"></i>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Rechazados</p>
                                <p className="text-2xl font-semibold" id="rejected-count">
                                    {filteredReports.filter(report => report.status === 'rejected').length}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Reports Table */}
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Comentario
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Profesor/Materia
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Motivo del reporte
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Fecha
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Estado
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredReports.map(report => (
                                <tr key={report._id}>
                                    <td className="px-6 py-4 whitespace-normal">
                                        <div className="text-sm text-gray-900 max-w-md">
                                            {report.ratingComment}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {report.teacherId.name}
                                        </div>
                                        <div className="text-sm text-gray-500">{report.subject}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-normal">
                                        <div className="text-sm text-gray-900">{report.reasons.join(', ')}</div>
                                        <div className="text-xs text-gray-500 mt-1">
                                            Reportado por: {report.reasons.length} usuarios
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            {new Date(report.reportDate).toLocaleDateString()}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {new Date(report.reportDate).toLocaleTimeString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                                            ${report.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                              report.status === 'rejected' ? 'bg-green-100 text-green-800' :
                                              'bg-red-100 text-red-800'}`}>
                                            {report.status === 'pending' ? 'Pendiente' :
                                             report.status === 'rejected' ? 'Rechazado' : 'Eliminado'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            className="text-indigo-600 hover:text-indigo-900 hover:cursor-pointer mr-3"
                                            onClick={() => handleViewDetails(report._id)}
                                        >
                                            <i className="fas fa-eye"></i>
                                        </button>
                                        <button
                                            className="text-red-600 hover:text-red-900 hover:cursor-pointer mr-3"
                                            onClick={() => handleDeleteReport(report._id)}
                                        >
                                            <i className="fas fa-trash-alt"></i>
                                        </button>
                                        <button
                                            className="text-green-600 hover:text-green-900 hover:cursor-pointer"
                                            onClick={() => handleRejectReport(report._id)}
                                        >
                                            <i className="fas fa-check"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Report Details Modal */}
                {selectedReport && (
                    <div className="fixed inset-0 backdrop-brightness-50 backdrop-opacity-60 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg max-w-2xl w-full mx-4 overflow-hidden">
                            <div className="px-6 py-4 bg-indigo-600 text-white flex justify-between items-center">
                                <h3 className="text-lg font-medium">Detalles del Comentario Reportado</h3>
                                <button
                                    className="text-white hover:text-gray-200"
                                    onClick={() => setSelectedReport(null)}
                                >
                                    <i className="fas fa-times"></i>
                                </button>
                            </div>
                            <div className="p-6">
                                <div className="mb-6">
                                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Comentario</h4>
                                    <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                                        <p className="text-gray-700">{selectedReport.ratingComment}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-900 mb-2">Profesor</h4>
                                        <p className="text-gray-700">
                                            {selectedReport.teacherId.name}
                                        </p>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-900 mb-2">Materia</h4>
                                        <p className="text-gray-700">{selectedReport.subject}</p>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-900 mb-2">Fecha del comentario</h4>
                                        <p className="text-gray-700">{new Date(selectedReport.ratingDate).toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-900 mb-2">Calificación dada</h4>
                                        <div className="flex items-center">
                                            <div className="flex text-indigo-500">
                                                <i className="fas fa-star"></i>
                                                <i className="fas fa-star"></i>
                                                <i className="fas fa-star-half-alt"></i>
                                                <i className="far fa-star"></i>
                                                <i className="far fa-star"></i>
                                            </div>
                                            <span className="ml-2 text-gray-700">2.5/5</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="mb-6">
                                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Reportes</h4>
                                    <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                                        <div className="space-y-4">
                                            {selectedReport.reasons.map((reason, index) => (
                                                <div key={index}>
                                                    <div className="flex justify-between">
                                                        <p className="text-sm font-medium text-gray-900">
                                                            Usuario: anónimo{index + 1}
                                                        </p>
                                                        <p className="text-sm text-gray-500">
                                                            {new Date(selectedReport.reportDate).toLocaleDateString()}
                                                            {' '}
                                                            {new Date(selectedReport.reportDate).toLocaleTimeString()}
                                                        </p>
                                                    </div>
                                                    <p className="mt-1 text-sm text-gray-700">Motivo: {reason}</p>
                                                    <p className="mt-1 text-sm text-gray-700">
                                                        Comentario: Este comentario contiene lenguaje ofensivo hacia el profesor.
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-end space-x-4">
                                    <button
                                        className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 hover:cursor-pointer"
                                        onClick={() => handleRejectReport(selectedReport._id)}
                                    >
                                        Rechazar Reporte
                                    </button>
                                    <button
                                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 hover:cursor-pointer"
                                        onClick={() => handleDeleteReport(selectedReport._id)}
                                    >
                                        Eliminar Comentario
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminReports;