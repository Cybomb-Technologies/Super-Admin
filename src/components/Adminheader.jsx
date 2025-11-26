import { useNavigate } from "react-router-dom";
import styles from "./Adminheader.module.css"; // Import the module

function Adminheader() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const userName = user?.name || "Admin"; // Added fallback
  const firstLetter = userName?.charAt(0)?.toUpperCase();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/admin/login");
  };

  return (
    // Use styles.adminHeader instead of "admin-header"
    <header className={styles.adminHeader}>
      <div className={styles.headerContent}>
        
        {/* Left Side: Title */}
        <div className={styles.headerLeft}>
          <h1 className={styles.pageTitle}>Dashboard Overview</h1>
        </div>

        {/* Right Side: Actions */}
        <div className={styles.headerRight}>
          <div className={styles.headerActions}>
            
            {/* Notification Button */}
            <button className={styles.notificationBtn}>
              <i className="fa-solid fa-bell"></i>
              <span className={styles.notificationBadge}>3</span>
            </button>

            {/* User Profile */}
            <div className={styles.userMenu}>
              <div className={styles.userAvatar}>{firstLetter}</div>
              <div className={styles.userInfo}>
                <span className={styles.userName}>{userName}</span>
                <span className={styles.userRole}>Administrator</span>
              </div>
            </div>

            {/* Logout Button */}
            <button className={styles.logoutBtn} onClick={handleLogout}>
              <i className="fas fa-sign-out-alt"></i>
              Logout
            </button>
            
          </div>
        </div>
      </div>
    </header>
  );
}

export default Adminheader;