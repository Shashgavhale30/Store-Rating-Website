import React, { useEffect, useState, useRef } from 'react';
import adminService from '../../services/adminService';
import InputField from '../../components/auth/InputField';
import PasswordInput from '../../components/auth/PasswordInput';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('ALL');
  
  // Sorting state
  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', address: '', role: 'USER' });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  // Bulk Upload Ref
  const fileInputRef = useRef(null);

  const handleDeleteUser = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) {
      try {
        await adminService.deleteUser(id);
        fetchUsers();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete user.');
      }
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await adminService.getUsers();
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter & Sort Logic
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.address && user.address.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesRole = filterRole === 'ALL' || user.role === filterRole;
    
    return matchesSearch && matchesRole;
  });

  const sortedUsers = [...filteredUsers].sort((a, b) => {
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

  const handleAddUser = async (e) => {
    e.preventDefault();
    setFormError('');

    // Frontend validations
    if (formData.name.length < 20 || formData.name.length > 60) {
      return setFormError('Name must be 20-60 characters');
    }
    if (formData.address.length > 400) {
      return setFormError('Address max 400 characters');
    }
    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,16}$/;
    if (!passwordRegex.test(formData.password)) {
      return setFormError('Password must be 8-16 characters long, include at least one uppercase letter and one special character.');
    }

    setFormLoading(true);
    
    try {
      await adminService.createUser(formData);
      setIsModalOpen(false);
      setFormData({ name: '', email: '', password: '', address: '', role: 'USER' });
      fetchUsers();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create user');
    } finally {
      setFormLoading(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target.result;
        const lines = text.split(/\r?\n/);
        let headerLine = lines[0].replace(/^\uFEFF/, '');
        const headers = headerLine.split(',').map(h => h.trim().toLowerCase());
        
        const bulkUsers = [];
        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue;
          const values = lines[i].split(',').map(v => v.trim());
          const userObj = {};
          headers.forEach((header, index) => {
            let key = header;
            if (key === 'location') key = 'address';
            userObj[key] = values[index];
          });
          if (userObj['name'] && userObj['email']) {
            bulkUsers.push(userObj);
          }
        }

        if (bulkUsers.length > 0) {
          await adminService.createBulkUsers(bulkUsers);
          alert(`Successfully uploaded ${bulkUsers.length} users!`);
          fetchUsers();
        } else {
          alert("No valid users found in CSV.");
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
        <h1 className="text-2xl font-bold text-gray-900">Manage Users</h1>
        <div className="flex gap-2">
          <input 
            type="file" 
            accept=".csv" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
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
            + Add New User
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
        <select 
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="ALL">All Roles</option>
          <option value="USER">Normal User</option>
          <option value="OWNER">Store Owner</option>
          <option value="ADMIN">Admin</option>
        </select>
      </div>

      {loading ? (
        <div className="text-gray-500">Loading users...</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th onClick={() => requestSort('name')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                  Name {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th onClick={() => requestSort('email')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                  Email {sortConfig.key === 'email' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th onClick={() => requestSort('address')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                  Address {sortConfig.key === 'address' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th onClick={() => requestSort('role')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                  Role {sortConfig.key === 'role' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th onClick={() => requestSort('average_rating')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                  Store Rating
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedUsers.map(user => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <a href={`/admin/users/${user.id}`} className="text-primary hover:underline">
                      {user.name}
                    </a>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.address}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.role === 'ADMIN' ? 'bg-red-100 text-red-800' :
                      user.role === 'OWNER' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.role === 'OWNER' ? (parseFloat(user.average_rating).toFixed(1) || '0.0') : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      onClick={() => handleDeleteUser(user.id, user.name)}
                      className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-md transition-colors"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {sortedUsers.length === 0 && (
                <tr><td colSpan="4" className="px-6 py-4 text-center text-gray-500">No users found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Add New User</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
            </div>
            
            <form onSubmit={handleAddUser}>
              {formError && <div className="mb-4 text-sm text-red-600 bg-red-50 p-2 rounded">{formError}</div>}
              
              <InputField label="Name" id="name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
              <InputField label="Email" id="email" type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
              <InputField label="Address" id="address" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} required />
              <PasswordInput label="Password" id="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required />
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md">
                  <option value="USER">Normal User</option>
                  <option value="OWNER">Store Owner</option>
                </select>
              </div>
              
              <div className="flex justify-end gap-2 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md">Cancel</button>
                <button type="submit" disabled={formLoading} className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90">{formLoading ? 'Adding...' : 'Add User'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;
