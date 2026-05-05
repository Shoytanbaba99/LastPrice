"use client";

import { motion } from "framer-motion";
import { PackageCheck, PackageOpen, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { api } from "~/trpc/react";
import { useState } from "react";

// ---------------------------------------------------------------------------
// Framer Motion: staggered list cascade
// ---------------------------------------------------------------------------

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as const },
  },
};

// ---------------------------------------------------------------------------
// Status badge helper
// ---------------------------------------------------------------------------

function StatusBadge({ status }: { status: string }) {
  const colourMap: Record<string, string> = {
    ACTIVE: "text-emerald-500",
    PENDING_HANDOVER: "text-amber-500",
    COMPLETED: "text-neutral-400",
  };
  const colour = colourMap[status] ?? "text-neutral-400";
  return (
    <span className={`text-[0.625rem] tracking-widest uppercase ${colour}`}>
      {status.replace("_", " ")}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SellerListings() {
  const { data: listings, isLoading, refetch } = api.listing.getMyListings.useQuery();
  const [actionFeedback, setActionFeedback] = useState<Record<string, string>>({});
  const [hideEnded, setHideEnded] = useState(false);

  const manualAcceptMutation = api.bid.manualAccept.useMutation({
    onSuccess: (_, variables) => {
      setActionFeedback((prev) => ({
        ...prev,
        [variables.listingId]: "Accepted. Handshake tokens generated.",
      }));
      void refetch();
    },
    onError: (err, variables) => {
      setActionFeedback((prev) => ({
        ...prev,
        [variables.listingId]: err.message,
      }));
    },
  });

  if (isLoading) {
    return (
      <div
        className="mt-16 w-full border-t pt-12"
        style={{ borderColor: "var(--border-faint)" }}
      >
        <p
          className="text-[0.625rem] tracking-[0.3em] uppercase"
          style={{ color: "var(--text-muted)" }}
        >
          Loading listings...
        </p>
      </div>
    );
  }

  const filteredListings = listings?.filter((listing) => {
    if (hideEnded && (listing.status === "COMPLETED" || listing.status === "EXPIRED")) {
      return false;
    }
    return true;
  });

  if (!listings || listings.length === 0) {
    return (
      <div
        className="mt-16 w-full border-t pt-12"
        style={{ borderColor: "var(--border-faint)" }}
      >
        <div className="space-y-4 text-center">
          <PackageOpen size={24} strokeWidth={1} style={{ color: "var(--text-xmuted)" }} className="mx-auto" />
          <p
            className="text-[0.875rem] font-light italic"
            style={{ color: "var(--text-muted)" }}
          >
            No listings yet.
          </p>
          <Link
            href="/listings/new"
            className="inline-block border-b pb-0.5 text-[0.625rem] tracking-[0.3em] uppercase transition-opacity hover:opacity-50"
            style={{
              borderColor: "var(--text-heading)",
              color: "var(--text-heading)",
            }}
          >
            Create First Listing
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className="mt-16 w-full space-y-8 border-t pt-12"
      style={{ borderColor: "var(--border-faint)" }}
    >
      {/* Section header with filter */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <PackageCheck size={14} strokeWidth={1.5} style={{ color: "var(--text-muted)" }} />
          <p
            className="text-[0.625rem] tracking-[0.3em] uppercase"
            style={{ color: "var(--text-secondary)" }}
          >
            Your Listings
          </p>
        </div>

        <button
          onClick={() => setHideEnded(!hideEnded)}
          className="text-[0.625rem] tracking-widest uppercase transition-colors"
          style={{ color: hideEnded ? "var(--text-heading)" : "var(--text-muted)" }}
        >
          {hideEnded ? "[ Show All ]" : "[ Hide Ended ]"}
        </button>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-5"
      >
        {filteredListings?.map((listing) => {
          const feedback = actionFeedback[listing.id];
          const isActive = listing.status === "ACTIVE";

          return (
            <motion.div
              key={listing.id}
              variants={itemVariants}
              className="card-minimal"
            >
              {/* Listing header */}
              <div className="flex items-start justify-between p-5 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={listing.status} />
                    <span style={{ color: "var(--border-ui)" }}>·</span>
                    <span
                      className="text-[0.625rem] tracking-widest uppercase"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {listing.saleMode.replace("_", " ")}
                    </span>
                  </div>
                  {/* H3 — heading colour */}
                  <h3
                    className="text-[1rem] font-light tracking-wide"
                    style={{ color: "var(--text-heading)" }}
                  >
                    {listing.title}
                  </h3>
                  <p
                    className="text-[0.75rem]"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Reserve: ${listing.reservePrice.toFixed(2)}
                  </p>
                </div>
                <Link
                  href={`/listings/${listing.id}`}
                  title="View listing"
                  className="mt-0.5 transition-colors hover:text-[var(--text-heading)]"
                  style={{ color: "var(--text-muted)" }}
                >
                  <ArrowUpRight size={16} />
                </Link>
              </div>

              {/* Bids list */}
              {listing.bids.length > 0 ? (
                <div
                  className="border-t px-5 py-4 space-y-3"
                  style={{ borderColor: "var(--border-faint)" }}
                >
                  <p
                    className="text-[0.625rem] tracking-[0.25em] uppercase"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Recent Bids
                  </p>
                  <ul className="space-y-2">
                    {listing.bids.map((bid) => (
                      <li
                        key={bid.id}
                        className="flex items-center justify-between px-4 py-3"
                        style={{ backgroundColor: "var(--bg-subtle)" }}
                      >
                        <div>
                          <p
                            className="text-[1.125rem] font-light"
                            style={{ color: "var(--text-heading)" }}
                          >
                            ${bid.amount.toFixed(2)}
                          </p>
                          <p
                            className="text-[0.6875rem]"
                            style={{ color: "var(--text-muted)" }}
                          >
                            {bid.buyer.name ?? bid.buyer.email}
                          </p>
                        </div>

                        {/* Accept CTA — only when listing is ACTIVE */}
                        {isActive && (
                          <button
                            onClick={() =>
                              manualAcceptMutation.mutate({
                                listingId: listing.id,
                                bidId: bid.id,
                              })
                            }
                            disabled={manualAcceptMutation.isPending}
                            className="text-[0.625rem] tracking-[0.25em] uppercase transition-colors disabled:opacity-30 border-b border-transparent pb-0.5 hover:text-[var(--text-heading)] hover:border-[var(--text-heading)]"
                            style={{ color: "var(--text-secondary)" }}
                          >
                            Accept
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div
                  className="border-t px-5 py-4"
                  style={{ borderColor: "var(--border-faint)" }}
                >
                  <p
                    className="text-[0.75rem] italic"
                    style={{ color: "var(--text-muted)" }}
                  >
                    No bids received yet.
                  </p>
                </div>
              )}

              {/* Inline feedback message */}
              {feedback && (
                <div
                  className="border-t px-5 py-3"
                  style={{ borderColor: "var(--border-faint)" }}
                >
                  <p
                    className="text-[0.6875rem] tracking-wide"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {feedback}
                  </p>
                </div>
              )}
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
