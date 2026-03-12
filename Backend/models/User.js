const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // later store hashed password
    highScoreEasy: { type: Number, default: 0 },
    highScoreMedium: { type: Number, default: 0 },
    highScoreHard: { type: Number, default: 0 },
    bananaCount: { type: Number, default: 20 },
    timeBreakPowers: { type: Number, default: 1 },
    extraLifePowers: { type: Number, default: 1 },
    doubleScorePowers: { type: Number, default: 1 },
    resetOTP: { type: String },
    resetOTPExpires: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);