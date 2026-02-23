/**
 * Arena Resolution Service
 * Called when an arena's timer expires.
 * Determines MATCH or UNMATCHED based on highest bid vs reserve_floor.
 */
const db = require("../config/db");

/**
 * Resolve an arena for a listing.
 * @param {number} listingId
 * @returns {object} Result summary
 */
async function resolveArena(listingId) {
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();

        // 1. Fetch listing with reserve_floor (internal use only)
        const [listings] = await conn.execute(
            `SELECT id, seller_id, reserve_floor, status, arena_end_time
       FROM Listings WHERE id = ? FOR UPDATE`,
            [listingId],
        );
        if (!listings.length) throw new Error("Listing not found");
        const listing = listings[0];

        if (listing.status !== "live") {
            await conn.rollback();
            return { message: "Listing is not in live status", status: listing.status };
        }

        // 2. Find the highest bid
        const [bids] = await conn.execute(
            `SELECT b.id, b.buyer_id, b.amount, u.email AS buyer_email, u.username AS buyer_username
       FROM Bids b
       JOIN Users u ON u.id = b.buyer_id
       WHERE b.listing_id = ?
       ORDER BY b.amount DESC, b.created_at ASC
       LIMIT 1`,
            [listingId],
        );

        if (!bids.length) {
            // No bids – unmatched
            await conn.execute("UPDATE Listings SET status = 'unmatched' WHERE id = ?", [
                listingId,
            ]);
            await conn.commit();
            return { outcome: "unmatched", reason: "No bids placed" };
        }

        const highestBid = bids[0];
        const reserve = parseFloat(listing.reserve_floor);
        const bidAmount = parseFloat(highestBid.amount);

        if (bidAmount >= reserve) {
            // ── MATCH ──
            const [sellerRows] = await conn.execute(
                "SELECT email, username FROM Users WHERE id = ?",
                [listing.seller_id],
            );
            const seller = sellerRows[0];

            // Create transaction record
            await conn.execute(
                `INSERT INTO Transactions (listing_id, buyer_id, seller_id, final_price, status)
         VALUES (?, ?, ?, ?, 'pending')`,
                [listingId, highestBid.buyer_id, listing.seller_id, highestBid.amount],
            );

            // Update listing status
            await conn.execute("UPDATE Listings SET status = 'matched' WHERE id = ?", [listingId]);

            await conn.commit();
            return {
                outcome: "matched",
                highestBid: bidAmount,
                buyer: {
                    id: highestBid.buyer_id,
                    username: highestBid.buyer_username,
                    email: highestBid.buyer_email,
                },
                seller: { id: listing.seller_id, username: seller.username, email: seller.email },
            };
        } else {
            // ── UNMATCHED ──
            await conn.execute("UPDATE Listings SET status = 'unmatched' WHERE id = ?", [
                listingId,
            ]);
            await conn.commit();
            return {
                outcome: "unmatched",
                reason: "Reserve not reached",
                highestBidder: {
                    id: highestBid.buyer_id,
                    username: highestBid.buyer_username,
                    email: highestBid.buyer_email,
                },
                highestBid: bidAmount,
            };
        }
    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        conn.release();
    }
}

module.exports = { resolveArena };
