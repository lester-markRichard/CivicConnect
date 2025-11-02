const express = require("express");
const router = express.Router();
const User = require("../models/User"); // note the .. to go back a folder

// Show all users
router.get("/", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).send("Error fetching users: " + err.message);
  }
});

// Add a new user
router.post("/add", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const user = new User({ name, email, password });
    await user.save();
    res.send("✅ User saved to database!");
  } catch (err) {
    res.status(500).send("Error saving user: " + err.message);
  }
});

module.exports = router;
