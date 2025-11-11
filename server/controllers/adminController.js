const User = require("../models/User");
const bcrypt = require("bcryptjs");

exports.superAdminDashboard = (req, res) => {
  res.json({
    msg: "Super Admin Panel",
    user: req.user,
  });
};

exports.adminDashboard = (req, res) => {
  res.json({
    msg: "Admin Panel Access",
    user: req.user,
  });
};

// Add new admin (only superadmin can access)
exports.addAdmin = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ error: "User already exists with this email" });
    }

    // Validate role
    const validRoles = ["superadmin", "admin"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    res.status(201).json({
      msg: "Admin created successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
