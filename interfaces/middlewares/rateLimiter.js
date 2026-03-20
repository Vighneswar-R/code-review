const rateLimit = require("express-rate-limit");

const { ipKeyGenerator } = rateLimit;

// OTP limiter (very strict)
const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: {
    status: "ERROR",
    message: "Too many OTP requests. Try again after 1 minute."
  },
  standardHeaders: true,
  legacyHeaders: false,
 keyGenerator: (req) => {
    const number = req.body?.number
    return `otp-${ipKeyGenerator}`;
  }
});


const otpLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 2,
  message: {
    status: "ERROR",
    message: "Too many OTP requests. Try again after 1 minute."
  },
  standardHeaders: true,
  legacyHeaders: false,
 keyGenerator: (req) => {
    const number = req.body?.number;
    return `otp-${ipKeyGenerator}`;
  }
});

module.exports = { globalLimiter ,otpLimiter };