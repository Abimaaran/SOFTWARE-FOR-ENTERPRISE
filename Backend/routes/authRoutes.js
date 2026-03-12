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
      highScoreMedium: user.highScoreMedium,
      highScoreHard: user.highScoreHard,
      bananaCount: user.bananaCount,
      timeBreakPowers: user.timeBreakPowers,
      extraLifePowers: user.extraLifePowers,
      doubleScorePowers: user.doubleScorePowers
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
      highScoreMedium: user.highScoreMedium,
      highScoreHard: user.highScoreHard,
      bananaCount: user.bananaCount,
      timeBreakPowers: user.timeBreakPowers,
      extraLifePowers: user.extraLifePowers,
      doubleScorePowers: user.doubleScorePowers
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// GET CURRENT USER DATA (sync localStorage with DB)
const authMiddleware = require("../middleware/authMiddleware");

router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({
      username: user.username,
      email: user.email,
      bananaCount: user.bananaCount,
      highScoreEasy: user.highScoreEasy,
      highScoreMedium: user.highScoreMedium,
      highScoreHard: user.highScoreHard,
      timeBreakPowers: user.timeBreakPowers,
      extraLifePowers: user.extraLifePowers,
      doubleScorePowers: user.doubleScorePowers
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// UPDATE HIGH SCORE

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

    const field = difficulty === "hard" ? "highScoreHard" :
      difficulty === "medium" ? "highScoreMedium" : "highScoreEasy";

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

// UPDATE BANANAS
router.put("/update-bananas", authMiddleware, async (req, res) => {
  try {
    const { amount } = req.body;
    const userId = req.user.userId;

    if (amount === undefined) {
      return res.status(400).json({ message: "Amount is required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.bananaCount += amount;
    await user.save();

    res.json({ message: "Bananas updated", bananaCount: user.bananaCount });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// USE POWER
router.put("/use-power", authMiddleware, async (req, res) => {
  try {
    const { powerType } = req.body;
    const userId = req.user.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const fieldMap = {
      timeBreak: "timeBreakPowers",
      extraLife: "extraLifePowers",
      doubleScore: "doubleScorePowers"
    };
    const field = fieldMap[powerType];
    if (!field) return res.status(400).json({ message: "Invalid power type" });

    if (user[field] > 0) {
      user[field] -= 1;
      await user.save();
      return res.json({
        message: "Power used",
        timeBreakPowers: user.timeBreakPowers,
        extraLifePowers: user.extraLifePowers,
        doubleScorePowers: user.doubleScorePowers
      });
    }

    res.status(400).json({ message: "No powers left" });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// BUY POWER
router.put("/buy-power", authMiddleware, async (req, res) => {
  try {
    const { powerType } = req.body;
    const userId = req.user.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const costMap = { timeBreak: 10, extraLife: 15, doubleScore: 20 };
    const fieldMap = {
      timeBreak: "timeBreakPowers",
      extraLife: "extraLifePowers",
      doubleScore: "doubleScorePowers"
    };
    const cost = costMap[powerType];
    const field = fieldMap[powerType];
    if (!cost || !field) return res.status(400).json({ message: "Invalid power type" });

    if (user.bananaCount >= cost) {
      user.bananaCount -= cost;
      user[field] += 1;
      await user.save();
      return res.json({
        message: "Power purchased successfully",
        bananaCount: user.bananaCount,
        timeBreakPowers: user.timeBreakPowers,
        extraLifePowers: user.extraLifePowers,
        doubleScorePowers: user.doubleScorePowers
      });
    }

    res.status(400).json({ message: `Not enough bananas. Need ${cost} 🍌` });
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
    const field = difficulty === "hard" ? "highScoreHard" :
      difficulty === "medium" ? "highScoreMedium" : "highScoreEasy";

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

// FORGOT PASSWORD - GENERATE OTP
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store in DB (Valid for 15 mins)
    user.resetOTP = otp;
    user.resetOTPExpires = Date.now() + 15 * 60 * 1000;
    await user.save();

    // Return the plain OTP to the frontend (to be sent via EmailJS)
    res.json({ message: "OTP generated", otp, email: user.email });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// VERIFY OTP
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: "Email and OTP required" });

    const user = await User.findOne({
      email,
      resetOTP: otp,
      resetOTPExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    res.json({ message: "OTP verified" });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// RESET PASSWORD
router.post("/reset-password", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: "All fields required" });
    }

    const user = await User.findOne({
      email,
      resetOTP: otp,
      resetOTPExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: "Session expired, please try again" });
    }

    // Hash new password
    const hash = await bcrypt.hash(newPassword, 10);
    user.password = hash;

    // Clear OTP fields
    user.resetOTP = undefined;
    user.resetOTPExpires = undefined;
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

module.exports = router;