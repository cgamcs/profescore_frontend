import React from 'react';
import { Routes, Route } from 'react-router-dom';
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

const App: React.FC = () => {
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
      </Route>

      {/* Ruta principal sin header */}
      <Route path="/" element={
        <div className="min-h-screen bg-white">
          {/* Logo y título */}
          <div className="pt-10 pb-6 text-center">
            <h1 className="text-3xl font-bold text-indigo-600">ProfeScore</h1>
            <p className="text-gray-600 mt-2">Califica y encuentra a los mejores maestros</p>
          </div>

          <FacultyList />
          <TopRatedProfessors />

          {/* Footer */}
          <footer className="bg-white py-8 border-t border-gray-200 flex justify-center">
            <div className="px-4 text-center text-gray-600 flex flex-col gap-4 md:flex-row">
              <p>&copy; ProfeScore - {new Date().getFullYear()}</p>
              <a href="#" className="hover:text-indigo-600 hover:font-bold transition-all">FAQ</a>
              <a href="#" className="hover:text-indigo-600 hover:font-bold transition-all">Términos de Privacidad</a>
            </div>
          </footer>
        </div>
      } />

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