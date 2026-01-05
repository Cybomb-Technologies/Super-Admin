import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import styles from "./Adminheader.module.css";
const API_DJITTRADING_URL = import.meta.env.VITE_DJITTRADING_API_URL;
const API_CYBOMB_URL = import.meta.env.VITE_CYBOMB_API_BASE;
const API_AITALS_URL = import.meta.env.VITE_AITALS_API_URL;

function Adminheader() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user"));

  // Dynamic Title based on route
  const getPageTitle = (path) => {
    if (path.includes("/startup-builder/users")) return "Startup Builder";
    if (path.includes("/startup-builder/analytics")) return "Analytics";
    if (path.includes("/startup-builder/pricing")) return "Pricing Manager";
    if (path.includes("/pdf-works")) return "PDF Works";
    if (path.includes("/cybomb")) return "Cybomb Admin";
    if (path.includes("/djittrading")) return "DJI Trading";
    if (path.includes("/rankseo")) return "Rank SEO";
    return "Dashboard Overview";
  };

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);

  const userName = user?.name || "Admin";
  const firstLetter = userName?.charAt(0)?.toUpperCase();
  // ... (rest of the fetching logic remains)
  // Skipping to line 212 for the return statement update

  // Fetch notifications from all sources
  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      const endpoints = [
        {
          url: `${API_DJITTRADING_URL}/api/notifications`,
          source: 'djittrading'
        },
        {
          url: `${API_CYBOMB_URL}/api/notifications`,
          source: 'cybomb'
        },
        {
          url: `${API_AITALS_URL}/api/notifications`,
          source: 'aitals'
        }
      ];

      const promises = endpoints.map(endpoint =>
        fetch(endpoint.url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
          .then(response => response.json())
          .then(data => ({
            ...data,
            source: endpoint.source
          }))
          .catch(error => {
            console.error(`Error fetching notifications from ${endpoint.source}:`, error);
            return { success: false, notifications: [], source: endpoint.source };
          })
      );

      const results = await Promise.all(promises);

      let allNotifications = [];
      let totalUnread = 0;

      results.forEach(result => {
        if (result.success) {
          // Add source information to each notification
          const notificationsWithSource = result.notifications.map(notification => ({
            ...notification,
            source: result.source
          }));
          allNotifications = [...allNotifications, ...notificationsWithSource];
          totalUnread += result.unreadCount || 0;
        }
      });

      // Sort all notifications by date (newest first)
      allNotifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setNotifications(allNotifications);
      setUnreadCount(totalUnread);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  // Mark notification as read based on source
  const markAsRead = async (notificationId, source) => {
    try {
      const token = localStorage.getItem("token");
      let url;

      // Determine the API endpoint based on source
      switch (source) {
        case 'djittrading':
          url = `${API_DJITTRADING_URL}/api/notifications/${notificationId}/read`;
          break;
        case 'cybomb':
          url = `${API_CYBOMB_URL}/api/notifications/${notificationId}/read`;
          break;
        case 'aitals':
          url = `${API_AITALS_URL}/api/notifications/${notificationId}/read`;
          break;
        default:
          url = `${API_DJITTRADING_URL}/api/notifications/${notificationId}/read`;
      }

      const response = await fetch(url, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
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

  // Handle notification click with source-specific routing
  const handleNotificationClick = (notification) => {
    markAsRead(notification._id, notification.source);

    // Redirect based on notification source and type
    if (notification.source === 'djittrading') {
      // DJITTRADING routing (existing logic)
      if (notification.type === "newsletter") {
        navigate("/djittrading/Newsletter");
      } else if (notification.type === "coupon") {
        navigate("/djittrading/Coupon-Generator");
      } else if (notification.type === "enrollment") {
        navigate("/djittrading/Enrollment");
      } else if (notification.type === "user") {
        navigate("/djittrading/users");
      } else if (notification.type === "course") {
        navigate("/djittrading/course");
      } else if (notification.type === "live-chat") {
        navigate("/djittrading/live-chat");
      }
    } else if (notification.source === 'cybomb') {
      // CYBOMB routing (existing logic)
      if (notification.type === "cybomb-newsletter") {
        navigate("/cybomb/news-letter");
      } else if (notification.type === "cybomb-contact") {
        navigate("/cybomb/form-submission");
      } else if (notification.type === "cybomb-appication") {
        navigate("/cybomb/career-application-manager");
      } else if (notification.type === "cybomb-blog") {
        navigate("/cybomb/blog-management");
      } else if (notification.type === "course") {
        navigate("/cybomb/course");
      } else if (notification.type === "live-chat") {
        navigate("/cybomb/live-chat");
      }
    } else if (notification.source === 'aitals') {
      // AITALS routing (new logic)
      if (notification.type === "aitals-blog") {
        navigate("/aitals/blog");
      } else if (notification.type === "aitals-contact") {
        navigate("/aitals/contact-forms");
      } else if (notification.type === "aitals-newsletter") {
        navigate("/aitals/newsletter-subscribers");
      } else if (notification.type === "aitals-application") {
        navigate("/aitals/application");
      }
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
          <h1 className={styles.pageTitle}>{getPageTitle(location.pathname)}</h1>
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
                    <h3 style={{ color: "black" }}>Notifications</h3>
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
                          key={`${notification.source}-${notification._id}`}
                          className={`${styles.notificationItem} ${!notification.isRead ? styles.unread : ""
                            }`}
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <div className={styles.notificationContent}>
                            <div className={styles.notificationHeaderRow}>
                              <h4>{notification.title}</h4>
                              <span className={styles.notificationSource}>
                                {notification.source}
                              </span>
                            </div>
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