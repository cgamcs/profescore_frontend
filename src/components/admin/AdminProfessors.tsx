import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "../../components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "../../components/ui/dialog";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "../../components/ui/dropdown-menu";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { useToast } from "../../hooks/use-toast";
import { Badge } from "../../components/ui/badge";
import { Plus, Search, MoreHorizontal, Star, Eye, Trash } from "lucide-react";

interface IFaculty {
  _id: string;
  name: string;
}

interface IProfessor {
  _id: string;
  name: string;
  faculty: string;
  facultyId: string;
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
  const { toast } = useToast();

  useEffect(() => {
    const fetchProfessors = async () => {
      try {
        const [professorsRes, facultiesRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/admin/professors`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          }),
          axios.get(`${import.meta.env.VITE_API_URL}/admin/faculty`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          })
        ]);

        const faculties = facultiesRes.data;
        const professorsWithFacultyId = professorsRes.data.map((professor: any) => {
          const faculty = faculties.find((f: IFaculty) => f.name === professor.faculty);
          return {
            ...professor,
            faculty: professor.faculty,
            facultyId: faculty?._id || ''
          };
        });
        setProfessors(professorsWithFacultyId);
        setFaculties(faculties);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchProfessors();
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
      const faculty = faculties.find(f => f._id === professor.facultyId);
      if (faculty) {
        try {
          await axios.delete(`${import.meta.env.VITE_API_URL}/admin/faculty/${professor.facultyId}/professor/${professor._id}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          setProfessors(professors.filter(p => p._id !== professor._id));
          setProfessorToDelete(null);
          setConfirmName('');
          toast({
            title: "Profesor eliminado",
            description: `El profesor "${professor.name}" ha sido eliminado correctamente.`,
          });
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

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return "text-green-500";
    if (rating >= 4.0) return "text-emerald-500";
    if (rating >= 3.5) return "text-amber-500";
    if (rating >= 3.0) return "text-orange-500";
    return "text-red-500";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Administrar Profesores</h1>
        <p className="text-muted-foreground">Gestiona los profesores de la universidad</p>
      </div>

      <Card>
        <CardHeader className="flex-row justify-between items-center space-y-0 gap-4">
          <div>
            <CardTitle>Lista de Profesores</CardTitle>
            <CardDescription>Todos los profesores disponibles en el sistema</CardDescription>
          </div>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Profesor
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar profesores..."
                className="pl-8"
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
          </div>

          <div className="border rounded-md">
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
                {filteredProfessors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                      No se encontraron profesores
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProfessors.map((professor) => (
                    <TableRow key={professor._id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="font-medium">{professor.name}</div>
                        </div>
                      </TableCell>
                      <TableCell>{professor.faculty}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {professor.subjects.map((subject: string, index: number) => (
                            <Badge key={index} variant="outline" className="bg-slate-100">
                              {subject}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Star className={`h-4 w-4 ${getRatingColor(professor.ratingStats.averageGeneral)}`} fill="currentColor" />
                          <span className={`font-medium ${getRatingColor(professor.ratingStats.averageGeneral)}`}>
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
                            <DropdownMenuItem asChild>
                              <Link to={`/admin/facultad/${professor.facultyId}/maestro/${professor._id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                Ver detalles
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link to={`/admin/facultad/${professor.facultyId}/maestro/${professor._id}/editar`}>
                                <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                Editar
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => setProfessorToDelete(professor)}>
                              <Trash className="mr-2 h-4 w-4" />
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {professorToDelete && (
        <Dialog open={!!professorToDelete}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Eliminar Profesor</DialogTitle>
              <DialogDescription>
                ¿Estás seguro de que deseas eliminar al profesor "{professorToDelete.name}"? Esta acción no se puede deshacer.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="confirm-name">Escribe el nombre del profesor para confirmar:</Label>
                <Input
                  id="confirm-name"
                  value={confirmName}
                  onChange={(e) => setConfirmName(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setProfessorToDelete(null)}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={() => handleDelete(professorToDelete)}>
                Eliminar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {showAddModal && (
        <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Agregar Profesor</DialogTitle>
              <DialogDescription>
                Selecciona la facultad para agregar un nuevo profesor.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="faculty-select">Selecciona la facultad:</Label>
                <Select value={selectedFaculty} onValueChange={handleFacultySelect}>
                  <SelectTrigger id="faculty-select">
                    <SelectValue placeholder="Selecciona una facultad" />
                  </SelectTrigger>
                  <SelectContent>
                    {faculties.map(faculty => (
                      <SelectItem key={faculty._id} value={faculty._id}>
                        {faculty.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddModal(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddProfessor}>
                Continuar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default AdminProfessors;