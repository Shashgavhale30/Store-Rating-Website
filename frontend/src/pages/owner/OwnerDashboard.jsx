import React, { useEffect, useState } from 'react';
import ownerService from '../../services/ownerService';

const OwnerDashboard = () => {
  const [stores, setStores] = useState([]);
  const [activeStoreId, setActiveStoreId] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [sortConfig, setSortConfig] = useState({ key: 'updated_at', direction: 'desc' });

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const storesData = await ownerService.getMyStores();
        setStores(storesData);
        if (storesData.length > 0) {
          setActiveStoreId(storesData[0].id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStores();
  }, []);

  useEffect(() => {
    const fetchRatings = async () => {
      if (!activeStoreId) return;
      try {
        const ratingsData = await ownerService.getStoreRatings(activeStoreId);
        setRatings(ratingsData);
      } catch (err) {
        console.error(err);
      }
    };
    fetchRatings();
  }, [activeStoreId]);

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedRatings = [...ratings].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  if (loading) return <div className="text-center py-10">Loading your dashboard...</div>;

  if (stores.length === 0) {
    return (
      <div className="text-center py-20 bg-white border border-gray-200 shadow-sm rounded-lg">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">No Stores Found</h2>
        <p className="text-gray-600 font-medium">You haven't been assigned any stores yet. Please contact the administrator.</p>
      </div>
    );
  }

  const activeStore = stores.find(s => s.id === activeStoreId);

  return (
    <div className="flex flex-col gap-6">
      {/* Store Selector (if multiple stores owned) */}
      {stores.length > 1 && (
        <div className="bg-white border border-gray-200 shadow-sm p-6 rounded-lg">
          <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">Select Store to View</label>
          <select 
            value={activeStoreId} 
            onChange={(e) => setActiveStoreId(e.target.value)}
            className="input-field md:w-1/3"
          >
            {stores.map(store => (
              <option key={store.id} value={store.id}>{store.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 shadow-sm p-6 rounded-lg flex items-center gap-6">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-3xl">
            ★
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Average Rating</p>
            <h3 className="text-4xl font-bold text-gray-900">{parseFloat(activeStore?.average_rating).toFixed(1)}</h3>
            <p className="text-sm text-gray-500 mt-1">out of 5.0</p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 shadow-sm p-6 rounded-lg flex items-center gap-6">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-3xl">
            👥
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Total Ratings</p>
            <h3 className="text-4xl font-bold text-gray-900">{ratings.length}</h3>
            <p className="text-sm text-gray-500 mt-1">submitted by users</p>
          </div>
        </div>
      </div>

      {/* Ratings Table */}
      <div className="bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden mt-4">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-bold text-gray-900">User Ratings History</h2>
        </div>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th onClick={() => requestSort('user_name')} className="cursor-pointer hover:bg-white/50">
                  User Name {sortConfig.key === 'user_name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th onClick={() => requestSort('rating')} className="cursor-pointer hover:bg-white/50">
                  Rating Given {sortConfig.key === 'rating' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th onClick={() => requestSort('updated_at')} className="cursor-pointer hover:bg-white/50">
                  Date Submitted {sortConfig.key === 'updated_at' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedRatings.map(rating => (
                <tr key={rating.id}>
                  <td className="font-bold">{rating.user_name}</td>
                  <td>
                    <span className="text-accent drop-shadow-sm">{Array(rating.rating).fill('★').join('')}</span>
                    <span className="text-secondary/50">{Array(5 - rating.rating).fill('★').join('')}</span>
                    <span className="text-primary ml-2 font-bold">({rating.rating})</span>
                  </td>
                  <td>
                    {new Date(rating.updated_at).toLocaleDateString()} at {new Date(rating.updated_at).toLocaleTimeString()}
                  </td>
                </tr>
              ))}
              {sortedRatings.length === 0 && (
                <tr><td colSpan="3" className="px-6 py-8 text-center text-accent/70 font-medium">No ratings have been submitted yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboard;
