const express = require("express");
const app = express();
const mongoose = require("mongoose");
require("dotenv").config();
const path = require("path");

// ---------------------- MIDDLEWARE ----------------------
app.use(express.urlencoded({ extended: true })); // replaces bodyParser
app.use(express.json()); // for future JSON API routes

// Set EJS and views path
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


// ---------------------- DATABASE ----------------------
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB error:", err));

// ---------------------- MODELS ----------------------
const Report = require("./models/Report");

// ---------------------- ROUTES ----------------------
const reportRoutes = require("./routes/reportRoutes");
app.use("/api/reports", reportRoutes);

// ---------------------- PAGE ROUTES ----------------------
// ✅ Root route - always go to login page
app.get("/", (req, res) => res.redirect("/login"));


app.get("/home", (req, res) => res.render("home"));
app.get("/report", (req, res) => res.render("report"));
app.get("/contact", (req, res) => res.render("contact"));
app.get("/about", (req, res) => res.render("about"));

// ---------------------- REPORTS PAGE ----------------------
app.get("/reports", async (req, res) => {
  try {
    const reports = await Report.find().sort({ createdAt: -1 });
    res.render("reports", { reports });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading reports");
  }
});

// ---------------------- LOGIN ----------------------
app.get("/login", (req, res) => res.render("login"));

app.post("/login", (req, res) => {
  const { role, email, password } = req.body;

  if (role === "citizen") {
    console.log("✅ Citizen logged in successfully");
    return res.redirect("/home");
  }

  if (role === "admin") {
    if (email === "admin@bmc.gov" && password === "admin123") {
      console.log("✅ Admin logged in successfully");
      return res.redirect("/admin/dashboard");
    } else {
      console.log("❌ Invalid admin credentials");
      return res.send("Invalid admin credentials");
    }
  }

  res.send("Please select a role");
});

// ---------------------- ADMIN DASHBOARD ----------------------
app.get("/admin/dashboard", async (req, res) => {
  try {
    const reports = await Report.find().sort({ createdAt: -1 });
    res.render("admin-dashboard", { reports });
  } catch (err) {
    console.error("Error loading dashboard:", err);
    res.status(500).send("Error loading dashboard");
  }
});

app.post("/admin/update/:id", async (req, res) => {
  try {
    const reportId = req.params.id;
    const { status } = req.body;

    console.log(`📝 Updating report ${reportId} to status: ${status}`);
    await Report.findByIdAndUpdate(reportId, { status }, { new: true });

    res.redirect("/admin/dashboard");
  } catch (err) {
    console.error("Error updating report:", err);
    res.status(500).send("Error updating report");
  }
});

// ---------------------- LOGOUT ----------------------
app.get("/logout", (req, res) => {
  console.log("✅ User logged out");
  res.redirect("/login");
});

// ---------------------- STATIC FILES ----------------------
/*app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));*/

// ---------------------- SERVER ----------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
