const express = require("express");
const router = express.Router();

const {
  superAdminDashboard,
  adminDashboard,
  addAdmin,
} = require("../controllers/adminController");

const {
  verifyToken,
  requireRole,
  allowRoles,
} = require("../middleware/authMiddleware");

// ✅ Super Admin only routes
router.get("/super-dashboard", verifyToken, superAdminDashboard);

// ✅ Add new admin (Super Admin only)
router.post("/add-admin", verifyToken, requireRole("superadmin"), addAdmin);

// ✅ Admin + Super Admin
router.get("/dashboard", verifyToken, adminDashboard);

module.exports = router;
