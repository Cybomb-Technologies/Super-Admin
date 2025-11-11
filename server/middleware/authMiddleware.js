const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ✅ Verify Token
exports.verifyToken = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) return res.status(401).json({ error: "Not authorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};

// ✅ If specific role needed
exports.requireRole = (role) => {
  return (req, res, next) => {
    if (req.user.role !== role)
      return res.status(403).json({ error: "Access denied" });

    next();
  };
};

// ✅ Allow multiple roles
exports.allowRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role))
      return res.status(403).json({ error: "Permission denied" });

    next();
  };
};
