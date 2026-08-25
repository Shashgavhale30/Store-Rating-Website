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
      <div className="mb-8 bg-white border border-gray-200 rounded-lg p-8 shadow-sm">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Discover Stores</h1>
        <p className="text-gray-600 font-medium text-lg">Find and rate your favorite stores</p>
      </div>

      {/* Search Bar */}
      <div className="bg-white border border-gray-200 shadow-sm p-6 rounded-lg mb-8 flex flex-col md:flex-row gap-6">
        <div className="relative flex-1 group">
          <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-primary group-focus-within:text-accent transition-colors">
            🔍
          </span>
          <input 
            type="text"
            placeholder="Search stores by name..."
            value={nameSearch}
            onChange={(e) => setNameSearch(e.target.value)}
            className="input-field pl-12"
          />
        </div>
        <div className="relative flex-1 group">
          <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-primary group-focus-within:text-accent transition-colors">
            📍
          </span>
          <input 
            type="text"
            placeholder="Search by location / address..."
            value={locationSearch}
            onChange={(e) => setLocationSearch(e.target.value)}
            className="input-field pl-12"
          />
        </div>
      </div>

      {/* Store Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStores.map(store => (
          <div key={store.id} className="bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden card-hover flex flex-col">
            {/* Store Photo Header */}
            <div className="h-48 bg-gray-100 relative overflow-hidden">
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
              {/* Overall Rating Badge overlay */}
              <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-md shadow flex items-center gap-1.5 font-semibold text-gray-800 border border-gray-200">
                <span className="text-yellow-500">★</span> 
                {parseFloat(store.average_rating).toFixed(1)}
              </div>
            </div>

            {/* Store Info */}
            <div className="p-6 flex-1 flex flex-col bg-white">
              <h3 className="text-xl font-bold text-gray-900 mb-2 truncate">{store.name}</h3>
              <p className="text-gray-600 text-sm mb-6 flex-1 font-medium bg-gray-50 p-3 rounded-md border border-gray-100 flex items-start gap-2">
                <span className="text-gray-400">📍</span> {store.address}
              </p>
              
              <div className="pt-4 border-t border-gray-100 mt-auto">
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
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
        <div className="text-center py-20 bg-white border border-gray-200 shadow-sm rounded-lg">
          <span className="text-4xl mb-4 block text-gray-400">🔍</span>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No stores found</h3>
          <p className="text-gray-600">Try adjusting your search terms.</p>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
