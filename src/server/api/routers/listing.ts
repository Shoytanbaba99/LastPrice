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
          take: 5,
          include: { buyer: { select: { name: true, email: true } } }
        }
      }
    });
    return listings;
  }),

  getAllActive: publicProcedure.query(async ({ ctx }) => {
    const listings = await ctx.db.listing.findMany({
      where: { status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
      include: {
        seller: { select: { id: true, name: true } },
        _count: { select: { bids: true } },
      },
    });
    return listings;
  }),
});
