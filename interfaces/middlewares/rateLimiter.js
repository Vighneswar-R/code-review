const rateLimit = require("express-rate-limit");

// OTP limiter (very strict)
const otpLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 5 minutes
  max: 2,
  message: {
    status: "ERROR",
    message: "Too many OTP requests. Try again after 5 minutes."
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // limit by phone number + IP
    return `${req.ip}-${req.body.number}`;
  }
});

module.exports = { otpLimiter };