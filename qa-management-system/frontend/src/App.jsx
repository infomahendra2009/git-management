import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Layout from './components/Layout.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Projects from './pages/Projects.jsx';
import ProjectDetail from './pages/ProjectDetail.jsx';
import ReleaseDetail from './pages/ReleaseDetail.jsx';
import TaskDetail from './pages/TaskDetail.jsx';
import Reports from './pages/Reports.jsx';
import Settings from './pages/Settings.jsx';
import PublicDashboard from './pages/PublicDashboard.jsx';

function withLayout(children) {
  return <Layout>{children}</Layout>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/public" element={<PublicDashboard />} />

      <Route path="/" element={<ProtectedRoute>{withLayout(<Dashboard />)}</ProtectedRoute>} />
      <Route path="/projects" element={<ProtectedRoute>{withLayout(<Projects />)}</ProtectedRoute>} />
      <Route path="/projects/:id" element={<ProtectedRoute>{withLayout(<ProjectDetail />)}</ProtectedRoute>} />
      <Route path="/releases/:id" element={<ProtectedRoute>{withLayout(<ReleaseDetail />)}</ProtectedRoute>} />
      <Route path="/tasks/:id" element={<ProtectedRoute>{withLayout(<TaskDetail />)}</ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute>{withLayout(<Reports />)}</ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute adminOnly>{withLayout(<Settings />)}</ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
