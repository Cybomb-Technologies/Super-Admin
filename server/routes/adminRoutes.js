const express = require("express");
const router = express.Router();

const {
  superAdminDashboard,
  adminDashboard,
  addAdmin,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
} = require("../controllers/adminController");

const {
  verifyToken,
  requireRole,
  allowRoles,
} = require("../middleware/authMiddleware");
// ===========================
// DASHBOARDS
// ===========================
router.get("/super-dashboard", verifyToken, requireRole("superadmin"), superAdminDashboard);
router.get("/dashboard", verifyToken, allowRoles(["admin", "superadmin"]), adminDashboard);

// ===========================
// CREATE / ADD
// ===========================
router.post("/add-admin", verifyToken, requireRole("superadmin"), addAdmin);
// ===========================
// READ / GET USERS
// ===========================
// Get all users or filter by role (admin + superadmin)
router.get("/users", verifyToken, allowRoles(["admin", "superadmin"]), getUsers);
// Get single user by ID
router.get("/users/:id", verifyToken, allowRoles(["admin", "superadmin"]), getUserById);
// ===========================
// UPDATE USER
// ===========================
router.put("/users/:id", verifyToken, requireRole("superadmin"), updateUser); 
// Only superadmin can update user/admin info
// ===========================
// DELETE USER
// ===========================
router.delete("/users/:id", verifyToken, requireRole("superadmin"), deleteUser); 
// Only superadmin can delete users/admins
module.exports = router;
