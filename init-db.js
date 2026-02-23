require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function initDB() {
    console.log('Connecting to database...');

    const dbConfig = {
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '3306'),
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
        multipleStatements: true // Required to run the whole file at once
    };

    if (process.env.DB_SSL === 'true') {
        dbConfig.ssl = { rejectUnauthorized: true };
    }

    try {
        const conn = await mysql.createConnection(dbConfig);
        console.log('✅ Connected.');

        console.log('Reading schema.sql...');
        const schemaPath = path.join(__dirname, 'database', 'schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        console.log('Running schema setup (this might take a moment)...');
        await conn.query(schemaSql);
        console.log('✅ Schema imported successfully!');

        await conn.end();
        console.log('\nYou can now start your server with: npm start');
    } catch (err) {
        console.error('❌ Error initializing database:', err.message);
    }
}

initDB();
