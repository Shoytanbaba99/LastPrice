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

const pool = new Pool({
    connectionString: connString,
    ssl: connString ? { rejectUnauthorized: false } : false,
});

// Test connection on startup (only if we have a string)
if (connString) {
    pool.connect()
    .then((client) => {
        console.log("✅ PostgreSQL connected successfully");
        client.release();
    })
    .catch((err) => {
        console.warn("⚠️  PostgreSQL connection failed:", err.message);
        console.warn(
            "   Start PostgreSQL and update .env with correct credentials, then restart the server.",
        );
    });
}

module.exports = pool;
