import React, { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from './components/ui/toaster';
import LayoutWithHeader from './components/LayoutWithHeader';
import FacultyDetails from './components/FacultyDetail';
import SubjectsPage from './components/SubjectsPage';
import ProfessorsPage from './components/ProfessorsPage';
import SubjectDetail from './components/SubjectDetail';
import ProfessorDetail from './components/ProfessorDetail';
import ProfessorRating from './components/ProfessorRating';
import ProfessorAdd from './components/ProfessorAdd';
import AdminLogin from './components/admin/AdminLogin';
import AdminWithHeader from './components/admin/AdminWithHeader';
import AdminDashboard from './components/admin/AdminDashboard';
import AdminFaculties from './components/admin/AdminFaculties';
import AddFaculty from './components/admin/AddFaculty';
import EditFaculty from './components/admin/EditFaculty';
import AdminSubjects from './components/admin/AdminSubjects';
import AddSubject from './components/admin/AddSubject';
import EditSubject from './components/admin/EditSubject';
import AdminProfessors from './components/admin/AdminProfessors';
import AddProfessor from './components/admin/AddProfessor';
import Unauthorized from './components/401/Unauthorized';
import Faq from './components/Faq';
import Privacity from './components/Privacity';
import AdminReports from './components/admin/AdminReports';
import EditProfessor from './components/admin/EditProfessor';
import HomePage from './components/HomePage'; // Importa el nuevo componente

const themeKeys = {
  system: "system",
  light: "light",
  dark: "dark"
} as const;

type ThemeKey = keyof typeof themeKeys;

// Function to check if browser supports View Transitions API
const supportsViewTransitions = () => {
  return !!document.startViewTransition;
};

const App: React.FC = () => {
  const [theme] = useState<ThemeKey>(localStorage.getItem('theme') as ThemeKey || 'system');

  // Add a class to the body if the browser supports View Transitions
  if (supportsViewTransitions()) {
    document.body.classList.add('view-transitions-enabled');
  }

  useEffect(() => {
    const root = document.documentElement;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const applyThem = () => {
      root.classList.toggle(
        'dark',
        theme === themeKeys.dark ||
        (theme === themeKeys.system && mediaQuery.matches)
      )

      localStorage.setItem("theme", theme)
    };

    applyThem();

    mediaQuery.addEventListener("change", applyThem)

    return () => {
      mediaQuery.removeEventListener("change", applyThem)
    };
  }, [theme]);

  return (
    <>
      <Routes>
        {/* Ruta de login para admin */}
        <Route path="/admin/login" element={<AdminLogin />} />

        <Route path="/admin" element={<AdminWithHeader />}>
          <Route index element={<AdminDashboard />} />
          <Route path="facultades" element={<AdminFaculties />} />
          <Route path="facultades/agregar" element={<AddFaculty />} />
          <Route path="facultades/:facultyId" element={<EditFaculty />} />
          <Route path="materias" element={<AdminSubjects />} />
          <Route path="facultad/:facultyId/materia/agregar" element={<AddSubject />} />
          <Route path="facultad/:facultyId/materia/:subjectId" element={<EditSubject />} />
          <Route path="maestros" element={<AdminProfessors />} />
          <Route path="facultad/:facultyId/maestro/multiple" element={<AddProfessor />} />
          <Route path="facultad/:facultyId/maestro/:professorId" element={<EditProfessor />} />
          <Route path="reportes" element={<AdminReports />} />
        </Route>

        {/* Ruta principal sin header */}
        <Route path="/" element={<HomePage />} />

        {/* Rutas con header */}
        <Route path="/facultad/:facultyId" element={<LayoutWithHeader />}>
          <Route index element={<FacultyDetails />} />
          <Route path="materias" element={<SubjectsPage />} />
          <Route path="materia/:subjectId" element={<SubjectDetail />} />
          <Route path="maestros" element={<ProfessorsPage />} />
          <Route path="maestros/agregar-maestro" element={<ProfessorAdd />} />
          <Route path="maestro/:professorId" element={<ProfessorDetail />} />
          <Route path="maestro/:professorId/calificar" element={<ProfessorRating />} />
        </Route>

        <Route path='/faq' element={<Faq />}></Route>
        <Route path='/privacity' element={<Privacity />}></Route>

        <Route element={<LayoutWithHeader />}>
          <Route path='/401' element={<Unauthorized />}></Route>
        </Route>
      </Routes>
      <Toaster />
    </>
  );
};

export default App;