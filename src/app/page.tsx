"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Zap, Timer, Tag, Users, ArrowRight, Inbox } from "lucide-react";
import { api } from "~/trpc/react";

// ---------------------------------------------------------------------------
// Framer Motion variants
// ---------------------------------------------------------------------------

const heroVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const gridVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.2 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  },
};

// ---------------------------------------------------------------------------
// ListingCard sub-component
// ---------------------------------------------------------------------------

interface Listing {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  displayPrice: number;
  saleMode: string;
  createdAt: Date;
  seller: { id: string; name: string | null };
  _count: { bids: number };
}

function ListingPlaceholder() {
  return (
    <svg
      viewBox="0 0 400 240"
      xmlns="http://www.w3.org/2000/svg"
      className="h-full w-full"
      aria-hidden
    >
      <rect width="400" height="240" fill="var(--bg-subtle)" />
      <rect x="170" y="90" width="60" height="4" rx="2" fill="var(--border-ui)" />
      <rect x="150" y="104" width="100" height="4" rx="2" fill="var(--border-ui)" />
      <rect x="185" y="118" width="30" height="4" rx="2" fill="var(--border-ui)" />
    </svg>
  );
}

function ListingCard({ listing }: { listing: Listing }) {
  const isShortBurst = listing.saleMode === "SHORT_BURST";
  const hasImage = listing.imageUrl?.startsWith("http");

  return (
    <motion.article
      variants={cardVariants}
      whileHover={{ borderColor: "var(--text-secondary)" }}
      className="card-minimal group flex flex-col overflow-hidden transition-all duration-700 hover:shadow-[0_0_24px_-6px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_0_24px_-6px_rgba(255,255,255,0.04)]"
      style={{ transitionProperty: "border-color, box-shadow" }}
    >
      {/* Image */}
      <div className="relative aspect-[5/3] overflow-hidden">
        {hasImage ? (
          <motion.img
            src={listing.imageUrl}
            alt={listing.title}
            className="h-full w-full object-cover"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <ListingPlaceholder />
        )}

        {/* Mode badge */}
        <div className="absolute left-3 top-3 flex items-center gap-2">
          <span
            className="flex items-center gap-1.5 px-2 py-0.5 text-[9px] tracking-[0.2em] uppercase"
            style={{
              backgroundColor: "color-mix(in srgb, var(--bg-primary) 80%, transparent)",
              color: "var(--text-secondary)",
              backdropFilter: "blur(6px)",
            }}
          >
            {isShortBurst ? (
              <><Zap size={9} strokeWidth={1.5} /> Short Burst</>
            ) : (
              <>
                <Timer size={9} strokeWidth={1.5} /> Long Burst
              </>
            )}
          </span>

          {!isShortBurst && (
            <motion.span
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              className="flex items-center gap-1.5 px-2 py-0.5 text-[8px] tracking-[0.15em] uppercase bg-red-500/10 text-red-400 border border-red-500/25 backdrop-blur-sm"
            >
              <span className="w-1 h-1 rounded-full bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.5)]" />
              Live
            </motion.span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="space-y-1">
          {/* H2 uses text-ui-heading — crisp contrast */}
          <h2
            className="text-base font-medium leading-snug tracking-wide transition-opacity group-hover:opacity-70"
            style={{ color: "var(--text-heading)" }}
          >
            {listing.title}
          </h2>
          <p
            className="line-clamp-2 text-xs font-light leading-relaxed"
            style={{ color: "var(--text-muted)" }}
          >
            {listing.description}
          </p>
        </div>

        {/* Price + Meta row */}
        <div className="mt-auto flex items-end justify-between">
          <div>
            <p
              className="text-[9px] tracking-[0.2em] uppercase mb-0.5"
              style={{ color: "var(--text-muted)" }}
            >
              Opening
            </p>
            <p
              className="text-xl font-light"
              style={{ color: "var(--text-heading)" }}
            >
              ${listing.displayPrice.toFixed(2)}
            </p>
          </div>

          <div
            className="flex flex-col items-end gap-1 text-[10px]"
            style={{ color: "var(--text-muted)" }}
          >
            <span className="flex items-center gap-1">
              <Users size={10} strokeWidth={1.5} />
              {listing._count.bids} bid{listing._count.bids !== 1 ? "s" : ""}
            </span>
            <span className="flex items-center gap-1">
              <Tag size={10} strokeWidth={1.5} />
              {listing.seller.name ?? "Anonymous"}
            </span>
          </div>
        </div>

        {/* CTA — stark, high-contrast */}
        <motion.div whileTap={{ scale: 0.98 }}>
          <Link
            href={`/listings/${listing.id}`}
            className="group/cta flex items-center justify-between border-t pt-4 text-[10px] tracking-[0.25em] uppercase font-semibold transition-all hover:opacity-80"
            style={{
              borderColor: "var(--border-faint)",
              color: "var(--text-heading)",
            }}
          >
            Enter Arena
            <ArrowRight
              size={12}
              strokeWidth={2}
              className="transition-transform group-hover/cta:translate-x-0.5"
            />
          </Link>
        </motion.div>
      </div>
    </motion.article>
  );
}

// ---------------------------------------------------------------------------
// Skeleton for loading state
// ---------------------------------------------------------------------------

function CardSkeleton() {
  return (
    <div className="card-minimal overflow-hidden animate-pulse">
      <div className="aspect-[5/3]" style={{ backgroundColor: "var(--bg-subtle)" }} />
      <div className="space-y-3 p-5">
        <div className="h-3 w-2/3 rounded-sm" style={{ backgroundColor: "var(--bg-subtle)" }} />
        <div className="h-3 w-full rounded-sm" style={{ backgroundColor: "var(--bg-subtle)" }} />
        <div className="h-3 w-1/2 rounded-sm" style={{ backgroundColor: "var(--bg-subtle)" }} />
        <div className="mt-4 h-px w-full" style={{ backgroundColor: "var(--border-faint)" }} />
        <div className="h-3 w-1/3 rounded-sm" style={{ backgroundColor: "var(--bg-subtle)" }} />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page component
// ---------------------------------------------------------------------------

export default function MarketplacePage() {
  const { data: listings, isLoading } = api.listing.getAllActive.useQuery();

  return (
    <main className="flex-1 surface-primary">
      {/* ── Hero ── */}
      <motion.section
        variants={heroVariants}
        initial="hidden"
        animate="visible"
        className="mx-auto max-w-7xl px-6 pb-8 pt-16 md:px-12 md:pt-24"
      >
        <div className="max-w-xl space-y-5">
          <p
            className="text-[10px] tracking-[0.4em] uppercase"
            style={{ color: "var(--text-muted)" }}
          >
            Live Market
          </p>
          {/* H1 — crisp, high contrast via CSS var --text-heading */}
          <h1
            className="text-5xl font-light tracking-tight md:text-6xl"
            style={{ color: "var(--text-heading)" }}
          >
            The Arena.
          </h1>
          <p
            className="text-sm font-light leading-relaxed"
            style={{ color: "var(--text-secondary)" }}
          >
            Active auctions in silent mode. Submit your price. The reserve stays hidden.
          </p>
        </div>
      </motion.section>

      {/* ── Divider ── */}
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        <div className="divider-ui" />
      </div>

      {/* ── Listings Grid ── */}
      <section className="mx-auto max-w-7xl px-6 py-12 md:px-12 md:py-16">
        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : !listings || listings.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center gap-5 py-24 text-center"
          >
            <Inbox size={36} strokeWidth={0.75} style={{ color: "var(--text-muted)" }} />
            <div className="space-y-2">
              <p
                className="text-sm font-light italic"
                style={{ color: "var(--text-muted)" }}
              >
                No active listings at this moment.
              </p>
              <p
                className="text-[10px] tracking-[0.3em] uppercase"
                style={{ color: "var(--text-xmuted)" }}
              >
                The silence is temporary.
              </p>
            </div>
            <motion.div whileTap={{ scale: 0.97 }}>
              <Link
                href="/listings/new"
                className="mt-2 border-b pb-0.5 text-[10px] tracking-[0.3em] uppercase font-semibold transition-opacity hover:opacity-60"
                style={{
                  borderColor: "var(--text-heading)",
                  color: "var(--text-heading)",
                }}
              >
                Open the First Listing
              </Link>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            variants={gridVariants}
            initial="hidden"
            animate="visible"
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </motion.div>
        )}
      </section>
    </main>
  );
}
