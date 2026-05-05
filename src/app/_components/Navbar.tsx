"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Sun, Moon, Gavel } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ---------------------------------------------------------------------------
// Theme toggle button — renders after mount to avoid SSR hydration mismatch
// ---------------------------------------------------------------------------

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Only render the toggle client-side so the icon matches the actual theme
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Reserve space to prevent layout shift
    return <div className="h-4 w-4" />;
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="group flex h-8 w-8 items-center justify-center transition-opacity hover:opacity-60"
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.span
            key="sun"
            initial={{ opacity: 0, rotate: -30, scale: 0.8 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 30, scale: 0.8 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            <Sun size={15} strokeWidth={1.5} className="text-ui-secondary" />
          </motion.span>
        ) : (
          <motion.span
            key="moon"
            initial={{ opacity: 0, rotate: 30, scale: 0.8 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: -30, scale: 0.8 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            <Moon size={15} strokeWidth={1.5} className="text-ui-secondary" />
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Main Navbar
// ---------------------------------------------------------------------------

export function Navbar() {
  const { data: session, status } = useSession();
  const loading = status === "loading";

  return (
    <nav
      className="fixed left-0 right-0 top-0 z-50 border-b"
      style={{
        borderColor: "var(--border-faint)",
        backgroundColor: "color-mix(in srgb, var(--bg-primary) 85%, transparent)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 md:px-12">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 transition-opacity hover:opacity-70"
          aria-label="LastPrice home"
        >
          <Gavel size={16} strokeWidth={1.5} className="text-ui-secondary" />
          <span className="text-[1.125rem] font-medium tracking-tighter text-ui-primary">
            Last<span className="font-light text-ui-secondary">Price</span>
          </span>
        </Link>

        {/* Nav links + toggle */}
        <div className="flex items-center gap-7">
          {/* Marketplace link — always visible */}
          <Link
            href="/"
            className="text-[0.75rem] font-light tracking-widest uppercase text-ui-secondary transition-colors hover:text-ui-primary"
          >
            Market
          </Link>

          {/* Auth-gated links */}
          {!loading && (
            <>
              {session ? (
                <>
                  <Link
                    href="/listings/new"
                    className="text-[0.75rem] font-light tracking-widest uppercase text-ui-secondary transition-colors hover:text-ui-primary"
                  >
                    Sell
                  </Link>
                  <Link
                    href="/dashboard"
                    className="text-[0.75rem] font-light tracking-widest uppercase text-ui-secondary transition-colors hover:text-ui-primary"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => void signOut({ callbackUrl: "/" })}
                    className="text-[0.75rem] font-light tracking-widest uppercase text-ui-muted transition-colors hover:text-ui-secondary"
                  >
                    Exit
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-[0.75rem] font-light tracking-widest uppercase text-ui-secondary transition-colors hover:text-ui-primary"
                  >
                    Enter
                  </Link>
                  <Link
                    href="/register"
                    className="text-[0.75rem] font-light tracking-widest uppercase text-ui-secondary transition-colors hover:text-ui-primary"
                  >
                    Join
                  </Link>
                </>
              )}
            </>
          )}

          {/* Separator */}
          <div className="h-4 w-px" style={{ backgroundColor: "var(--border-ui)" }} />

          {/* Dark mode toggle */}
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
