const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.verifyToken = async (req, res, next) => {
  try {
    // Get token from header or cookie
    let token = req.header("Authorization") || req.cookies.token;

    if (token && token.startsWith("Bearer ")) {
      token = token.slice(7, token.length).trim();
    }

    if (!token) {
      return res
        .status(401)
        .json({ error: "Access denied. No token provided." });
    }

    const verified = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(verified.id).select("-password");

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};

exports.requireRole = (role) => {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(403).json({
        error: "Access denied. Insufficient permissions.",
      });
    }
    next();
  };
};

exports.allowRoles = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: "Access denied. Insufficient permissions.",
      });
    }
    next();
  };
};
