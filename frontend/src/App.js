import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/routing/ProtectedRoute';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Admin Pages
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageUsers from './pages/admin/ManageUsers';
import ManageStores from './pages/admin/ManageStores';
import UserDetails from './pages/admin/UserDetails';

// Placeholder dashboards
const UserDashboard = () => <div className="p-10 text-center"><h1 className="text-2xl font-bold">User Dashboard</h1><p>Requires USER role</p></div>;
const OwnerDashboard = () => <div className="p-10 text-center"><h1 className="text-2xl font-bold">Owner Dashboard</h1><p>Requires OWNER role</p></div>;

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Admin Routes */}
        <Route path="/admin" element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
          <Route element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<ManageUsers />} />
            <Route path="users/:id" element={<UserDetails />} />
            <Route path="stores" element={<ManageStores />} />
          </Route>
        </Route>

        {/* Protected User Routes */}
        <Route element={<ProtectedRoute allowedRoles={['USER']} />}>
          <Route path="/user" element={<UserDashboard />} />
        </Route>

        {/* Protected Owner Routes */}
        <Route element={<ProtectedRoute allowedRoles={['OWNER']} />}>
          <Route path="/store-owner" element={<OwnerDashboard />} />
        </Route>
        
        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
