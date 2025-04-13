import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Pencil, Trash2, Plus } from "lucide-react";
import { useToast } from "../../hooks/use-toast";
import { Button } from "../ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "../ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import axios from 'axios';

interface Faculty {
  _id: string;
  name: string;
  abbreviation: string;
  departments: string[];
}

interface Department {
  _id: string;
}

const AdminFaculties: React.FC = () => {
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentFaculty, setCurrentFaculty] = useState<{ 
    _id?: string; 
    name: string; 
    abbreviation: string; 
    departments: string[] 
  }>({ 
    name: "", 
    abbreviation: "", 
    departments: [] 
  });
  const [facultyToDelete, setFacultyToDelete] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const { toast } = useToast();

  const fetchFaculties = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/admin/faculty`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setFaculties(response.data);
    } catch (err) {
      console.error('Error fetching faculties:', err);
    }
  };

  useEffect(() => {
    fetchFaculties();
  }, []);

  useEffect(() => {
    if (location.state?.refresh) {
      fetchFaculties();
      navigate('.', { state: {} });
    }
  }, [location.state, navigate]);

  const normalizeString = (str: string) => {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  };

  const filteredFaculties = faculties.filter(faculty =>
    normalizeString(faculty.name).includes(normalizeString(searchTerm)) ||
    normalizeString(faculty.abbreviation).includes(normalizeString(searchTerm))
  );

  const handleAddFaculty = () => {
    setCurrentFaculty({ name: "", abbreviation: "", departments: [] });
    setIsDialogOpen(true);
  };

  const handleEditFaculty = (faculty: Faculty) => {
    setCurrentFaculty({ 
      _id: faculty._id, 
      name: faculty.name, 
      abbreviation: faculty.abbreviation, 
      departments: faculty.departments 
    });
    setIsDialogOpen(true);
  };

  const handleDeleteFaculty = (id: string) => {
    setFacultyToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleSaveFaculty = async () => {
    if (!currentFaculty.name.trim() || !currentFaculty.abbreviation.trim()) {
      toast({
        title: "Error",
        description: "El nombre y la abreviatura son obligatorios",
        variant: "destructive",
      });
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const dataToSend = {
        name: currentFaculty.name,
        abbreviation: currentFaculty.abbreviation,
        departments: currentFaculty.departments.map(id => ({ _id: id }))
      };

      if (currentFaculty._id) {
        await axios.put(
          `${import.meta.env.VITE_API_URL}/admin/faculty/${currentFaculty._id}`,
          dataToSend,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        toast({
          title: "Facultad actualizada",
          description: `Facultad "${currentFaculty.name}" actualizada correctamente.`,
        });
      } else {
        await axios.post(
          `${import.meta.env.VITE_API_URL}/admin/faculty`,
          dataToSend,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        toast({
          title: "Facultad creada",
          description: `Facultad "${currentFaculty.name}" creada correctamente.`,
        });
      }

      fetchFaculties();
      setIsDialogOpen(false);
    } catch (err) {
      console.error('Error saving faculty:', err);
      toast({
        title: "Error",
        description: "Ocurrió un error al guardar la facultad",
        variant: "destructive",
      });
    }
  };

  const handleConfirmDelete = async () => {
    if (facultyToDelete) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${import.meta.env.VITE_API_URL}/admin/faculty/${facultyToDelete}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setFaculties(faculties.filter(f => f._id !== facultyToDelete));
        setIsDeleteDialogOpen(false);
        toast({
          title: "Facultad eliminada",
          description: "Facultad eliminada correctamente.",
        });
      } catch (err) {
        console.error('Error deleting faculty:', err);
        toast({
          title: "Error",
          description: "Ocurrió un error al eliminar la facultad",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="bg-white min-h-screen">
      <main className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Facultades</h1>
          <Button className='bg-black text-white' onClick={handleAddFaculty}>
            <Plus className="w-4 h-4 mr-2" />
            Nueva Facultad
          </Button>
        </div>

        <div className="relative w-full max-w-md mb-6">
          <input
            type="text"
            placeholder="Buscar por nombre o abreviatura..."
            className="w-full border border-gray-200 px-4 py-3 rounded-xl shadow-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="border border-gray-200 rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Abreviatura</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFaculties.map(faculty => (
                <TableRow key={faculty._id}>
                  <TableCell>{faculty.name}</TableCell>
                  <TableCell>{faculty.abbreviation}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleEditFaculty(faculty)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="text-red-500 hover:bg-red-100"
                        onClick={() => handleDeleteFaculty(faculty._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </main>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {currentFaculty._id ? "Editar Facultad" : "Nueva Facultad"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nombre</Label>
              <Input
                value={currentFaculty.name}
                className='border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-white focus:border-indigo-500'
                onChange={(e) => setCurrentFaculty({...currentFaculty, name: e.target.value})}
                placeholder="Ej. Facultad de Ingeniería"
              />
            </div>
            <div>
              <Label>Abreviatura</Label>
              <Input
                value={currentFaculty.abbreviation}
                className='border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-white focus:border-indigo-500'
                onChange={(e) => setCurrentFaculty({...currentFaculty, abbreviation: e.target.value})}
                placeholder="Ej. FI"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="cancel" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="save" onClick={handleSaveFaculty}>
              {currentFaculty._id ? "Guardar cambios" : "Crear facultad"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar facultad?</DialogTitle>
            <DialogDescription>
              Esta acción no se puede deshacer. ¿Confirmas que deseas eliminar esta facultad?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="cancel" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminFaculties;