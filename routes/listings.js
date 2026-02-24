/**
 * Listings Routes
 * GET  /api/listings          – All live listings (NO reserve_floor)
 * POST /api/listings          – Create listing (seller, with photo upload)
 * GET  /api/listings/:id      – Single listing (NO reserve_floor)
 * GET  /api/listings/my       – Seller's own listings
 * PATCH /api/listings/:id/go-live – Transition draft → live
 */
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const db = require("../config/db");
const auth = require("../middleware/auth");
const { sanitizeString, isPositiveDecimal, isFutureDate } = require("../middleware/validate");

const router = express.Router();

// ── Multer storage (memory for serverless) ─────────────
// Note: We use memoryStorage so we can convert the file to a Base64 string.
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE || "5242880") },
    fileFilter: (req, file, cb) => {
        const allowed = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
        if (allowed.includes(path.extname(file.originalname).toLowerCase())) cb(null, true);
        else cb(new Error("Only image files are allowed"));
    },
});

/**
 * Helper: strip reserve_floor from a listing object.
 * CRITICAL: Call this on EVERY listing before sending to client.
 */
function stripReserve(listing) {
    const { reserve_floor, ...safe } = listing;
    return safe;
}

// ── GET /api/listings ────────────────────────────────────────
router.get("/", async (req, res) => {
    try {
        const { rows } = await db.query(
            `SELECT l.id, l.seller_id, u.username AS seller_name, l.title, l.description,
              l.photo_url, l.display_price, l.status, l.arena_start_time, l.created_at,
              (SELECT COUNT(DISTINCT b.buyer_id) FROM Bids b WHERE b.listing_id = l.id) AS participant_count
       FROM Listings l
       JOIN Users u ON u.id = l.seller_id
       WHERE l.status = 'live'
       ORDER BY l.arena_start_time ASC`,
        );
        return res.json({ listings: rows }); // reserve_floor never selected
    } catch (err) {
        console.error("GET /listings error:", err);
        return res.status(500).json({ error: "Server error" });
    }
});

// ── GET /api/listings/my ─────────────────────────────────────
router.get("/my", auth, async (req, res) => {
    try {
        const { rows } = await db.query(
            `SELECT l.id, l.title, l.display_price, l.status, l.arena_start_time, l.created_at,
              l.photo_url, l.description,
              (SELECT MAX(b.amount) FROM Bids b WHERE b.listing_id = l.id) AS highest_bid,
              (SELECT COUNT(*) FROM Bids b WHERE b.listing_id = l.id) AS bid_count,
              (SELECT u2.username FROM Bids b2
               JOIN Users u2 ON u2.id = b2.buyer_id
               WHERE b2.listing_id = l.id
               ORDER BY b2.amount DESC LIMIT 1) AS top_bidder_name
       FROM Listings l
       WHERE l.seller_id = $1
       ORDER BY l.created_at DESC`,
            [req.user.id],
        );
        return res.json({ listings: rows }); // reserve_floor never selected
    } catch (err) {
        console.error("GET /listings/my error:", err);
        return res.status(500).json({ error: "Server error" });
    }
});

// ── GET /api/listings/:id ────────────────────────────────────
router.get("/:id", async (req, res) => {
    try {
        const { rows } = await db.query(
            `SELECT l.id, l.seller_id, u.username AS seller_name, l.title, l.description,
              l.photo_url, l.display_price, l.status, l.arena_start_time, l.created_at,
              (SELECT COUNT(DISTINCT b.buyer_id) FROM Bids b WHERE b.listing_id = l.id) AS participant_count
       FROM Listings l
       JOIN Users u ON u.id = l.seller_id
       WHERE l.id = $1`,
            [req.params.id],
        );
        if (!rows.length) return res.status(404).json({ error: "Listing not found" });

        const { rows: bids } = await db.query(
            `SELECT u.username, b.amount, b.created_at
             FROM Bids b
             JOIN Users u ON b.buyer_id = u.id
             WHERE b.listing_id = $1
             ORDER BY b.amount DESC
             LIMIT 10`,
            [req.params.id],
        );

        return res.json({ listing: rows[0], leaderboard: bids }); // reserve_floor never selected
    } catch (err) {
        console.error("GET /listings/:id error:", err);
        return res.status(500).json({ error: "Server error" });
    }
});

// ── POST /api/listings ───────────────────────────────────────
router.post("/", auth, upload.single("photo"), async (req, res) => {
    try {
        const { title, description, display_price, reserve_floor, arena_start_time } = req.body;

        if (!title || !display_price || !reserve_floor || !arena_start_time)
            return res.status(400).json({
                error: "title, display_price, reserve_floor, arena_start_time are required",
            });

        if (!isPositiveDecimal(display_price))
            return res.status(400).json({ error: "display_price must be a positive number" });

        if (!isPositiveDecimal(reserve_floor))
            return res.status(400).json({ error: "reserve_floor must be a positive number" });

        if (!isFutureDate(arena_start_time))
            return res.status(400).json({ error: "arena_start_time must be a future date" });

        const cleanTitle = sanitizeString(title);
        const cleanDesc = sanitizeString(description || "");

        let photoUrl = null;
        if (req.file) {
            // Convert file buffer to Base64
            const b64 = req.file.buffer.toString("base64");
            const mimeType = req.file.mimetype;
            photoUrl = `data:${mimeType};base64,${b64}`;
        }

        const { rows: result } = await db.query(
            `INSERT INTO Listings (seller_id, title, description, photo_url, display_price, reserve_floor, arena_start_time, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'live') RETURNING id`,
            [
                req.user.id,
                cleanTitle,
                cleanDesc,
                photoUrl,
                parseFloat(display_price),
                parseFloat(reserve_floor),
                new Date(arena_start_time),
            ],
        );

        // Return listing without reserve_floor
        return res.status(201).json({
            message: "Listing created",
            listing: {
                id: result[0].id,
                title: cleanTitle,
                description: cleanDesc,
                photo_url: photoUrl,
                display_price: parseFloat(display_price),
                status: "live",
                arena_start_time,
            },
        });
    } catch (err) {
        console.error("POST /listings error:", err);
        return res.status(500).json({ error: "Server error" });
    }
});

// ── PATCH /api/listings/:id/complete ────────────────────────
router.patch("/:id/complete", auth, async (req, res) => {
    try {
        const { rows } = await db.query(
            "SELECT id, seller_id, status FROM Listings WHERE id = $1",
            [req.params.id],
        );
        if (!rows.length) return res.status(404).json({ error: "Listing not found" });
        if (rows[0].seller_id !== req.user.id)
            return res.status(403).json({ error: "Not your listing" });

        await db.query("UPDATE Listings SET status = 'completed' WHERE id = $1", [req.params.id]);
        return res.json({ message: "Listing marked completed" });
    } catch (err) {
        console.error("PATCH /listings/:id/complete error:", err);
        return res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
