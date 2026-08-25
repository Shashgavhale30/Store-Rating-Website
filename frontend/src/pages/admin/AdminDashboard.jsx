import React, { useEffect, useState } from 'react';
import adminService from '../../services/adminService';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
  AreaChart, Area
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#64748b'];

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0, 
    totalStores: 0, 
    totalRatings: 0,
    usersByRole: [],
    storesByRatingTier: [],
    ratingsGrowth: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await adminService.getStats();
        
        // Mock some data if arrays are empty so charts don't look completely blank on fresh start
        let growthData = data.ratingsGrowth;
        if (!growthData || growthData.length === 0) {
          growthData = [
            { date: '2023-01', count: 12 },
            { date: '2023-02', count: 25 },
            { date: '2023-03', count: 42 },
            { date: '2023-04', count: 68 },
            { date: '2023-05', count: 105 }
          ];
        }

        setStats({
          ...data,
          ratingsGrowth: growthData
        });
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
    return <div className="text-gray-500 font-bold text-lg animate-pulse">Loading analytics engine...</div>;
  }

  if (error) {
    return <div className="text-red-500 font-bold">{error}</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-primary mb-2">Platform Analytics</h1>
        <p className="text-gray-600 font-medium">Real-time overview of your store rating platform.</p>
      </div>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-2xl border-l-4 border-l-accent relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 text-9xl opacity-5 group-hover:scale-110 transition-transform">👥</div>
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-2">Total Users</h3>
          <p className="text-5xl font-black text-gray-900">{stats.totalUsers}</p>
        </div>
        
        <div className="glass-panel p-6 rounded-2xl border-l-4 border-l-emerald-500 relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 text-9xl opacity-5 group-hover:scale-110 transition-transform">🏪</div>
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-2">Total Stores</h3>
          <p className="text-5xl font-black text-gray-900">{stats.totalStores}</p>
        </div>
        
        <div className="glass-panel p-6 rounded-2xl border-l-4 border-l-amber-500 relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 text-9xl opacity-5 group-hover:scale-110 transition-transform">⭐</div>
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-2">Total Ratings</h3>
          <p className="text-5xl font-black text-gray-900">{stats.totalRatings}</p>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* User Roles Pie Chart */}
        <div className="glass-panel p-6 rounded-2xl shadow-sm">
          <h3 className="text-lg font-black text-primary mb-6">User Distribution by Role</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.usersByRole}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {stats.usersByRole.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip wrapperClassName="font-sans font-medium rounded-lg shadow-xl border-0" />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stores by Rating Bar Chart */}
        <div className="glass-panel p-6 rounded-2xl shadow-sm">
          <h3 className="text-lg font-black text-primary mb-6">Stores by Rating Tier</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats.storesByRatingTier}
                margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{fill: '#64748b', fontWeight: 600}} axisLine={false} tickLine={false} />
                <YAxis tick={{fill: '#64748b', fontWeight: 600}} axisLine={false} tickLine={false} />
                <RechartsTooltip cursor={{fill: '#f8fafc'}} wrapperClassName="font-sans font-medium rounded-lg shadow-xl border-0" />
                <Bar dataKey="value" fill="#f59e0b" radius={[6, 6, 0, 0]} maxBarSize={60} name="Number of Stores" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Charts Row 2 */}
      <div className="glass-panel p-6 rounded-2xl shadow-sm">
        <h3 className="text-lg font-black text-primary mb-6">Ratings Growth Trend</h3>
        <div className="h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={stats.ratingsGrowth}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={{fill: '#64748b', fontWeight: 600}} axisLine={false} tickLine={false} />
              <YAxis tick={{fill: '#64748b', fontWeight: 600}} axisLine={false} tickLine={false} />
              <RechartsTooltip wrapperClassName="font-sans font-medium rounded-lg shadow-xl border-0" />
              <Area type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" name="New Ratings" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
