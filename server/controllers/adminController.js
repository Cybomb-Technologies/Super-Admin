const User = require("../models/User");
const bcrypt = require("bcryptjs");

// ===========================
// GET DASHBOARDS
// ===========================
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

// ===========================
// CREATE USER / ADMIN
// ===========================
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

// ===========================
// GET USERS
// ===========================
exports.getUsers = async (req, res) => {
  try {
    const { role } = req.query; // optional filter by role
    let filter = {};
    if (role) filter.role = role;

    const users = await User.find(filter).select("-password"); // exclude password
    res.status(200).json({
      msg: "Users fetched successfully",
      users,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get single user by ID
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({
      msg: "User fetched successfully",
      user,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ===========================
// UPDATE USER
// ===========================
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, role } = req.body;

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Check email duplication
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser)
        return res.status(400).json({ error: "Email already in use" });
      user.email = email;
    }

    if (name) user.name = name;

    if (role) {
      const validRoles = ["superadmin", "admin"];
      if (!validRoles.includes(role)) {
        return res.status(400).json({ error: "Invalid role" });
      }
      user.role = role;
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
    }

    await user.save();

    res.status(200).json({
      msg: "User updated successfully",
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

// ===========================
// DELETE USER
// ===========================
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: "User not found" });

    await user.deleteOne();

    res.status(200).json({
      msg: "User deleted successfully",
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
