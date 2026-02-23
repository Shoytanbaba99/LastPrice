module.exports = (req, res) => {
  res.json({ test: "ok", env: !!process.env.DATABASE_URL });
};
