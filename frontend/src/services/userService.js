import api from './api';

const userService = {
  getStores: async () => {
    const response = await api.get('/stores');
    return response.data;
  },

  getUserRatings: async () => {
    const response = await api.get('/ratings/user/me');
    return response.data;
  },

  submitRating: async (store_id, rating) => {
    const response = await api.post('/ratings', { store_id, rating });
    return response.data;
  }
};

export default userService;
