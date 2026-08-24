import React, { useEffect, useState } from 'react';
import adminService from '../../services/adminService';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ totalUsers: 0, totalStores: 0, totalRatings: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await adminService.getStats();
        setStats(data);
      } catch (err) {
        setError('Failed to load dashboard statistics.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return <div className="text-gray-500">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Users</h3>
          <p className="mt-2 text-4xl font-extrabold text-primary">{stats.totalUsers}</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Stores</h3>
          <p className="mt-2 text-4xl font-extrabold text-secondary">{stats.totalStores}</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Submitted Ratings</h3>
          <p className="mt-2 text-4xl font-extrabold text-accent">{stats.totalRatings}</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
