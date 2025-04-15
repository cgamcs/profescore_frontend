import { useState, useEffect } from 'react';
import { Badge } from "../../components/ui/badge";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";
import { ScrollArea } from "../../components/ui/scroll-area";
import { Check, X } from "lucide-react";

interface SubjectSelectorProps {
    allSubjects: {
        _id: string;
        name: string;
        facultyId: string;
    }[];
    selectedSubjects: string[];
    facultyId: string;
    onChange: (newSubjects: string[]) => void;
    error?: string;
}

const SubjectSelector = ({
    allSubjects,
    selectedSubjects,
    facultyId,
    onChange,
    error
}: SubjectSelectorProps) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [availableSubjects, setAvailableSubjects] = useState<{ _id: string; name: string; facultyId: string }[]>([]);

    // Filter subjects by faculty and search term
    useEffect(() => {
        if (!facultyId) {
            setAvailableSubjects([]);
            return;
        }

        const filteredSubjects = allSubjects
            .filter(subject => subject.facultyId === facultyId)
            .filter(subject =>
                subject.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        setAvailableSubjects(filteredSubjects);
    }, [allSubjects, facultyId, searchTerm]);

    const handleToggleSubject = (subjectId: string) => {
        const newSelectedSubjects = selectedSubjects.includes(subjectId)
            ? selectedSubjects.filter(s => s !== subjectId)
            : [...selectedSubjects, subjectId];

        onChange(newSelectedSubjects);
    };

    return (
        <div className="space-y-2">
            <Label>Materias</Label>

            {/* Search input */}
            <div className="relative">
                <Input
                    placeholder="Buscar materia..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="mb-2 dark:bg-[#383939] border border-gray-300 dark:border-[#202024] dark:text-white"
                />
                {searchTerm && (
                    <button
                        className="absolute right-2 top-1/2 -translate-y-1/2"
                        onClick={() => setSearchTerm('')}
                        type="button"
                    >
                        <X className="h-4 w-4 text-gray-500" />
                    </button>
                )}
            </div>

            {/* Selected subjects */}
            {selectedSubjects.length > 0 && (
                <div className="mb-2">
                    <Label className="text-sm text-gray-500 dark:text-gray-300">Seleccionadas ({selectedSubjects.length})</Label>
                    <div className="flex flex-wrap gap-2 mt-1">
                        {selectedSubjects.map(subjectId => {
                            const subjectName = allSubjects.find(s => s._id === subjectId)?.name || '';
                            return (
                                <Badge
                                    key={subjectId}
                                    variant="default"
                                    className="px-2 py-1 dark:bg-[#383939] flex items-center gap-1"
                                >
                                    {subjectName}
                                    <button
                                        onClick={() => handleToggleSubject(subjectId)}
                                        className="ml-1 text-white hover:text-red-200 rounded-full"
                                        type="button"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </Badge>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Available subjects */}
            <ScrollArea className="border border-gray-300 dark:border-[#2B2B2D] rounded-md h-64 p-2">
                {availableSubjects.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                        {availableSubjects.map(subject => {
                            const isSelected = selectedSubjects.includes(subject._id);
                            return (
                                <Badge
                                    key={subject._id}
                                    variant={isSelected ? "secondary" : "outline"}
                                    className={`cursor-pointer flex items-center gap-1 ${isSelected ? 'bg-gray-200 dark:bg-[#2B2B2D]' : ''
                                        }`}
                                    onClick={() => handleToggleSubject(subject._id)}
                                >
                                    {isSelected && <Check className="h-3 w-3" />}
                                    {subject.name}
                                </Badge>
                            );
                        })}
                    </div>
                ) : (
                    <p className="text-gray-500 text-center py-8">
                        {searchTerm
                            ? "No se encontraron materias con ese nombre"
                            : facultyId
                                ? "No hay materias disponibles para esta facultad"
                                : "Selecciona una facultad para ver materias"
                        }
                    </p>
                )}
            </ScrollArea>

            {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
    );
};

export default SubjectSelector;