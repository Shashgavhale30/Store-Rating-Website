const db = require('../config/db');

const storeModel = {
  createStore: async (name, email, address, owner_id, photo_url) => {
    const query = `
      INSERT INTO stores (name, email, address, owner_id, photo_url) 
      VALUES ($1, $2, $3, $4, $5) 
      RETURNING *;
    `;
    const values = [name, email, address, owner_id, photo_url || null];
    const result = await db.query(query, values);
    return result.rows[0];
  },

  findAllStores: async () => {
    const query = `
      SELECT s.id, s.name, s.email, s.address, s.photo_url, s.created_at,
             u.name as owner_name, u.email as owner_email,
             COALESCE(AVG(r.rating), 0) as average_rating
      FROM stores s
      LEFT JOIN users u ON s.owner_id = u.id
      LEFT JOIN ratings r ON s.id = r.store_id
      GROUP BY s.id, u.name, u.email
      ORDER BY s.created_at DESC;
    `;
    const result = await db.query(query);
    return result.rows;
  },

  findStoresByOwnerId: async (owner_id) => {
    const query = `
      SELECT s.id, s.name, s.email, s.address, s.photo_url, s.created_at,
             COALESCE(AVG(r.rating), 0) as average_rating
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      WHERE s.owner_id = $1
      GROUP BY s.id
      ORDER BY s.created_at DESC;
    `;
    const result = await db.query(query, [owner_id]);
    return result.rows;
  }
};

module.exports = storeModel;
