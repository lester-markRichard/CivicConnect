const express = require("express");
const router = express.Router();
const Report = require("../models/Report");
const multer = require("multer");
const path = require("path");

// 🧠 Setup Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // store in /uploads folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // rename file to timestamp.jpg
  },
});

// 📸 Initialize upload middleware
const upload = multer({ storage: storage });

// 🧾 POST - Add a new report
router.post("/add", upload.single("image"), async (req, res) => {
  try {
    const { title, description, location } = req.body;

    const newReport = new Report({
      title,
      description,
      location,
      imageUrl: req.file ? `/uploads/${req.file.filename}` : "", // file path
      status: "pending", // 🟡 Default status for new reports
    });

    await newReport.save();
    res.redirect("/reports");
  } catch (err) {
    console.error("Error adding report:", err);
    res.status(500).send("Something went wrong while adding the report.");
  }
});

// 🧾 GET - Show all reports
router.get("/", async (req, res) => {
  try {
    let reports = await Report.find().sort({ createdAt: -1 });

    // ✅ Ensure every report has a valid status
    reports.forEach((r) => {
      if (!r.status) r.status = "pending";
    });

    // ✅ Render EJS file with safe data
    res.render("reports", { reports });
  } catch (err) {
    console.error("Error fetching reports:", err);
    res.status(500).send("Error loading reports.");
  }
});

module.exports = router;
