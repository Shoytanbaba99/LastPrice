/**
 * Transactions Routes
 * GET  /api/transactions/my          – Buyer/seller's transaction history
 * GET  /api/transactions/:id         – Single transaction (buyer & seller only)
 * POST /api/transactions/confirm     – Buyer confirms physical deal (refund escrow + +5 TP bonus)
 * POST /api/transactions/ghost       – Mark buyer as ghost (burn 10 TP permanently)
 */
const express = require("express");
const db = require("../config/db");
const auth = require("../middleware/auth");

const router = express.Router();

// ── GET /api/transactions/my ─────────────────────────────────
router.get("/my", auth, async (req, res) => {
    try {
        const { rows } = await db.query(
            `SELECT t.id, t.listing_id, t.final_price, t.status, t.created_at,
              l.title AS listing_title, l.photo_url,
              buyer.username AS buyer_name, buyer.email AS buyer_email,
              seller.username AS seller_name, seller.email AS seller_email,
              t.handshake_buyer, t.handshake_seller,
              t.buyer_confirmed, t.seller_confirmed,
              CASE WHEN t.buyer_id = $1 THEN 'buyer' ELSE 'seller' END AS my_role
       FROM Transactions t
       JOIN Listings l  ON l.id = t.listing_id
       JOIN Users buyer ON buyer.id = t.buyer_id
       JOIN Users seller ON seller.id = t.seller_id
       WHERE t.buyer_id = $2 OR t.seller_id = $3
       ORDER BY t.created_at DESC`,
            [req.user.id, req.user.id, req.user.id],
        );
        return res.json({ transactions: rows });
    } catch (err) {
        console.error("GET /transactions/my error:", err);
        return res.status(500).json({ error: "Server error" });
    }
});

// ── GET /api/transactions/:id ────────────────────────────────
router.get("/:id", auth, async (req, res) => {
    try {
        const { rows } = await db.query(
            `SELECT t.id, t.listing_id, t.final_price, t.status, t.created_at,
              l.title AS listing_title, l.photo_url, l.description,
              buyer.id AS buyer_id, buyer.username AS buyer_name, buyer.email AS buyer_email,
              seller.id AS seller_id, seller.username AS seller_name, seller.email AS seller_email,
              t.handshake_buyer, t.handshake_seller,
              t.buyer_confirmed, t.seller_confirmed
       FROM Transactions t
       JOIN Listings l   ON l.id  = t.listing_id
       JOIN Users buyer  ON buyer.id  = t.buyer_id
       JOIN Users seller ON seller.id = t.seller_id
       WHERE t.id = $1 AND (t.buyer_id = $2 OR t.seller_id = $3)`,
            [req.params.id, req.user.id, req.user.id],
        );
        if (!rows.length)
            return res.status(404).json({ error: "Transaction not found or access denied" });

        return res.json({ transaction: rows[0] });
    } catch (err) {
        console.error("GET /transactions/:id error:", err);
        return res.status(500).json({ error: "Server error" });
    }
});

// Handshake Verification: Buyer/Seller confirm deal via 6-digit codes.
router.post("/confirm", auth, async (req, res) => {
    const { transaction_id, code } = req.body;
    if (!transaction_id || !code) {
        return res.status(400).json({ error: "transaction_id and code are required" });
    }

    const client = await db.connect();
    try {
        await client.query("BEGIN");

        const { rows } = await client.query(
            "SELECT * FROM Transactions WHERE id = $1 FOR UPDATE",
            [transaction_id]
        );
        
        if (!rows.length) {
            await client.query("ROLLBACK");
            return res.status(404).json({ error: "Transaction not found" });
        }
        const tx = rows[0];

        if (tx.status !== "pending") {
            await client.query("ROLLBACK");
            return res.status(400).json({ error: `Transaction already ${tx.status}` });
        }

        let isBuyer = tx.buyer_id === req.user.id;
        let isSeller = tx.seller_id === req.user.id;

        if (!isBuyer && !isSeller) {
            await client.query("ROLLBACK");
            return res.status(403).json({ error: "Access denied" });
        }

        if (isBuyer) {
            if (tx.handshake_seller !== code) {
                await client.query("ROLLBACK");
                return res.status(400).json({ error: "Invalid handshake code" });
            }
            await client.query("UPDATE Transactions SET buyer_confirmed = true WHERE id = $1", [transaction_id]);
        }

        if (isSeller) {
            if (tx.handshake_buyer !== code) {
                await client.query("ROLLBACK");
                return res.status(400).json({ error: "Invalid handshake code" });
            }
            await client.query("UPDATE Transactions SET seller_confirmed = true WHERE id = $1", [transaction_id]);
        }

        // Re-check status
        const { rows: updatedRows } = await client.query(
            "SELECT * FROM Transactions WHERE id = $1",
            [transaction_id]
        );
        const updatedTx = updatedRows[0];

        if (updatedTx.buyer_confirmed && updatedTx.seller_confirmed) {
            // Both confirmed -> Finalize!
            await client.query("UPDATE Transactions SET status = 'confirmed' WHERE id = $1", [transaction_id]);
            await client.query("UPDATE Listings SET status = 'completed' WHERE id = $1", [tx.listing_id]);
            
            await client.query("COMMIT");
            return res.json({ message: "Deal successfully finalized!", finalized: true });
        }

        await client.query("COMMIT");
        return res.json({ 
            message: isBuyer ? "Buyer confirmed. Waiting for seller." : "Seller confirmed. Waiting for buyer.",
            finalized: false 
        });

    } catch (err) {
        await client.query("ROLLBACK");
        console.error("POST /transactions/confirm error:", err);
        return res.status(500).json({ error: "Server error" });
    } finally {
        client.release();
    }
});

module.exports = router;
