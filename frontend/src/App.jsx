import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Kanban from './pages/Kanban';
import Approvals from './pages/Approvals';
import Documents from './pages/Documents';
import AuditLogs from './pages/AuditLogs';
import Unauthorized from './pages/Unauthorized';
import Notifications from './pages/Notifications';

import MainLayout from './layouts/MainLayout';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      
      {/* Protected Routes */}
      <Route element={<PrivateRoute />}>
        <Route element={<LayoutWrapper />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/kanban" element={<Kanban />} />
          <Route path="/approvals" element={<Approvals />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/audit-logs" element={<PrivateRoute roles={['admin']}><AuditLogs /></PrivateRoute>} />
          <Route path="/users" element={<PrivateRoute roles={['admin']}><Users /></PrivateRoute>} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

const LayoutWrapper = () => {
  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  );
}

export default App;
