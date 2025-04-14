import { useState, useEffect, useCallback, useMemo } from 'react';
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
import { Plus, MoreHorizontal, Book, Users, Trash2, Edit, ChevronLeft, ChevronRight } from "lucide-react";

// API base URL
const API_URL = import.meta.env.VITE_API_URL;
// Items per page for client-side pagination
const ITEMS_PER_PAGE = 10;

// Interfaces
interface IFaculty {
  _id: string;
  name: string;
  abbreviation: string;
}

interface ISubject {
  _id: string;
  name: string;
  credits: number;
  description: string;
  faculty: IFaculty | null;
  professors: string[];
  studentsCount?: number;
}

// Utility function to normalize strings for case-insensitive comparison
const normalizeString = (str = '') => 
  str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

const Subjects = () => {
  const { toast } = useToast();
  
  // Main data states
  const [allSubjects, setAllSubjects] = useState<ISubject[]>([]);
  const [faculties, setFaculties] = useState<IFaculty[]>([]);
  
  // UI states
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [currentSubject, setCurrentSubject] = useState<Partial<ISubject>>({ faculty: null });
  const [confirmationInput, setConfirmationInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Loading states
  const [isInitialDataLoaded, setIsInitialDataLoaded] = useState(false);
  const [isLoadingAction, setIsLoadingAction] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  
  // Memoized filtered subjects - only recalculate when necessary
  const filteredSubjects = useMemo(() => {
    if (!searchTerm.trim()) return allSubjects;
    
    const normalizedSearch = normalizeString(searchTerm);
    return allSubjects.filter(subject => 
      normalizeString(subject.name).includes(normalizedSearch) ||
      (subject.faculty && normalizeString(subject.faculty.abbreviation).includes(normalizedSearch))
    );
  }, [allSubjects, searchTerm]);
  
  // Calculate paginated subjects
  const paginatedSubjects = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredSubjects.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredSubjects, currentPage]);
  
  // Total pages
  const totalPages = useMemo(() => 
    Math.max(1, Math.ceil(filteredSubjects.length / ITEMS_PER_PAGE)), 
    [filteredSubjects.length]
  );
  
  // Reset to first page when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);
  
  // Fetch initial data (subjects and faculties) in parallel
  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();
    
    const fetchInitialData = async () => {
      try {
        // Create both requests
        const subjectsPromise = axios.get(`${API_URL}/admin/subjects`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          signal: controller.signal
        });
        
        const facultiesPromise = axios.get(`${API_URL}/admin/faculty`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          signal: controller.signal
        });
        
        // Execute in parallel
        const [subjectsRes, facultiesRes] = await Promise.all([
          subjectsPromise,
          facultiesPromise
        ]);
        
        if (isMounted) {
          setAllSubjects(subjectsRes.data);
          setFaculties(facultiesRes.data);
          setIsInitialDataLoaded(true);
        }
      } catch (error) {
        if (isMounted && !axios.isCancel(error)) {
          toast({
            title: 'Error',
            description: 'No se pudieron cargar los datos',
            variant: 'destructive'
          });
        }
      }
    };
    
    fetchInitialData();
    
    // Cleanup function
    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);
  
  // Functions for handling subject operations
  const handleDialogOpen = useCallback((subject?: ISubject) => {
    setCurrentSubject(subject || { faculty: null });
    setErrors({});
    setOpenDialog(true);
  }, []);
  
  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};
    if (!currentSubject.name?.trim()) newErrors.name = 'Nombre obligatorio';
    if (!currentSubject.credits || currentSubject.credits < 1 || currentSubject.credits > 22) {
      newErrors.credits = 'Créditos entre 1-22';
    }
    if (!currentSubject.faculty?._id) newErrors.faculty = 'Facultad obligatoria';
    if (currentSubject.description && currentSubject.description.length > 500) {
      newErrors.description = 'Máximo 500 caracteres';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [currentSubject]);
  
  const handleSaveSubject = useCallback(async () => {
    if (!validateForm()) return;
    
    try {
      setIsLoadingAction(true);
      const isEdit = !!currentSubject._id;
      const url = isEdit
        ? `${API_URL}/admin/faculty/${currentSubject.faculty?._id}/subject/${currentSubject._id}`
        : `${API_URL}/admin/faculty/${currentSubject.faculty?._id}/subject`;
        
      const response = await axios[isEdit ? 'put' : 'post'](
        url, 
        currentSubject, 
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      
      // Si es una nueva materia, hacer una recarga completa de datos
      // para asegurar que todos los campos estén correctamente cargados
      if (!isEdit) {
        try {
          const refreshResponse = await axios.get(`${API_URL}/admin/subjects`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          });
          setAllSubjects(refreshResponse.data);
        } catch (refreshError) {
          // Si falla la recarga, al menos añadimos la materia con los datos que tenemos
          setAllSubjects(prev => [response.data, ...prev]);
        }
      } else {
        // Para ediciones, actualizamos solo la materia modificada
        setAllSubjects(prev => prev.map(s => s._id === currentSubject._id ? response.data : s));
      }
      
      toast({
        title: `Materia ${isEdit ? 'actualizada' : 'creada'}`,
        description: `La materia "${currentSubject.name}" se ha guardado correctamente`,
      });
      
      setOpenDialog(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error al procesar la solicitud',
        variant: 'destructive'
      });
    } finally {
      setIsLoadingAction(false);
    }
  }, [currentSubject, validateForm]);
  
  const handleDeleteSubject = useCallback(async () => {
    if (!currentSubject._id || !currentSubject.faculty?._id) return;
    
    try {
      setIsLoadingAction(true);
      await axios.delete(
        `${API_URL}/admin/faculty/${currentSubject.faculty._id}/subject/${currentSubject._id}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      
      setAllSubjects(prev => prev.filter(s => s._id !== currentSubject._id));
      
      toast({
        title: 'Materia eliminada',
        description: `La materia "${currentSubject.name}" ha sido eliminada`,
      });
      
      setOpenDeleteDialog(false);
      setConfirmationInput('');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error al eliminar la materia',
        variant: 'destructive'
      });
    } finally {
      setIsLoadingAction(false);
    }
  }, [currentSubject]);
  
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
          <h1 className="text-3xl dark:text-white font-bold">Materias</h1>
          <Button 
            className="bg-black dark:bg-indigo-600 text-white hover:cursor-pointer" 
            onClick={() => handleDialogOpen()}
            disabled={!isInitialDataLoaded}
          >
            <Plus className="w-4 h-4 mr-2" />
            Nueva Materia
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
                <TableHead>Materia</TableHead>
                <TableHead>Facultad</TableHead>
                <TableHead>Créditos</TableHead>
                <TableHead>Profesores</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!isInitialDataLoaded ? (
                <SkeletonLoader />
              ) : paginatedSubjects.length > 0 ? (
                paginatedSubjects.map((subject) => (
                  <TableRow className="hover:bg-gray-100" key={subject._id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center">
                          <Book className="h-5 w-5 text-purple-600" />
                        </div>
                        <span className="font-medium">{subject.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{subject.faculty?.abbreviation || 'N/A'}</TableCell>
                    <TableCell>{subject.credits}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{subject.professors?.length || 0}</span>
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
                          <DropdownMenuItem
                            className="dark:text-white"
                            onClick={() => handleDialogOpen(subject)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-500"
                            onClick={() => {
                              setCurrentSubject(subject);
                              setOpenDeleteDialog(true);
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24">
                    No se encontraron materias
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        
        {/* Pagination */}
        {isInitialDataLoaded && totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            >
              <ChevronLeft className="h-4 w-4 dark:text-white" />
            </Button>
            <span className="text-sm dark:text-white">
              Página {currentPage} de {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            >
              <ChevronRight className="h-4 w-4 dark:text-white" />
            </Button>
          </div>
        )}

        {/* Add/Edit Dialog */}
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {currentSubject?._id ? "Editar Materia" : "Nueva Materia"}
              </DialogTitle>
              <DialogDescription>
                {currentSubject?._id 
                  ? "Modifica los detalles de la materia" 
                  : "Completa los campos requeridos"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-white">Nombre de la Materia <span className="text-red-500">*</span></Label>
                <Input
                  value={currentSubject?.name || ''}
                  onChange={(e) => setCurrentSubject(prev => ({ ...prev, name: e.target.value }))}
                  className={errors.name ? 'border-red-500' : 'dark:bg-[#383939] border border-gray-300 dark:border-[#202024] dark:text-white'}
                />
                {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label className="text-white">Créditos <span className="text-red-500">*</span></Label>
                <Input
                  type="number"
                  value={currentSubject?.credits || ''}
                  onChange={(e) => setCurrentSubject(prev => ({
                    ...prev,
                    credits: Number(e.target.value)
                  }))}
                  className={errors.credits ? 'border-red-500' : 'dark:bg-[#383939] border border-gray-300 dark:border-[#202024] dark:text-white'}
                />
                {errors.credits && <p className="text-red-500 text-sm">{errors.credits}</p>}
              </div>

              <div className="space-y-2">
                <Label className="text-white">Facultad <span className="text-red-500">*</span></Label>
                <Select
                  value={currentSubject?.faculty?._id || ''}
                  onValueChange={(value) => {
                    const faculty = faculties.find(f => f._id === value);
                    setCurrentSubject(prev => ({ ...prev, faculty: faculty || null }));
                  }}
                >
                  <SelectTrigger className={errors.faculty ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Seleccionar facultad" />
                  </SelectTrigger>
                  <SelectContent>
                    {faculties.map(faculty => (
                      <SelectItem
                        key={faculty._id}
                        value={faculty._id}
                      >
                        {faculty.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.faculty && <p className="text-red-500 text-sm">{errors.faculty}</p>}
              </div>

              <div className="space-y-2">
                <Label className="text-white">Descripción</Label>
                <Input
                  value={currentSubject?.description || ''}
                  onChange={(e) => setCurrentSubject(prev => ({ ...prev, description: e.target.value }))}
                  className={errors.description ? 'border-red-500' : 'dark:bg-[#383939] border border-gray-300 dark:border-[#202024] dark:text-white'}
                />
                {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="cancel" 
                onClick={() => setOpenDialog(false)}
                disabled={isLoadingAction}
              >
                Cancelar
              </Button>
              <Button 
                variant="save"
                onClick={handleSaveSubject}
                disabled={isLoadingAction}
              >
                {isLoadingAction ? 'Guardando...' : currentSubject?._id ? 'Actualizar' : 'Crear'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar eliminación</DialogTitle>
              <DialogDescription>
                Escribe el nombre de la materia para confirmar:{" "}
                <strong>{currentSubject?.name}</strong>
              </DialogDescription>
            </DialogHeader>
            <Input
              value={confirmationInput}
              onChange={(e) => setConfirmationInput(e.target.value)}
              placeholder="Nombre de la materia"
            />
            <DialogFooter>
              <Button 
                variant="cancel" 
                onClick={() => {
                  setOpenDeleteDialog(false);
                  setConfirmationInput('');
                }}
                disabled={isLoadingAction}
              >
                Cancelar
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDeleteSubject}
                disabled={isLoadingAction || confirmationInput !== currentSubject?.name}
              >
                {isLoadingAction ? 'Eliminando...' : 'Eliminar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default Subjects;