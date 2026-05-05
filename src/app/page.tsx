"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Zap, Timer, Tag, Users, ArrowRight, Inbox, Eye, EyeOff } from "lucide-react";
import { api } from "~/trpc/react";
import { useState } from "react";

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
  status: string;
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
  const hasImage = listing.imageUrl?.startsWith("http") || listing.imageUrl?.startsWith("data:image");

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
            className="flex items-center gap-1.5 px-2 py-0.5 text-[0.5625rem] tracking-[0.2em] uppercase"
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

          {listing.status === "ACTIVE" && !isShortBurst && (
            <motion.span
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              className="flex items-center gap-1.5 px-2 py-0.5 text-[0.5rem] tracking-[0.15em] uppercase bg-red-500/10 text-red-400 border border-red-500/25 backdrop-blur-sm"
            >
              <span className="w-1 h-1 rounded-full bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.5)]" />
              Live
            </motion.span>
          )}

          {listing.status !== "ACTIVE" && (
            <span
              className="px-2 py-0.5 text-[0.5rem] tracking-[0.15em] uppercase bg-neutral-500/10 text-neutral-400 border border-neutral-500/25 backdrop-blur-sm"
            >
              {listing.status}
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="space-y-1">
          <h2
            className="text-[1rem] font-medium leading-snug tracking-wide transition-opacity group-hover:opacity-70"
            style={{ color: "var(--text-heading)" }}
          >
            {listing.title}
          </h2>
          <p
            className="line-clamp-2 text-[0.75rem] font-light leading-relaxed"
            style={{ color: "var(--text-muted)" }}
          >
            {listing.description}
          </p>
        </div>

        {/* Price + Meta row */}
        <div className="mt-auto flex items-end justify-between">
          <div>
            <p
              className="text-[0.5625rem] tracking-[0.2em] uppercase mb-0.5"
              style={{ color: "var(--text-muted)" }}
            >
              Opening
            </p>
            <p
              className="text-[1.25rem] font-light"
              style={{ color: "var(--text-heading)" }}
            >
              ${listing.displayPrice.toFixed(2)}
            </p>
          </div>

          <div
            className="flex flex-col items-end gap-1 text-[0.625rem]"
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
            className="group/cta flex items-center justify-between border-t pt-4 text-[0.625rem] tracking-[0.25em] uppercase font-semibold transition-all hover:opacity-80"
            style={{
              borderColor: "var(--border-faint)",
              color: "var(--text-heading)",
            }}
          >
            {listing.status === "ACTIVE" ? "Enter Arena" : "View Results"}
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
  const [hideEnded, setHideEnded] = useState(false);

  const filteredListings = listings?.filter((listing) => {
    if (hideEnded && listing.status !== "ACTIVE") {
      return false;
    }
    return true;
  });

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
            className="text-[0.625rem] tracking-[0.4em] uppercase"
            style={{ color: "var(--text-muted)" }}
          >
            Live Market
          </p>
          <h1
            className="text-[3rem] font-light tracking-tight md:text-[3.75rem]"
            style={{ color: "var(--text-heading)" }}
          >
            The Arena.
          </h1>
          <p
            className="text-[0.875rem] font-light leading-relaxed"
            style={{ color: "var(--text-secondary)" }}
          >
            Active auctions in silent mode. Submit your price. The reserve stays hidden.
          </p>
        </div>
      </motion.section>

      {/* ── Filter Bar ── */}
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        <div className="flex items-center justify-between py-6 border-y" style={{ borderColor: "var(--border-faint)" }}>
          <p className="text-[0.625rem] tracking-[0.3em] uppercase" style={{ color: "var(--text-muted)" }}>
            {filteredListings?.length ?? 0} manifest{filteredListings?.length !== 1 ? "s" : ""} available
          </p>
          
          <button
            onClick={() => setHideEnded(!hideEnded)}
            className="flex items-center gap-2 text-[0.625rem] tracking-[0.2em] uppercase transition-colors hover:text-[var(--text-heading)]"
            style={{ color: hideEnded ? "var(--text-heading)" : "var(--text-muted)" }}
          >
            {hideEnded ? (
              <><Eye size={12} /> Showing Active Only</>
            ) : (
              <><EyeOff size={12} /> Including Ended</>
            )}
          </button>
        </div>
      </div>

      {/* ── Listings Grid ── */}
      <section className="mx-auto max-w-7xl px-6 py-12 md:px-12 md:py-16">
        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : !filteredListings || filteredListings.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center gap-5 py-24 text-center"
          >
            <Inbox size={36} strokeWidth={0.75} style={{ color: "var(--text-muted)" }} />
            <div className="space-y-2">
              <p
                className="text-[0.875rem] font-light italic"
                style={{ color: "var(--text-muted)" }}
              >
                {hideEnded ? "No active listings found." : "No listings manifest yet."}
              </p>
              <p
                className="text-[0.625rem] tracking-[0.3em] uppercase"
                style={{ color: "var(--text-xmuted)" }}
              >
                The silence is temporary.
              </p>
            </div>
            {hideEnded && (
              <button 
                onClick={() => setHideEnded(false)}
                className="text-[0.625rem] tracking-[0.3em] uppercase border-b pb-0.5"
                style={{ borderColor: "var(--text-heading)", color: "var(--text-heading)" }}
              >
                Show All
              </button>
            )}
          </motion.div>
        ) : (
          <motion.div
            variants={gridVariants}
            initial="hidden"
            animate="visible"
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {filteredListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </motion.div>
        )}
      </section>
    </main>
  );
}
