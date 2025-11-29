import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import styles from "./Adminheader.module.css";
const API_DJITTRADING_URL = import.meta.env.VITE_DJITTRADING_API_URL;

function Adminheader() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);

  const userName = user?.name || "Admin";
  const firstLetter = userName?.charAt(0)?.toUpperCase();

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_DJITTRADING_URL}/api/notifications`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_DJITTRADING_URL}/api/notifications/${notificationId}/read`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        setUnreadCount(data.unreadCount);
        setNotifications((prev) =>
          prev.map((notif) =>
            notif._id === notificationId ? { ...notif, isRead: true } : notif
          )
        );
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Handle notification click
  const handleNotificationClick = (notification) => {
    markAsRead(notification._id);

    // Redirect based on notification type
    if (notification.type === "newsletter") {
      navigate("/djittrading/Newsletter");
    } else if (notification.type === "coupon") {
      navigate("/djittrading/Coupon-Generator");
    } else if (notification.type === "enrollment") {
        navigate("/djittrading/Enrollment");  
    } else if (notification.type === "user") {
      navigate("/djittrading/users");
    } else if (notification.type === "course") { // ADDED: Course notification
      navigate("/djittrading/course");
    }
    else if (notification.type === "live-chat") { // ADDED: Course notification
      navigate("/djittrading/live-chat");
    }

    setShowNotifications(false);
  };

  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fetch notifications on component mount and set up real-time updates
  useEffect(() => {
    fetchNotifications();

    // Set up Socket.IO for real-time notifications
    if (window.io) {
      window.io.on('newNotification', (data) => {
        setNotifications(prev => [data.notification, ...prev]);
        setUnreadCount(data.unreadCount);
      });
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/admin/login");
  };

  return (
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
            <div className={styles.notificationContainer} ref={notificationRef}>
              <button
                className={styles.notificationBtn}
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <i
                  className="fa-solid fa-bell"
                  style={{ fontSize: "20px", color: "gray" }}
                ></i>

                {unreadCount > 0 && (
                  <span className={styles.notificationBadge}>
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Popup */}
              {showNotifications && (
                <div className={styles.notificationPopup}>
                  <div className={styles.notificationHeader}>
                    <h3>Notifications</h3>
                    {unreadCount > 0 && (
                      <span className={styles.unreadCount}>
                        {unreadCount} unread
                      </span>
                    )}
                  </div>

                  <div className={styles.notificationList}>
                    {notifications.length === 0 ? (
                      <div className={styles.noNotifications}>
                        No notifications
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <div
                          key={notification._id}
                          className={`${styles.notificationItem} ${
                            !notification.isRead ? styles.unread : ""
                          }`}
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <div className={styles.notificationContent}>
                            <h4>{notification.title}</h4>
                            <p>{notification.message}</p>
                            <span className={styles.notificationTime}>
                              {new Date(
                                notification.createdAt
                              ).toLocaleDateString()}
                            </span>
                          </div>
                          {!notification.isRead && (
                            <div className={styles.unreadDot}></div>
                          )}
                        </div>
                      ))
                    )}
                  </div>

                </div>
              )}
            </div>

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