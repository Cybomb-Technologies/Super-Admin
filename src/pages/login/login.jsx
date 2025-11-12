import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./login.module.css";

const API_BASE_URL = import.meta.env.VITE_SUPERADMIN_API_URL;

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }

      // ✅ If user requires OTP (Admin), redirect to OTP page
      if (data.requiresOtp) {
        localStorage.setItem("tempToken", data.tempToken);
        localStorage.setItem("user", JSON.stringify(data.user));
        navigate("/admin/verify-otp");
        return;
      }

      // ✅ If backend returns token → store it (Super Admin)
      if (data.token) {
        localStorage.setItem("token", data.token);
        window.dispatchEvent(new Event("tokenChanged"));
      }

      // ✅ Store user
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      // ✅ Navigate immediately after login (Super Admin)
      navigate("/dashboard");
    } catch (err) {
      setError("Network error");
    } finally {
      setIsLoading(false);
    }
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
          <h1 className={styles.title}>Cybomb</h1>
          <h2 className={styles.subtitle}>Super Admin</h2>
        </div>

        {error && (
          <div className={styles.error}>
            <span className={styles.errorIcon}>⚠️</span>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className={styles.form}>
          <div className={styles.inputGroup}>
            <input
              type="email"
              placeholder="Email Address"
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <span className={styles.inputIcon}>📧</span>
          </div>

          <div className={styles.inputGroup}>
            <input
              type="password"
              placeholder="Password"
              className={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span className={styles.inputIcon}>🔒</span>
          </div>

          <button
            type="submit"
            className={`${styles.btn} ${isLoading ? styles.btnLoading : ""}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className={styles.spinner}></span>
            ) : (
              "Login to Dashboard"
            )}
          </button>
        </form>

        <div className={styles.footer}>
          <p className={styles.footerText}>Secure Admin Access</p>
        </div>
      </div>
    </div>
  );
}

export default Login;
