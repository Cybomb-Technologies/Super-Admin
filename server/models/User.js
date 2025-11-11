const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["superadmin", "admin"],
    default: "admin",
  },
  // OTP fields for admin two-step verification
  otp: { type: String },
  otpExpires: { type: Date },
});

module.exports = mongoose.model("User", userSchema);
