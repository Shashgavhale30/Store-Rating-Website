const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');

const authController = {
  register: async (req, res) => {
    try {
      const { name, email, address, password } = req.body;

      // Check if user already exists
      const existingUser = await userModel.findUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists with this email' });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(password, salt);

      // Default role for public registration is 'USER', but allow 'OWNER' if requested
      const role = (req.body.role === 'OWNER') ? 'OWNER' : 'USER';

      // Create user
      const newUser = await userModel.createUser(name, email, password_hash, address, role);

      res.status(201).json({
        message: 'User registered successfully',
        user: newUser
      });
    } catch (error) {
      console.error('Registration Error:', error);
      res.status(500).json({ message: 'Server error during registration' });
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      // Check if user exists
      const user = await userModel.findUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Verify password
      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Generate JWT
      const payload = {
        id: user.id,
        role: user.role
      };

      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

      res.status(200).json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Login Error:', error);
      res.status(500).json({ message: 'Server error during login' });
    }
  }
};

module.exports = authController;
