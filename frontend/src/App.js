import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/routing/ProtectedRoute';

// Layouts
import AdminLayout from './layouts/AdminLayout';
import UserLayout from './layouts/UserLayout';
import OwnerLayout from './layouts/OwnerLayout';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageUsers from './pages/admin/ManageUsers';
import ManageStores from './pages/admin/ManageStores';
import UserDetails from './pages/admin/UserDetails';

// User Pages
import UserDashboard from './pages/user/UserDashboard';
import TopStoresDashboard from './pages/user/TopStoresDashboard';

// Owner Pages
import OwnerDashboard from './pages/owner/OwnerDashboard';

import Home from './pages/Home';

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
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
        <Route path="/user" element={<ProtectedRoute allowedRoles={['USER']} />}>
          <Route element={<UserLayout />}>
            <Route index element={<Navigate to="rate" replace />} />
            <Route path="rate" element={<UserDashboard />} />
            <Route path="top" element={<TopStoresDashboard />} />
          </Route>
        </Route>

        {/* Protected Owner Routes */}
        <Route path="/store-owner" element={<ProtectedRoute allowedRoles={['OWNER']} />}>
          <Route element={<OwnerLayout />}>
            <Route index element={<OwnerDashboard />} />
          </Route>
        </Route>
        
      </Routes>
    </AuthProvider>
  );
}

export default App;
