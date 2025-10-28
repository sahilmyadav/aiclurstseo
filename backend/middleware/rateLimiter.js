import rateLimit from 'express-rate-limit';

// Limit auth endpoints to mitigate brute-force and abuse
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});

export { authLimiter };
