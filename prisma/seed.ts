/**
 * prisma/seed.ts
 *
 * Seed script for the LastPrice MVP database.
 * Generates three users, two active listings owned by Seller1,
 * and sample bids to simulate realistic auction activity.
 *
 * Run with:
 *   npm run seed
 *
 * Safe to run multiple times — existing seed users are deleted first
 * to ensure idempotency without the need for --force-reset.
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const SALT_ROUNDS = 10;

async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

function daysFromNow(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
}

// ---------------------------------------------------------------------------
// Main seed function
// ---------------------------------------------------------------------------

async function main() {
  console.log("🌱  Starting LastPrice database seed...\n");

  // ── 1. Clean up existing seed data (idempotency) ──────────────────────────
  // We identify seed users by their email domain for safety
  const seedEmails = ["seller1@lastprice.dev", "buyer1@lastprice.dev", "buyer2@lastprice.dev"];

  console.log("🗑   Cleaning existing seed records...");

  // Delete in dependency order to satisfy FK constraints
  await db.transaction.deleteMany({
    where: {
      OR: [
        { buyer: { email: { in: seedEmails } } },
        { seller: { email: { in: seedEmails } } },
      ],
    },
  });

  await db.bid.deleteMany({
    where: {
      OR: [
        { buyer: { email: { in: seedEmails } } },
        { listing: { seller: { email: { in: seedEmails } } } },
      ],
    },
  });

  await db.listing.deleteMany({
    where: { seller: { email: { in: seedEmails } } },
  });

  await db.user.deleteMany({
    where: { email: { in: seedEmails } },
  });

  console.log("   ✓ Cleanup complete.\n");

  // ── 2. Create Users ────────────────────────────────────────────────────────
  console.log("👤  Creating seed users...");

  const hashedPassword = await hashPassword("password123");

  const seller1 = await db.user.create({
    data: {
      email: "seller1@lastprice.dev",
      name: "Aiko (Seller)",
      password: hashedPassword,
    },
  });

  const buyer1 = await db.user.create({
    data: {
      email: "buyer1@lastprice.dev",
      name: "Kenji (Buyer 1)",
      password: hashedPassword,
    },
  });

  const buyer2 = await db.user.create({
    data: {
      email: "buyer2@lastprice.dev",
      name: "Mei (Buyer 2)",
      password: hashedPassword,
    },
  });

  console.log(`   ✓ ${seller1.name} — ${seller1.email}`);
  console.log(`   ✓ ${buyer1.name}  — ${buyer1.email}`);
  console.log(`   ✓ ${buyer2.name}  — ${buyer2.email}`);
  console.log("   All passwords: password123\n");

  // ── 3. Create Listings ─────────────────────────────────────────────────────
  console.log("📦  Creating seed listings...");

  const shortBurstListing = await db.listing.create({
    data: {
      sellerId: seller1.id,
      title: "Wabi-Sabi Ceramic Vase",
      description:
        "A hand-thrown stoneware vase with an ash glaze finish. Each piece is unique, bearing the marks of the kiln and the potter's hand. Perfect imperfection.",
      imageUrl:
        "https://images.unsplash.com/photo-1549492423-400259a2e574?auto=format&fit=crop&q=80&w=800",
      displayPrice: 120,
      reservePrice: 280,
      saleMode: "SHORT_BURST",
      burstChances: 3,
      status: "ACTIVE",
      expiresAt: daysFromNow(7),
    },
  });

  const longBurstListing = await db.listing.create({
    data: {
      sellerId: seller1.id,
      title: "First Edition Ink Print — Mountain Series No. 4",
      description:
        "Woodblock print on washi paper. Limited to 12 copies. Signed and stamped by the artist. Archival quality, UV-protective framing recommended.",
      imageUrl:
        "https://images.unsplash.com/photo-1617375407361-53d41e9e2bf4?auto=format&fit=crop&q=80&w=800",
      displayPrice: 500,
      reservePrice: 900,
      saleMode: "LONG_BURST",
      burstRounds: 5,
      status: "ACTIVE",
      expiresAt: daysFromNow(14),
    },
  });

  console.log(`   ✓ [SHORT_BURST] "${shortBurstListing.title}" (ID: ${shortBurstListing.id})`);
  console.log(`   ✓ [LONG_BURST]  "${longBurstListing.title}" (ID: ${longBurstListing.id})\n`);

  // ── 4. Create Sample Bids ──────────────────────────────────────────────────
  console.log("💸  Seeding bids on the Short Burst listing...");

  // Buyer 1 has placed 2 of their 3 allowed bids
  const bid1 = await db.bid.create({
    data: {
      buyerId: buyer1.id,
      listingId: shortBurstListing.id,
      amount: 140,
      createdAt: new Date(Date.now() - 1000 * 60 * 15), // 15 min ago
    },
  });

  const bid2 = await db.bid.create({
    data: {
      buyerId: buyer1.id,
      listingId: shortBurstListing.id,
      amount: 210,
      createdAt: new Date(Date.now() - 1000 * 60 * 8), // 8 min ago
    },
  });

  // Buyer 2 has placed 1 of their 3 allowed bids
  const bid3 = await db.bid.create({
    data: {
      buyerId: buyer2.id,
      listingId: shortBurstListing.id,
      amount: 195,
      createdAt: new Date(Date.now() - 1000 * 60 * 5), // 5 min ago
    },
  });

  console.log(
    `   ✓ ${buyer1.name}: $${bid1.amount} and $${bid2.amount} (1 chance remaining)`,
  );
  console.log(`   ✓ ${buyer2.name}: $${bid3.amount} (2 chances remaining)\n`);

  // ── 5. Summary ─────────────────────────────────────────────────────────────
  console.log("─".repeat(52));
  console.log("✅  Seed complete. Database is ready for testing.\n");
  console.log("  Login credentials (all use password: password123):");
  console.log(`  • Seller : ${seller1.email}`);
  console.log(`  • Buyer 1: ${buyer1.email}`);
  console.log(`  • Buyer 2: ${buyer2.email}`);
  console.log("─".repeat(52));
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

main()
  .catch((err) => {
    console.error("❌  Seed failed:", err);
    process.exit(1);
  })
  .finally(() => {
    void db.$disconnect();
  });
