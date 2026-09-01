const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const connectDB = require("./config/db");
const electionRoutes = require("./routes/electionRoutes");
const candidateRoutes = require("./routes/candidateRoutes");
const voteRoutes = require("./routes/voteRoutes");
const voterRoutes = require("./routes/voterRoutes");
const adminRoutes = require("./routes/adminRoutes");
const resultsRoutes = require("./routes/resultsRoutes");

const {
  updateElectionStatuses,
} = require("./controllers/electionController");

// Import rate limiters
const {
  globalLimiter,
  authLimiter,
  votingLimiter,
  adminLimiter,
} = require("./middleware/rateLimiter");

dotenv.config();

connectDB();

setInterval(async () => {
  await updateElectionStatuses();
}, 60 * 1000);

const app = express();

// ==========================================
// TRUST PROXY CONFIGURATION
// ==========================================
// For single-server deployments, this can be omitted or set to false.
// If your Express app is behind a reverse proxy (nginx, AWS ELB, Cloudflare, etc.),
// set this to 1 so that rate limiters correctly identify client IPs from the
// X-Forwarded-For header instead of the proxy's IP address.
// For now, this is commented out for local/direct deployment.
// Uncomment if deploying behind a reverse proxy:
// app.set("trust proxy", 1);

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "2mb" }));

// ==========================================
// APPLY GLOBAL RATE LIMITER
// ==========================================
// Purpose: Protect entire API from abuse
// Limit: 300 requests per IP per 15 minutes
// This applies to ALL endpoints before any other middleware
app.use(globalLimiter);

// ==========================================
// APPLY SPECIFIC RATE LIMITERS TO ROUTES
// ==========================================

// Authentication endpoints: stricter limit (20 per 15 min)
app.use("/api/auth", authLimiter, require("./routes/authRoutes"));

// Admin endpoints: reasonable limit (100 per 15 min)
app.use("/api/admin", adminLimiter, adminRoutes);

// Voting endpoints: moderate limit (30 per 15 min)
app.use("/api/votes", votingLimiter, voteRoutes);

// ==========================================
// APPLY REMAINING ROUTES (use global limiter only)
// ==========================================
app.use("/api/elections", electionRoutes);
app.use("/api/candidates", candidateRoutes);
app.use("/api/voters", voterRoutes);
app.use("/api/results", resultsRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "Voting Management System API is running",
  });
});

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    message: "Internal server error",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});