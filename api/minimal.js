const express = require("express");
const app = express();

app.get("/api/minimal", (req, res) => {
    res.json({ 
        status: "ok", 
        msg: "Minimal server running",
        db: !!process.env.DATABASE_URL 
    });
});

module.exports = app;
