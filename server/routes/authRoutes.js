const express = require("express");
const router = express.Router();

const {
  register,
  login,
  logout,
  me,
} = require("../controllers/authController");

const { verifyToken } = require("../middleware/authMiddleware");

// ✅ Register SuperAdmin/Admin
router.post("/register", register);

// ✅ Login
router.post("/login", login);

// ✅ Logout
router.post("/logout", logout);

// ✅ Me
router.get("/me", verifyToken, me);

module.exports = router;
