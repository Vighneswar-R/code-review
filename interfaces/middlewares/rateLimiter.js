const rateLimit = require("express-rate-limit");

const { ipKeyGenerator } = rateLimit;


const getClientKey = (req) => {
  // Safely extract IP respecting proxy
  const ip = (req.headers["x-forwarded-for"] || "").split(",")[0].trim() 
             || req.socket?.remoteAddress 
             || "unknown";

  // For authenticated requests — key by route + user ID
  if (req.user?.id) {
    return `${req.baseUrl}${req.path}-user-${req.user.id}`;
  }

  // For pre-auth requests — key by route + IP
  return `${req.baseUrl}${req.path}-ip-${ip}`;
};

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
keyGenerator: getClientKey
});


const otpLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 2,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: "ERROR", message: "Too many OTP requests. Try again after 1 minute." },
  keyGenerator: (req) => {
    const ip = (req.headers["x-forwarded-for"] || "").split(",")[0].trim()
               || req.socket?.remoteAddress
               || "unknown";
    const number = req.body?.number || "unknown";
    // Key by route + IP + phone number
    return `${req.baseUrl}${req.path}-otp-${ip}-${number}`;
  }
});

module.exports = { globalLimiter ,otpLimiter };
