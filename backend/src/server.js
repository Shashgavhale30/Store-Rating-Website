require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;
const db = require('./config/db');

// Test database connection and seed Admin
db.query('SELECT NOW()', async (err, res) => {
  if (err) {
    console.error('Failed to connect to the database:', err.stack);
  } else {
    console.log('Successfully connected to the database at:', res.rows[0].now);
    
    // Auto-create Admin
    try {
      const userModel = require('./models/userModel');
      const bcrypt = require('bcryptjs');
      const adminEmail = 'admin@storerating.com';
      
      const adminExists = await userModel.findUserByEmail(adminEmail);
      if (!adminExists) {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash('Admin@123', salt);
        await userModel.createUser('System Administrator', adminEmail, hash, 'HQ', 'ADMIN');
        console.log(`✅ Default admin created: ${adminEmail} / Admin@123`);
      }
      
      // Auto-migrate: Add photo_url to stores if it doesn't exist
      try {
        await db.query(`ALTER TABLE stores ADD COLUMN IF NOT EXISTS photo_url VARCHAR(255);`);
        console.log('✅ Database schema verified (photo_url).');
      } catch (alterErr) {
        console.error('Failed to alter stores table:', alterErr);
      }
      
    } catch (seedErr) {
      console.error('Failed to seed admin:', seedErr);
    }
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Serve static uploads
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Basic health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'success', message: 'API is running' });
});

// Route mounts
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/stores', require('./routes/storeRoutes'));
// app.use('/api/ratings', require('./routes/ratingRoutes'));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
