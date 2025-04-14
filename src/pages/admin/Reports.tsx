import { useEffect, useState } from 'react';
import axios from 'axios';
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import { X, Check, AlertTriangle, MessageSquare } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "../../components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { useToast } from "../../hooks/use-toast";

interface Professor {
    _id: string;
    name: string;
    biography: string;
    department: string;
}

interface Subject {
    _id: string;
    name: string;
}

interface Report {
    _id: string;
    commentId: string;
    ratingComment: string;
    ratingDate: string;
    teacherId: Professor | null;
    subject: Subject;
    reasons: string[];
    reportComment?: string;
    status: 'pending' | 'rejected' | 'deleted';
    reportDate: string;
}

const Reports = () => {
    const [reports, setReports] = useState<Report[]>([]);
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const { toast } = useToast();

    const api = axios.create({
        baseURL: import.meta.env.VITE_API_URL,
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const response = await api.get('/admin/reports');
                const normalizedReports = response.data.map((report: Report) => ({
                    ...report,
                    teacherId: report.teacherId || {
                        _id: 'unknown',
                        name: 'Desconocido',
                        biography: '',
                        department: ''
                    },
                    subject: report.subject || { _id: '', name: 'Sin materia' }
                }));
                
                console.log('Reportes normalizados:', normalizedReports); // Agrega este log para debug
                setReports(normalizedReports);
                setLoading(false);
            } catch (error) {
                console.error('Error al obtener los reportes:', error);
                setError('Error al cargar los reportes');
                setLoading(false);
            }
        };
        fetchReports();
    }, []);

    const handleDeleteReport = async (reportId: string) => {
        try {
            await api.delete(`/admin/reports/${reportId}/delete-comment`);
    
            setReports(reports.map(report => 
                report._id === reportId ? { ...report, status: 'deleted' } : report
            ));
            setSelectedReport(null);
            
            toast({
                title: "Comentario eliminado",
                description: "El comentario ha sido removido del sistema.",
            });
        } catch (error) {
            console.error('Error al eliminar:', error);
            toast({
                title: "Error",
                description: "No se pudo eliminar el comentario",
                variant: "destructive"
            });
        }
    };

    const handleRejectReport = async (reportId: string) => {
        try {
            await api.put(`/admin/reports/${reportId}/reject`);
    
            setReports(reports.map(report => 
                report._id === reportId ? { ...report, status: 'rejected' } : report
            ));
            setSelectedReport(null);
            
            toast({
                title: "Reporte rechazado",
                description: "El comentario permanecerá en el sistema.",
            });
        } catch (error) {
            console.error('Error al rechazar:', error);
            toast({
                title: "Error",
                description: "No se pudo rechazar el reporte",
                variant: "destructive"
            });
        }
    };

    const filteredReports = reports.filter(report => {
        const matchesSearch =
            report.ratingComment.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (report.teacherId?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            report.subject.name.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesTab =
            activeTab === 'all' ||
            (activeTab === 'pending' && report.status === 'pending') ||
            (activeTab === 'deleted' && report.status === 'deleted') ||
            (activeTab === 'rejected' && report.status === 'rejected');

        return matchesSearch && matchesTab;
    });

    const renderStatusBadge = (status: string) => {
        switch (status) {
            case "pending":
                return (
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Pendiente
                    </Badge>
                );
            case "deleted":
                return (
                    <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
                        <X className="h-3 w-3 mr-1" />
                        Eliminado
                    </Badge>
                );
            case "rejected":
                return (
                    <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                        <Check className="h-3 w-3 mr-1" />
                        Rechazado
                    </Badge>
                );
            default:
                return null;
        }
    };

    if (loading) return (
        <div className="bg-white dark:bg-[#0A0A0A] min-h-screen flex items-center justify-center">
            <div className="text-center py-4">Cargando reportes...</div>
        </div>
    );

    if (error) return (
        <div className="bg-white dark:bg-[#0A0A0A] min-h-screen flex items-center justify-center">
            <div className="text-red-500 text-center py-4">{error}</div>
        </div>
    );

    return (
        <div className="bg-white dark:bg-[#0A0A0A] min-h-screen">
            <main className="container mx-auto px-4 py-6">
                <div className="mb-5">
                    <h1 className="text-3xl dark:text-white font-bold">Gestión de Reportes</h1>
                    <p className="dark:text-white text-muted-foreground">Revisa y modera los comentarios reportados</p>
                </div>

                <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
                    <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                        <TabsList className="bg-gray-200 dark:bg-[#383939]">
                            <TabsTrigger value="all">Todos</TabsTrigger>
                            <TabsTrigger value="pending">Pendientes</TabsTrigger>
                            <TabsTrigger value="deleted">Eliminados</TabsTrigger>
                            <TabsTrigger value="rejected">Rechazados</TabsTrigger>
                        </TabsList>

                        <div className="w-full md:max-w-md">
                            <Input
                                type="text"
                                placeholder="Buscar por comentario, profesor o materia..."
                                className="w-full border border-gray-200 dark:border-[#2B2B2D] px-4 py-3 rounded-xl shadow-xl"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <TabsContent value={activeTab} className="m-0">
                        <div className="border border-gray-300 dark:border-[#383939] rounded-lg shadow-md">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Estado</TableHead>
                                        <TableHead>Comentario</TableHead>
                                        <TableHead>Profesor/Materia</TableHead>
                                        <TableHead>Motivos</TableHead>
                                        <TableHead>Fecha</TableHead>
                                        <TableHead className="text-right">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredReports.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                                                No se encontraron reportes
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredReports.map((report) => (
                                            <TableRow key={report._id}>
                                                <TableCell>{renderStatusBadge(report.status)}</TableCell>
                                                <TableCell className="max-w-[200px]">
                                                    <p className="truncate">{report.ratingComment}</p>
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <p className="font-medium">
                                                            {report.teacherId?.name || 'Desconocido'}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {report.subject?.name || 'Sin materia'}
                                                        </p>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{report.reasons.join(', ')}</TableCell>
                                                <TableCell>
                                                    {new Date(report.reportDate).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell className="text-right space-x-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setSelectedReport(report)}
                                                    >
                                                        Ver
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </TabsContent>
                </Tabs>

                {selectedReport && (
                    <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>Detalles del Reporte</DialogTitle>
                                <DialogDescription>
                                    Revisa la información del comentario reportado
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-medium text-lg">Estado del reporte</h3>
                                        {renderStatusBadge(selectedReport.status)}
                                    </div>
                                    <Badge variant="secondary">
                                        {selectedReport.reasons.length} reportes
                                    </Badge>
                                </div>

                                <div className="space-y-2">
                                    <h3 className="font-medium">Comentario</h3>
                                    <div className="p-4 bg-slate-50 dark:bg-[#383939] rounded-md border border-gray-300 dark:border-[#383939] flex items-start gap-3">
                                        <MessageSquare className="h-5 w-5 text-slate-400 dark:text-[#202024] mt-0.5 flex-shrink-0" />
                                        <p>{selectedReport.ratingComment}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <h3 className="font-medium">Profesor</h3>
                                        <p>{selectedReport.teacherId?.name || 'Desconocido'}</p>
                                    </div>
                                    <div>
                                        <h3 className="font-medium">Materia</h3>
                                        <p>{selectedReport.subject?.name || 'Sin materia'}</p>
                                    </div>
                                    <div>
                                        <h3 className="font-medium">Fecha del comentario</h3>
                                        <p>{new Date(selectedReport.ratingDate).toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                        <h3 className="font-medium">Fecha del reporte</h3>
                                        <p>{new Date(selectedReport.reportDate).toLocaleDateString()}</p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <h3 className="font-medium">Detalles de los reportes</h3>
                                    <div className="p-4 bg-slate-50 dark:bg-[#383939] rounded-md border border-gray-300 dark:border-[#383939] space-y-4">
                                        {selectedReport.reasons.map((reason, index) => (
                                            <div key={index} className="text-sm">
                                                <div className="flex justify-between">
                                                    <span className="font-medium">Usuario anónimo {index + 1}</span>
                                                    <span className="text-muted-foreground">
                                                        {new Date(selectedReport.reportDate).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <p className="text-muted-foreground">Motivo: {reason}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {selectedReport.status === 'pending' && (
                                <DialogFooter className="space-x-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => handleRejectReport(selectedReport._id)}
                                    >
                                        <Check className="mr-2 h-4 w-4" />
                                        Rechazar Reporte
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        onClick={() => handleDeleteReport(selectedReport._id)}
                                    >
                                        <X className="mr-2 h-4 w-4" />
                                        Eliminar Comentario
                                    </Button>
                                </DialogFooter>
                            )}
                        </DialogContent>
                    </Dialog>
                )}
            </main>
        </div>
    );
};

export default Reports;