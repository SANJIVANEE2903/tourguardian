const mysql = require('mysql2/promise');
require('dotenv').config();

async function test() {
  try {
    const pool = mysql.createPool({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, phone, nationality, role) VALUES (?, ?, ?, ?, ?, "tourist")',
      ['Aparna', 'demo@sentinel.ai', 'hash', '8177950074', 'Indian']
    );
    console.log("Success", result);
    process.exit(0);
  } catch(e) {
    console.error("DB Error:", e);
    process.exit(1);
  }
}
test();
