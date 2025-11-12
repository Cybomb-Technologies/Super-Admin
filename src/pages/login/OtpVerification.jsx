import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./OtpVerification.module.css";

const API_BASE_URL = import.meta.env.VITE_SUPERADMIN_API_URL;

function OtpVerification() {
  const navigate = useNavigate();
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.email) {
      setUserEmail(user.email);
    } else {
      navigate("/admin/login");
    }

    // Start 30-second countdown for resend
    setCountdown(30);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setIsLoading(true);

    try {
      const tempToken = localStorage.getItem("tempToken");

      if (!tempToken) {
        setError("Session expired. Please login again.");
        setTimeout(() => navigate("/admin/login"), 2000);
        return;
      }

      const res = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tempToken, otp }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Invalid OTP");
        return;
      }

      // OTP verified successfully
      localStorage.setItem("token", data.token);
      localStorage.removeItem("tempToken");
      window.dispatchEvent(new Event("tokenChanged"));

      setMessage("OTP verified successfully! Redirecting...");
      setTimeout(() => navigate("/dashboard"), 1000);
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;

    setError("");
    setMessage("");
    setIsResending(true);

    try {
      const tempToken = localStorage.getItem("tempToken");

      if (!tempToken) {
        setError("Session expired. Please login again.");
        setTimeout(() => navigate("/admin/login"), 2000);
        return;
      }

      const res = await fetch(`${API_BASE_URL}/api/auth/resend-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tempToken }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to resend OTP");
        return;
      }

      setMessage("New OTP sent to your email!");
      setOtp("");

      // Start countdown again
      setCountdown(30);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  const handleBackToLogin = () => {
    localStorage.removeItem("tempToken");
    navigate("/admin/login");
  };

  return (
    <div className={styles.container}>
      <div className={styles.background}>
        <div className={styles.shape}></div>
        <div className={styles.shape}></div>
      </div>

      <div className={styles.card}>
        <div className={styles.logoContainer}>
          <div className={styles.logo}>
            <span className={styles.logoIcon}>⚡</span>
          </div>
          <h1 className={styles.title}>Two-Step Verification</h1>
          <p className={styles.subtitle}>
            Enter the OTP sent to
            <br />
            <strong>{userEmail}</strong>
          </p>
        </div>

        {error && (
          <div className={styles.error}>
            <span className={styles.errorIcon}>⚠️</span>
            {error}
          </div>
        )}

        {message && (
          <div className={styles.success}>
            <span className={styles.successIcon}>✅</span>
            {message}
          </div>
        )}

        <form onSubmit={handleVerifyOtp} className={styles.form}>
          <div className={styles.inputGroup}>
            <input
              type="text"
              placeholder="Enter 6-digit OTP"
              className={styles.input}
              value={otp}
              onChange={(e) =>
                setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              maxLength={6}
              required
            />
            <span className={styles.inputIcon}>🔢</span>
          </div>

          <button
            type="submit"
            className={`${styles.btn} ${isLoading ? styles.btnLoading : ""}`}
            disabled={isLoading || otp.length !== 6}
          >
            {isLoading ? (
              <span className={styles.spinner}></span>
            ) : (
              "Verify OTP"
            )}
          </button>
        </form>

        <div className={styles.footer}>
          <button
            onClick={handleResendOtp}
            className={styles.resendBtn}
            disabled={countdown > 0 || isResending}
          >
            {isResending ? (
              <span className={styles.smallSpinner}></span>
            ) : countdown > 0 ? (
              `Resend OTP in ${countdown}s`
            ) : (
              "Resend OTP"
            )}
          </button>

          <button onClick={handleBackToLogin} className={styles.backBtn}>
            ← Back to Login
          </button>

          <p className={styles.footerText}>
            Check your email including spam folder
          </p>
        </div>
      </div>
    </div>
  );
}

export default OtpVerification;
