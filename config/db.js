/**
 * HaggleArena – Database Connection Pool
 * Uses pg for PostgreSQL connectivity.
 */
const { Pool } = require("pg");
require("dotenv").config();

// The connection string provided by Neon
// Example: postgresql://neondb_owner:npg_UJq7cunXL3HE@ep-wispy-sea-ae9k0nve-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require
const connString = process.env.DATABASE_URL;

if (!connString) {
    console.error("❌ CRITICAL: DATABASE_URL is not set in environment variables!");
}

const poolOptions = {
    ssl: connString ? { rejectUnauthorized: false } : false,
};

if (connString) {
    poolOptions.connectionString = connString;
}

const pool = new Pool(poolOptions);

module.exports = pool;
