const ratingModel = require('../models/ratingModel');
const storeModel = require('../models/storeModel');

const ratingController = {
  submitRating: async (req, res) => {
    try {
      const { store_id, rating } = req.body;
      const user_id = req.user.id;

      if (!store_id || !rating) {
        return res.status(400).json({ message: 'Store ID and rating are required' });
      }

      if (rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'Rating must be between 1 and 5' });
      }

      // Check if store exists
      // In a real app we might want to check this, but foreign key constraint will also catch it
      const newRating = await ratingModel.upsertRating(user_id, store_id, rating);
      res.status(200).json({ message: 'Rating submitted successfully', rating: newRating });
    } catch (error) {
      console.error('Error submitting rating:', error);
      res.status(500).json({ message: 'Server error submitting rating' });
    }
  },

  getUserRatings: async (req, res) => {
    try {
      const user_id = req.user.id;
      const ratings = await ratingModel.getRatingsByUser(user_id);
      res.status(200).json(ratings);
    } catch (error) {
      console.error('Error fetching user ratings:', error);
      res.status(500).json({ message: 'Server error fetching user ratings' });
    }
  },

  getRatingsByStore: async (req, res) => {
    try {
      const { storeId } = req.params;
      const user_id = req.user.id; // The owner

      // Verify the owner actually owns this store
      const db = require('../config/db');
      const storeResult = await db.query('SELECT owner_id FROM stores WHERE id = $1', [storeId]);
      if (storeResult.rows.length === 0) {
        return res.status(404).json({ message: 'Store not found' });
      }
      
      if (storeResult.rows[0].owner_id !== user_id) {
        return res.status(403).json({ message: 'Forbidden: You do not own this store' });
      }

      const ratings = await ratingModel.getRatingsByStore(storeId);
      res.status(200).json(ratings);
    } catch (error) {
      console.error('Error fetching store ratings:', error);
      res.status(500).json({ message: 'Server error fetching store ratings' });
    }
  }
};

module.exports = ratingController;
