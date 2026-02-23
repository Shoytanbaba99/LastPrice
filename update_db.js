require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  const client = await pool.connect();
  try {
    await client.query("ALTER TABLE Listings ALTER COLUMN photo_url TYPE TEXT;");
    console.log("Successfully altered photo_url column type to TEXT.");
    
    await client.query("ALTER TABLE Bids ADD COLUMN IF NOT EXISTS round_number INTEGER NOT NULL DEFAULT 1;");
    console.log("Added round_number column to Bids.");
    
    try {
      await client.query("ALTER TABLE Bids ADD CONSTRAINT unique_bid_per_round UNIQUE (listing_id, buyer_id, round_number);");
      console.log("Added UNIQUE constraint on Bids");
    } catch (e) {
      console.log("Unique constraint might already exist");
    }

    try {
      await client.query("ALTER TABLE Listings RENAME COLUMN arena_end_time TO arena_start_time;");
      console.log("Renamed arena_end_time to arena_start_time.");
    } catch (e) {
       console.log("Column might already be renamed");
    }

  } catch (err) {
    console.error("Error updating DB:", err);
  } finally {
    client.release();
    pool.end();
    process.exit(0);
  }
}

main();
