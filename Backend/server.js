const express = require("express");
const cors = require("cors");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get("/health", (req, res) => {
  res.json({ ok: true });
});

// Default route
app.get("/", (req, res) => {
  res.send("Banana Quiz Game Backend Running 🚀");
});

// Start server
const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});