const { verifyToken } = require('../config/jwt');

/**
 * Protect middleware - Verify JWT token
 * Attaches user info to request object
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.substring(7); // Remove "Bearer " prefix
    }

    // Check for token in cookies (alternative method)
    if (!token && req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    // No token found
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No authentication token provided. Please login.',
      });
    }

    // Verify token
    const decoded = verifyToken(token);

    // Attach user info to request
    req.user = {
      id: decoded.id,
      role: decoded.role,
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired. Please login again.',
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. Please login again.',
      });
    }

    res.status(401).json({
      success: false,
      message: 'Authentication failed. Please login.',
      error: error.message,
    });
  }
};

/**
 * Authorize middleware - Restrict access to specific roles
 * @param {...string} roles - Allowed roles (e.g., 'admin', 'customer')
 * @returns {function} Middleware function
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    // Check if user exists (protect middleware should run first)
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    // Check if user role is authorized
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role(s): ${roles.join(', ')}. Your role: ${req.user.role}`,
      });
    }

    next();
  };
};

/**
 * Optional auth middleware - Attach user if token exists, but don't require it
 */
const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.substring(7);
    }

    if (!token && req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (token) {
      const decoded = verifyToken(token);
      req.user = {
        id: decoded.id,
        role: decoded.role,
      };
    }

    next();
  } catch (error) {
    // Continue without user info if token is invalid
    next();
  }
};

/**
 * Check if user is admin (shorthand for authorize with admin role)
 */
const isAdmin = authorize('admin');

/**
 * Check if user is customer (shorthand for authorize with customer role)
 */
const isCustomer = authorize('customer');

/**
 * Check if user owns the resource
 * @param {string} userIdParam - The request parameter name containing user ID (e.g., 'userId')
 * @returns {function} Middleware function
 */
const isOwner = (userIdParam = 'userId') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const resourceUserId = req.params[userIdParam];

    // Allow if user is admin or owns the resource
    if (req.user.role === 'admin' || req.user.id === resourceUserId) {
      next();
    } else {
      res.status(403).json({
        success: false,
        message: 'Access denied. You can only access your own resources.',
      });
    }
  };
};

module.exports = {
  protect,
  authorize,
  optionalAuth,
  isAdmin,
  isCustomer,
  isOwner,
};
