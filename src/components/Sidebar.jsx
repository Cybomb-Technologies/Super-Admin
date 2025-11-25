// Sidebar.jsx
import React, { useState, useEffect, useMemo } from "react";
import { NavLink, useLocation } from "react-router-dom";
// IMPORT THE CSS MODULE
import styles from "./Sidebar.module.css";

const API_BASE_URL =
  import.meta.env.VITE_CYBOMB_API_BASE || "http://localhost:5002";
const VITE_RANKSEO_API_URL = import.meta.env.VITE_RANKSEO_API_URL || "http://localhost:5001";

const Dropdown = ({ title, items, icon, counts = {} }) => {
  const [open, setOpen] = useState(false);
  const loc = useLocation();

  // Open dropdown if any sub-item is active
  useEffect(() => {
    if (items.some((i) => loc.pathname.startsWith(i.to))) setOpen(true);
  }, [loc.pathname, items]);

  // Get count for specific route
  const getCountForRoute = (label) => {
    // Map the human-readable label back to the count key used in counts prop
    const keyMap = {
      // Cybomb Keys
      "Contacts Submission": "contacts",
      "Enquiry Submission": "popupforms",
      "Career Application": "applications",
      "Job Openings": "jobopenings",
      "Blog Management": "blogs",
      "Press Release": "pressreleases",
      
      // Rank SEO Keys
      "Users": "rankUsers",
      "Support Tickets": "rankSupport",
      "Newsletter": "rankNewsletter",
      "Payments": "rankPayments"
    };

    const lookupKey = keyMap[label];
    return counts[lookupKey] || 0;
  };

  return (
    <li className={styles.menuItem}>
      <button
        className={`${styles.menuButton} ${open ? styles.menuButtonOpen : ""}`}
        onClick={() => setOpen((s) => !s)}
      >
        <div className={styles.menuButtonContent}>
          <span className={styles.linkIcon}>{icon}</span>
          <span className={styles.linkText}>{title}</span>
        </div>
        <span
          className={`${styles.arrow} ${open ? styles.menuButtonOpen : ""}`}
        >
          &#9660;
        </span>
      </button>
      {open && (
        <ul className={styles.submenu}>
          {items.map((it) => {
            const itemCount = getCountForRoute(it.label);
            return (
              <li key={it.to}>
                <NavLink
                  to={it.to}
                  className={({ isActive }) =>
                    `${styles.link} ${isActive ? styles.active : ""}`
                  }
                  onClick={() => {
                    // Close mobile sidebar on link click
                    if (window.innerWidth <= 768) {
                      document
                        .querySelector(`.${styles.sidebar}`)
                        .classList.remove(styles.sidebarOpen);
                      document.querySelector(
                        `.${styles.mobileOverlay}`
                      ).style.display = "none";
                    }
                  }}
                >
                  <span className={styles.linkText}>{it.label}</span>
                  {itemCount > 0 && (
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full min-w-6 text-center">
                      {itemCount}
                    </span>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      )}
    </li>
  );
};

export default function Sidebar() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  
  // State for Counts
  const [cybombCounts, setCybombCounts] = useState({});
  const [rankSeoCounts, setRankSeoCounts] = useState({});
  
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState("");
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");

  // Fetch user data from localStorage
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      setUserName(user.name || "Admin User");
      setUserRole(user.role || "Administrator");
      setUserEmail(user.email || "");
    }
  }, []);

  // Listen for user data changes
  useEffect(() => {
    const handleUserChange = () => {
      const user = JSON.parse(localStorage.getItem("user"));
      if (user) {
        setUserName(user.name || "Admin User");
        setUserRole(user.role || "Administrator");
        setUserEmail(user.email || "");
      }
    };

    window.addEventListener("storage", handleUserChange);
    window.addEventListener("tokenChanged", handleUserChange);

    return () => {
      window.removeEventListener("storage", handleUserChange);
      window.removeEventListener("tokenChanged", handleUserChange);
    };
  }, []);

  // --- FETCH CYBOMB COUNTS ---
  const fetchCybombCounts = async () => {
    try {
      const endpoints = [
        { key: "popupforms", url: `${API_BASE_URL}/api/popup-mail` },
        { key: "contacts", url: `${API_BASE_URL}/api/contact` },
        { key: "applications", url: `${API_BASE_URL}/api/application` },
        { key: "blogs", url: `${API_BASE_URL}/api/blog` },
        { key: "jobopenings", url: `${API_BASE_URL}/api/applications` },
        { key: "pressreleases", url: `${API_BASE_URL}/api/pressrelease` },
      ];

      const results = {};

      // Set all counts to 0 initially
      endpoints.forEach(endpoint => {
        results[endpoint.key] = 0;
      });

      // Fetch counts in parallel with timeout
      const fetchPromises = endpoints.map(async (endpoint) => {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
          
          const response = await fetch(endpoint.url, { 
            signal: controller.signal 
          });
          clearTimeout(timeoutId);
          
          if (response.ok) {
            const data = await response.json();
            if (endpoint.key === "popupforms") {
              results[endpoint.key] = Array.isArray(data) ? data.length : 0;
            } else {
              results[endpoint.key] = Array.isArray(data?.data)
                ? data.data.length
                : Array.isArray(data)
                ? data.length
                : 0;
            }
          }
        } catch (error) {
          if (error.name !== 'AbortError') {
            console.error(`Error fetching ${endpoint.key}:`, error);
          }
          // Keep default 0 value on error
        }
      });

      await Promise.allSettled(fetchPromises);
      setCybombCounts(results);
    } catch (error) {
      console.error("Error in fetchCybombCounts:", error);
      // Set empty counts on major error
      setCybombCounts({});
    }
  };
// --- FETCH RANK SEO COUNTS ---
  const fetchRankSeoCounts = async () => {
    try {
      // Authentication check removed. 
      // Ensure your backend endpoints are public or this will fail with 401.
      
      const headers = { 
        'Content-Type': 'application/json'
      };

      // Helper to fetch and count array length
      const fetchCount = async (url) => {
        try {
          const res = await fetch(url, { headers });
          if(res.ok) {
            const data = await res.json();
            // Handle different response structures
            if (Array.isArray(data)) return data.length;
            if (Array.isArray(data.users)) return data.users.length;
            if (Array.isArray(data.payments)) return data.payments.length;
            if (Array.isArray(data.subscribers)) return data.subscribers.length;
            if (Array.isArray(data.messages)) return data.messages.length;
            return 0;
          }
          return 0;
        } catch(e) { 
          console.log(`Failed to fetch from ${url}:`, e.message);
          return 0; 
        }
      };

      // Helper to fetch stats object
      const fetchStats = async (url, statKey) => {
        try {
          const res = await fetch(url, { headers });
          if(res.ok) {
            const data = await res.json();
            // Navigate nested stats object
            if (data.stats && data.stats[statKey] !== undefined) {
              return data.stats[statKey];
            }
            // If stats is at root level
            if (data[statKey] !== undefined) {
              return data[statKey];
            }
          }
          return 0;
        } catch(e) { 
          console.log(`Failed to fetch stats from ${url}:`, e.message);
          return 0; 
        }
      };

      // Fetch counts with error handling for each endpoint
      const results = {
        rankUsers: await fetchCount(`${VITE_RANKSEO_API_URL}/api/admin/dashboard`),
        rankPayments: await fetchCount(`${VITE_RANKSEO_API_URL}/api/admin/payments`),
        rankSupport: await fetchStats(`${VITE_RANKSEO_API_URL}/api/admin/support/stats`, 'new') || 
                     await fetchCount(`${VITE_RANKSEO_API_URL}/api/admin/support/messages?status=new`),
        rankNewsletter: await fetchStats(`${VITE_RANKSEO_API_URL}/api/admin/newsletter/stats`, 'total') ||
                        await fetchCount(`${VITE_RANKSEO_API_URL}/api/admin/newsletter`)
      };

      setRankSeoCounts(results);

    } catch (error) {
      console.error("Error fetching Rank SEO counts:", error);
      // Set empty counts on error
      setRankSeoCounts({});
    }
  };

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      try {
        await Promise.allSettled([fetchCybombCounts(), fetchRankSeoCounts()]);
      } catch (error) {
        console.error("Error loading sidebar data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadAll();

    // Refresh counts every 60 seconds instead of 30
    const interval = setInterval(() => {
      fetchCybombCounts();
      fetchRankSeoCounts();
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);

  // --- MENU ITEMS DEFINITIONS ---

  const rankSeoItems = [
    { to: "/rankseo/dashboard", label: "Dashboard" },
    { to: "/rankseo/users", label: "Users", countKey: "rankUsers" },
    { to: "/rankseo/audit", label: "Audit Logs" },
    { to: "/rankseo/pricing", label: "Pricing Plans" },
    { to: "/rankseo/payments", label: "Payments", countKey: "rankPayments" },
    { to: "/rankseo/newsletter", label: "Newsletter", countKey: "rankNewsletter" },
    { to: "/rankseo/support", label: "Support Tickets", countKey: "rankSupport" },
  ];

  const cybombItems = [
    { to: "/cybomb/dashboard-overview", label: "Dashboard" },
    {
      to: "/cybomb/form-submission",
      label: "Contacts Submission",
      countKey: "contacts",
    },
    {
      to: "/cybomb/enquiry-application",
      label: "Enquiry Submission",
      countKey: "popupforms",
    },
    {
      to: "/cybomb/career-application-manager",
      label: "Career Application",
      countKey: "applications",
    },
    {
      to: "/cybomb/career-application",
      label: "Job Openings",
      countKey: "jobopenings",
    },
    {
      to: "/cybomb/blog-management",
      label: "Blog Management",
      countKey: "blogs",
    },
    {
      to: "/cybomb/press-release",
      label: "Press Release",
      countKey: "pressreleases",
    },
    { to: "/cybomb/news-letter", label: "Newsletter" },
  ];

  const adminItems = [{ to: "/admin/add-admin", label: "Add Admin" }];

  const aitals = [
    { to: "/aitals/dashboard", label: "Dashboard" },
    { to: "/aitals/enquiry", label: "Enquiry Data" },
    { to: "/aitals/contact-forms", label: "Contact Form" },
    { to: "/aitals/application", label: "Application" },
    { to: "/aitals/job-openings", label: "Job Opening" },
    { to: "/aitals/blog", label: "Blog Manager" },
    { to: "/aitals/newsletter-subscribers", label: "Newsletter Subscribers" },
    { to: "/aitals/admin-register", label: "Admin Register" },
  ];

  const socialmedia = [
    { to: "/social-media/dashboard", label: "Dashboard" },
    { to: "/social-media/promotional-request", label: "Promotional Request" },
    { to: "/social-media/customers", label: "Customers" },
    { to: "/social-media/users", label: "Users" },
    { to: "/social-media/contact", label: "Contact Message" },
  ];

  const pdfworks = [
    { to: "/pdf-works/dashboard", label: "Dashboard" },
    { to: "/pdf-works/user", label: "User" },
    { to: "/pdf-works/contact-details", label: "Contact Details" },
    { to: "/pdf-works/admin-details", label: "Admin Details" },
  ];

  const djittrading = [
    { to: "/djittrading/live-chat", label: "Live Chat" },
    { to: "/djittrading/dashboard", label: "Dashboard" },
    { to: "/djittrading/course", label: "Courses" },
    { to: "/djittrading/users", label: "User" },
    { to: "/djittrading/Enrollment", label: "Enrollment" },
    { to: "/djittrading/Coupon-Generator", label: "Coupon Generator" },
     { to: "/djittrading/Newsletter", label: "Newsletter" },
  ];

  // Prepare counts for Cybomb dropdown
  const cybombDropdownCounts = useMemo(() => {
    return cybombItems.reduce((acc, item) => {
      if (item.countKey && cybombCounts[item.countKey] !== undefined) {
        acc[item.countKey] = cybombCounts[item.countKey];
      }
      return acc;
    }, {});
  }, [cybombCounts, cybombItems]);

  // Prepare counts for Rank SEO dropdown
  const rankSeoDropdownCounts = useMemo(() => {
    return rankSeoItems.reduce((acc, item) => {
      if (item.countKey && rankSeoCounts[item.countKey] !== undefined) {
        acc[item.countKey] = rankSeoCounts[item.countKey];
      }
      return acc;
    }, {});
  }, [rankSeoCounts, rankSeoItems]);

  // Get first letter of user's name for avatar
  const firstLetter = userName?.charAt(0)?.toUpperCase() || "A";

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className={styles.mobileOverlay}
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile Header */}
      <div className={styles.mobileHeader}>
        <button
          className={styles.mobileToggle}
          onClick={() => setIsMobileOpen(!isMobileOpen)}
        >
          ☰
        </button>
        <div className={styles.mobileBrand}>
          <div className={styles.brandLogo}>⚡</div>
          <span className="font-semibold">Rank SEO Admin</span>
        </div>
      </div>

      {/* Sidebar */}
      <aside
        className={`${styles.sidebar} ${
          isMobileOpen ? styles.sidebarOpen : ""
        }`}
      >
        {/* Brand Section */}
        <div className={styles.brand}>
          <div className={styles.brandLogoContainer}>
            <div className={styles.brandLogo}>⚡</div>
          </div>
          <div className={styles.brandTextContainer}>
            <div className={styles.brandTitle}>
              Rank SEO Admin
            </div>
            <div className={styles.brandSubtitle}>Administration Panel</div>
          </div>
        </div>

        {/* Navigation */}
        <nav className={styles.nav}>
          <ul className={styles.menu}>
            {/* Main Dashboard Link */}
            <li className={styles.menuItem}>
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  `${styles.link} ${isActive ? styles.active : ""}`
                }
                onClick={() => setIsMobileOpen(false)}
              >
                <span className={styles.linkIcon}>📊</span>
                <span className={styles.linkText}>Dashboard</span>
              </NavLink>
            </li>

            {/* Admin Dropdown - Only for Super Admin */}
            {userRole === "superadmin" && (
              <Dropdown
                title="Admin"
                items={adminItems}
                icon="👨‍💼"
                counts={{}}
              />
            )}

            {/* Rank SEO Dropdown (NEW) */}
            <Dropdown
              title="Rank SEO"
              items={rankSeoItems}
              icon="📈"
              counts={rankSeoDropdownCounts}
            />

            {/* Cybomb Dropdown */}
            <Dropdown
              title="Cybomb"
              items={cybombItems}
              icon="🚀"
              counts={cybombDropdownCounts}
            />

            {/* Other Dropdowns */}
            <Dropdown
              title="Aitals Tech"
              items={aitals}
              icon="📄"
              counts={{}}
            />
            <Dropdown
              title="PDF Works"
              items={pdfworks}
              icon="📄"
              counts={{}}
            />
            <Dropdown
              title="Social Media"
              items={socialmedia}
              icon="💹"
              counts={{}}
            />
            <Dropdown
              title="DjitTrading"
              items={djittrading}
              icon="💬"
              counts={{}}
            />
          </ul>
        </nav>

        {/* Sidebar Footer */}
        <div className={styles.sidebarFooter}>
          <div className={styles.userInfo}>
            <div className={styles.userAvatar}>{firstLetter}</div>
            <div className={styles.userDetails}>
              <div className={styles.userName}>{userName}</div>
              <div className={styles.userRole}>
                {userRole === "superadmin"
                  ? "Super Administrator"
                  : "Administrator"}
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}