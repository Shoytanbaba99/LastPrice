import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "~/server/auth";
import { SellerListings } from "./SellerListings";
import { PendingHandshakes } from "./PendingHandshakes";

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const firstName =
    session.user?.name?.split(" ")[0] ??
    session.user?.email?.split("@")[0] ??
    "You";

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg-primary)" }}>
      <div className="mx-auto max-w-3xl px-6 pb-32 pt-28 md:px-12">

        {/* ── Greeting Header ── */}
        <header className="space-y-3">
          <p
            className="text-[0.625rem] tracking-[0.3em] uppercase"
            style={{ color: "var(--text-muted)" }}
          >
            Authenticated Space
          </p>
          {/* H1 — crisp heading colour from CSS var */}
          <h1
            className="text-[2.5rem] font-light tracking-tight"
            style={{ color: "var(--text-heading)" }}
          >
            {firstName}.
          </h1>
          <p
            className="max-w-sm text-[1rem] font-light leading-relaxed"
            style={{ color: "var(--text-secondary)" }}
          >
            Your listings, active bids, and pending handshakes are all below.
          </p>
        </header>

        {/* ── Decorative Divider ── */}
        <div className="mt-10 flex items-center gap-4">
          <div className="h-px flex-1" style={{ backgroundColor: "var(--border-faint)" }} />
          <p
            className="text-[0.625rem] tracking-[0.25em] uppercase italic"
            style={{ color: "var(--text-muted)" }}
          >
            &ldquo;The final price is a silent agreement.&rdquo;
          </p>
          <div className="h-px flex-1" style={{ backgroundColor: "var(--border-faint)" }} />
        </div>

        {/* ── Pending Handshakes (Transaction Verification) ── */}
        {/* This renders FIRST — it is the most time-sensitive activity */}
        <PendingHandshakes />

        {/* ── Seller's Active Listings ── */}
        <SellerListings />

        {/* ── Account Actions ── */}
        <div
          className="mt-20 flex items-center justify-between border-t pt-8"
          style={{ borderColor: "var(--border-faint)" }}
        >
          <Link
            href="/listings/new"
            className="text-[0.625rem] tracking-[0.3em] uppercase transition-colors"
            style={{ color: "var(--text-secondary)" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-heading)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-secondary)";
            }}
          >
            + New Listing
          </Link>
          <Link
            href="/api/auth/signout"
            className="text-[0.625rem] tracking-[0.3em] uppercase transition-colors"
            style={{ color: "var(--text-muted)" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-secondary)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-muted)";
            }}
          >
            Leave Workspace
          </Link>
        </div>

      </div>
    </div>
  );
}
