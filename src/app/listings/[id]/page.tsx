"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { api } from "~/trpc/react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Timer, 
  Zap, 
  ChevronRight, 
  ArrowLeft, 
  ShieldCheck,
  TrendingUp,
  History
} from "lucide-react";
import Link from "next/link";
import NumberTicker from "~/app/_components/NumberTicker";

export default function ListingPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: session } = useSession();

  const [bidAmount, setBidAmount] = useState("");
  const [feedback, setFeedback] = useState<{ 
    message: string; 
    type: "info" | "success" | "error";
    level?: "LOW" | "CLOSE" | "MATCHED";
  } | null>(null);

  const utils = api.useUtils();

  const { data: listing, isLoading, error } = api.bid.getListingState.useQuery(
    { listingId: id },
    { 
      refetchInterval: (query) => {
        const state = query.state.data;
        if ((state?.saleMode === "LONG_BURST" || state?.saleMode === "SHORT_BURST") && !state?.isEnded) {
          return 3000;
        }
        return false;
      }
    }
  );

  const shortBurstMutation = api.bid.submitShortBurst.useMutation({
    onSuccess: (data) => {
      setFeedback({ 
        message: `${data.feedback}. Final chance: ${data.isFinalChance ? "YES" : "NO"}`, 
        type: data.level === "MATCHED" ? "success" : data.level === "CLOSE" ? "info" : "error",
        level: data.level
      });
      void utils.bid.getListingState.invalidate({ listingId: id });
    },
    onError: (err) => {
      setFeedback({ message: err.message, type: "error" });
    }
  });

  const manualAcceptMutation = api.bid.manualAccept.useMutation({
    onSuccess: () => {
      setFeedback({ message: "Handshake initialized. Finalizing...", type: "success" });
      void utils.bid.getListingState.invalidate({ listingId: id });
    },
    onError: (err) => {
      setFeedback({ message: err.message, type: "error" });
    }
  });

  const longBurstMutation = api.bid.submitLongBurst.useMutation({
    onSuccess: () => {
      setFeedback({ message: "Bid registered for this round.", type: "success" });
      void utils.bid.getListingState.invalidate({ listingId: id });
    },
    onError: (err) => {
      setFeedback({ message: err.message, type: "error" });
    }
  });

  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "var(--bg-primary)" }}
      >
        <motion.div 
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="text-[0.625rem] tracking-[0.3em] uppercase"
          style={{ color: "var(--text-muted)" }}
        >
          Gathering Intel...
        </motion.div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div
        className="min-h-screen p-8 flex flex-col items-center justify-center gap-6"
        style={{ backgroundColor: "var(--bg-primary)" }}
      >
        <p
          className="font-light"
          style={{ color: "var(--text-muted)" }}
        >
          Listing has vanished or never existed.
        </p>
        <Link href="/" className="btn-minimal">
          Back to Marketplace
        </Link>
      </div>
    );
  }

  const isSeller = session?.user?.id === listing.sellerId;
  const isShortBurst = listing.saleMode === "SHORT_BURST";

  const handleBidSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    const amount = parseFloat(bidAmount);
    if (isNaN(amount) || amount <= 0) return;

    if (listing.saleMode === "SHORT_BURST") {
      shortBurstMutation.mutate({ listingId: id, amount });
    } else {
      longBurstMutation.mutate({ listingId: id, amount });
    }
  };

  /* ─── Tension level helpers ─── */
  const tensionPct = Math.min((listing._count.bids / 10) * 100, 100);
  const isHighTension = listing._count.bids > 5;
  const isCriticalTension = listing._count.bids > 7;

  return (
    <div
      className="min-h-screen px-6 py-12 md:py-24 relative overflow-hidden"
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      {/* Global Tension Pulse */}
      {(isHighTension || feedback?.level === "CLOSE" || feedback?.level === "MATCHED") && (
        <motion.div 
          animate={{ 
            opacity: feedback?.level === "MATCHED" ? [0.2, 0.5, 0.2] : isCriticalTension ? [0.1, 0.3, 0.1] : [0.05, 0.15, 0.05],
            backgroundColor: feedback?.level === "MATCHED" ? "rgba(16, 185, 129, 0.1)" : feedback?.level === "CLOSE" ? "rgba(245, 158, 11, 0.1)" : "rgba(239, 68, 68, 0.1)"
          }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="pointer-events-none absolute inset-0 z-0"
          style={{ 
            boxShadow: feedback?.level === "MATCHED" ? "inset 0 0 100px rgba(16, 185, 129, 0.2)" : "inset 0 0 100px rgba(239, 68, 68, 0.2)",
          }}
        />
      )}

      <div className="max-w-4xl mx-auto space-y-16 relative z-10">
        
        {/* Back nav */}
        <Link 
          href="/" 
          className="group flex items-center gap-3 text-[0.625rem] tracking-[0.2em] uppercase transition-colors hover:text-[var(--text-heading)]"
          style={{ color: "var(--text-muted)" }}
        >
          <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" />
          Marketplace
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16">
          
          {/* ── Left Column: Details ── */}
          <div className="lg:col-span-3 space-y-10">
            <header className="space-y-6">
              {/* Mode + ID badges */}
              <div className="flex items-center gap-3">
                <span
                  className="px-2 py-0.5 text-[0.5rem] tracking-[0.2em] uppercase border"
                  style={{
                    borderColor: "var(--border-faint)",
                    color: "var(--text-muted)",
                  }}
                >
                  ID: {listing.id.slice(-8)}
                </span>
                {isShortBurst ? (
                  <span
                    className="flex items-center gap-1.5 px-2 py-0.5 text-[0.5rem] tracking-[0.2em] uppercase"
                    style={{
                      backgroundColor: "var(--text-heading)",
                      color: "var(--bg-primary)",
                    }}
                  >
                    <Zap size={10} /> Short Burst
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 px-2 py-0.5 text-[0.5rem] tracking-[0.2em] uppercase bg-red-500/10 text-red-400 border border-red-500/25">
                    <Timer size={10} /> Long Burst
                  </span>
                )}
              </div>
              
              {/* H1 — crisp */}
              <h1
                className="text-[2.5rem] md:text-[3rem] lg:text-[3.5rem] font-light leading-[1.1] tracking-tight"
                style={{ color: "var(--text-heading)" }}
              >
                {listing.title}
              </h1>
              
              <p
                className="text-[1rem] md:text-[1.125rem] font-light leading-relaxed max-w-xl"
                style={{ color: "var(--text-secondary)" }}
              >
                {listing.description}
              </p>
            </header>

            {/* ── Tension Bar (Short Burst Only) ── */}
            {isShortBurst && listing.status === "ACTIVE" && (
              <div className="space-y-3">
                <div className="flex justify-between items-end">
                  {/* H3 — heading colour */}
                  <h3
                    className="text-[0.625rem] tracking-[0.2em] uppercase font-medium"
                    style={{ color: "var(--text-heading)" }}
                  >
                    Auction Tension
                  </h3>
                  <span
                    className="text-[0.625rem] font-mono"
                    style={{ color: isHighTension ? "rgb(239, 68, 68)" : "var(--text-primary)" }}
                  >
                    {listing._count.bids > 0 ? "STABILITY: VOLATILE" : "STABILITY: CALM"}
                  </span>
                </div>

                {/* Track — now uses border-faint bg for visibility */}
                <div
                  className="h-0.5 w-full relative overflow-hidden rounded-full"
                  style={{ backgroundColor: "var(--border-ui)" }}
                >
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ 
                      width: `${tensionPct}%`,
                      backgroundColor: isHighTension
                        ? "rgb(239, 68, 68)"
                        : "var(--text-heading)"
                    }}
                    transition={{ duration: 0.5 }}
                    className="absolute h-full rounded-full"
                  />
                  {/* Pulse glow for critical tension */}
                  {isCriticalTension && (
                    <motion.div 
                      animate={{ opacity: [0, 0.4, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity }}
                      className="absolute inset-0 bg-red-500/30 rounded-full"
                    />
                  )}
                </div>

                <p
                  className="text-[0.75rem] tracking-[0.2em] uppercase"
                  style={{ color: "var(--text-muted)" }}
                >
                  {listing._count.bids} bid{listing._count.bids !== 1 ? "s" : ""} recorded
                </p>

                {!isSeller && isShortBurst && (
                  <div className="pt-4 flex items-center gap-4">
                    <p className="text-[0.625rem] tracking-[0.2em] uppercase text-muted-foreground">
                      Your Chances:
                    </p>
                    <div className="flex gap-1.5">
                      {Array.from({ length: listing.burstChances ?? 3 }).map((_, i) => (
                        <div 
                          key={i} 
                          className={`h-1.5 w-6 border ${
                            i < (listing.bids.filter((b: any) => b.buyerId === session?.user?.id).length)
                              ? "bg-white border-white" 
                              : "border-border-faint"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── Long Burst Round Timer ── */}
            {!isShortBurst && !listing.isEnded && (
              <div className="space-y-3">
                <div className="flex justify-between items-end">
                  {/* H3 */}
                  <h3
                    className="text-[0.625rem] tracking-[0.2em] uppercase font-medium"
                    style={{ color: "var(--text-heading)" }}
                  >
                    Round {listing.currentRound} of {listing.totalRounds}
                  </h3>
                  <span
                    className="text-[1.5rem] font-light tabular-nums"
                    style={{ color: "var(--text-heading)" }}
                  >
                    {Math.floor(listing.secondsRemainingInRound)}s
                  </span>
                </div>

                {/* Progress track */}
                <div
                  className="h-0.5 w-full relative overflow-hidden rounded-full"
                  style={{ backgroundColor: "var(--border-ui)" }}
                >
                  <motion.div 
                    initial={{ width: "100%" }}
                    animate={{ width: `${(listing.secondsRemainingInRound / 30) * 100}%` }}
                    transition={{ ease: "linear", duration: 1 }}
                    className="absolute h-full rounded-full bg-red-500"
                  />
                </div>

                <p
                  className="text-[0.75rem] tracking-[0.2em] uppercase"
                  style={{ color: "var(--text-muted)" }}
                >
                  Timer resets each round — submit before it drops to zero
                </p>
              </div>
            )}
          </div>

          {/* ── Right Column: Interaction Panel ── */}
          <div className="lg:col-span-2">
            <div
              className="p-8 md:p-10 sticky top-32 space-y-10"
              style={{
                backgroundColor: "var(--bg-surface)",
                border: "1px solid var(--border-ui)",
              }}
            >
              
              {/* Current peak price */}
              <div className="space-y-1">
                <p
                  className="text-[0.875rem] tracking-[0.3em] uppercase mb-4 flex items-center gap-2"
                  style={{ color: "var(--text-muted)" }}
                >
                  <TrendingUp size={12} strokeWidth={1.5} />
                  Current Peak
                </p>
                <div
                  className="text-[3rem] font-light flex items-baseline gap-1"
                  style={{ color: "var(--text-heading)" }}
                >
                  <span
                    className="text-[1.5rem]"
                    style={{ color: "var(--text-muted)" }}
                  >
                    $
                  </span>
                  {listing.highestBid ? (
                    <NumberTicker value={listing.highestBid.amount} />
                  ) : (
                    <NumberTicker value={listing.displayPrice} />
                  )}
                </div>
                {listing.highestBid && (
                  <p
                    className="text-[0.75rem] mt-2 tracking-wide uppercase"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Last activity from {listing.highestBid.buyer.name?.split(" ")[0]}
                  </p>
                )}
              </div>

              {/* Bid form */}
              {!isSeller && listing.status === "ACTIVE" && !listing.isEnded ? (
                <form onSubmit={handleBidSubmit} className="space-y-8">
                  <div className="space-y-4">
                    <label 
                      htmlFor="bidAmount" 
                      className="text-[0.875rem] tracking-[0.25em] uppercase block"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Offer your price
                    </label>
                    <div className="relative">
                      <span
                        className="absolute left-0 bottom-3 text-[1.25rem] font-light"
                        style={{ color: "var(--text-muted)" }}
                      >
                        $
                      </span>
                      <input
                        id="bidAmount"
                        type="number"
                        step="0.01"
                        required
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                        className="w-full bg-transparent border-b py-3 pl-6 text-[1.875rem] font-light focus:outline-none transition-colors"
                        style={{
                          borderBottomColor: "var(--border-ui)",
                          color: "var(--text-heading)",
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderBottomColor = "var(--text-heading)";
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderBottomColor = "var(--border-ui)";
                        }}
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <AnimatePresence mode="wait">
                    {feedback && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className={`text-[0.75rem] tracking-wider p-4 border flex items-start gap-3 ${
                          feedback.type === "error"
                            ? "text-red-400 bg-red-500/5 border-red-500/20"
                            : feedback.level === "CLOSE"
                            ? "text-yellow-400 bg-yellow-500/5 border-yellow-500/20"
                            : feedback.level === "MATCHED"
                            ? "text-emerald-400 bg-emerald-500/5 border-emerald-500/20"
                            : "border-border-faint"
                        }`}
                        style={
                          feedback.type !== "error" && !feedback.level
                            ? {
                                color: "var(--text-primary)",
                                backgroundColor: "var(--bg-subtle)",
                                borderColor: "var(--border-faint)",
                              }
                            : {}
                        }
                      >
                        <ShieldCheck size={14} className="shrink-0 mt-0.5" />
                        <div className="flex-1 space-y-2">
                          <p>{feedback.message}</p>
                          {feedback.level && (
                            <div className="flex gap-1 h-1 w-24">
                              <div className={`flex-1 ${feedback.level === "LOW" || feedback.level === "CLOSE" || feedback.level === "MATCHED" ? (feedback.level === "LOW" ? "bg-red-500" : feedback.level === "CLOSE" ? "bg-yellow-500" : "bg-emerald-500") : "bg-white/10"}`} />
                              <div className={`flex-1 ${feedback.level === "CLOSE" || feedback.level === "MATCHED" ? (feedback.level === "CLOSE" ? "bg-yellow-500" : "bg-emerald-500") : "bg-white/10"}`} />
                              <div className={`flex-1 ${feedback.level === "MATCHED" ? "bg-emerald-500" : "bg-white/10"}`} />
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Primary CTA — bold, unmistakable */}
                  <motion.button
                    type="submit"
                    disabled={shortBurstMutation.isPending || longBurstMutation.isPending}
                    whileTap={{ scale: 0.98 }}
                    className="btn-solid w-full py-5 text-[0.625rem] tracking-[0.4em] group"
                  >
                    <span className="flex items-center justify-center gap-2">
                      Submit Price
                      <ChevronRight
                        size={14}
                        className="transition-transform group-hover:translate-x-1"
                      />
                    </span>
                  </motion.button>
                </form>
              ) : (
                <div
                  className="space-y-6 pt-6 border-t"
                  style={{ borderColor: "var(--border-faint)" }}
                >
                  <div
                    className="flex items-center gap-3"
                    style={{ color: "var(--text-muted)" }}
                  >
                    <History size={16} strokeWidth={1.5} />
                    <span className="text-[0.75rem] tracking-[0.2em] uppercase">
                      {isSeller ? "Orchestrator Controls" : "Arena Access Restricted"}
                    </span>
                  </div>

                  {isSeller && listing.allBids && listing.allBids.length > 0 && (
                    <div className="space-y-4 pt-4">
                      <p className="text-[0.625rem] tracking-[0.2em] uppercase text-muted-foreground">Recent Bids</p>
                      <div className="space-y-3">
                        {listing.allBids.map((bid: any) => {
                          const isMatched = bid.amount >= listing.reservePrice;
                          const isClose = !isMatched && bid.amount >= listing.reservePrice * 0.7;
                          const levelColor = isMatched ? "text-emerald-400" : isClose ? "text-yellow-400" : "text-red-400";
                          const borderColor = isMatched ? "border-emerald-500/30" : isClose ? "border-yellow-500/30" : "border-red-500/30";

                          return (
                            <div 
                              key={bid.id} 
                              className={`flex items-center justify-between p-3 border bg-black/20 ${borderColor}`}
                            >
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <p className={`text-[0.75rem] font-medium ${levelColor}`}>${bid.amount}</p>
                                </div>
                                <p className="text-[0.625rem] text-muted-foreground uppercase tracking-widest">
                                  {bid.buyer.name}
                                </p>
                              </div>
                                {listing.status === "ACTIVE" && (
                                  <motion.button
                                    whileHover={{ scale: 1.05, backgroundColor: "#000" }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => manualAcceptMutation.mutate({ listingId: id, bidId: bid.id })}
                                    disabled={manualAcceptMutation.isPending}
                                    className="px-4 py-1.5 text-[0.625rem] tracking-[0.2em] uppercase bg-white text-black font-medium transition-all shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)] disabled:opacity-50"
                                  >
                                    Accept Manifest
                                  </motion.button>
                                )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {listing.isEnded && listing.status === "ACTIVE" && (
                    <p
                      className="text-[0.75rem] font-light leading-relaxed"
                      style={{ color: "var(--text-muted)" }}
                    >
                      The time of negotiation has passed. This listing is now under review for finalization.
                    </p>
                  )}
                </div>
              )}

              {/* Authenticity footer */}
              <div
                className="pt-8 border-t space-y-4"
                style={{ borderColor: "var(--border-faint)" }}
              >
                <div
                  className="flex items-center justify-between text-[0.5625rem] tracking-[0.2em] uppercase"
                  style={{ color: "var(--text-muted)" }}
                >
                  <span>Authenticity Guarantee</span>
                  <ShieldCheck size={14} strokeWidth={1} />
                </div>
                <p
                  className="text-[0.625rem] font-light leading-relaxed opacity-60"
                  style={{ color: "var(--text-muted)" }}
                >
                  LastPrice ensures dual-token verification for every completed handshake.
                </p>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
