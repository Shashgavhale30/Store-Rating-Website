import api from './api';

const adminService = {
  getStats: async () => {
    const response = await api.get('/admin/stats');
    return response.data;
  },
  
  getUsers: async () => {
    const response = await api.get('/users');
    return response.data;
  },

  createUser: async (userData) => {
    const response = await api.post('/users', userData);
    return response.data;
  },

  getStores: async () => {
    const response = await api.get('/stores');
    return response.data;
  },

  createStore: async (storeData) => {
    // Determine if storeData is FormData (contains file) or plain object
    const isFormData = storeData instanceof FormData;
    const config = isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
    const response = await api.post('/stores', storeData, config);
    return response.data;
  },

  createBulkUsers: async (users) => {
    const response = await api.post('/users/bulk', users);
    return response.data;
  },

  createBulkStores: async (stores) => {
    const response = await api.post('/stores/bulk', stores);
    return response.data;
  },

  deleteUser: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  }
};

export default adminService;
