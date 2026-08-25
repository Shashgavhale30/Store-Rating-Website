import React, { useEffect, useState } from 'react';
import userService from '../../services/userService';

const TopStoresDashboard = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTopStores = async () => {
    try {
      const storesData = await userService.getStores();
      // Sort by average_rating descending
      const sortedStores = storesData.sort((a, b) => {
        return parseFloat(b.average_rating) - parseFloat(a.average_rating);
      });
      setStores(sortedStores);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopStores();
  }, []);

  if (loading) {
    return <div className="text-center py-10 text-gray-500 font-bold">Loading top stores...</div>;
  }

  return (
    <div>
      <div className="mb-8 bg-white border border-gray-200 rounded-lg p-8 shadow-sm text-center">
        <h1 className="text-4xl font-extrabold text-primary mb-2">Top Rated Shops</h1>
        <p className="text-gray-600 font-medium text-lg">The highest-rated stores near you, ranked by the community.</p>
      </div>

      <div className="flex flex-col gap-6">
        {stores.map((store, index) => (
          <div key={store.id} className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden card-hover flex flex-col md:flex-row relative">
            
            {/* Rank Badge */}
            <div className="absolute -left-2 -top-2 z-10">
              <div className={`w-12 h-12 flex items-center justify-center rounded-full font-black text-xl shadow-lg border-2 border-white ${
                index === 0 ? 'bg-yellow-400 text-yellow-900' :
                index === 1 ? 'bg-gray-300 text-gray-800' :
                index === 2 ? 'bg-orange-400 text-orange-900' :
                'bg-primary text-white'
              }`}>
                #{index + 1}
              </div>
            </div>

            {/* Store Photo */}
            <div className="md:w-64 h-48 md:h-auto bg-gray-100 relative shrink-0">
              {store.photo_url ? (
                <img 
                  src={store.photo_url.startsWith('http') ? store.photo_url : `http://localhost:5000${store.photo_url}`} 
                  alt={store.name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-primary/30 bg-secondary/10">
                  <span className="text-6xl">🏪</span>
                </div>
              )}
            </div>

            {/* Store Info */}
            <div className="p-6 flex-1 flex flex-col justify-center">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-2xl font-black text-gray-900">{store.name}</h3>
                  <p className="text-gray-500 font-medium text-sm mt-1">
                    📍 {store.address}
                  </p>
                </div>
                <div className="flex items-center gap-2 bg-yellow-50 px-4 py-2 rounded-lg border border-yellow-200">
                  <span className="text-yellow-500 text-2xl">★</span>
                  <span className="text-2xl font-black text-yellow-700">
                    {parseFloat(store.average_rating).toFixed(1)}
                  </span>
                </div>
              </div>
              <p className="text-gray-500 text-sm mt-4">
                Owned by: <span className="font-semibold text-gray-700">{store.owner_name || store.owner_email || 'Store Owner'}</span>
              </p>
            </div>
          </div>
        ))}

        {stores.length === 0 && (
          <div className="text-center py-20 bg-white border border-gray-200 shadow-sm rounded-lg">
            <span className="text-4xl mb-4 block text-gray-400">🏆</span>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No rated stores yet</h3>
            <p className="text-gray-600">Be the first to rate a store near you!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopStoresDashboard;
