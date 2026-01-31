import rateLimit from 'express-rate-limit';

// Rate limiter for comment creation
export const commentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  message: {
    error: "Too many comments",
    details: "You have exceeded the rate limit. Please try again later."
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Rate limiter for comment deletion (more lenient)
export const deleteCommentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 delete requests per windowMs
  message: {
    error: "Too many delete requests",
    details: "You have exceeded the rate limit for deletions. Please try again later."
  },
  standardHeaders: true,
  legacyHeaders: false,
});
