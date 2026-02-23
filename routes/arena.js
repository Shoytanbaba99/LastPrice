/**
 * Arena Routes
 * POST /api/arena/join             – Buyer stakes 10 TP into escrow
 * GET  /api/arena/:listingId/status – Participant count, time remaining, own status
 * POST /api/arena/resolve/:listingId – Trigger resolution (admin/timer)
 */
const express = require("express");
const db = require("../config/db");
const auth = require("../middleware/auth");
const { resolveArena } = require("../services/arena");

const router = express.Router();

// ── GET /api/arena/:listingId/status ─────────────────────────
router.get("/:listingId/status", auth, async (req, res) => {
    try {
        const { listingId } = req.params;

        const { rows: listings } = await db.query(
            "SELECT id, status, arena_end_time FROM Listings WHERE id = $1",
            [listingId],
        );
        if (!listings.length) return res.status(404).json({ error: "Listing not found" });
        const listing = listings[0];

        const { rows: countRows } = await db.query(
            "SELECT COUNT(DISTINCT buyer_id) AS count FROM Bids WHERE listing_id = $1",
            [listingId],
        );

        const { rows: myEntry } = await db.query(
            "SELECT id FROM Bids WHERE listing_id = $1 AND buyer_id = $2",
            [listingId, req.user.id],
        );

        const now = new Date();
        const endTime = new Date(listing.arena_end_time);
        const timeLeftMs = Math.max(0, endTime - now);

        return res.json({
            listing_status: listing.status,
            arena_end_time: listing.arena_end_time,
            time_left_seconds: Math.floor(timeLeftMs / 1000),
            participant_count: countRows[0].count,
            my_participation: myEntry.length > 0 ? { status: "active" } : null,
        });
    } catch (err) {
        console.error("GET /arena/:id/status error:", err);
        return res.status(500).json({ error: "Server error" });
    }
});

// ── POST /api/arena/resolve/:listingId ───────────────────────
// In production, this would be called by a scheduled job.
// Protected by auth; in a real system add an admin role check.
router.post("/resolve/:listingId", auth, async (req, res) => {
    try {
        // Optional: verify the listing's arena time has passed
        const { rows: listings } = await db.query(
            "SELECT arena_end_time, status, seller_id FROM Listings WHERE id = $1",
            [req.params.listingId],
        );
        if (!listings.length) return res.status(404).json({ error: "Listing not found" });
        const listing = listings[0];

        // Allow seller OR after timer to trigger
        const isExpired = new Date() >= new Date(listing.arena_end_time);
        const isSeller = listing.seller_id === req.user.id;

        if (!isExpired && !isSeller)
            return res.status(403).json({ error: "Arena has not ended yet" });

        const result = await resolveArena(parseInt(req.params.listingId));
        return res.json({ message: "Arena resolved", result });
    } catch (err) {
        console.error("POST /arena/resolve error:", err);
        return res.status(500).json({ error: err.message || "Server error" });
    }
});

module.exports = router;
