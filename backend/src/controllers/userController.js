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
      
      // Validations
      if (!name || name.length < 20 || name.length > 60) {
        return res.status(400).json({ message: 'Name must be between 20 and 60 characters.' });
      }
      if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
        return res.status(400).json({ message: 'Please provide a valid email address.' });
      }
      if (!address || address.length > 400) {
        return res.status(400).json({ message: 'Address must not exceed 400 characters.' });
      }

      const existingUser = await userModel.findUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists with this email' });
      }

      // Enforce single admin rule
      if (role === 'ADMIN') {
        const adminExists = await userModel.findAdminUser();
        if (adminExists) {
          return res.status(400).json({ message: 'A system administrator already exists. Only one admin is allowed.' });
        }
      }

      // Check password complexity
      const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,16}$/;
      if (!passwordRegex.test(password)) {
        return res.status(400).json({ message: 'Password must be 8-16 characters long, include at least one uppercase letter and one special character.' });
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
          if (!user.name || user.name.length < 20 || user.name.length > 60) {
            throw new Error(`Invalid name for user ${user.email}. Must be 20-60 characters.`);
          }
          if (!user.email || !/^\S+@\S+\.\S+$/.test(user.email)) {
            throw new Error(`Invalid email format for ${user.email}.`);
          }
          if (!user.address || user.address.length > 400) {
            throw new Error(`Invalid address for user ${user.email}. Max 400 characters.`);
          }

          // Check password complexity for bulk upload too
          const pass = user.password || 'Temp@123';
          const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,16}$/;
          if (!passwordRegex.test(pass)) {
            throw new Error(`Invalid password for user ${user.email}. Must be 8-16 chars, 1 uppercase, 1 special.`);
          }

          const salt = await bcrypt.genSalt(10);
          const password_hash = await bcrypt.hash(pass, salt);
          let role = user.role && ['USER', 'OWNER', 'ADMIN'].includes(user.role.toUpperCase()) ? user.role.toUpperCase() : 'USER';
          
          if (role === 'ADMIN') {
            const adminExists = await userModel.findAdminUser();
            if (adminExists || createdUsers.some(u => u.role === 'ADMIN')) {
              throw new Error('A system administrator already exists. Only one admin is allowed.');
            }
          }

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
      
      const userToDelete = await userModel.findUserById(id);
      if (!userToDelete) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      if (userToDelete.role === 'ADMIN') {
        return res.status(400).json({ message: 'System administrator cannot be deleted.' });
      }

      const deletedUser = await userModel.deleteUser(id);
      
      res.status(200).json({ message: 'User deleted successfully', user: deletedUser });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ message: 'Server error deleting user' });
    }
  },

  updatePassword: async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const user_id = req.user.id;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Current and new password are required' });
      }

      // Validate new password format
      const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,16}$/;
      if (!passwordRegex.test(newPassword)) {
        return res.status(400).json({ message: 'New password must be 8-16 characters long, include at least one uppercase letter and one special character.' });
      }

      const db = require('../config/db');
      const userResult = await db.query('SELECT * FROM users WHERE id = $1', [user_id]);
      const user = userResult.rows[0];
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
      if (!isMatch) {
        return res.status(400).json({ message: 'Incorrect current password' });
      }

      const salt = await bcrypt.genSalt(10);
      const new_password_hash = await bcrypt.hash(newPassword, salt);

      await db.query('UPDATE users SET password_hash = $1 WHERE id = $2', [new_password_hash, user_id]);

      res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
      console.error('Error updating password:', error);
      res.status(500).json({ message: 'Server error updating password' });
    }
  }
};

module.exports = userController;
