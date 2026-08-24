const db = require('./src/config/db');

async function test() {
  try {
    const stores = await db.query('SELECT name, owner_id FROM stores');
    const users = await db.query('SELECT id, name, email, role FROM users');
    console.log("=== USERS ===");
    console.table(users.rows);
    console.log("=== STORES ===");
    console.table(stores.rows);
  } catch(e) {
    console.error(e);
  } finally {
    process.exit();
  }
}

test();
