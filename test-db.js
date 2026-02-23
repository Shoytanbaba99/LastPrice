const mysql = require('mysql2/promise');
require('dotenv').config();

async function test() {
  try {
    const conn = await mysql.createConnection({
      host: '127.0.0.1',
      user: 'haggle',
      password: 'arena',
      database: 'haggle_arena'
    });
    console.log('Connected to MySQL!');
    await conn.query('SHOW TABLES;');
    console.log('Query executed!');
    await conn.end();
  } catch (e) {
    console.error('Failed:', e);
  }
}

test();
