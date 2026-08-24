const adminModel = require('../models/adminModel');

const adminController = {
  getStats: async (req, res) => {
    try {
      const stats = await adminModel.getDashboardStats();
      res.status(200).json(stats);
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      res.status(500).json({ message: 'Server error fetching statistics' });
    }
  }
};

module.exports = adminController;
