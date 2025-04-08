/**
 * Middleware to sanitize user inputs to prevent XSS attacks
 * Can be used on specific routes or globally
 */

// Helper function to safely sanitize text
const sanitizeText = (text, req) => {
  if (typeof text !== "string") return text;

  // Use expressSanitizer if available, otherwise do basic sanitization
  if (req.expressSanitizer) {
    return req.expressSanitizer(text);
  } else {
    // Basic sanitization as fallback
    return text
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#x27;")
      .replace(/\//g, "&#x2F;");
  }
};

// Sanitizes fields in request body
exports.sanitizeBody = (req, res, next) => {
  if (req.body) {
    // Sanitize common text fields
    const fieldsToSanitize = ["name", "title", "description", "text", "email"];

    fieldsToSanitize.forEach((field) => {
      if (req.body[field] && typeof req.body[field] === "string") {
        req.body[field] = sanitizeText(req.body[field], req);
      }
    });

    // Handle nested objects like in ticket responses
    if (req.body.responses) {
      req.body.responses = req.body.responses.map((response) => {
        if (response.text) {
          response.text = sanitizeText(response.text, req);
        }
        return response;
      });
    }
  }

  next();
};

// Sanitize URL parameters (if needed)
exports.sanitizeParams = (req, res, next) => {
  for (const param in req.params) {
    if (typeof req.params[param] === "string") {
      req.params[param] = sanitizeText(req.params[param], req);
    }
  }

  next();
};

// Sanitize query parameters
exports.sanitizeQuery = (req, res, next) => {
  for (const query in req.query) {
    if (typeof req.query[query] === "string") {
      req.query[query] = sanitizeText(req.query[query], req);
    }
  }

  next();
};
