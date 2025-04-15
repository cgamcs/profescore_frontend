import { useEffect, useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { ProfessorPageLoader } from '../layouts/SkeletonLoader';
import api from '../api';
import useViewTransition from '../layouts/useViewTransition';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import SubjectSelector from '../components/ui/subjectselector';
import { useToast } from "../hooks/use-toast";

interface IProfessor {
    _id: string;
    name: string;
    department?: string;
    subjects: string[];
    ratingStats: {
        averageGeneral: number;
        totalRatings: number;
    };
}

interface ISubject {
    _id: string;
    name: string;
}

const STALE_TIME = 5 * 60 * 1000; // 5 minutos

const ProfessorsPage = () => {
    const { facultyId } = useParams<{ facultyId: string }>();
    const [searchQuery, setSearchQuery] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [currentProfessor, setCurrentProfessor] = useState<IProfessor | null>(null);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [isLoadingAction, setIsLoadingAction] = useState(false);
    const { handleLinkClick } = useViewTransition();
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const { data: professors = [], isLoading: professorsLoading } = useQuery({
        queryKey: ['professors', facultyId],
        queryFn: () => api.get(`/faculties/${facultyId}/professors`).then(res => res.data),
        staleTime: STALE_TIME,
        select: (data) => data.map((prof: IProfessor) => ({
            _id: prof._id,
            name: prof.name,
            department: prof.department,
            subjects: prof.subjects,
            ratingStats: {
                averageGeneral: prof.ratingStats.averageGeneral,
                totalRatings: prof.ratingStats.totalRatings
            }
        }))
    });

    const { data: subjects = [], isLoading: subjectsLoading } = useQuery({
        queryKey: ['subjects', facultyId],
        queryFn: () => api.get(`/faculties/${facultyId}/subjects`).then(res => res.data),
        staleTime: STALE_TIME,
        select: (data) => data.map((subj: ISubject) => ({
            _id: subj._id,
            name: subj.name,
            facultyId: facultyId // Asegúrate de agregar el facultyId aquí
        }))
    });

    // Verificar si las materias se están cargando correctamente
    useEffect(() => {
        console.log('Subjects loaded:', subjects);
    }, [subjects]);

    const isLoading = professorsLoading || subjectsLoading;

    useEffect(() => {
        document.title = "ProfeScore - Maestros";

        const mainElement = document.getElementById('main-content');
        if (mainElement) {
            mainElement.style.viewTransitionName = 'main-content';
            mainElement.style.contain = 'layout';
        }

        return () => {
            const mainElement = document.getElementById('main-content');
            if (mainElement) {
                mainElement.style.viewTransitionName = '';
                mainElement.style.contain = '';
            }
        };
    }, []);

    const normalizeText = (text: string) => {
        return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    };

    const filteredProfessors = useMemo(() => {
        if (!searchQuery) return professors;

        const query = normalizeText(searchQuery);
        return professors.filter((professor: IProfessor) => {
            const nameMatches = normalizeText(professor.name).includes(query);
            const subjectMatches = professor.subjects.some((subjectId: string) => {
                const subject = subjects.find((s: ISubject) => s._id === subjectId);
                return subject ? normalizeText(subject.name).includes(query) : false;
            });
            return nameMatches || subjectMatches;
        });
    }, [professors, subjects, searchQuery]);

    const filteredSubjects = useMemo(() => {
        if (!searchQuery) return [];

        const query = normalizeText(searchQuery);
        return subjects.filter((subject: ISubject) => {
            const nameMatches = normalizeText(subject.name).includes(query);
            const hasProfessor = professors.some((professor: IProfessor) =>
                professor.subjects.includes(subject._id)
            );
            return nameMatches && !hasProfessor;
        });
    }, [subjects, professors, searchQuery]);

    const renderStars = (rating: number) => {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;

        return (
            <div className="flex">
                {[...Array(5)].map((_, index) => {
                    if (index < fullStars) {
                        return <i key={index} className="fas fa-star text-indigo-500 dark:text-[#83838B] text-sm" />;
                    }
                    if (index === fullStars && hasHalfStar) {
                        return <i key={index} className="fas fa-star-half-alt text-indigo-500 dark:text-[#83838B] text-sm" />;
                    }
                    return <i key={index} className="far fa-star text-gray-300 text-sm" />;
                })}
            </div>
        );
    };

    const handleOpenAddDialog = () => {
        setCurrentProfessor({
            _id: '',
            name: '',
            department: '',
            subjects: [],
            ratingStats: {
                averageGeneral: 0,
                totalRatings: 0
            }
        });
        setErrors({});
        setOpenDialog(true);
    };

    const handleSaveProfessor = async () => {
        if (!currentProfessor || !facultyId) return;
    
        const newErrors: { [key: string]: string } = {};
        if (!currentProfessor.name.trim()) newErrors.name = 'Nombre requerido';
        if (currentProfessor.subjects.length === 0) newErrors.subjects = 'Selecciona al menos una materia';
    
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
    
        try {
            setIsLoadingAction(true);
    
            const payload = {
                name: currentProfessor.name,
                subjects: currentProfessor.subjects // Aquí se envían los IDs de las materias
            };
    
            const endpoint = currentProfessor._id ?
                `/faculties/${facultyId}/professor/${currentProfessor._id}` :
                `/faculties/${facultyId}/professor/multiple`; // Actualiza la ruta aquí
    
            const response = await api[currentProfessor._id ? 'put' : 'post'](endpoint, payload);
    
            const updatedProfessor = {
                ...response.data,
                subjects: Array.isArray(response.data.subjects) ? response.data.subjects.map((subjectId: string) => {
                    const subject = subjects.find((s: ISubject) => s._id === subjectId);
                    return subject ? subject.name : '';
                }) : []
            };
    
            queryClient.setQueryData(['professors', facultyId], (oldData: IProfessor[]) => {
                if (currentProfessor._id) {
                    return oldData.map(p => p._id === currentProfessor._id ? updatedProfessor : p);
                } else {
                    return [...oldData, updatedProfessor];
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
        } finally {
            setIsLoadingAction(false);
        }
    };

    if (isLoading) return <ProfessorPageLoader />;

    return (
        <main id="main-content" data-view-transition className="container mx-auto px-4 py-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl dark:text-white font-bold">Maestros</h1>
                <button
                    onClick={handleOpenAddDialog}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium hover:cursor-pointer"
                >
                    Agregar Maestro
                </button>
            </div>

            <div className="relative max-w-2xl mx-auto mb-8">
                <input
                    type="text"
                    placeholder="Buscar por nombre del maestro o materia..."
                    className="w-full border dark:text-white border-gray-200 dark:border-[#2B2B2D] px-4 py-3 rounded-xl shadow-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 text-black dark:text-[#383939] w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </div>

            <div className="bg-white dark:bg-[#202024] rounded-lg border border-gray-200 dark:border-[#202024] shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-[#383939]">
                        <thead className="bg-gray-50 dark:bg-indigo-600">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">Nombre</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">Materias</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">Calificación</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-[#202024] divide-y divide-gray-200 dark:divide-[#383939]">
                            {filteredProfessors.map((professor: IProfessor) => (
                                <tr key={professor._id} className="hover:bg-gray-50 dark:hover:bg-[#ffffff0d]">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <Link
                                            to={`/facultad/${facultyId}/maestro/${professor._id}`}
                                            onClick={(e) => handleLinkClick(`/facultad/${facultyId}/maestro/${professor._id}`, e)}
                                            className="text-indigo-600 dark:text-white font-medium"
                                        >
                                            {professor.name}
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        <div className="flex flex-wrap gap-1">
                                            {professor.subjects?.slice(0, 2).map((subjectId: string) => {
                                                const subject = subjects.find((s: ISubject) => s._id === subjectId);
                                                return subject ? (
                                                    <span
                                                        key={subjectId}
                                                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 dark:bg-indigo-600 text-indigo-800 dark:text-white"
                                                    >
                                                        {subject.name}
                                                    </span>
                                                ) : null;
                                            })}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <span className="bg-indigo-100 dark:bg-[#646464] text-indigo-800 dark:text-white font-bold rounded px-2 py-1 text-sm mr-2">
                                                {professor.ratingStats.averageGeneral.toFixed(1)}
                                            </span>
                                            {renderStars(professor.ratingStats.averageGeneral)}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredSubjects.map((subject: ISubject) => (
                                <tr key={subject._id} className="hover:bg-gray-50 dark:hover:bg-[#ffffff0d]">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-gray-500 dark:text-gray-400 font-medium">
                                            Sin maestro
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        <div className="flex flex-wrap gap-1">
                                            <span
                                                key={subject._id}
                                                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 dark:bg-indigo-400/70 text-indigo-800 dark:text-white"
                                            >
                                                {subject.name}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <span className="bg-gray-100 dark:bg-[#646464] text-gray-800 dark:text-white font-bold rounded px-2 py-1 text-sm mr-2">
                                                N/A
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right whitespace-nowrap"></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

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
                            <SubjectSelector
                                facultyId={facultyId!}
                                allSubjects={subjects}
                                selectedSubjects={currentProfessor?.subjects || []}
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
        </main>
    );
};

export default ProfessorsPage;