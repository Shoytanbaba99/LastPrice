import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "~/server/api/trpc";

export const listingRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        description: z.string(),
        imageUrl: z.string().optional().default(""),
        displayPrice: z.number().min(0),
        reservePrice: z.number().min(0),
        saleMode: z.enum(["SHORT_BURST", "LONG_BURST"]),
        burstChances: z.number().optional(),
        burstRounds: z.number().optional(),
        scheduledStartAt: z.date().optional().default(new Date()),
        expiresAt: z.date(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const listing = await ctx.db.listing.create({
        data: {
          sellerId: ctx.session?.user?.id,
          title: input.title,
          description: input.description,
          imageUrl: input.imageUrl,
          displayPrice: input.displayPrice,
          reservePrice: input.reservePrice,
          saleMode: input.saleMode,
          burstChances: input.burstChances,
          burstRounds: input.burstRounds,
          status: "ACTIVE",
          scheduledStartAt: input.scheduledStartAt,
          expiresAt: input.expiresAt,
        },
      });

      return listing;
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const listing = await ctx.db.listing.findUnique({
        where: { id: input.id },
        include: {
          seller: {
            select: { name: true, email: true },
          },
          bids: {
            orderBy: { createdAt: "desc" },
            include: {
              buyer: { select: { id: true, name: true } },
            },
          },
        },
      });
      return listing;
    }),

  getMyListings: protectedProcedure.query(async ({ ctx }) => {
    const listings = await ctx.db.listing.findMany({
      where: { sellerId: ctx.session?.user?.id },
      orderBy: { createdAt: "desc" },
      include: {
        bids: {
          orderBy: { amount: "desc" },
          take: 20,
          include: { buyer: { select: { name: true, email: true } } }
        }
      }
    });
    return listings;
  }),

  getAllActive: publicProcedure
    .input(z.object({ includeEnded: z.boolean().optional().default(false) }))
    .query(async ({ ctx, input }) => {
      const now = new Date();
      const where: any = {};

      if (!input.includeEnded) {
        where.status = "ACTIVE";
        where.scheduledStartAt = { lte: now };
        where.expiresAt = { gte: now };
      } else {
        // When including ended, show finished ACTIVE ones or PENDING_HANDOVER
        where.OR = [
          { status: "ACTIVE" },
          { status: "PENDING_HANDOVER" }
        ];
      }

      const listings = await ctx.db.listing.findMany({
        where,
        orderBy: { createdAt: "desc" },
        include: {
          seller: { select: { id: true, name: true } },
          _count: { select: { bids: true } },
        },
      });
      return listings;
    }),

  getServerTime: publicProcedure.query(async () => {
    return { serverTime: new Date() };
  }),
});
