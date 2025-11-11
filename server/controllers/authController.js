const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendOtpEmail } = require("../utils/emailService");

// Register (only for setup → superadmin create)
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const validRoles = ["superadmin", "admin"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashed,
      role,
    });

    res.status(201).json({ msg: "User created", userId: user._id });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const matched = await bcrypt.compare(password, user.password);
    if (!matched) return res.status(401).json({ error: "Invalid credentials" });

    // For Super Admin: Direct login without OTP
    if (user.role === "superadmin") {
      const token = jwt.sign(
        { id: user._id, role: user.role, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );

      // Save token inside cookie
      res.cookie("token", token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 24 * 60 * 60 * 1000,
      });

      // Return token in response
      res.json({
        msg: "Logged in",
        token: token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    }
    // For Admin: Send OTP for two-step verification
    else if (user.role === "admin") {
      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Save OTP to user
      user.otp = otp;
      user.otpExpires = otpExpires;
      await user.save();

      // Send OTP via email (with fallback to console log)
      await sendOtpEmail(user.email, otp);

      // Generate temporary token for OTP verification (short expiry)
      const tempToken = jwt.sign(
        {
          id: user._id,
          role: user.role,
          email: user.email,
          requiresOtp: true,
        },
        process.env.JWT_SECRET,
        { expiresIn: "15m" } // Short expiry for OTP verification
      );

      res.json({
        msg: "OTP sent to your email",
        requiresOtp: true,
        tempToken: tempToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    }
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Internal server error during login" });
  }
};

// Verify OTP
exports.verifyOtp = async (req, res) => {
  try {
    const { tempToken, otp } = req.body;

    if (!tempToken || !otp) {
      return res.status(400).json({ error: "Token and OTP are required" });
    }

    // Verify temporary token
    let decoded;
    try {
      decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    // Find user
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if OTP matches and is not expired
    if (user.otp !== otp) {
      return res.status(401).json({ error: "Invalid OTP" });
    }

    if (user.otpExpires < new Date()) {
      return res.status(401).json({ error: "OTP has expired" });
    }

    // Clear OTP after successful verification
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    // Generate final login token
    const finalToken = jwt.sign(
      { id: user._id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Save token in cookie
    res.cookie("token", finalToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.json({
      msg: "OTP verified successfully",
      token: finalToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("OTP verification error:", err);
    res
      .status(500)
      .json({ error: "Internal server error during OTP verification" });
  }
};

// Resend OTP
exports.resendOtp = async (req, res) => {
  try {
    const { tempToken } = req.body;

    if (!tempToken) {
      return res.status(400).json({ error: "Token is required" });
    }

    // Verify temporary token
    let decoded;
    try {
      decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    // Find user
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save new OTP to user
    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    // Send new OTP via email (with fallback to console log)
    await sendOtpEmail(user.email, otp);

    res.json({
      msg: "New OTP sent to your email",
      requiresOtp: true,
    });
  } catch (err) {
    console.error("Resend OTP error:", err);
    res
      .status(500)
      .json({ error: "Internal server error while resending OTP" });
  }
};

exports.logout = (req, res) => {
  res.clearCookie("token", { httpOnly: true, sameSite: "lax" });
  res.json({ msg: "Logged out" });
};

exports.me = (req, res) => {
  res.json({ user: req.user });
};
