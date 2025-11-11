const express = require("express");
const router = express.Router();

const {
  superAdminDashboard,
  adminDashboard,
} = require("../controllers/adminController");

const {
  verifyToken,
  requireRole,
  allowRoles,
} = require("../middleware/authMiddleware");

// ✅ Super Admin only routes
router.get("/super-dashboard",
  verifyToken,
  superAdminDashboard
);

// ✅ Admin + Super Admin
router.get("/dashboard",
  verifyToken,
  adminDashboard
);

module.exports = router;
