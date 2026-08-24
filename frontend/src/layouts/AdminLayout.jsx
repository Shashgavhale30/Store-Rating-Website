import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminLayout = () => {
  const { logout, user } = useAuth();
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/admin' },
    { name: 'Manage Users', path: '/admin/users' },
    { name: 'Manage Stores', path: '/admin/stores' },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white shadow-md flex-shrink-0">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-primary">Store Rating Admin</h2>
          <p className="text-sm text-gray-500 mt-1">{user?.email}</p>
        </div>
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`block px-4 py-2 rounded-md transition-colors ${
                  isActive
                    ? 'bg-primary text-white font-medium'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-gray-200 mt-auto">
          <button
            onClick={logout}
            className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
