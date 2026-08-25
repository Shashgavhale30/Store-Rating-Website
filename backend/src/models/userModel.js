const db = require('../config/db');

const userModel = {
  createUser: async (name, email, password_hash, address, role) => {
    const query = `
      INSERT INTO users (name, email, password_hash, address, role) 
      VALUES ($1, $2, $3, $4, $5) 
      RETURNING id, name, email, role, created_at;
    `;
    const values = [name, email, password_hash, address, role];
    const result = await db.query(query, values);
    return result.rows[0];
  },

  findUserByEmail: async (email) => {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await db.query(query, [email]);
    return result.rows[0];
  },

  findAdminUser: async () => {
    const query = "SELECT * FROM users WHERE role = 'ADMIN' LIMIT 1";
    const result = await db.query(query);
    return result.rows[0];
  },

  findAllUsers: async () => {
    const query = `
      SELECT u.id, u.name, u.email, u.address, u.role, u.created_at,
             COALESCE(AVG(r.rating), 0) as average_rating
      FROM users u
      LEFT JOIN stores s ON u.id = s.owner_id AND u.role = 'OWNER'
      LEFT JOIN ratings r ON s.id = r.store_id
      GROUP BY u.id
      ORDER BY u.created_at DESC;
    `;
    const result = await db.query(query);
    return result.rows;
  },

  findUserById: async (id) => {
    const query = `
      SELECT u.id, u.name, u.email, u.address, u.role, u.created_at,
             COALESCE(AVG(r.rating), 0) as average_rating
      FROM users u
      LEFT JOIN stores s ON u.id = s.owner_id AND u.role = 'OWNER'
      LEFT JOIN ratings r ON s.id = r.store_id
      WHERE u.id = $1
      GROUP BY u.id;
    `;
    const result = await db.query(query, [id]);
    return result.rows[0];
  },

  deleteUser: async (id) => {
    const query = 'DELETE FROM users WHERE id = $1 RETURNING *';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }
};

module.exports = userModel;
