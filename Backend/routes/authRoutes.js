const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({ message: "Email already used" });
    }

    const hash = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      email,
      password: hash,
    });

    res.status(201).json({ 
      message: "Registered", 
      userId: user._id,
      highScore: user.highScore 
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.json({ 
      message: "Login success", 
      token,
      highScore: user.highScore
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// UPDATE HIGH SCORE
const authMiddleware = require("../middleware/authMiddleware");

router.put("/highscore", authMiddleware, async (req, res) => {
  try {
    const { score } = req.body;
    const userId = req.user.userId;

    if (score === undefined) {
      return res.status(400).json({ message: "Score is required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (score > user.highScore) {
      user.highScore = score;
      await user.save();
      return res.json({ message: "High score updated", highScore: user.highScore });
    }

    res.json({ message: "Score not higher than high score", highScore: user.highScore });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

module.exports = router;