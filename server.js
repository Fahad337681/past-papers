const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const session = require("express-session");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));

// Session configuration
app.use(
  session({
    secret: "your-secret-key-change-this-in-production",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to true if using HTTPS
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// Create uploads directory if it doesn't exist
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

// Admin credentials (in production, store these in environment variables or database)
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD =
  "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi"; // "password" hashed

// Authentication middleware
function requireAuth(req, res, next) {
  if (req.session.isAuthenticated) {
    next();
  } else {
    res.redirect("/login");
  }
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    const allowedTypes = /pdf|doc|docx|jpg|jpeg|png/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb("Error: Only PDF, DOC, DOCX, JPG, JPEG, PNG files are allowed!");
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Store papers data
let papers = [];

// Load existing papers from file if exists
const papersFile = "papers.json";
if (fs.existsSync(papersFile)) {
  try {
    papers = JSON.parse(fs.readFileSync(papersFile, "utf8"));
  } catch (error) {
    console.log("Error loading papers file:", error);
  }
}

// Save papers to file
function savePapers() {
  fs.writeFileSync(papersFile, JSON.stringify(papers, null, 2));
}

// Routes
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Login routes
app.get("/login", (req, res) => {
  if (req.session.isAuthenticated) {
    res.redirect("/admin");
  } else {
    res.sendFile(path.join(__dirname, "public", "login.html"));
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (
    username === ADMIN_USERNAME &&
    (await bcrypt.compare(password, ADMIN_PASSWORD))
  ) {
    req.session.isAuthenticated = true;
    req.session.username = username;
    res.json({ success: true, message: "Login successful!" });
  } else {
    res.status(401).json({ success: false, message: "Invalid credentials!" });
  }
});

app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      res.status(500).json({ success: false, message: "Logout failed!" });
    } else {
      res.json({ success: true, message: "Logout successful!" });
    }
  });
});

// Protected admin route
app.get("/admin", requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin.html"));
});

// API Routes
app.get("/api/papers", (req, res) => {
  res.json(papers);
});

// Protected API routes
app.post("/api/upload", requireAuth, upload.single("paper"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const { subject, year, examType } = req.body;

    if (!subject || !year || !examType) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newPaper = {
      id: Date.now().toString(),
      filename: req.file.filename,
      originalName: req.file.originalname,
      subject: subject,
      year: year,
      examType: examType,
      uploadDate: new Date().toISOString(),
      fileSize: req.file.size,
      filePath: `/uploads/${req.file.filename}`,
    };

    papers.push(newPaper);
    savePapers();

    res.json({
      success: true,
      message: "Paper uploaded successfully!",
      paper: newPaper,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Upload failed" });
  }
});

app.delete("/api/papers/:id", requireAuth, (req, res) => {
  try {
    const paperId = req.params.id;
    const paperIndex = papers.findIndex((p) => p.id === paperId);

    if (paperIndex === -1) {
      return res.status(404).json({ error: "Paper not found" });
    }

    const paper = papers[paperIndex];

    // Delete file from uploads directory
    const filePath = path.join(__dirname, "uploads", paper.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Remove from papers array
    papers.splice(paperIndex, 1);
    savePapers();

    res.json({ success: true, message: "Paper deleted successfully!" });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ error: "Delete failed" });
  }
});

// Check authentication status
app.get("/api/auth/status", (req, res) => {
  res.json({
    isAuthenticated: !!req.session.isAuthenticated,
    username: req.session.username || null,
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Admin panel: http://localhost:${PORT}/admin`);
  console.log(`Login page: http://localhost:${PORT}/login`);
  console.log(`Default admin credentials: admin / password`);
});
