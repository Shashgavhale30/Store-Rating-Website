import React, { useState } from 'react';
import { Outlet, useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ChangePasswordModal from '../components/auth/ChangePasswordModal';

const UserLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-base flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center gap-3 cursor-pointer" onClick={() => navigate('/user')}>
                <div className="w-8 h-8 bg-accent text-white rounded-md flex items-center justify-center font-bold text-lg shadow-sm">
                  S
                </div>
                <span className="font-bold text-xl text-gray-900 tracking-tight">Store<span className="text-accent">Rating</span></span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-sm text-accent hidden sm:block">
                Welcome, <span className="font-bold text-primary">{user?.name}</span>
              </span>
              <button 
                onClick={() => setIsPasswordModalOpen(true)}
                className="text-sm text-primary hover:text-accent font-bold px-3 py-2 rounded-md hover:bg-secondary/20 transition-colors"
              >
                Change Password
              </button>
              <button
                onClick={handleLogout}
                className="btn-danger text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Tabs Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="-mb-px flex space-x-8">
            <NavLink
              to="/user/rate"
              className={({ isActive }) => 
                `whitespace-nowrap pb-4 pt-4 px-1 border-b-2 font-bold text-sm transition-colors ${
                  isActive 
                    ? 'border-accent text-accent' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`
              }
            >
              Rate Stores
            </NavLink>
            <NavLink
              to="/user/top"
              className={({ isActive }) => 
                `whitespace-nowrap pb-4 pt-4 px-1 border-b-2 font-bold text-sm transition-colors ${
                  isActive 
                    ? 'border-accent text-accent' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`
              }
            >
              Top Rated Stores
            </NavLink>
          </nav>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      <ChangePasswordModal 
        isOpen={isPasswordModalOpen} 
        onClose={() => setIsPasswordModalOpen(false)} 
      />
    </div>
  );
};

export default UserLayout;
