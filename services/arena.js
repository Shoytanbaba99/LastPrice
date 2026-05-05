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
    const client = await db.connect();
    try {
        await client.query("BEGIN");

        // 1. Fetch listing with reserve_floor (internal use only)
        const { rows: listings } = await client.query(
            `SELECT id, seller_id, reserve_floor, status, arena_start_time 
             FROM Listings WHERE id = $1 FOR UPDATE`,
            [listingId],
        );
        if (!listings.length) throw new Error("Listing not found");
        const listing = listings[0];

        if (listing.status !== "live") {
            await client.query("ROLLBACK");
            return { message: "Listing is not in live status", status: listing.status };
        }

        // 2. Find the highest bid
        const { rows: bids } = await client.query(
            `SELECT b.id, b.buyer_id, b.amount, u.email AS buyer_email, u.username AS buyer_username
             FROM Bids b
             JOIN Users u ON u.id = b.buyer_id
             WHERE b.listing_id = $1
             ORDER BY b.amount DESC, b.created_at ASC
             LIMIT 1`,
            [listingId],
        );

        if (!bids.length) {
            // No bids – unmatched
            await client.query("UPDATE Listings SET status = 'unmatched' WHERE id = $1", [
                listingId,
            ]);
            await client.query("COMMIT");
            return { outcome: "unmatched", reason: "No bids placed" };
        }

        const highestBid = bids[0];
        const reserve = parseFloat(listing.reserve_floor);
        const bidAmount = parseFloat(highestBid.amount);

        if (bidAmount >= reserve) {
            // ── MATCH ──
            const { rows: sellerRows } = await client.query(
                "SELECT email, username FROM Users WHERE id = $1",
                [listing.seller_id],
            );
            const seller = sellerRows[0];

            // Create transaction record
            await client.query(
                `INSERT INTO Transactions (listing_id, buyer_id, seller_id, final_price, status)
                 VALUES ($1, $2, $3, $4, 'pending')`,
                [listingId, highestBid.buyer_id, listing.seller_id, highestBid.amount],
            );

            // Update listing status
            await client.query("UPDATE Listings SET status = 'matched' WHERE id = $1", [listingId]);

            await client.query("COMMIT");
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
            await client.query("UPDATE Listings SET status = 'unmatched' WHERE id = $1", [
                listingId,
            ]);
            await client.query("COMMIT");
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
        await client.query("ROLLBACK");
        throw err;
    } finally {
        client.release();
    }
}

module.exports = { resolveArena };
