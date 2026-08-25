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
    <div className="min-h-screen bg-base flex flex-col md:flex-row font-sans">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-gray-200 flex-shrink-0 z-10 relative flex flex-col">
        <div className="p-6 border-b border-gray-200 text-center">
          <div className="w-10 h-10 bg-primary text-white rounded-md flex items-center justify-center font-bold text-xl mx-auto shadow-sm mb-3">
            A
          </div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Store<span className="text-accent">Rating</span></h2>
          <p className="text-sm font-medium text-gray-600 mt-1">{user?.email}</p>
        </div>
        <nav className="p-4 space-y-2 mt-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`block px-4 py-2 rounded-md transition-colors duration-200 font-semibold ${
                  isActive
                    ? 'bg-accent text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 mt-auto border-t border-gray-200 bg-gray-50">
          <button
            onClick={logout}
            className="w-full text-center px-4 py-2 text-red-600 font-semibold hover:bg-red-100 rounded-md transition-colors"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto relative z-0">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
