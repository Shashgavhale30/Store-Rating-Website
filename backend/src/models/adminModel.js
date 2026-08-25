const db = require('../config/db');

const adminModel = {
  getDashboardStats: async () => {
    const usersCountResult = await db.query('SELECT COUNT(*) FROM users');
    const storesCountResult = await db.query('SELECT COUNT(*) FROM stores');
    const ratingsCountResult = await db.query('SELECT COUNT(*) FROM ratings');

    const usersByRoleResult = await db.query('SELECT role, COUNT(*) as count FROM users GROUP BY role');
    const usersByRole = usersByRoleResult.rows.map(row => ({
      name: row.role,
      value: parseInt(row.count, 10)
    }));

    const ratingsGrowthResult = await db.query(`
      SELECT TO_CHAR(created_at, 'YYYY-MM-DD') as date, COUNT(*) as count 
      FROM ratings 
      GROUP BY TO_CHAR(created_at, 'YYYY-MM-DD') 
      ORDER BY date ASC 
      LIMIT 10
    `);
    
    // Fallback data if ratings is empty
    let ratingsGrowth = ratingsGrowthResult.rows.map(row => ({
      date: row.date,
      count: parseInt(row.count, 10)
    }));

    return {
      totalUsers: parseInt(usersCountResult.rows[0].count, 10),
      totalStores: parseInt(storesCountResult.rows[0].count, 10),
      totalRatings: parseInt(ratingsCountResult.rows[0].count, 10),
      usersByRole,
      ratingsGrowth
    };
  }
};

module.exports = adminModel;
