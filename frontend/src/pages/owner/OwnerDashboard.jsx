import React, { useEffect, useState } from 'react';
import ownerService from '../../services/ownerService';

const OwnerDashboard = () => {
  const [stores, setStores] = useState([]);
  const [activeStoreId, setActiveStoreId] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <div className="text-center py-10">Loading your dashboard...</div>;

  if (stores.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">No Stores Found</h2>
        <p className="text-gray-500">You haven't been assigned any stores yet. Please contact the administrator.</p>
      </div>
    );
  }

  const activeStore = stores.find(s => s.id === activeStoreId);

  return (
    <div className="flex flex-col gap-6">
      {/* Store Selector (if multiple stores owned) */}
      {stores.length > 1 && (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Store to View</label>
          <select 
            value={activeStoreId} 
            onChange={(e) => setActiveStoreId(e.target.value)}
            className="w-full md:w-1/3 px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {stores.map(store => (
              <option key={store.id} value={store.id}>{store.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center gap-6">
          <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-4xl">
            ★
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Average Rating</p>
            <h3 className="text-4xl font-bold text-gray-900">{parseFloat(activeStore?.average_rating).toFixed(1)}</h3>
            <p className="text-sm text-gray-500 mt-1">out of 5.0</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center gap-6">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-4xl">
            👥
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Ratings</p>
            <h3 className="text-4xl font-bold text-gray-900">{ratings.length}</h3>
            <p className="text-sm text-gray-500 mt-1">submitted by users</p>
          </div>
        </div>
      </div>

      {/* Ratings Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-bold text-gray-900">User Ratings History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-white">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating Given</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Submitted</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {ratings.map(rating => (
                <tr key={rating.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{rating.user_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-yellow-500">
                    {Array(rating.rating).fill('★').join('')}
                    <span className="text-gray-300">{Array(5 - rating.rating).fill('★').join('')}</span>
                    <span className="text-gray-600 ml-2 font-normal">({rating.rating})</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(rating.updated_at).toLocaleDateString()} at {new Date(rating.updated_at).toLocaleTimeString()}
                  </td>
                </tr>
              ))}
              {ratings.length === 0 && (
                <tr><td colSpan="3" className="px-6 py-8 text-center text-gray-500">No ratings have been submitted yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboard;
