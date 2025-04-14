import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useToast } from "../../hooks/use-toast";
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "../../components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Badge } from "../../components/ui/badge";
import { Plus, MoreHorizontal, Star, Trash2, Edit, ChevronLeft, ChevronRight, Eye, Users } from "lucide-react";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import SubjectSelector from '../../components/ui/subjectselector';

const API_URL = import.meta.env.VITE_API_URL;
const ITEMS_PER_PAGE = 10;

interface IFaculty {
    _id: string;
    name: string;
    abbreviation?: string;
}

interface IProfessor {
    _id: string;
    name: string;
    faculty: string;
    facultyAbbreviation?: string;
    facultyId: string;
    subjects: string[];
    ratingStats: {
        averageGeneral: number;
        averageExplanation: number;
        averageAccessibility: number;
        averageDifficulty: number;
        averageAttendance: number;
        totalRatings: number;
    };
}

interface ISubject {
    _id: string;
    name: string;
    facultyId: string;
}

const normalizeString = (str = '') =>
    str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

const Professors = () => {
    const { toast } = useToast();
    const [professors, setProfessors] = useState<IProfessor[]>([]);
    const [faculties, setFaculties] = useState<IFaculty[]>([]);
    const [allSubjects, setAllSubjects] = useState<ISubject[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [openViewDialog, setOpenViewDialog] = useState(false);
    const [professorToDelete, setProfessorToDelete] = useState<IProfessor | null>(null);
    const [currentProfessor, setCurrentProfessor] = useState<IProfessor | null>(null);
    const [viewingProfessor, setViewingProfessor] = useState<IProfessor | null>(null);
    const [confirmName, setConfirmName] = useState('');
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [isInitialDataLoaded, setIsInitialDataLoaded] = useState(false);
    const [isLoadingAction, setIsLoadingAction] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    // Filtrado y paginación
    const filteredProfessors = useMemo(() => {
        if (!searchTerm.trim()) return professors;
        const normalizedSearch = normalizeString(searchTerm);
        return professors.filter(professor =>
            normalizeString(professor.name).includes(normalizedSearch) ||
            normalizeString(professor.facultyAbbreviation).includes(normalizedSearch) ||
            professor.subjects.some(subject => normalizeString(subject).includes(normalizedSearch))
        );
    }, [professors, searchTerm]);

    const paginatedProfessors = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredProfessors.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredProfessors, currentPage]);

    const totalPages = useMemo(() =>
        Math.max(1, Math.ceil(filteredProfessors.length / ITEMS_PER_PAGE)),
        [filteredProfessors.length]
    );

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    // Carga inicial de datos
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [professorsRes, facultiesRes] = await Promise.all([
                    axios.get(`${API_URL}/admin/professors`, {
                        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                    }),
                    axios.get(`${API_URL}/admin/faculty`, {
                        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                    })
                ]);

                const professorsWithFacultyId = professorsRes.data.map((professor: any) => {
                    const faculty = facultiesRes.data.find((f: IFaculty) => f.name === professor.faculty);
                    return {
                        ...professor,
                        facultyId: faculty?._id || '',
                        facultyAbbreviation: faculty?.abbreviation || '' // Incluir la abreviatura
                    };
                });

                setProfessors(professorsWithFacultyId);
                setFaculties(facultiesRes.data);
                setIsInitialDataLoaded(true);
            } catch (error) {
                toast({
                    title: 'Error',
                    description: 'Error cargando datos iniciales',
                    variant: 'destructive'
                });
            }
        };

        fetchInitialData();
    }, []);

    // Carga de todas las materias para todas las facultades
    useEffect(() => {
        const fetchAllSubjects = async () => {
            if (!isInitialDataLoaded || faculties.length === 0) return;

            try {
                const subjectsPromises = faculties.map(faculty =>
                    axios.get(`${API_URL}/admin/faculty/${faculty._id}/subjects`, {
                        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                    })
                );

                const responses = await Promise.all(subjectsPromises);
                const allSubjectsData = responses.flatMap((res, index) =>
                    res.data.map((subject: any) => ({
                        ...subject,
                        facultyId: faculties[index]._id
                    }))
                );

                setAllSubjects(allSubjectsData);
            } catch (error) {
                toast({
                    title: 'Error',
                    description: 'Error cargando materias',
                    variant: 'destructive'
                });
            }
        };

        fetchAllSubjects();
    }, [isInitialDataLoaded, faculties]);

    // Handlers
    const handleOpenAddDialog = () => {
        setCurrentProfessor({
            _id: '',
            name: '',
            faculty: '',
            facultyId: '',
            subjects: [],
            ratingStats: {
                averageGeneral: 0,
                averageExplanation: 0,
                averageAccessibility: 0,
                averageDifficulty: 0,
                averageAttendance: 0,
                totalRatings: 0
            }
        });
        setErrors({});
        setOpenDialog(true);
    };

    const handleEditProfessor = (professor: IProfessor) => {
        setCurrentProfessor({
            ...professor,
            subjects: professor.subjects.map(subjectName => {
                const subject = allSubjects.find(s => s.name === subjectName);
                return subject ? subject._id : '';
            }),
            facultyAbbreviation: professor.facultyAbbreviation // Incluir la abreviatura
        });
        setOpenDialog(true);
    };

    const handleViewProfessor = (professor: IProfessor) => {
        setViewingProfessor(professor);
        setOpenViewDialog(true);
    };

    const handleSaveProfessor = async () => {
        if (!currentProfessor) return;

        const newErrors: { [key: string]: string } = {};
        if (!currentProfessor.name.trim()) newErrors.name = 'Nombre requerido';
        if (!currentProfessor.facultyId) newErrors.faculty = 'Facultad requerida';
        if (currentProfessor.subjects.length === 0) newErrors.subjects = 'Selecciona al menos una materia';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            setIsLoadingAction(true);

            // Find the faculty name and abbreviation from the facultyId
            const faculty = faculties.find(f => f._id === currentProfessor.facultyId);
            if (!faculty) {
                throw new Error('Facultad no encontrada');
            }

            const payload = {
                name: currentProfessor.name,
                facultyId: currentProfessor.facultyId,
                subjects: currentProfessor.subjects // Aquí se envían los IDs de las materias
            };

            const endpoint = currentProfessor._id ?
                `${API_URL}/admin/faculty/${currentProfessor.facultyId}/professor/${currentProfessor._id}` :
                `${API_URL}/admin/faculty/${currentProfessor.facultyId}/professor/multiple`;

            const response = await axios[currentProfessor._id ? 'put' : 'post'](endpoint, payload, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });

            // Ensure faculty name and abbreviation are included in the updated professor data
            const updatedProfessor = {
                ...response.data,
                faculty: faculty.name,
                facultyAbbreviation: faculty.abbreviation, // Incluir la abreviatura
                subjects: Array.isArray(response.data.subjects) ? response.data.subjects.map((subjectId: string) => {
                    const subject = allSubjects.find(s => s._id === subjectId);
                    return subject ? subject.name : '';
                }) : []
            };

            setProfessors(prev => {
                if (currentProfessor._id) {
                    return prev.map(p => p._id === currentProfessor._id ? updatedProfessor : p);
                } else {
                    return [...prev, updatedProfessor];
                }
            });

            toast({
                title: 'Éxito',
                description: `Profesor ${currentProfessor._id ? 'actualizado' : 'creado'} correctamente`
            });

            setOpenDialog(false);
        } catch (error) {
            toast({
                title: 'Error',
                description: `Error ${currentProfessor._id ? 'actualizando' : 'creando'} profesor`,
                variant: 'destructive'
            });
            console.log(error)
        } finally {
            setIsLoadingAction(false);
        }
    };

    const getInitials = (name: string) =>
        name.split(' ').map(word => word[0]).join('').toUpperCase();

    const getRatingColor = (rating: number) => {
        if (rating >= 4.5) return "text-green-500";
        if (rating >= 4.0) return "text-emerald-500";
        if (rating >= 3.5) return "text-amber-500";
        if (rating >= 3.0) return "text-orange-500";
        return "text-red-500";
    };

    const handleFacultyChange = (value: string) => {
        if (!currentProfessor) return;

        const faculty = faculties.find(f => f._id === value);
        setCurrentProfessor({
            ...currentProfessor,
            facultyId: value,
            faculty: faculty?.name || '',
            subjects: [] // Reset subjects when faculty changes
        });
    };

    // Skeleton loader for initial data loading
    const SkeletonLoader = () => (
        <>
            {[...Array(5)].map((_, index) => (
                <TableRow key={`skeleton-${index}`}>
                    <TableCell>
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-[#d4d3d3] animate-pulse"></div>
                            <div className="h-4 bg-gray-200 dark:bg-[#d4d3d3] rounded w-32 animate-pulse"></div>
                        </div>
                    </TableCell>
                    <TableCell><div className="h-4 bg-gray-200 dark:bg-[#d4d3d3] rounded w-16 animate-pulse"></div></TableCell>
                    <TableCell><div className="h-4 bg-gray-200 dark:bg-[#d4d3d3] rounded w-8 animate-pulse"></div></TableCell>
                    <TableCell><div className="h-4 bg-gray-200 dark:bg-[#d4d3d3] rounded w-12 animate-pulse"></div></TableCell>
                    <TableCell className="text-right">
                        <div className="h-8 bg-gray-200 dark:bg-[#d4d3d3] rounded w-8 ml-auto animate-pulse"></div>
                    </TableCell>
                </TableRow>
            ))}
        </>
    );

    return (
        <div className="bg-white dark:bg-[#0A0A0A] min-h-screen">
            <main className="container mx-auto px-4 py-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl dark:text-white font-bold">Profesores</h1>
                    <Button
                        className="bg-black dark:bg-indigo-600 text-white hover:cursor-pointer"
                        onClick={handleOpenAddDialog}
                        disabled={!isInitialDataLoaded}
                    >
                        <Plus className="w-4 h-4 mr-2" /> Nuevo Profesor
                    </Button>
                </div>

                {isInitialDataLoaded && (
                    <div className="relative w-full max-w-md mb-6">
                        <Input
                            type="text"
                            placeholder="Buscar por nombre o facultad..."
                            className="w-full border border-gray-200 dark:border-[#2B2B2D] px-4 py-3 rounded-xl shadow-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                )}

                <div className="border border-gray-300 dark:border-[#383939] rounded-lg overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Profesor</TableHead>
                                <TableHead>Facultad</TableHead>
                                <TableHead>Materias</TableHead>
                                <TableHead>Calificación</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {!isInitialDataLoaded ? (
                                <SkeletonLoader />
                            ) : paginatedProfessors.length > 0 ? (
                                paginatedProfessors.map((professor) => (
                                    <TableRow key={professor._id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center">
                                                    <Users className="h-5 w-5 text-blue-600" />
                                                </div>
                                                <span className="font-medium">{professor.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{professor.facultyAbbreviation}</TableCell> {/* Mostrar la abreviatura */}
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                {professor.subjects.slice(0, 3).map((subject, index) => (
                                                    <Badge key={index} variant="outline">{subject}</Badge>
                                                ))}
                                                {professor.subjects.length > 3 && (
                                                    <Badge variant="outline">+{professor.subjects.length - 3}</Badge>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <Star className={`h-4 w-4 ${getRatingColor(professor.ratingStats.averageGeneral)}`} />
                                                <span className={getRatingColor(professor.ratingStats.averageGeneral)}>
                                                    {professor.ratingStats.averageGeneral.toFixed(1)}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem className="dark:text-white" onClick={() => handleViewProfessor(professor)}>
                                                        <Eye className="mr-2 h-4 w-4" /> Ver Detalles
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="dark:text-white" onClick={() => handleEditProfessor(professor)}>
                                                        <Edit className="mr-2 h-4 w-4" /> Editar
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="text-red-500"
                                                        onClick={() => {
                                                            setProfessorToDelete(professor);
                                                            setOpenDeleteDialog(true);
                                                        }}
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24">
                                        No se encontraron profesores
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Paginación */}
                <div className="flex justify-center items-center gap-4 mt-4">
                    <Button
                        variant="outline"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                    >
                        <ChevronLeft className="h-4 w-4 dark:text-white" />
                    </Button>
                    <span className="dark:text-white">Página {currentPage} de {totalPages}</span>
                    <Button
                        variant="outline"
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                    >
                        <ChevronRight className="h-4 w-4 dark:text-white" />
                    </Button>
                </div>

                {/* Modal Editar/Crear */}
                <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                    <DialogContent className="w-full">
                        <DialogHeader>
                            <DialogTitle>
                                {currentProfessor ? "Editar Profesor" : "Nuevo Profesor"}
                            </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Nombre Completo</Label>
                                <Input
                                    value={currentProfessor?.name || ''}
                                    onChange={(e) => setCurrentProfessor(prev =>
                                        prev ? { ...prev, name: e.target.value } : null
                                    )}
                                    className={errors.name ? 'border-red-500' : 'dark:bg-[#383939] border border-gray-300 dark:border-[#202024] dark:text-white'}
                                />
                                {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="faculty">Facultad</Label>
                                <Select
                                    value={currentProfessor?.facultyId || ''}
                                    onValueChange={handleFacultyChange}
                                >
                                    <SelectTrigger id="faculty">
                                        <SelectValue placeholder="Selecciona una facultad" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white">
                                        {faculties.map((faculty) => (
                                            <SelectItem
                                                key={faculty._id}
                                                value={faculty._id}
                                                className="hover:bg-gray-100"
                                            >
                                                {faculty.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.faculty && <p className="text-red-500 text-sm">{errors.faculty}</p>}
                            </div>

                            <div className="space-y-2">
                                <SubjectSelector
                                    allSubjects={allSubjects}
                                    selectedSubjects={currentProfessor?.subjects || []}
                                    facultyId={currentProfessor?.facultyId || ''}
                                    onChange={(newSubjects) => setCurrentProfessor(prev =>
                                        prev ? { ...prev, subjects: newSubjects } : null
                                    )}
                                    error={errors.subjects}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="cancel" onClick={() => setOpenDialog(false)}>
                                Cancelar
                            </Button>
                            <Button variant="save" onClick={handleSaveProfessor} disabled={isLoadingAction}>
                                {isLoadingAction ? 'Guardando...' : 'Guardar'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Modal Ver Detalles */}
                <Dialog open={openViewDialog} onOpenChange={setOpenViewDialog}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Detalles del Profesor</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="flex flex-col items-center">
                                <Avatar className="h-24 w-24 bg-gray-300">
                                    <AvatarFallback className="text-2xl">
                                        {getInitials(viewingProfessor?.name || '')}
                                    </AvatarFallback>
                                </Avatar>
                                <h2 className="text-2xl font-bold mt-4">{viewingProfessor?.name}</h2>
                                <p className="text-muted-foreground">{viewingProfessor?.faculty}</p>
                            </div>

                            <div className="space-y-4">
                                <h3 className="font-semibold">Calificaciones</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <p className="text-sm text-muted-foreground">General</p>
                                        <div className="flex items-center">
                                            <Star className={`h-4 w-4 mr-2 ${getRatingColor(viewingProfessor?.ratingStats.averageGeneral || 0)
                                                }`} />
                                            <span className="font-medium">
                                                {(viewingProfessor?.ratingStats.averageGeneral || 0).toFixed(1)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm text-muted-foreground">Accesibilidad</p>
                                        <div className="flex items-center">
                                            <Star className={`h-4 w-4 mr-2 ${getRatingColor(viewingProfessor?.ratingStats.averageAccessibility || 0)
                                                }`} />
                                            <span className="font-medium">
                                                {(viewingProfessor?.ratingStats.averageAccessibility || 0).toFixed(1)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm text-muted-foreground">Asistencia</p>
                                        <div className="flex items-center">
                                            <Star className={`h-4 w-4 mr-2 ${getRatingColor(viewingProfessor?.ratingStats.averageAttendance || 0)
                                                }`} />
                                            <span className="font-medium">
                                                {(viewingProfessor?.ratingStats.averageAttendance || 0).toFixed(1)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm text-muted-foreground">Explicación</p>
                                        <div className="flex items-center">
                                            <Star className={`h-4 w-4 mr-2 ${getRatingColor(viewingProfessor?.ratingStats.averageExplanation || 0)
                                                }`} />
                                            <span className="font-medium">
                                                {(viewingProfessor?.ratingStats.averageExplanation || 0).toFixed(1)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm text-muted-foreground">Dificultad</p>
                                        <div className="flex items-center">
                                            <Star className={`h-4 w-4 mr-2 ${getRatingColor(viewingProfessor?.ratingStats.averageDifficulty || 0)
                                                }`} />
                                            <span className="font-medium">
                                                {(viewingProfessor?.ratingStats.averageDifficulty || 0).toFixed(1)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="font-semibold mb-2">Materias Impartidas</h3>
                                <div className="flex flex-wrap gap-2">
                                    {viewingProfessor?.subjects.map((subject, index) => (
                                        <Badge key={index} variant="outline">{subject}</Badge>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Modal Eliminar */}
                <Dialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Confirmar Eliminación</DialogTitle>
                            <DialogDescription>
                                ¿Estás seguro de eliminar al profesor "{professorToDelete?.name}"?
                                Esta acción no se puede deshacer.
                            </DialogDescription>
                        </DialogHeader>
                        <Input
                            placeholder="Escribe el nombre del profesor para confirmar"
                            value={confirmName}
                            onChange={(e) => setConfirmName(e.target.value)}
                        />
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setOpenDeleteDialog(false)}>
                                Cancelar
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={async () => {
                                    if (professorToDelete && confirmName === professorToDelete.name) {
                                        try {
                                            await axios.delete(
                                                `${API_URL}/admin/faculty/${professorToDelete.facultyId}/professor/${professorToDelete._id}`,
                                                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
                                            );
                                            setProfessors(prev => prev.filter(p => p._id !== professorToDelete._id));
                                            setOpenDeleteDialog(false);
                                        } catch (error) {
                                            toast({
                                                title: 'Error',
                                                description: 'Error eliminando profesor',
                                                variant: 'destructive'
                                            });
                                        }
                                    }
                                }}
                                disabled={confirmName !== professorToDelete?.name}
                            >
                                Eliminar
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </main>
        </div>
    );
};

export default Professors;