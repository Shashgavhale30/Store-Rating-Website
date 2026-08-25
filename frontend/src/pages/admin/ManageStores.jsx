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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-extrabold text-primary tracking-tight">Manage Stores</h1>
        <div className="flex gap-4">
          <input 
            type="file" 
            accept=".csv" 
            ref={fileInputRef} 
            onChange={handleCsvUpload} 
            className="hidden" 
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="btn-secondary"
          >
            Bulk Upload CSV
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="btn-primary"
          >
            + Add New Store
          </button>
        </div>
      </div>

      <div className="glass-panel p-6 rounded-2xl mb-8 flex flex-col md:flex-row gap-6 relative z-10">
        <input 
          type="text"
          placeholder="Search by name, email, or address..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-field flex-1"
        />
      </div>

      {loading ? (
        <div className="text-primary font-bold">Loading stores...</div>
      ) : (
        <div className="glass-panel rounded-3xl overflow-x-auto p-4">
          <table>
            <thead>
              <tr>
                <th>Photo</th>
                <th onClick={() => requestSort('name')} className="cursor-pointer hover:bg-white/50">
                  Store Name {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th>
                  Assigned Owner
                </th>
                <th onClick={() => requestSort('email')} className="cursor-pointer hover:bg-white/50">
                  Email {sortConfig.key === 'email' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th onClick={() => requestSort('address')} className="cursor-pointer hover:bg-white/50">
                  Address {sortConfig.key === 'address' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th onClick={() => requestSort('average_rating')} className="cursor-pointer hover:bg-white/50">
                  Rating {sortConfig.key === 'average_rating' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedStores.map(store => (
                <tr key={store.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {store.photo_url ? (
                      <img 
                        src={store.photo_url.startsWith('http') ? store.photo_url : `http://localhost:5000${store.photo_url}`} 
                        alt="store" 
                        className="h-12 w-12 rounded-full object-cover shadow-md border-2 border-secondary/50" 
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-secondary/30 text-accent font-bold flex items-center justify-center">?</div>
                    )}
                  </td>
                  <td className="font-bold text-primary">{store.name}</td>
                  <td>
                    {store.owner_name ? (
                      <span className="font-bold text-primary">{store.owner_name} <br/><span className="text-accent text-xs font-medium">{store.owner_email}</span></span>
                    ) : (
                      <span className="text-red-500 font-bold bg-red-50 px-2 py-1 rounded-md">Unassigned</span>
                    )}
                  </td>
                  <td>{store.email}</td>
                  <td>{store.address}</td>
                  <td className="font-bold text-accent">
                    ★ {parseFloat(store.average_rating).toFixed(1)}
                  </td>
                </tr>
              ))}
              {sortedStores.length === 0 && (
                <tr><td colSpan="6" className="px-6 py-8 text-center text-primary font-bold">No stores found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Store Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass-panel rounded-3xl max-w-md w-full p-8 border-2 border-white/60">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-primary">Add New Store</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-accent hover:text-primary transition-colors text-2xl">&times;</button>
            </div>
            
            <form onSubmit={handleAddStore}>
              {formError && <div className="mb-6 text-sm text-red-600 bg-red-50 p-3 rounded-xl border border-red-200 font-bold">{formError}</div>}
              
              <div className="space-y-4">
                <InputField label="Store Name" id="name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
                <InputField label="Store Email" id="email" type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
                <InputField label="Store Address" id="address" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} required />
                
                <div>
                  <label className="block text-sm font-bold text-primary mb-1">Store Photo (Optional)</label>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileChange}
                    className="w-full text-sm text-accent file:mr-4 file:py-2 file:px-6 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-secondary file:text-primary hover:file:bg-secondary/80 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-primary mb-1">Assign to Store Owner</label>
                  <select 
                    value={formData.owner_id} 
                    onChange={(e) => setFormData({...formData, owner_id: e.target.value})} 
                    className="input-field"
                    required
                  >
                    <option value="" disabled>Select an owner</option>
                    {owners.map(owner => (
                      <option key={owner.id} value={owner.id}>{owner.name} ({owner.email})</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end gap-4 mt-8">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={formLoading} className="btn-primary">{formLoading ? 'Adding...' : 'Add Store'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageStores;
