import React, { useEffect, useState } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import LayoutWithHeader from './components/LayoutWithHeader';
import FacultyList from './components/FacultyList';
import FacultyDetails from './components/FacultyDetail';
import TopRatedProfessors from './components/TopRatedProfessors';
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

const themeKeys = {
  system: "system",
  light: "light",
  dark: "dark"
} as const;

type ThemeKey = keyof typeof themeKeys;

const App: React.FC = () => {
  const [theme] = useState<ThemeKey>(localStorage.getItem('theme') as ThemeKey || 'system');

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
      <Route path="/" element={
        <div className="min-h-screen bg-white dark:bg-[#0A0A0A]">
          {/* Logo y título */}
          <div className="pt-10 pb-6 text-center">
            <h1 className="text-3xl font-bold text-indigo-600 dark:text-indigo-500">ProfeScore</h1>
            <p className="text-gray-600 dark:text-[#F3F5F7] mt-2">Califica y encuentra a los mejores maestros</p>
          </div>

          <FacultyList />
          <TopRatedProfessors />

          {/* Footer */}
          <footer className="bg-white dark:bg-[#0A0A0A] border-t border-gray-200 dark:border-[#202024]">
            <div className='container mx-auto dark:text-white px-4 py-3 flex items-center justify-between'>
              <p>&copy; ProfeScore - {new Date().getFullYear()}</p>

              <div className="flex gap-4">
                <Link to="/faq" className="link">Preguntas Frecuentes</Link>
                <Link to="/privacity" className="link">Términos de Privacidad</Link>
              </div>

            </div>
          </footer>
        </div>
      } />

      <Route path='/faq' element={<Faq />}></Route>
      <Route path='/privacity' element={<Privacity />}></Route>

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

      <Route element={<LayoutWithHeader />}>
        <Route path='/401' element={<Unauthorized />}></Route>
      </Route>
    </Routes>
  );
};

export default App;