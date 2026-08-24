import api from './api';

const ownerService = {
  getMyStores: async () => {
    const response = await api.get('/stores/owner/me');
    return response.data;
  },

  getStoreRatings: async (storeId) => {
    const response = await api.get(`/ratings/store/${storeId}`);
    return response.data;
  }
};

export default ownerService;
