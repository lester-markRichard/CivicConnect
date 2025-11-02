const express = require("express");
const router = express.Router();
const Report = require("../models/Report");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// 🧠 Ensure uploads folder exists (important for Render!)
const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("📁 Created uploads folder");
}

// 🧠 Setup Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // store in /uploads folder (absolute path)
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // rename file to timestamp.ext
  },
});

// 📸 Initialize upload middleware
const upload = multer({ storage: storage });

// 🧾 POST - Add a new report
router.post("/add", upload.single("image"), async (req, res) => {
  try {
    console.log("📥 Incoming report data:", req.body);
    console.log("🖼 Uploaded file info:", req.file);

    const { title, description, location } = req.body;

    const newReport = new Report({
      title,
      description,
      location,
      imageUrl: req.file ? `/uploads/${req.file.filename}` : "",
      status: "Pending", // 🟡 Default status for new reports
    });

    await newReport.save();
    console.log("✅ Report saved successfully");

    res.redirect("/reports");
  } catch (err) {
    console.error("❌ Error adding report:", err.message);
    res.status(500).send("Something went wrong while adding the report.");
  }
});

// 🧾 GET - Show all reports
router.get("/", async (req, res) => {
  try {
    const reports = await Report.find().sort({ createdAt: -1 });

    // ✅ Ensure every report has a status
    reports.forEach((r) => {
      if (!r.status) r.status = "Pending";
    });

    res.render("reports", { reports });
  } catch (err) {
    console.error("❌ Error fetching reports:", err.message);
    res.status(500).send("Error loading reports.");
  }
});

module.exports = router;
