import React, { useEffect, useState } from 'react';
import userService from '../../services/userService';

const StarRating = ({ initialRating, onSave, isSaving }) => {
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedRating, setSelectedRating] = useState(initialRating || 0);

  const handleClick = (rating) => {
    if (isSaving) return;
    setSelectedRating(rating);
    onSave(rating);
  };

  return (
    <div className="flex items-center gap-1" onMouseLeave={() => setHoverRating(0)}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          disabled={isSaving}
          onMouseEnter={() => !isSaving && setHoverRating(star)}
          onClick={() => handleClick(star)}
          className={`text-2xl transition-all ${
            star <= (hoverRating || selectedRating) 
              ? 'text-yellow-400 drop-shadow-sm scale-110' 
              : 'text-gray-300 hover:scale-110'
          } ${isSaving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          ★
        </button>
      ))}
    </div>
  );
};

const UserDashboard = () => {
  const [stores, setStores] = useState([]);
  const [userRatings, setUserRatings] = useState({});
  const [loading, setLoading] = useState(true);
  const [nameSearch, setNameSearch] = useState('');
  const [locationSearch, setLocationSearch] = useState('');
  const [savingStoreId, setSavingStoreId] = useState(null);

  const fetchStoresAndRatings = async () => {
    try {
      const [storesData, ratingsData] = await Promise.all([
        userService.getStores(),
        userService.getUserRatings()
      ]);
      setStores(storesData);
      
      // Convert ratings array to a map for easy lookup
      const ratingsMap = {};
      ratingsData.forEach(r => {
        ratingsMap[r.store_id] = r.rating;
      });
      setUserRatings(ratingsMap);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStoresAndRatings();
  }, []);

  const handleRatingSubmit = async (storeId, newRating) => {
    setSavingStoreId(storeId);
    try {
      await userService.submitRating(storeId, newRating);
      // Update local state to reflect change instantly
      setUserRatings(prev => ({ ...prev, [storeId]: newRating }));
      
      // Re-fetch stores to update the global average rating
      const updatedStores = await userService.getStores();
      setStores(updatedStores);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit rating.');
    } finally {
      setSavingStoreId(null);
    }
  };

  const filteredStores = stores.filter(store => {
    const nTerm = nameSearch.toLowerCase();
    const lTerm = locationSearch.toLowerCase();
    const matchesName = store.name.toLowerCase().includes(nTerm);
    const matchesLocation = store.address ? store.address.toLowerCase().includes(lTerm) : false;
    // If locationSearch is empty, it shouldn't filter out stores without address, just match name
    return matchesName && (lTerm === '' ? true : matchesLocation);
  });

  if (loading) {
    return <div className="text-center py-10 text-gray-500">Loading stores...</div>;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Discover Stores</h1>
        <p className="text-gray-600">Find and rate your favorite stores</p>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-8 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
            🔍
          </span>
          <input 
            type="text"
            placeholder="Search stores by name..."
            value={nameSearch}
            onChange={(e) => setNameSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          />
        </div>
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
            📍
          </span>
          <input 
            type="text"
            placeholder="Search by location / address..."
            value={locationSearch}
            onChange={(e) => setLocationSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Store Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStores.map(store => (
          <div key={store.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group flex flex-col">
            {/* Store Photo Header */}
            <div className="h-40 bg-gray-200 relative overflow-hidden">
              {store.photo_url ? (
                <img 
                  src={store.photo_url.startsWith('http') ? store.photo_url : `http://localhost:5000${store.photo_url}`} 
                  alt={store.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100">
                  <span className="text-4xl">🏪</span>
                </div>
              )}
              {/* Overall Rating Badge overlay */}
              <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm flex items-center gap-1 font-bold text-gray-800">
                <span className="text-yellow-400">★</span> 
                {parseFloat(store.average_rating).toFixed(1)}
              </div>
            </div>

            {/* Store Info */}
            <div className="p-5 flex-1 flex flex-col">
              <h3 className="text-xl font-bold text-gray-900 mb-1">{store.name}</h3>
              <p className="text-gray-500 text-sm mb-4 flex-1 line-clamp-2">📍 {store.address}</p>
              
              <div className="pt-4 border-t border-gray-100 mt-auto">
                <div className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-gray-700">
                    {userRatings[store.id] ? 'Your Rating' : 'Rate this store'}
                  </span>
                  <StarRating 
                    initialRating={userRatings[store.id] || 0} 
                    onSave={(newRating) => handleRatingSubmit(store.id, newRating)}
                    isSaving={savingStoreId === store.id}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredStores.length === 0 && (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200 shadow-sm">
          <span className="text-4xl mb-4 block">🔍</span>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No stores found</h3>
          <p className="text-gray-500">Try adjusting your search terms.</p>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
