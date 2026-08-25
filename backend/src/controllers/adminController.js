const adminModel = require('../models/adminModel');
const storeModel = require('../models/storeModel');

const adminController = {
  getStats: async (req, res) => {
    try {
      const stats = await adminModel.getDashboardStats();
      
      const stores = await storeModel.findAllStores();
      const storesByRatingTier = [
        { name: '5 Stars', value: 0 },
        { name: '4 Stars', value: 0 },
        { name: '3 Stars', value: 0 },
        { name: '2 Stars', value: 0 },
        { name: '1 Star', value: 0 },
        { name: 'Unrated', value: 0 }
      ];

      stores.forEach(store => {
        const rating = parseFloat(store.average_rating);
        if (rating >= 4.5) storesByRatingTier[0].value += 1;
        else if (rating >= 3.5) storesByRatingTier[1].value += 1;
        else if (rating >= 2.5) storesByRatingTier[2].value += 1;
        else if (rating >= 1.5) storesByRatingTier[3].value += 1;
        else if (rating > 0) storesByRatingTier[4].value += 1;
        else storesByRatingTier[5].value += 1;
      });

      res.status(200).json({
        ...stats,
        storesByRatingTier
      });
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      res.status(500).json({ message: 'Server error fetching statistics' });
    }
  }
};

module.exports = adminController;
