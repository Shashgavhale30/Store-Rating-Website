const db = require('../config/db');

const adminModel = {
  getDashboardStats: async () => {
    const usersCountResult = await db.query('SELECT COUNT(*) FROM users');
    const storesCountResult = await db.query('SELECT COUNT(*) FROM stores');
    const ratingsCountResult = await db.query('SELECT COUNT(*) FROM ratings');

    return {
      totalUsers: parseInt(usersCountResult.rows[0].count, 10),
      totalStores: parseInt(storesCountResult.rows[0].count, 10),
      totalRatings: parseInt(ratingsCountResult.rows[0].count, 10)
    };
  }
};

module.exports = adminModel;
