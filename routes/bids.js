/**
 * Bids Routes
 * POST /api/bids              – Place a bid (must be arena participant)
 * GET  /api/bids/:listingId   – Get own bids for a listing
 *
 * Security: reserve_floor is NEVER returned.
 * Price Tension Indicator computed server-side:
 *   - bid < 50% reserve  → "red"
 *   - bid 50–99% reserve → "yellow"
 *   - bid >= reserve     → "green"
 */
const express = require("express");
const db = require("../config/db");
const auth = require("../middleware/auth");
const { isPositiveDecimal } = require("../middleware/validate");

const router = express.Router();

// ── POST /api/bids ───────────────────────────────────────────
router.post("/", auth, async (req, res) => {
    try {
        const { listing_id, amount } = req.body;

        if (!listing_id || !amount)
            return res.status(400).json({ error: "listing_id and amount are required" });

        if (!isPositiveDecimal(amount))
            return res.status(400).json({ error: "amount must be a positive number" });

        const bidAmount = parseFloat(parseFloat(amount).toFixed(2));

        // 1. Fetch listing (including reserve_floor for tension computation)
        const { rows: listings } = await db.query(
            `SELECT id, seller_id, status, arena_start_time, reserve_floor FROM Listings WHERE id = $1`,
            [listing_id],
        );
        if (!listings.length) return res.status(404).json({ error: "Listing not found" });

        const listing = listings[0];

        if (listing.status !== "live")
            return res.status(400).json({ error: "This arena is not currently live" });

        const now = new Date();
        const startTime = new Date(listing.arena_start_time);

        if (now < startTime) return res.status(400).json({ error: "Arena has not started yet" });

        // Calculate current round (2 min intervals)
        // e.g. 0-2 mins = Round 1. 2-4 mins = Round 2. 4-6 mins = Round 3.
        const elapsedMinutes = (now - startTime) / (1000 * 60);
        const currentRound = Math.floor(elapsedMinutes / 2) + 1;

        if (currentRound > 3)
            return res
                .status(400)
                .json({ error: "This arena has concluded (max 3 rounds reached)" });

        if (listing.seller_id === req.user.id)
            return res.status(403).json({ error: "Sellers cannot bid on their own listings" });

        // 2. Insert bid
        let result;
        try {
            const { rows } = await db.query(
                "INSERT INTO Bids (listing_id, buyer_id, amount, round_number) VALUES ($1, $2, $3, $4) RETURNING id",
                [listing_id, req.user.id, bidAmount, currentRound],
            );
            result = rows;
        } catch (err) {
            // Check for Postgres unique constraint violation
            if (err.code === "23505") {
                return res
                    .status(400)
                    .json({ error: "You have already placed a bid in this round" });
            }
            throw err;
        }

        // 4. Compute Price Tension Indicator (server-side, never exposes reserve value)
        const reserve = parseFloat(listing.reserve_floor);
        let tension;
        if (bidAmount >= reserve) tension = "green";
        else if (bidAmount >= reserve * 0.5) tension = "yellow";
        else tension = "red";

        return res.status(201).json({
            message: "Bid placed successfully",
            bid: {
                id: result[0].id,
                listing_id: parseInt(listing_id),
                amount: bidAmount,
                tension, // "red" | "yellow" | "green" – reserve value NEVER revealed
            },
        });
    } catch (err) {
        console.error("POST /bids error:", err);
        return res.status(500).json({ error: "Server error" });
    }
});

// ── GET /api/bids/:listingId ─────────────────────────────────
// Returns the authenticated user's own bids for a listing
router.get("/:listingId", auth, async (req, res) => {
    try {
        const { rows } = await db.query(
            `SELECT b.id, b.amount, b.created_at, b.round_number
       FROM Bids b
       WHERE b.listing_id = $1 AND b.buyer_id = $2
       ORDER BY b.created_at DESC`,
            [req.params.listingId, req.user.id],
        );

        // Compute tension for each bid without revealing reserve
        let tension_latest = null;
        if (rows.length) {
            // Need reserve internally
            const { rows: listings } = await db.query(
                "SELECT reserve_floor FROM Listings WHERE id = $1",
                [req.params.listingId],
            );
            if (listings.length) {
                const reserve = parseFloat(listings[0].reserve_floor);
                const latest = parseFloat(rows[0].amount);
                if (latest >= reserve) tension_latest = "green";
                else if (latest >= reserve * 0.5) tension_latest = "yellow";
                else tension_latest = "red";
            }
        }

        return res.json({
            bids: rows.map((b) => ({
                id: b.id,
                amount: parseFloat(b.amount),
                created_at: b.created_at,
                round_number: b.round_number,
            })),
            tension_latest, // colour indicator only, no reserve value
        });
    } catch (err) {
        console.error("GET /bids/:listingId error:", err);
        return res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
