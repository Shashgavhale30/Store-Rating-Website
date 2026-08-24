const storeModel = require('../models/storeModel');

const storeController = {
  getAllStores: async (req, res) => {
    try {
      const stores = await storeModel.findAllStores();
      res.status(200).json(stores);
    } catch (error) {
      console.error('Error fetching stores:', error);
      res.status(500).json({ message: 'Server error fetching stores' });
    }
  },

  createStore: async (req, res) => {
    try {
      const { name, email, address, owner_id } = req.body;
      const photo_url = req.file ? `/uploads/${req.file.filename}` : null;
      
      const newStore = await storeModel.createStore(name, email, address, owner_id, photo_url);
      res.status(201).json({ message: 'Store created successfully', store: newStore });
    } catch (error) {
      console.error('Error creating store:', error);
      res.status(500).json({ message: 'Server error creating store' });
    }
  },

  createBulkStores: async (req, res) => {
    try {
      const stores = req.body; // Expects an array
      if (!Array.isArray(stores)) return res.status(400).json({ message: 'Invalid format. Expected an array of stores.' });

      const createdStores = [];
      for (const store of stores) {
        // Find owner by email for easy CSV mapping
        const userModel = require('../models/userModel');
        const owner = await userModel.findUserByEmail(store.owner_email);
        const owner_id = owner ? owner.id : null;
        
        if (owner_id && owner.role === 'OWNER') {
          const newStore = await storeModel.createStore(store.name, store.email, store.address, owner_id, store.photo_url || null);
          createdStores.push(newStore);
        }
      }
      res.status(201).json({ message: `Successfully created ${createdStores.length} stores.`, stores: createdStores });
    } catch (error) {
      console.error('Error in bulk store creation:', error);
      res.status(500).json({ message: 'Server error during bulk store creation' });
    }
  },

  getStoresByOwner: async (req, res) => {
    try {
      const owner_id = req.user.id;
      // We can reuse a model function or write a quick query.
      // Let's add it to storeModel if we want, or just query it here if simple.
      const storeModel = require('../models/storeModel');
      const stores = await storeModel.findStoresByOwnerId(owner_id);
      res.status(200).json(stores);
    } catch (error) {
      console.error('Error fetching owner stores:', error);
      res.status(500).json({ message: 'Server error fetching owner stores' });
    }
  }
};

module.exports = storeController;
