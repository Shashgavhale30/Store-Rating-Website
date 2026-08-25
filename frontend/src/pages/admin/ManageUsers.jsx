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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-extrabold text-primary tracking-tight">Manage Users</h1>
        <div className="flex gap-4">
          <input 
            type="file" 
            accept=".csv" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
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
            + Add New User
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
        <select 
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="input-field md:w-64"
        >
          <option value="ALL">All Roles</option>
          <option value="USER">Normal User</option>
          <option value="OWNER">Store Owner</option>
          <option value="ADMIN">Admin</option>
        </select>
      </div>

      {loading ? (
        <div className="text-primary font-bold">Loading users...</div>
      ) : (
        <div className="glass-panel rounded-3xl overflow-x-auto p-4">
          <table>
            <thead>
              <tr>
                <th onClick={() => requestSort('name')} className="cursor-pointer hover:bg-white/50">
                  Name {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th onClick={() => requestSort('email')} className="cursor-pointer hover:bg-white/50">
                  Email {sortConfig.key === 'email' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th onClick={() => requestSort('address')} className="cursor-pointer hover:bg-white/50">
                  Address {sortConfig.key === 'address' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th onClick={() => requestSort('role')} className="cursor-pointer hover:bg-white/50">
                  Role {sortConfig.key === 'role' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th onClick={() => requestSort('average_rating')} className="cursor-pointer hover:bg-white/50">
                  Store Rating
                </th>
                <th className="text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedUsers.map(user => (
                <tr key={user.id}>
                  <td className="font-bold">
                    <a href={`/admin/users/${user.id}`} className="text-primary hover:text-accent hover:underline transition-colors">
                      {user.name}
                    </a>
                  </td>
                  <td>{user.email}</td>
                  <td>{user.address}</td>
                  <td>
                    <span className={`px-3 py-1 inline-flex text-xs font-bold rounded-full ${
                      user.role === 'ADMIN' ? 'bg-red-100 text-red-800 border border-red-200' :
                      user.role === 'OWNER' ? 'bg-secondary/50 text-accent border border-secondary' :
                      'bg-primary/10 text-primary border border-primary/20'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="font-bold">
                    {user.role === 'OWNER' ? (parseFloat(user.average_rating).toFixed(1) || '0.0') : '-'}
                  </td>
                  <td className="text-right">
                    <button 
                      onClick={() => handleDeleteUser(user.id, user.name)}
                      className="btn-danger text-xs"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {sortedUsers.length === 0 && (
                <tr><td colSpan="6" className="px-6 py-8 text-center text-primary font-bold">No users found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass-panel rounded-3xl max-w-md w-full p-8 border-2 border-white/60">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-primary">Add New User</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-accent hover:text-primary transition-colors text-2xl">&times;</button>
            </div>
            
            <form onSubmit={handleAddUser}>
              {formError && <div className="mb-6 text-sm text-red-600 bg-red-50 p-3 rounded-xl border border-red-200 font-bold">{formError}</div>}
              
              <div className="space-y-4">
                <InputField label="Name" id="name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
                <InputField label="Email" id="email" type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
                <InputField label="Address" id="address" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} required />
                <PasswordInput label="Password" id="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required />
                
                <div>
                  <label className="block text-sm font-bold text-primary mb-1">Role</label>
                  <select value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})} className="input-field">
                    <option value="USER">Normal User</option>
                    <option value="OWNER">Store Owner</option>
                    <option value="ADMIN">System Administrator</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end gap-4 mt-8">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={formLoading} className="btn-primary">{formLoading ? 'Adding...' : 'Add User'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;
