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
      const adminEmail = 'admin@gmail.com';

      const adminExists = await userModel.findUserByEmail(adminEmail);
      if (!adminExists) {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash('Admin@123', salt);
        await userModel.createUser('Administrator Account', adminEmail, hash, 'Nagpur, Maharashtra', 'ADMIN');
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
app.use(cors({
  origin: [
    'https://storeratingweb.netlify.app',
    'http://localhost:3000',
    'http://localhost:5173'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());

// Serve static uploads
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Basic health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'success', message: 'API is running' });
});

app.get('/api/debug', async (req, res) => {
  try {
    const stores = await db.query('SELECT id, name, owner_id FROM stores');
    const users = await db.query('SELECT id, email FROM users');
    require('fs').writeFileSync('debug.json', JSON.stringify({ stores: stores.rows, users: users.rows }, null, 2));
    res.json({ status: 'written to debug.json' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Route mounts
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const userRoutes = require('./routes/userRoutes');
const storeRoutes = require('./routes/storeRoutes');
const ratingRoutes = require('./routes/ratingRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/ratings', ratingRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
