/**
 * Middleware to sanitize user inputs to prevent XSS attacks
 * Can be used on specific routes or globally
 */

// Sanitizes fields in request body
exports.sanitizeBody = (req, res, next) => {
  if (req.body) {
    // Sanitize common text fields
    const fieldsToSanitize = ["name", "title", "description", "text", "email"];

    fieldsToSanitize.forEach((field) => {
      if (req.body[field] && typeof req.body[field] === "string") {
        req.body[field] = req.expressSanitizer(req.body[field]);
      }
    });

    // Handle nested objects like in ticket responses
    if (req.body.responses) {
      req.body.responses = req.body.responses.map((response) => {
        if (response.text) {
          response.text = req.expressSanitizer(response.text);
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
      req.params[param] = req.expressSanitizer(req.params[param]);
    }
  }

  next();
};

// Sanitize query parameters
exports.sanitizeQuery = (req, res, next) => {
  for (const query in req.query) {
    if (typeof req.query[query] === "string") {
      req.query[query] = req.expressSanitizer(req.query[query]);
    }
  }

  next();
};
