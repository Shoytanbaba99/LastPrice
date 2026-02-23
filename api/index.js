let app;
try {
    app = require("../server");
} catch (err) {
    console.error("Failed to load server.js:", err);
    // Fallback app to return error info
    const express = require("express");
    app = express();
    app.all("*", (req, res) => {
        res.status(500).json({
            error: "Backend Startup Failed",
            message: err.message,
            stack: err.stack // Show stack temporarily to debug Vercel
        });
    });
}
module.exports = app;
