const nodemailer = require("nodemailer");

// Create transporter with better error handling
let transporter;

try {
  transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // Verify transporter configuration
  transporter.verify(function (error, success) {
    if (error) {
      console.log("Email transporter configuration error:", error);
    } else {
      console.log("Email server is ready to send messages");
    }
  });
} catch (error) {
  console.log("Email transporter initialization failed:", error);
}

// Send OTP email with fallback
const sendOtpEmail = async (email, otp) => {
  try {
    // If email credentials are not configured, log OTP to console for development
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || !transporter) {
      console.log(`📧 [DEV MODE] OTP for ${email}: ${otp}`);
      console.log(
        `📧 Note: Configure EMAIL_USER and EMAIL_PASS in .env for real emails`
      );
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
    console.error("❌ Error sending OTP email:", error);

    // Fallback: log OTP to console for development
    console.log(`📧 [FALLBACK] OTP for ${email}: ${otp}`);
    return true; // Still return true to allow login flow to continue
  }
};

module.exports = { sendOtpEmail };
