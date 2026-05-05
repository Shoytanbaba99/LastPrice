"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import { motion } from "framer-motion";

export default function NewListingPage() {
  const router = useRouter();
  const [saleMode, setSaleMode] = useState<"SHORT_BURST" | "LONG_BURST">("SHORT_BURST");
  const [error, setError] = useState<string | null>(null);

  const createListingMutation = api.listing.create.useMutation({
    onSuccess: (data) => {
      router.push(`/listings/${data.id}`);
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const imageUrl =
      (formData.get("imageUrl") as string) ||
      "https://images.unsplash.com/photo-1549492423-400259a2e574?auto=format&fit=crop&q=80&w=1000";
    const displayPrice = parseFloat(formData.get("displayPrice") as string);
    const reservePrice = parseFloat(formData.get("reservePrice") as string);
    
    const burstChances =
      saleMode === "SHORT_BURST"
        ? parseInt(formData.get("burstChances") as string)
        : undefined;
    const burstRounds =
      saleMode === "LONG_BURST"
        ? parseInt(formData.get("burstRounds") as string)
        : undefined;
    
    // Default expiration to 7 days for MVP
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    createListingMutation.mutate({
      title,
      description,
      imageUrl,
      displayPrice,
      reservePrice,
      saleMode,
      burstChances,
      burstRounds,
      expiresAt,
    });
  };

  return (
    <div
      className="flex-1 flex flex-col items-center py-24 px-6"
      style={{ backgroundColor: "var(--bg-primary)", color: "var(--text-primary)" }}
    >
      <div className="w-full max-w-2xl space-y-12">
        <div className="space-y-4 text-center">
          <p
            className="text-xs uppercase tracking-[0.3em] font-light"
            style={{ color: "var(--text-muted)" }}
          >
            New Origin
          </p>
          {/* H1 — crisp heading colour */}
          <h1
            className="text-4xl font-light tracking-tight"
            style={{ color: "var(--text-heading)" }}
          >
            Create Listing
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-12">

          {/* ── Core Info ── */}
          <div className="space-y-6">
            <h2
              className="text-[0.875rem] tracking-widest uppercase border-b pb-2"
              style={{
                color: "var(--text-secondary)",
                borderColor: "var(--border-faint)",
              }}
            >
              Listing Details
            </h2>
            <div className="space-y-4">
              <input
                name="title"
                type="text"
                placeholder="Title"
                required
                className="input-minimal text-[1.125rem] py-4"
              />
              <textarea
                name="description"
                placeholder="Description"
                required
                rows={3}
                className="input-minimal resize-none text-[1rem]"
              />
              
              {/* Image Selection */}
              <div className="space-y-3">
                <label className="text-[0.75rem] tracking-widest uppercase font-light" style={{ color: "var(--text-muted)" }}>
                  Visual Manifestation
                </label>
                <div className="flex flex-col gap-4">
                  <input
                    name="imageUrl"
                    type="url"
                    placeholder="External Image URL (optional)"
                    className="input-minimal text-[1rem]"
                  />
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            const base64String = reader.result as string;
                            const urlInput = document.querySelector('input[name="imageUrl"]') as HTMLInputElement;
                            if (urlInput) urlInput.value = base64String;
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="flex items-center justify-center gap-2 border-2 border-dashed py-8 cursor-pointer transition-all hover:bg-[var(--bg-subtle)]"
                      style={{ borderColor: "var(--border-faint)", color: "var(--text-muted)" }}
                    >
                      <span className="text-[0.625rem] tracking-[0.2em] uppercase">Upload Local Image</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Pricing ── */}
          <div className="space-y-6">
            <h2
              className="text-[0.875rem] tracking-widest uppercase border-b pb-2"
              style={{
                color: "var(--text-secondary)",
                borderColor: "var(--border-faint)",
              }}
            >
              The Valuation
            </h2>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label
                  className="text-[0.75rem] font-light"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Display Price
                </label>
                <input
                  name="displayPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  className="input-minimal text-[1rem]"
                />
              </div>
              <div className="space-y-2">
                <label
                  className="text-[0.75rem] font-light"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Reserve Price (Hidden)
                </label>
                <input
                  name="reservePrice"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  className="input-minimal text-[1rem]"
                />
              </div>
            </div>
          </div>

          {/* ── Exchange Mode ── */}
          <div className="space-y-6">
            <h2
              className="text-[0.875rem] tracking-widest uppercase border-b pb-2"
              style={{
                color: "var(--text-secondary)",
                borderColor: "var(--border-faint)",
              }}
            >
              The Exchange Mode
            </h2>

            {/* Mode toggles */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setSaleMode("SHORT_BURST")}
                className="flex-1 py-4 text-[0.75rem] tracking-widest uppercase transition-all duration-300 border"
                style={
                  saleMode === "SHORT_BURST"
                    ? {
                        backgroundColor: "var(--cta-bg)",
                        color: "var(--cta-fg)",
                        borderColor: "var(--cta-bg)",
                      }
                    : {
                        backgroundColor: "transparent",
                        color: "var(--text-secondary)",
                        borderColor: "var(--border-ui)",
                      }
                }
              >
                Short Burst
              </button>
              <button
                type="button"
                onClick={() => setSaleMode("LONG_BURST")}
                className="flex-1 py-4 text-[0.75rem] tracking-widest uppercase transition-all duration-300 border"
                style={
                  saleMode === "LONG_BURST"
                    ? {
                        backgroundColor: "var(--cta-bg)",
                        color: "var(--cta-fg)",
                        borderColor: "var(--cta-bg)",
                      }
                    : {
                        backgroundColor: "transparent",
                        color: "var(--text-secondary)",
                        borderColor: "var(--border-ui)",
                      }
                }
              >
                Long Burst
              </button>
            </div>

            {saleMode === "SHORT_BURST" && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-500">
                <label
                  className="text-[0.75rem] font-light"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Number of Chances per Bidder
                </label>
                <input
                  name="burstChances"
                  type="number"
                  min="1"
                  defaultValue="3"
                  required
                  className="input-minimal text-[1rem]"
                />
                <p
                  className="text-[0.625rem] italic"
                  style={{ color: "var(--text-muted)" }}
                >
                  Buyers get limited attempts to meet the reserve.
                </p>
              </div>
            )}

            {saleMode === "LONG_BURST" && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-500">
                <label
                  className="text-[0.75rem] font-light"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Number of Rounds
                </label>
                <input
                  name="burstRounds"
                  type="number"
                  min="1"
                  defaultValue="5"
                  required
                  className="input-minimal text-[1rem]"
                />
                <p
                  className="text-[0.625rem] italic"
                  style={{ color: "var(--text-muted)" }}
                >
                  The arena stays open for configured intervals.
                </p>
              </div>
            )}
          </div>

          {error && (
            <p className="text-[0.75rem] text-red-500 text-center font-light">{error}</p>
          )}

          {/* Primary CTA */}
          <div className="pt-8 flex justify-center">
            <motion.button
              type="submit"
              disabled={createListingMutation.isPending}
              whileTap={{ scale: 0.98 }}
              className="btn-solid px-16 py-4 text-[0.75rem]"
            >
              {createListingMutation.isPending ? "Manifesting..." : "Publish to Market"}
            </motion.button>
          </div>
        </form>
      </div>
    </div>
  );
}
