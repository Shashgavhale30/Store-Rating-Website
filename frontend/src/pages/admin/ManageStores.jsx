import React, { useEffect, useState, useRef } from 'react';
import adminService from '../../services/adminService';
import InputField from '../../components/auth/InputField';

const ManageStores = () => {
  const [stores, setStores] = useState([]);
  const [owners, setOwners] = useState([]); 
  const [loading, setLoading] = useState(true);
  
  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  
  // Sorting state
  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', address: '', owner_id: '', photo: null });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  // Bulk Upload Ref
  const fileInputRef = useRef(null);

  const fetchStoresAndOwners = async () => {
    try {
      const [storesData, usersData] = await Promise.all([
        adminService.getStores(),
        adminService.getUsers()
      ]);
      setStores(storesData);
      setOwners(usersData.filter(user => user.role === 'OWNER'));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStoresAndOwners();
  }, []);

  // Filter & Sort Logic
  const filteredStores = stores.filter(store => {
    return (
      store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      store.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (store.address && store.address.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  const sortedStores = [...filteredStores].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, photo: e.target.files[0] });
  };

  const handleAddStore = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);
    
    if (!formData.name || !formData.email || !formData.address || !formData.owner_id) {
      setFormError('All fields are required.');
      setFormLoading(false);
      return;
    }

    try {
      // Use FormData to support image uploads
      const data = new FormData();
      data.append('name', formData.name);
      data.append('email', formData.email);
      data.append('address', formData.address);
      data.append('owner_id', formData.owner_id);
      if (formData.photo) {
        data.append('photo', formData.photo);
      }

      await adminService.createStore(data);
      setIsModalOpen(false);
      setFormData({ name: '', email: '', address: '', owner_id: '', photo: null });
      fetchStoresAndOwners(); 
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create store');
    } finally {
      setFormLoading(false);
    }
  };

  const handleCsvUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target.result;
        const lines = text.split(/\r?\n/);
        // Strip BOM just in case
        let headerLine = lines[0].replace(/^\uFEFF/, '');
        const headers = headerLine.split(',').map(h => h.trim().toLowerCase());
        
        const bulkStores = [];
        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue;
          const values = lines[i].split(',').map(v => v.trim());
          const storeObj = {};
          headers.forEach((header, index) => {
            let key = header;
            if (key === 'location') key = 'address';
            storeObj[key] = values[index];
          });
          
          if (storeObj['name'] && storeObj['owner_email']) {
            bulkStores.push(storeObj);
          }
        }

        if (bulkStores.length > 0) {
          await adminService.createBulkStores(bulkStores);
          alert(`Successfully uploaded stores!`);
          fetchStoresAndOwners();
        } else {
          alert("No valid stores found in CSV. (Ensure 'owner_email' column exists)");
        }
      } catch (err) {
        console.error(err);
        alert(err.response?.data?.message || err.message || "Error parsing CSV or uploading to server.");
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Manage Stores</h1>
        <div className="flex gap-2">
          <input 
            type="file" 
            accept=".csv" 
            ref={fileInputRef} 
            onChange={handleCsvUpload} 
            className="hidden" 
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors shadow-sm"
          >
            Bulk Upload CSV
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-colors shadow-sm"
          >
            + Add New Store
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-col md:flex-row gap-4">
        <input 
          type="text"
          placeholder="Search by name, email, or address..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      {loading ? (
        <div className="text-gray-500">Loading stores...</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Photo</th>
                <th onClick={() => requestSort('name')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                  Store Name {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assigned Owner
                </th>
                <th onClick={() => requestSort('email')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                  Email {sortConfig.key === 'email' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th onClick={() => requestSort('address')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                  Address {sortConfig.key === 'address' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th onClick={() => requestSort('average_rating')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                  Rating {sortConfig.key === 'average_rating' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedStores.map(store => (
                <tr key={store.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {store.photo_url ? (
                      <img 
                        src={store.photo_url.startsWith('http') ? store.photo_url : `http://localhost:5000${store.photo_url}`} 
                        alt="store" 
                        className="h-10 w-10 rounded-full object-cover border border-gray-200" 
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-400">?</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{store.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {store.owner_name ? (
                      <span className="text-gray-900 font-medium">{store.owner_name} <br/><span className="text-gray-400 text-xs">{store.owner_email}</span></span>
                    ) : (
                      <span className="text-red-500 font-medium">Unassigned</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{store.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{store.address}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-accent">
                    ★ {parseFloat(store.average_rating).toFixed(1)}
                  </td>
                </tr>
              ))}
              {sortedStores.length === 0 && (
                <tr><td colSpan="5" className="px-6 py-4 text-center text-gray-500">No stores found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Store Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Add New Store</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
            </div>
            
            <form onSubmit={handleAddStore}>
              {formError && <div className="mb-4 text-sm text-red-600 bg-red-50 p-2 rounded">{formError}</div>}
              
              <InputField label="Store Name" id="name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
              <InputField label="Store Email" id="email" type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
              <InputField label="Store Address" id="address" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} required />
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Store Photo (Optional)</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileChange}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Assign to Store Owner</label>
                <select 
                  value={formData.owner_id} 
                  onChange={(e) => setFormData({...formData, owner_id: e.target.value})} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
                  required
                >
                  <option value="" disabled>Select an owner</option>
                  {owners.map(owner => (
                    <option key={owner.id} value={owner.id}>{owner.name} ({owner.email})</option>
                  ))}
                </select>
              </div>
              
              <div className="flex justify-end gap-2 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md">Cancel</button>
                <button type="submit" disabled={formLoading} className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90">{formLoading ? 'Adding...' : 'Add Store'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageStores;
