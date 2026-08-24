const userModel = require('../models/userModel');
const bcrypt = require('bcryptjs');

const userController = {
  getAllUsers: async (req, res) => {
    try {
      // Basic implementation without explicit query filtering in DB for now,
      // filtering will be handled on frontend or can be passed via query string.
      // To strictly follow "Can apply filters on all listings based on Name, Email, Address, and Role",
      // doing it on frontend for small datasets is often acceptable, but returning all allows frontend to filter.
      const users = await userModel.findAllUsers();
      res.status(200).json(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ message: 'Server error fetching users' });
    }
  },

  getUserById: async (req, res) => {
    try {
      const { id } = req.params;
      const user = await userModel.findUserById(id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.status(200).json(user);
    } catch (error) {
      console.error('Error fetching user details:', error);
      res.status(500).json({ message: 'Server error fetching user details' });
    }
  },

  createUserByAdmin: async (req, res) => {
    try {
      const { name, email, password, address, role } = req.body;
      
      if (role === 'ADMIN') {
        return res.status(403).json({ message: 'Cannot create additional Admin accounts. Only one Admin is allowed.' });
      }

      const existingUser = await userModel.findUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists with this email' });
      }

      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(password, salt);

      const newUser = await userModel.createUser(name, email, password_hash, address, role);
      res.status(201).json({ message: 'User created successfully', user: newUser });
    } catch (error) {
      console.error('Error creating user by admin:', error);
      res.status(500).json({ message: 'Server error creating user' });
    }
  },

  createBulkUsers: async (req, res) => {
    try {
      const users = req.body;
      if (!Array.isArray(users)) return res.status(400).json({ message: 'Expected an array of users.' });

      const createdUsers = [];
      for (const user of users) {
        const existingUser = await userModel.findUserByEmail(user.email);
        if (!existingUser) {
          const salt = await bcrypt.genSalt(10);
          const password_hash = await bcrypt.hash(user.password || 'Temp@123', salt);
          let role = user.role && ['USER', 'OWNER', 'ADMIN'].includes(user.role.toUpperCase()) ? user.role.toUpperCase() : 'USER';
          if (role === 'ADMIN') role = 'USER'; // Prevent creating additional admins via CSV
          
          const newUser = await userModel.createUser(user.name, user.email, password_hash, user.address || '', role);
          createdUsers.push(newUser);
        }
      }
      res.status(201).json({ message: `Successfully created ${createdUsers.length} users.`, users: createdUsers });
    } catch (error) {
      console.error('Error in bulk user creation:', error);
      res.status(500).json({ message: error.message || 'Server error during bulk user creation' });
    }
  },

  deleteUser: async (req, res) => {
    try {
      const { id } = req.params;
      const deletedUser = await userModel.deleteUser(id);
      
      if (!deletedUser) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      res.status(200).json({ message: 'User deleted successfully', user: deletedUser });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ message: 'Server error deleting user' });
    }
  }
};

module.exports = userController;
