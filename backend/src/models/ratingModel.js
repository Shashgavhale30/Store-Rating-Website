const db = require('../config/db');

const ratingModel = {
  upsertRating: async (user_id, store_id, rating) => {
    const query = `
      INSERT INTO ratings (user_id, store_id, rating, updated_at)
      VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
      ON CONFLICT (user_id, store_id) 
      DO UPDATE SET rating = EXCLUDED.rating, updated_at = CURRENT_TIMESTAMP
      RETURNING *;
    `;
    const values = [user_id, store_id, rating];
    const result = await db.query(query, values);
    return result.rows[0];
  },

  getRatingsByUser: async (user_id) => {
    const query = `
      SELECT store_id, rating, updated_at 
      FROM ratings 
      WHERE user_id = $1
    `;
    const result = await db.query(query, [user_id]);
    return result.rows;
  },

  getRatingsByStore: async (store_id) => {
    const query = `
      SELECT r.id, r.rating, r.updated_at, u.name as user_name
      FROM ratings r
      JOIN users u ON r.user_id = u.id
      WHERE r.store_id = $1
      ORDER BY r.updated_at DESC
    `;
    const result = await db.query(query, [store_id]);
    return result.rows;
  }
};

module.exports = ratingModel;
