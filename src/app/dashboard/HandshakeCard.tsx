"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  ShieldAlert,
  Loader2,
  ArrowRight,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { api } from "~/trpc/react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TransactionCardProps {
  transaction: {
    id: string;
    listingId: string;
    listingTitle: string;
    listingStatus: string;
    finalPrice: number;
    buyerVerified: boolean;
    sellerVerified: boolean;
    createdAt: Date;
    isBuyer: boolean;
    myToken: string;
    counterpartyName: string | null;
  };
}

// ---------------------------------------------------------------------------
// Framer Motion variants — slow and serene, like a breath
// ---------------------------------------------------------------------------

const cardVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const successVariants = {
  hidden: { opacity: 0, scale: 0.97 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  },
};

// ---------------------------------------------------------------------------
// Sub-component: Token Display
// ---------------------------------------------------------------------------

function TokenDisplay({ token, label }: { token: string; label: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    void navigator.clipboard.writeText(token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-2">
      <p
        className="text-[0.75rem] tracking-[0.25em] uppercase"
        style={{ color: "var(--text-muted)" }}
      >
        {label}
      </p>
      <button
        onClick={handleCopy}
        title="Click to copy"
        className="group flex items-center gap-3 font-mono text-[1.5rem] font-light tracking-[0.3em] transition-opacity hover:opacity-60"
        style={{ color: "var(--text-heading)" }}
      >
        {token}
        <span
          className="font-sans text-[0.75rem] tracking-widest uppercase opacity-0 transition-opacity group-hover:opacity-100"
          style={{ color: "var(--text-muted)" }}
        >
          {copied ? "Copied" : "Copy"}
        </span>
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-component: Verification Status Pips
// ---------------------------------------------------------------------------

function VerificationPips({
  buyerVerified,
  sellerVerified,
  isBuyer,
}: {
  buyerVerified: boolean;
  sellerVerified: boolean;
  isBuyer: boolean;
}) {
  const myVerified = isBuyer ? buyerVerified : sellerVerified;
  const theirVerified = isBuyer ? sellerVerified : buyerVerified;

  return (
    <div
      className="flex items-center gap-4 text-[0.75rem] tracking-widest uppercase"
      style={{ color: "var(--text-secondary)" }}
    >
      <span className="flex items-center gap-1.5">
        {myVerified ? (
          <CheckCircle2 size={12} className="text-emerald-500" />
        ) : (
          <Clock size={12} style={{ color: "var(--text-muted)" }} />
        )}
        You
      </span>
      <div
        className="h-px w-6"
        style={{ backgroundColor: "var(--border-ui)" }}
      />
      <span className="flex items-center gap-1.5">
        {theirVerified ? (
          <CheckCircle2 size={12} className="text-emerald-500" />
        ) : (
          <Clock size={12} style={{ color: "var(--text-muted)" }} />
        )}
        Counterparty
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component: HandshakeCard
// ---------------------------------------------------------------------------

export function HandshakeCard({ transaction }: TransactionCardProps) {
  const [tokenInput, setTokenInput] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const [localSuccess, setLocalSuccess] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(
    transaction.buyerVerified && transaction.sellerVerified,
  );

  const utils = api.useUtils();

  const myVerifiedAlready = transaction.isBuyer
    ? transaction.buyerVerified
    : transaction.sellerVerified;

  const verifyMutation = api.transaction.verifyToken.useMutation({
    onSuccess: (data) => {
      setLocalError(null);
      setLocalSuccess(data.message);
      setTokenInput("");
      if (data.completed) {
        setIsCompleted(true);
      }
      void utils.transaction.getMyTransactions.invalidate();
    },
    onError: (err) => {
      setLocalError(err.message);
    },
  });

  function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setLocalError(null);
    setLocalSuccess(null);
    if (tokenInput.trim().length !== 6) {
      setLocalError("Token must be exactly 6 characters.");
      return;
    }
    verifyMutation.mutate({
      transactionId: transaction.id,
      submittedToken: tokenInput.trim().toUpperCase(),
    });
  }

  const counterpartyLabel = transaction.isBuyer ? "Seller" : "Buyer";
  const roleLabel = transaction.isBuyer ? "Buyer" : "Seller";

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      className="card-minimal"
    >
      {/* ── Card Header ── */}
      <div
        className="flex items-start justify-between border-b p-6"
        style={{ borderColor: "var(--border-faint)" }}
      >
        <div className="space-y-1">
          <p
            className="text-[0.75rem] tracking-[0.25em] uppercase"
            style={{ color: "var(--text-muted)" }}
          >
            {roleLabel} · Handshake Pending
          </p>
          {/* H3 — heading colour */}
          <h3
            className="text-[1.125rem] font-light tracking-wide"
            style={{ color: "var(--text-heading)" }}
          >
            {transaction.listingTitle}
          </h3>
          <p
            className="text-[0.875rem] font-light"
            style={{ color: "var(--text-secondary)" }}
          >
            Final Price:{" "}
            <span style={{ color: "var(--text-heading)" }}>
              ${transaction.finalPrice.toFixed(2)}
            </span>
            {" · "}With {transaction.counterpartyName ?? "Unknown"}
          </p>
        </div>
        <div className="mt-0.5">
          {isCompleted ? (
            <ShieldCheck size={20} className="text-emerald-500" />
          ) : (
            <ShieldAlert size={20} style={{ color: "var(--text-muted)" }} />
          )}
        </div>
      </div>

      {/* ── Completed State ── */}
      <AnimatePresence>
        {isCompleted && (
          <motion.div
            variants={successVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="space-y-2 p-8 text-center"
          >
            <CheckCircle2
              size={32}
              className="mx-auto text-emerald-500"
              strokeWidth={1}
            />
            <p className="text-[0.875rem] font-light tracking-widest text-emerald-500 uppercase">
              Transaction Complete
            </p>
            <p
              className="text-[0.75rem] tracking-wide"
              style={{ color: "var(--text-muted)" }}
            >
              Handover Successful.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Active Handshake State ── */}
      {!isCompleted && (
        <div className="space-y-6 p-6">
          {/* Verification status pips */}
          <VerificationPips
            buyerVerified={transaction.buyerVerified}
            sellerVerified={transaction.sellerVerified}
            isBuyer={transaction.isBuyer}
          />

          {/* My token display */}
          <div
            className="border-l-2 pl-4"
            style={{ borderColor: "var(--border-ui)" }}
          >
            <TokenDisplay
              token={transaction.myToken}
              label={`Your ${roleLabel} Token — share this with the ${counterpartyLabel}`}
            />
          </div>

          {/* Verification input */}
          {myVerifiedAlready ? (
            <div className="flex items-center gap-2 text-[0.75rem] tracking-widest text-emerald-500 uppercase">
              <CheckCircle2 size={12} />
              Your verification is confirmed. Awaiting{" "}
              {counterpartyLabel.toLowerCase()}.
            </div>
          ) : (
            <form onSubmit={handleVerify} className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor={`token-input-${transaction.id}`}
                  className="text-[0.75rem] tracking-[0.25em] uppercase"
                  style={{ color: "var(--text-muted)" }}
                >
                  Enter {counterpartyLabel}&rsquo;s Token to Verify
                </label>
                <div
                  className="flex items-stretch border-b transition-colors focus-within:border-[var(--text-heading)]"
                  style={{ borderColor: "var(--border-ui)" }}
                >
                  <input
                    id={`token-input-${transaction.id}`}
                    type="text"
                    maxLength={6}
                    value={tokenInput}
                    onChange={(e) =>
                      setTokenInput(e.target.value.toUpperCase())
                    }
                    placeholder="XXXXXX"
                    className="flex-1 bg-transparent py-2 font-mono text-[1.125rem] tracking-[0.3em] focus:outline-none"
                    style={{
                      color: "var(--text-heading)",
                    }}
                  />
                  <button
                    type="submit"
                    disabled={
                      verifyMutation.isPending || tokenInput.trim().length !== 6
                    }
                    className="flex items-center gap-1.5 px-3 text-[0.75rem] tracking-widest uppercase transition-colors disabled:opacity-30 hover:text-[var(--text-heading)]"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {verifyMutation.isPending ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <ArrowRight size={14} />
                    )}
                    Verify
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {localError && (
                  <motion.p
                    key="error"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-[0.75rem] tracking-wide text-rose-400"
                  >
                    {localError}
                  </motion.p>
                )}
                {localSuccess && (
                  <motion.p
                    key="success"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-[0.75rem] tracking-wide text-emerald-500"
                  >
                    {localSuccess}
                  </motion.p>
                )}
              </AnimatePresence>
            </form>
          )}
        </div>
      )}
    </motion.div>
  );
}
