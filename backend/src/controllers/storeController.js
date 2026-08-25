const storeModel = require('../models/storeModel');

const storeController = {
  getPublicStores: async (req, res) => {
    try {
      const stores = await storeModel.findAllStores();
      const sortedStores = stores.sort((a, b) => parseFloat(b.average_rating) - parseFloat(a.average_rating));
      // Return top 6 stores for the home page
      res.status(200).json(sortedStores.slice(0, 6));
    } catch (error) {
      console.error('Error fetching public stores:', error);
      res.status(500).json({ message: 'Server error fetching public stores' });
    }
  },

  getAllStores: async (req, res) => {
    try {
      const stores = await storeModel.findAllStores();
      
      if (req.user && req.user.role === 'USER') {
        const userModel = require('../models/userModel');
        const user = await userModel.findUserById(req.user.id);
        
        let filteredStores = stores;
        if (user && user.address) {
          const userLocation = user.address.toLowerCase().trim();
          
          const extractKeywords = (address) => {
            return address.toLowerCase()
              .split(/[\s,]+/) // Split by spaces or commas
              .filter(word => word.length > 2); // Ignore very short words
          };
          const userKeywords = extractKeywords(user.address);

          filteredStores = stores.filter(store => {
            if (!store.address) return false;
            const storeLoc = store.address.toLowerCase().trim();
            
            // 1. Direct overlap check
            if (storeLoc.includes(userLocation) || userLocation.includes(storeLoc)) return true;

            // 2. Keyword intersection check
            const storeKeywords = extractKeywords(store.address);
            return userKeywords.some(kw => storeKeywords.includes(kw));
          });
        }
        return res.status(200).json(filteredStores);
      }

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
