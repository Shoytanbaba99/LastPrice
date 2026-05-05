/**
 * Auth Routes
 * POST /api/auth/register  – Create account (100 TP initial grant)
 * POST /api/auth/login     – Login and receive JWT
 * GET  /api/auth/me        – Get current user profile (requires token)
 */
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");
const auth = require("../middleware/auth");
const { sanitizeString, isValidEmail } = require("../middleware/validate");

const router = express.Router();

// ── POST /api/auth/register ──────────────────────────────────
router.post("/register", async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password)
            return res.status(400).json({ error: "username, email, and password are required" });

        const cleanName = sanitizeString(username);
        const cleanEmail = sanitizeString(email).toLowerCase();

        if (!isValidEmail(cleanEmail))
            return res.status(400).json({ error: "Invalid email format" });

        if (password.length < 8)
            return res.status(400).json({ error: "Password must be at least 8 characters" });

        if (cleanName.length < 3 || cleanName.length > 50)
            return res.status(400).json({ error: "Username must be 3–50 characters" });

        // Check duplicates
        const { rows: existing } = await db.query(
            "SELECT id FROM Users WHERE email = $1 OR username = $2",
            [cleanEmail, cleanName],
        );
        if (existing.length)
            return res.status(409).json({ error: "Email or username already registered" });

        const hash = await bcrypt.hash(password, 12);

        const client = await db.connect();
        try {
            await client.query("BEGIN");

            const result = await client.query(
                "INSERT INTO Users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id",
                [cleanName, cleanEmail, hash],
            );
            const userId = result.rows[0].id;

            await client.query("COMMIT");

            const token = jwt.sign(
                { id: userId, email: cleanEmail, username: cleanName },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES_IN || "7d" },
            );

            return res.status(201).json({
                message: "Registration successful",
                token,
                user: { id: userId, username: cleanName, email: cleanEmail },
            });
        } catch (err) {
            await client.query("ROLLBACK");
            throw err;
        } finally {
            client.release();
        }
    } catch (err) {
        console.error("Register error:", err);
        return res.status(500).json({ error: "Server error during registration" });
    }
});

// ── POST /api/auth/login ─────────────────────────────────────
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password)
            return res.status(400).json({ error: "email and password are required" });

        const cleanEmail = sanitizeString(email).toLowerCase();

        const { rows } = await db.query(
            "SELECT id, username, email, password_hash FROM Users WHERE email = $1",
            [cleanEmail],
        );
        if (!rows.length) return res.status(401).json({ error: "Invalid email or password" });

        const user = rows[0];
        const match = await bcrypt.compare(password, user.password_hash);
        if (!match) return res.status(401).json({ error: "Invalid email or password" });

        const token = jwt.sign(
            { id: user.id, email: user.email, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || "7d" },
        );

        return res.json({
            message: "Login successful",
            token,
            user: { id: user.id, username: user.username, email: user.email },
        });
    } catch (err) {
        console.error("Login error:", err);
        return res.status(500).json({ error: "Server error during login" });
    }
});

// ── GET /api/auth/me ─────────────────────────────────────────
router.get("/me", auth, async (req, res) => {
    try {
        const { rows } = await db.query(
            "SELECT id, username, email, created_at FROM Users WHERE id = $1",
            [req.user.id],
        );
        if (!rows.length) return res.status(404).json({ error: "User not found" });
        return res.json({ user: rows[0] });
    } catch (err) {
        console.error("Me error:", err);
        return res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
