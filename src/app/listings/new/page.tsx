"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, Image as ImageIcon } from "lucide-react";

export default function NewListingPage() {
  const router = useRouter();
  const [saleMode, setSaleMode] = useState<"SHORT_BURST" | "LONG_BURST">("SHORT_BURST");
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

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
      previewUrl ||
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
            className="text-[0.75rem] uppercase tracking-[0.3em] font-light"
            style={{ color: "var(--text-muted)" }}
          >
            Draft
          </p>
          <h1
            className="text-[2.5rem] font-light tracking-tight"
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
              The Manifest
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
                  Visual Representation
                </label>
                
                <AnimatePresence>
                  {previewUrl && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="relative aspect-video w-full overflow-hidden rounded-sm border mb-4"
                      style={{ borderColor: "var(--border-faint)" }}
                    >
                      <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setPreviewUrl(null)}
                        className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {!previewUrl && (
                  <div className="flex flex-col gap-4">
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setPreviewUrl(reader.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="hidden"
                        id="file-upload"
                      />
                      <label
                        htmlFor="file-upload"
                        className="flex flex-col items-center justify-center gap-3 border-2 border-dashed py-12 cursor-pointer transition-all hover:bg-[var(--bg-subtle)] hover:border-[var(--text-muted)]"
                        style={{ borderColor: "var(--border-faint)", color: "var(--text-muted)" }}
                      >
                        <Upload size={24} strokeWidth={1} />
                        <span className="text-[0.75rem] tracking-[0.2em] uppercase">Upload Local Image</span>
                      </label>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="h-px flex-1" style={{ backgroundColor: "var(--border-faint)" }} />
                      <span className="text-[0.625rem] tracking-[0.2em] uppercase" style={{ color: "var(--text-muted)" }}>OR</span>
                      <div className="h-px flex-1" style={{ backgroundColor: "var(--border-faint)" }} />
                    </div>

                    <div className="relative flex items-center">
                      <ImageIcon size={14} className="absolute left-3" style={{ color: "var(--text-muted)" }} />
                      <input
                        name="imageUrl"
                        type="url"
                        placeholder="Paste Image URL"
                        className="input-minimal text-[1rem] pl-10"
                        onChange={(e) => {
                          if (e.target.value.startsWith('http')) {
                            setPreviewUrl(e.target.value);
                          }
                        }}
                      />
                    </div>
                  </div>
                )}
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
              Pricing
            </h2>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label
                  className="text-[0.75rem] font-light"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Display Price
                </label>
                <div className="relative flex items-center">
                   <span className="absolute left-0 text-[1rem]" style={{ color: "var(--text-muted)" }}>$</span>
                   <input
                    name="displayPrice"
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    className="input-minimal text-[1rem] pl-4"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label
                  className="text-[0.75rem] font-light"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Reserve Price (Hidden)
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-0 text-[1rem]" style={{ color: "var(--text-muted)" }}>$</span>
                  <input
                    name="reservePrice"
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    className="input-minimal text-[1rem] pl-4"
                  />
                </div>
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
              Engagement Mode
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
                  className="text-[0.75rem] italic"
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
                  className="text-[0.75rem] italic"
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
              className="btn-solid px-16 py-4 text-[0.75rem] tracking-[0.3em] uppercase"
            >
              {createListingMutation.isPending ? "Manifesting..." : "Publish to Market"}
            </motion.button>
          </div>
        </form>
      </div>
    </div>
  );
}
