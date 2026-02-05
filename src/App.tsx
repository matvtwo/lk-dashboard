import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { useState } from 'react';

import GroupsBoard from './admin/pages/GroupsBoard';
import AuditPage from './admin/pages/AuditPage';
import LoginPage from './pages/Login';
import StudentProfile from './pages/StudentProfile';
import { useAuth } from './context/AuthContext';
import TeacherGroups from './pages/teacher/TeacherGroups';
import TeacherGroup from './pages/teacher/TeacherGroup';

function hasToken() {
  const t = localStorage.getItem('token');
  return typeof t === 'string' && t.length > 20 && t !== 'null';
}

function Protected({ authed, children }: { authed: boolean; children: JSX.Element }) {
  return authed ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const { role } = useAuth();

  const [authed, setAuthed] = useState(hasToken());

  return (
    <>
    <button
  className="topnav__link"
  onClick={() => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  }}
>
  Выход
</button>
{authed && (
  <nav className="topnav">
    {role === 'TEACHER' && (
  <Link to="/teacher/groups">Мои группы</Link>
)}
    {role === 'ADMIN' && (
      <>
        <Link to="/admin/groups">Группы</Link>
        <Link to="/admin/audit">Журнал</Link>
      </>
    )}

    {role === 'STUDENT' && (
      <Link to="/student/profile">Профиль</Link>
    )}

    <button
      onClick={() => {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }}
    >
      Выход
    </button>
  </nav>
)}

      <Routes>
        <Route path="/login" element={<LoginPage onLogin={() => setAuthed(true)} />} />

        <Route path="/" element={<Navigate to="/student/profile" replace />} />

        <Route
          path="/admin/groups"
          element={
            <Protected authed={authed}>
              <GroupsBoard />
            </Protected>
          }
        />

        <Route
          path="/admin/audit"
          element={
            <Protected authed={authed}>
              <AuditPage />
            </Protected>
          }
        />

        <Route
          path="/student/profile"
          element={
            <Protected authed={authed}>
              <StudentProfile />
            </Protected>
          }
        />
        <Route
  path="/teacher/groups"
  element={
    <Protected authed={authed}>
      <TeacherGroups />
    </Protected>
  }
/>

<Route
  path="/teacher/groups/:id"
  element={
    <Protected authed={authed}>
      <TeacherGroup />
    </Protected>
  }
/>
      </Routes>
    </>
  );
}
