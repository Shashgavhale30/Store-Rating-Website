require('dotenv').config();
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function createAdmin() {
  try {
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash('Admin@123', salt);
    
    const query = `
      INSERT INTO users (name, email, address, password_hash, role)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, name, email, role;
    `;
    const values = ['Admin', 'admin@gmail.com', 'Nagpur, Maharashtra', password_hash, 'ADMIN'];
    
    const res = await pool.query(query, values);
    console.log('Admin user created successfully:', res.rows[0]);
  } catch (err) {
    if (err.code === '23505') { // unique violation
      console.log('Admin user already exists (duplicate email).');
    } else {
      console.error('Error inserting admin:', err);
    }
  } finally {
    pool.end();
  }
}

createAdmin();
