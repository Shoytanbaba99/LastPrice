import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

/** Generates a unique 6-character alphanumeric token for handshake verification. */
function generateToken(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Omit 0/O and 1/I for unambiguous readability
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export const bidRouter = createTRPCRouter({
  submitShortBurst: protectedProcedure
    .input(
      z.object({
        listingId: z.string(),
        amount: z.number().min(0),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const listing = await ctx.db.listing.findUnique({
        where: { id: input.listingId },
        include: { bids: { where: { buyerId: ctx.session.user.id } } },
      });

      if (!listing || listing.saleMode !== "SHORT_BURST") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid listing." });
      }

      if (listing.status !== "ACTIVE") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Listing is no longer active." });
      }

      const chances = listing.burstChances ?? 3;
      if (listing.bids.length >= chances) {
        throw new TRPCError({ code: "FORBIDDEN", message: "No chances remaining." });
      }

      const bid = await ctx.db.bid.create({
        data: {
          buyerId: ctx.session.user.id,
          listingId: input.listingId,
          amount: input.amount,
        },
      });

      const isFinalChance = listing.bids.length + 1 >= chances;
      const isMatched = input.amount >= listing.reservePrice;

      let feedback = "Too low";
      if (isMatched) {
        feedback = "Matched";
      } else if (input.amount >= listing.reservePrice * 0.7) {
        feedback = "Close";
      }

      return {
        bid,
        feedback,
        isFinalChance,
      };
    }),

  submitLongBurst: protectedProcedure
    .input(
      z.object({
        listingId: z.string(),
        amount: z.number().min(0),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const listing = await ctx.db.listing.findUnique({
        where: { id: input.listingId },
      });

      if (!listing || listing.saleMode !== "LONG_BURST") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid listing." });
      }

      if (listing.status !== "ACTIVE") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Listing is no longer active." });
      }

      const bid = await ctx.db.bid.create({
        data: {
          buyerId: ctx.session.user.id,
          listingId: input.listingId,
          amount: input.amount,
        },
      });

      return bid;
    }),

  getListingState: publicProcedure
    .input(z.object({ listingId: z.string() }))
    .query(async ({ ctx, input }) => {
      const listing = await ctx.db.listing.findUnique({
        where: { id: input.listingId },
        include: {
          bids: {
            orderBy: { amount: "desc" },
            take: 1,
            include: { buyer: { select: { id: true, name: true } } },
          },
          _count: {
            select: { bids: true },
          },
        },
      });

      if (!listing) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const ROUND_DURATION_SEC = 30;
      const rounds = listing.burstRounds ?? 5;
      const now = new Date();
      const elapsedSeconds = (now.getTime() - listing.createdAt.getTime()) / 1000;
      const currentRound = Math.floor(elapsedSeconds / ROUND_DURATION_SEC) + 1;

      const isEnded = currentRound > rounds || listing.status !== "ACTIVE";
      const highestBid = listing.bids[0];

      return {
        ...listing,
        currentRound: Math.min(currentRound, rounds),
        isEnded,
        highestBid,
        totalRounds: rounds,
        secondsRemainingInRound: ROUND_DURATION_SEC - (elapsedSeconds % ROUND_DURATION_SEC),
      };
    }),

  finalizeLongBurst: protectedProcedure
    .input(z.object({ listingId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const listing = await ctx.db.listing.findUnique({
        where: { id: input.listingId },
        include: {
          bids: {
            orderBy: { amount: "desc" },
            take: 1,
          },
        },
      });

      if (!listing || listing.sellerId !== ctx.session.user.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const highestBid = listing.bids[0];

      if (highestBid && highestBid.amount >= listing.reservePrice) {
        // Reserve was met — generate tokens and create the transaction atomically
        const buyerToken = generateToken();
        const sellerToken = generateToken();

        await ctx.db.$transaction([
          ctx.db.transaction.create({
            data: {
              listingId: listing.id,
              buyerId: highestBid.buyerId,
              sellerId: listing.sellerId,
              finalPrice: highestBid.amount,
              buyerToken,
              sellerToken,
              buyerVerified: false,
              sellerVerified: false,
            },
          }),
          ctx.db.listing.update({
            where: { id: listing.id },
            data: { status: "PENDING_HANDOVER" },
          }),
        ]);

        return { success: true, message: "Listing finalized. Reserve met. Tokens generated." };
      }

      // Reserve not met — just close the listing cleanly
      await ctx.db.listing.update({
        where: { id: listing.id },
        data: { status: "COMPLETED" },
      });
      return { success: false, message: "Listing finalized. Reserve not met." };
    }),

  manualAccept: protectedProcedure
    .input(z.object({ listingId: z.string(), bidId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const listing = await ctx.db.listing.findUnique({
        where: { id: input.listingId },
      });

      if (!listing || listing.sellerId !== ctx.session.user.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      if (listing.status !== "ACTIVE") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Listing is not in an active state.",
        });
      }

      // Fetch the specific bid being accepted
      const acceptedBid = await ctx.db.bid.findUnique({
        where: { id: input.bidId },
      });

      if (!acceptedBid || acceptedBid.listingId !== input.listingId) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Bid not found on this listing." });
      }

      // Ensure no existing transaction
      const existingTransaction = await ctx.db.transaction.findFirst({
        where: { listingId: input.listingId },
      });
      if (existingTransaction) {
        throw new TRPCError({ code: "CONFLICT", message: "A transaction already exists." });
      }

      const buyerToken = generateToken();
      const sellerToken = generateToken();

      // Atomically create the Transaction and update the Listing status
      await ctx.db.$transaction([
        ctx.db.transaction.create({
          data: {
            listingId: listing.id,
            buyerId: acceptedBid.buyerId,
            sellerId: listing.sellerId,
            finalPrice: acceptedBid.amount,
            buyerToken,
            sellerToken,
            buyerVerified: false,
            sellerVerified: false,
          },
        }),
        ctx.db.listing.update({
          where: { id: input.listingId },
          data: { status: "PENDING_HANDOVER" },
        }),
      ]);

      return { success: true, message: "Bid accepted. Handshake tokens generated." };
    }),
});
