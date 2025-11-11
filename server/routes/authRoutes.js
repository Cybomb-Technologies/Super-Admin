const express = require("express");
const router = express.Router();

const {
  register,
  login,
  logout,
  me,
  verifyOtp,
  resendOtp,
} = require("../controllers/authController");

const { verifyToken } = require("../middleware/authMiddleware");

// ✅ Register SuperAdmin/Admin
router.post("/register", register);

// ✅ Login
router.post("/login", login);

// ✅ Verify OTP
router.post("/verify-otp", verifyOtp);

// ✅ Resend OTP
router.post("/resend-otp", resendOtp);

// ✅ Logout
router.post("/logout", logout);

// ✅ Me
router.get("/me", verifyToken, me);

module.exports = router;
