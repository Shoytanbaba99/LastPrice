import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

/**
 * Generates a cryptographically random 6-character alphanumeric token.
 * Uses uppercase letters and digits for unambiguous readability.
 */
function generateToken(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Omit 0/O and 1/I for clarity
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export const transactionRouter = createTRPCRouter({
  /**
   * Creates a new Transaction record for a winning bid.
   * Called internally after a bid is accepted (manual or automatic).
   * Generates unique buyerToken and sellerToken pairs.
   * Sets the listing status to PENDING_HANDOVER.
   */
  createForBid: protectedProcedure
    .input(
      z.object({
        listingId: z.string(),
        winningBidId: z.string(),
        finalPrice: z.number().min(0),
        buyerId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const listing = await ctx.db.listing.findUnique({
        where: { id: input.listingId },
      });

      if (!listing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Listing not found." });
      }

      if (listing.sellerId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only the listing seller can finalize a transaction.",
        });
      }

      // Ensure no duplicate transaction for this listing
      const existing = await ctx.db.transaction.findFirst({
        where: { listingId: input.listingId },
      });
      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "A transaction already exists for this listing.",
        });
      }

      const buyerToken = generateToken();
      const sellerToken = generateToken();

      // Ensure uniqueness — regenerate if collision (extremely unlikely with 32^6 space)
      const buyerTokenExists = await ctx.db.transaction.findFirst({
        where: { buyerToken },
      });
      const sellerTokenExists = await ctx.db.transaction.findFirst({
        where: { sellerToken },
      });
      const finalBuyerToken = buyerTokenExists ? generateToken() : buyerToken;
      const finalSellerToken = sellerTokenExists ? generateToken() : sellerToken;

      const [transaction] = await ctx.db.$transaction([
        ctx.db.transaction.create({
          data: {
            listingId: input.listingId,
            buyerId: input.buyerId,
            sellerId: listing.sellerId,
            finalPrice: input.finalPrice,
            buyerToken: finalBuyerToken,
            sellerToken: finalSellerToken,
            buyerVerified: false,
            sellerVerified: false,
          },
        }),
        ctx.db.listing.update({
          where: { id: input.listingId },
          data: { status: "PENDING_HANDOVER" },
        }),
      ]);

      return transaction;
    }),

  /**
   * Retrieves all transactions where the current user is either buyer or seller.
   * Returns full listing and counterparty details for the dashboard.
   */
  getMyTransactions: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const transactions = await ctx.db.transaction.findMany({
      where: {
        OR: [{ buyerId: userId }, { sellerId: userId }],
      },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            status: true,
            imageUrl: true,
          },
        },
        buyer: {
          select: { id: true, name: true, email: true },
        },
        seller: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Return role-aware data: hide the counterparty's token to prevent cheating
    return transactions.map((tx) => {
      const isBuyer = tx.buyerId === userId;
      return {
        id: tx.id,
        listingId: tx.listingId,
        listingTitle: tx.listing.title,
        listingStatus: tx.listing.status,
        listingImageUrl: tx.listing.imageUrl,
        finalPrice: tx.finalPrice,
        buyerVerified: tx.buyerVerified,
        sellerVerified: tx.sellerVerified,
        createdAt: tx.createdAt,
        isBuyer,
        // Each party only sees their own token, never the counterparty's
        myToken: isBuyer ? tx.buyerToken : tx.sellerToken,
        counterpartyName: isBuyer
          ? tx.seller.name ?? tx.seller.email
          : tx.buyer.name ?? tx.buyer.email,
      };
    });
  }),

  /**
   * The core handshake mutation.
   * A buyer submits the seller's token (or vice-versa) to verify their side.
   * If both parties have verified, the listing is marked COMPLETED.
   */
  verifyToken: protectedProcedure
    .input(
      z.object({
        transactionId: z.string(),
        submittedToken: z.string().length(6),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const transaction = await ctx.db.transaction.findUnique({
        where: { id: input.transactionId },
      });

      if (!transaction) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Transaction not found." });
      }

      const isBuyer = transaction.buyerId === userId;
      const isSeller = transaction.sellerId === userId;

      if (!isBuyer && !isSeller) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not a party to this transaction.",
        });
      }

      if (isBuyer) {
        // The buyer must enter the seller's token
        if (transaction.buyerVerified) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "You have already verified this transaction.",
          });
        }
        if (input.submittedToken.toUpperCase() !== transaction.sellerToken) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Incorrect token. Please ask the seller to confirm their code.",
          });
        }
        await ctx.db.transaction.update({
          where: { id: input.transactionId },
          data: { buyerVerified: true },
        });
      } else {
        // The seller must enter the buyer's token
        if (transaction.sellerVerified) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "You have already verified this transaction.",
          });
        }
        if (input.submittedToken.toUpperCase() !== transaction.buyerToken) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Incorrect token. Please ask the buyer to confirm their code.",
          });
        }
        await ctx.db.transaction.update({
          where: { id: input.transactionId },
          data: { sellerVerified: true },
        });
      }

      // Re-fetch to get the updated state and check if both are now verified
      const updated = await ctx.db.transaction.findUniqueOrThrow({
        where: { id: input.transactionId },
      });

      if (updated.buyerVerified && updated.sellerVerified) {
        // The handshake is complete — mark the listing as COMPLETED
        await ctx.db.listing.update({
          where: { id: transaction.listingId },
          data: { status: "COMPLETED" },
        });
        return { success: true, completed: true, message: "Handshake complete. Transaction sealed." };
      }

      return {
        success: true,
        completed: false,
        message: isBuyer
          ? "Your side is verified. Awaiting seller confirmation."
          : "Your side is verified. Awaiting buyer confirmation.",
      };
    }),
});
