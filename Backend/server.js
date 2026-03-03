const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());



//Auth  routes
const authRoutes = require("./routes/authRoutes");
app.use("/auth", authRoutes);

// 🔹 Import middleware
const authMiddleware = require("./middleware/authMiddleware");

// 🔹 Protected route 
app.get("/protected", authMiddleware, (req, res) => {
  res.json({
    message: "Access granted",
    user: req.user
  });
});

// MongoDB connect
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected ✅"))
  .catch((err) => console.log("MongoDB Error:", err.message));

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));