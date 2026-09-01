const rateLimit = require("express-rate-limit");

// ==========================================
// GLOBAL API RATE LIMITER
// ==========================================
// Purpose: Protect the entire API from abusive traffic
// Limit: 300 requests per IP per 15 minutes
// This allows normal users to use the application comfortably
// while preventing large-scale automated attacks

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Requests per window per IP
  message: {
    message: "Too many requests. Please try again later.",
  },
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // IP detection is handled automatically by express-rate-limit
  // It correctly handles both IPv4 and IPv6 addresses
  // For production with reverse proxy, ensure app.set("trust proxy", 1)
});

// ==========================================
// AUTHENTICATION RATE LIMITER
// ==========================================
// Purpose: Reduce brute-force login/registration attempts and credential abuse
// Limit: 20 requests per IP per 15 minutes
// Applied to: login, register, forgot-password, reset-password endpoints
// This is stricter than the global limit because authentication endpoints
// are prime targets for automated attacks (credential stuffing, brute force, etc.)

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Strict limit for authentication attempts
  message: {
    message: "Too many authentication attempts. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  // IP detection is handled automatically by express-rate-limit
  // It correctly handles both IPv4 and IPv6 addresses
});

// ==========================================
// VOTING API RATE LIMITER
// ==========================================
// Purpose: Protect voting-related endpoints from abuse
// Limit: 30 requests per IP per 15 minutes
// Applied to: getActiveElections, getCandidates, submitVote, getVotingStatus, getVotingHistory
//
// IMPORTANT: This rate limiter is an ADDITIONAL security layer ONLY.
// The existing backend security checks remain intact:
// - Authenticated user verification (authMiddleware)
// - Voter role verification (voterMiddleware)
// - Blocked voter checks
// - Active election validation
// - Election date/time constraints
// - Candidate existence validation
// - Candidate belongs to election validation
// - Duplicate vote prevention (via database queries and constraints)
// - All other existing security checks
//
// Rate limiting prevents REQUEST FLOODING. Duplicate voting is still prevented
// by the existing Vote.findOne() checks and database constraints.

const votingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Requests per window per IP
  message: {
    message: "Too many voting requests. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  // IP detection is handled automatically by express-rate-limit
  // It correctly handles both IPv4 and IPv6 addresses
});

// ==========================================
// ADMIN API RATE LIMITER
// ==========================================
// Purpose: Reasonable protection for admin operations
// Limit: 100 requests per IP per 15 minutes
// Applied to: All /api/admin/* endpoints
//
// IMPORTANT: Admin routes already have dual middleware protection:
// - authMiddleware (JWT verification)
// - adminMiddleware (role verification)
// These checks are NOT changed. This rate limiter is an additional layer.

const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Reasonable limit for admin operations
  message: {
    message: "Too many requests. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  // IP detection is handled automatically by express-rate-limit
  // It correctly handles both IPv4 and IPv6 addresses
});

// ==========================================
// EXPORT ALL LIMITERS
// ==========================================
module.exports = {
  globalLimiter,
  authLimiter,
  votingLimiter,
  adminLimiter,
};
