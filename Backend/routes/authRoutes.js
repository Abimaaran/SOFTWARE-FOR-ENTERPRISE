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
      highScoreEasy: user.highScoreEasy,
      highScoreHard: user.highScoreHard 
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
      username: user.username,
      email: user.email,
      highScoreEasy: user.highScoreEasy,
      highScoreHard: user.highScoreHard
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// UPDATE HIGH SCORE
const authMiddleware = require("../middleware/authMiddleware");

router.put("/highscore", authMiddleware, async (req, res) => {
  try {
    const { score, difficulty } = req.body;
    const userId = req.user.userId;

    if (score === undefined || !difficulty) {
      return res.status(400).json({ message: "Score and difficulty are required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const field = difficulty === "hard" ? "highScoreHard" : "highScoreEasy";

    if (score > user[field]) {
      user[field] = score;
      await user.save();
      return res.json({ message: "High score updated", highScore: user[field] });
    }

    res.json({ message: "Score not higher than high score", highScore: user[field] });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// UPDATE PROFILE
router.put("/update-profile", authMiddleware, async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const userId = req.user.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update username if provided
    if (username) user.username = username;

    // Update email if provided and check for uniqueness
    if (email && email !== user.email) {
      const exists = await User.findOne({ email });
      if (exists) {
        return res.status(409).json({ message: "Email already in use" });
      }
      user.email = email;
    }

    // Update password if provided
    if (password) {
      const hash = await bcrypt.hash(password, 10);
      user.password = hash;
    }

    await user.save();

    res.json({
      message: "Profile updated successfully",
      username: user.username,
      email: user.email
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// GET LEADERBOARD
router.get("/leaderboard", authMiddleware, async (req, res) => {
  try {
    const { difficulty } = req.query;
    const field = difficulty === "hard" ? "highScoreHard" : "highScoreEasy";

    const topPlayers = await User.find({}, `username ${field}`)
      .sort({ [field]: -1 })
      .limit(10);
    
    // Map response to a common "highScore" property for easier frontend display
    const formattedPlayers = topPlayers.map(p => ({
      _id: p._id,
      username: p.username,
      highScore: p[field]
    }));

    res.json(formattedPlayers);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

module.exports = router;