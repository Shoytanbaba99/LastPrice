"use client";

import { motion } from "framer-motion";
import { Handshake } from "lucide-react";
import { api } from "~/trpc/react";
import { HandshakeCard } from "./HandshakeCard";

// ---------------------------------------------------------------------------
// Framer Motion: staggered container for a serene cascade effect
// ---------------------------------------------------------------------------

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function PendingHandshakes() {
  const { data: transactions, isLoading } =
    api.transaction.getMyTransactions.useQuery();

  if (isLoading) {
    return (
      <div
        className="mt-16 w-full border-t pt-12"
        style={{ borderColor: "var(--border-faint)" }}
      >
          <div
            className="flex items-center gap-2 text-[0.75rem] tracking-[0.3em] uppercase"
            style={{ color: "var(--text-muted)" }}
          >
            <Handshake size={14} strokeWidth={1.5} />
            Loading handshakes...
          </div>
      </div>
    );
  }

  if (!transactions || transactions.length === 0) {
    return null; // Render nothing — negative space is intentional
  }

  // Split into pending (PENDING_HANDOVER) and completed (COMPLETED)
  const pending = transactions.filter(
    (tx) => tx.listingStatus === "PENDING_HANDOVER",
  );
  const completed = transactions.filter(
    (tx) => tx.buyerVerified && tx.sellerVerified,
  );

  if (pending.length === 0 && completed.length === 0) {
    return null;
  }

  return (
    <div
      className="mt-16 w-full space-y-12 border-t pt-12"
      style={{ borderColor: "var(--border-faint)" }}
    >
      {/* Section header */}
      <div className="flex items-center gap-3">
        <Handshake
          size={14}
          strokeWidth={1.5}
          style={{ color: "var(--text-muted)" }}
        />
        <p
          className="text-[0.75rem] tracking-[0.3em] uppercase"
          style={{ color: "var(--text-secondary)" }}
        >
          Pending Handshakes
        </p>
      </div>

      {/* Staggered card list */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Active handshakes first */}
        {pending.map((tx) => (
          <HandshakeCard key={tx.id} transaction={tx} />
        ))}

        {/* Completed handshakes follow, visually dimmed */}
        {completed.length > 0 && (
          <>
            <div className="flex items-center gap-3 pt-6">
              <div
                className="h-px flex-1"
                style={{ backgroundColor: "var(--border-faint)" }}
              />
              <p
                className="text-[0.75rem] tracking-[0.25em] uppercase"
                style={{ color: "var(--text-muted)" }}
              >
                Completed
              </p>
              <div
                className="h-px flex-1"
                style={{ backgroundColor: "var(--border-faint)" }}
              />
            </div>
            {completed.map((tx) => (
              <div key={tx.id} className="opacity-50">
                <HandshakeCard transaction={tx} />
              </div>
            ))}
          </>
        )}
      </motion.div>
    </div>
  );
}
