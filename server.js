/**
 * LastPrice – Server Entry Point
 * Express app with all routes, security middleware, and static file serving.
 */
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const rateLimit = require("express-rate-limit");

// ── Route Imports ────────────────────────────────────────────
const authRoutes = require("./routes/auth");
const listingsRoutes = require("./routes/listings");
const bidsRoutes = require("./routes/bids");
const arenaRoutes = require("./routes/arena");
const transactionsRoutes = require("./routes/transactions");

const app = express();
const PORT = process.env.PORT || 3000;

// Essential for Express Rate Limit on Vercel
app.set("trust proxy", 1);

// ── Security & Parsing Middleware ────────────────────────────
app.use(
    cors({
        origin: true, // Reflect origin (better for Vercel previews)
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    }),
);

// Rate limiter – protect auth endpoints from brute force
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Increased for testing
    message: { error: "Too many requests, please try again later" },
});

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ── Static Files (frontend) ──────────────────────────────────
app.use(express.static(path.join(__dirname, "public")));

// ── API Routes ───────────────────────────────────────────────
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/listings", listingsRoutes);
app.use("/api/bids", bidsRoutes);
app.use("/api/arena", arenaRoutes);
app.use("/api/transactions", transactionsRoutes);

// ── Health Check ─────────────────────────────────────────────
app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── SPA Fallback (serve index.html for all unmatched routes) ─
app.get("*", (req, res) => {
    // Only serve index for non-API routes
    if (req.path.startsWith("/api")) {
        return res.status(404).json({ error: "API route not found" });
    }
    res.sendFile(path.join(__dirname, "public", "index.html"), (err) => {
        if (err) {
            res.status(500).send("Server Error: Missing index.html");
        }
    });
});

// ── Global Error Handler ─────────────────────────────────────
app.use((err, req, res, next) => {
    console.error("Unhandled error:", err);
    if (err.code === "LIMIT_FILE_SIZE")
        return res.status(413).json({ error: "File too large (max 5MB)" });
    res.status(500).json({ error: "Internal server error" });
});

// ── Start Server ─────────────────────────────────────────────
// On Vercel, we export the app and let Vercel handle the server start
if (!process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`
╔══════════════════════════════════════════════╗
║   🏟️  LastPrice – The Silent Negotiator    ║
║   Server running at http://localhost:${PORT}   ║
╚══════════════════════════════════════════════╝
      `);
    });
}

module.exports = app;
