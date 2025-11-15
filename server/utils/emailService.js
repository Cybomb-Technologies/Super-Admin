const nodemailer = require("nodemailer");

// Create transporter using Hostinger SMTP
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.hostinger.com",
  port: process.env.EMAIL_PORT ? Number(process.env.EMAIL_PORT) : 587,
  secure: process.env.EMAIL_PORT == 465 ? true : false, // true for 465, false for 587
  auth: {
    user: process.env.EMAIL_USER, // Hostinger email
    pass: process.env.EMAIL_PASS, // Email password or App Password
  },
});

// Verify transporter configuration
transporter.verify((error, success) => {
  if (error) {
    console.log("❌ Email transporter configuration error:", error.message);
    console.log("📧 OTP emails will fallback to console logging until fixed.");
  } else {
    console.log("✅ Email server is ready to send messages");
  }
});

// Function to send OTP email
const sendOtpEmail = async (email, otp) => {
  try {
    // If transporter is not ready, fallback to console
    if (!transporter || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log(`📧 [DEV MODE] OTP for ${email}: ${otp}`);
      return true;
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP for Admin Login - Cybomb",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 28px;">⚡ Cybomb Admin</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">Two-Step Verification</p>
          </div>
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #333; margin-bottom: 20px;">Your Verification Code</h2>
            <div style="background: white; padding: 20px; border-radius: 10px; text-align: center; border: 2px dashed #667eea;">
              <div style="font-size: 32px; font-weight: bold; letter-spacing: 10px; color: #667eea; margin: 20px 0;">
                ${otp}
              </div>
              <p style="color: #666; margin: 0;">This OTP will expire in 10 minutes</p>
            </div>
            <p style="color: #888; font-size: 14px; margin-top: 20px;">
              If you didn't request this code, please ignore this email.
            </p>
          </div>
          <div style="background: #333; padding: 20px; text-align: center; color: white;">
            <p style="margin: 0; font-size: 14px;">&copy; 2024 Cybomb Admin Panel. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ OTP sent to ${email}`);
    return true;
  } catch (error) {
    console.error("❌ Error sending OTP email:", error.message);
    console.log(`📧 [FALLBACK] OTP for ${email}: ${otp}`);
    return true;
  }
};

module.exports = { sendOtpEmail };
