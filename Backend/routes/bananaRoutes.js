const express = require("express");
const axios = require("axios");
const router = express.Router();

router.get("/question", async (req, res) => {
  try {
    const apiRes = await axios.get("https://marcconrad.com/uob/banana/api.php");
    res.json(apiRes.data); // { question: "<img-url>", solution: <digit> }
  } catch (e) {
    res.status(500).json({ message: "Banana API failed" });
  }
});

module.exports = router;