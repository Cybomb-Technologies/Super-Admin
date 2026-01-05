import React, { useState, useEffect, useMemo } from "react";
import { NavLink, useLocation } from "react-router-dom";
import styles from "./Sidebar.module.css";

// VITE SYNTAX for Environment Variables
const API_BASE_URL = import.meta.env.VITE_CYBOMB_API_BASE || "http://localhost:5002";
const VITE_RANKSEO_API_URL = import.meta.env.VITE_RANKSEO_API_URL || "http://localhost:5001";

const Dropdown = ({ title, items, icon, counts = {}, onTabChange, isCollapsed }) => {
  const [open, setOpen] = useState(false);
  const loc = useLocation();

  // Open dropdown if any sub-item is active
  useEffect(() => {
    if (items.some((i) => loc.pathname.startsWith(i.to))) setOpen(true);
  }, [loc.pathname, items]);

  // Force close dropdown if sidebar is collapsed
  useEffect(() => {
    if (isCollapsed) setOpen(false);
  }, [isCollapsed]);

  const getCountForRoute = (label) => {
    const keyMap = {
      // Cybomb Keys
      "Contacts Submission": "contacts",
      "Enquiry Submission": "popupforms",
      "Career Application": "applications",
      "Job Openings": "jobopenings",
      "Blog Management": "blogs",
      "Press Release": "pressreleases",

      // Rank SEO Keys
      "Overview": "rankOverview",
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
        className={`${styles.menuButton} ${open ? styles.menuButtonOpen : ""} ${isCollapsed ? styles.collapsedMenuButton : ""}`}
        onClick={() => !isCollapsed && setOpen((s) => !s)}
        title={isCollapsed ? title : ""}
      >
        <div className={styles.menuButtonContent}>
          <span className={styles.linkIcon}>{icon}</span>
          {!isCollapsed && <span className={styles.linkText}>{title}</span>}
        </div>
        {!isCollapsed && (
          <span className={`${styles.arrow} ${open ? styles.menuButtonOpen : ""}`}>
            &#9660;
          </span>
        )}
      </button>
      {open && !isCollapsed && (
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
                      const sidebar = document.querySelector(`.${styles.sidebar}`);
                      const overlay = document.querySelector(`.${styles.mobileOverlay}`);
                      if (sidebar) sidebar.classList.remove(styles.sidebarOpen);
                      if (overlay) overlay.style.display = "none";
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

export default function Sidebar({ onRankSeoTabChange, rankSeoData, isCollapsed, toggleSidebar }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [cybombCounts, setCybombCounts] = useState({});
  const [rankSeoCounts, setRankSeoCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState("");
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      setUserName(user.name || "Admin User");
      setUserRole(user.role || "Administrator");
    }
  }, []);

  // --- FETCH COUNTS LOGIC ---
  const fetchRankSeoCounts = async () => {
    try {
      const headers = { 'Content-Type': 'application/json' };
      const fetchCount = async (url) => {
        try {
          const res = await fetch(url, { headers });
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data)) return data.length;
            if (Array.isArray(data.users)) return data.users.length;
            if (Array.isArray(data.payments)) return data.payments.length;
            return 0;
          }
          return 0;
        } catch (e) { return 0; }
      };

      // Simplified stats fetching for Sidebar badges
      const results = {
        rankUsers: await fetchCount(`${VITE_RANKSEO_API_URL}/api/admin/users`),
        rankPayments: await fetchCount(`${VITE_RANKSEO_API_URL}/api/admin/payments`),
        // Add other endpoints as needed
      };

      setRankSeoCounts(prev => ({ ...prev, ...results }));
    } catch (error) {
      console.error("Error fetching Rank SEO counts:", error);
    }
  };

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
      await Promise.allSettled(endpoints.map(async (endpoint) => {
        try {
          const response = await fetch(endpoint.url);
          if (response.ok) {
            const data = await response.json();
            if (endpoint.key === "popupforms") {
              results[endpoint.key] = Array.isArray(data) ? data.length : 0;
            } else {
              results[endpoint.key] = Array.isArray(data?.data) ? data.data.length : Array.isArray(data) ? data.length : 0;
            }
          }
        } catch (error) { console.error(error); }
      }));

      setCybombCounts(prev => ({ ...prev, ...results }));
    } catch (error) {
      console.error("Error in fetchCybombCounts:", error);
    }
  };

  useEffect(() => {
    fetchCybombCounts();
    fetchRankSeoCounts();
  }, []);

  // --- MENU CONFIG ---
  const rankSeoItems = [
    { to: "/rankseo/dashboard", label: "Overview", countKey: "rankOverview" },
    { to: "/rankseo/users", label: "Users", countKey: "rankUsers" },
    { to: "/rankseo/audit", label: "Audit Logs" },
    { to: "/rankseo/pricing", label: "Pricing Plans" },
    { to: "/rankseo/payments", label: "Payments", countKey: "rankPayments" },
    { to: "/rankseo/newsletter", label: "Newsletter", countKey: "rankNewsletter" },
    { to: "/rankseo/support", label: "Support Tickets", countKey: "rankSupport" },
  ];

  const cybombItems = [
    { to: "/cybomb/dashboard-overview", label: "Dashboard" },
    { to: "/cybomb/form-submission", label: "Contacts Submission", countKey: "contacts" },
    { to: "/cybomb/enquiry-application", label: "Enquiry Submission", countKey: "popupforms" },
    { to: "/cybomb/career-application-manager", label: "Career Application", countKey: "applications" },
    { to: "/cybomb/career-application", label: "Job Openings", countKey: "jobopenings" },
    { to: "/cybomb/blog-management", label: "Blog Management", countKey: "blogs" },
    { to: "/cybomb/press-release", label: "Press Release", countKey: "pressreleases" },
    { to: "/cybomb/news-letter", label: "Newsletter" },
  ];

  const adminItems = [
    { to: "/admin/add-admin", label: "Add Admin" },
    { to: "/admin/cybomb-admin", label: "Cybomb Admin" },
    { to: "/admin/aitals-admin", label: "Aitals Admin" },
    { to: "/admin/rankseo-admin", label: "Rank SEO Admin" },
    { to: "/admin/djittrading-admin", label: "DjitTrading Admin" },
    { to: "/admin/pdfworks-admin", label: "PDF Works Admin" },
  ];
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
    { to: "/pdf-works/pricing-management", label: "Pricing Management" },
    { to: "/pdf-works/blog-manager", label: "Blog Manager" },
    { to: "/pdf-works/payment-manager", label: "Payment Manager" },
    { to: "/pdf-works/topup-manager", label: "Topup Manager" },

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

  const startupbuilder = [
    // { to: "/startup-builder/analytics", label: "Analytics" },
    { to: "/startup-builder/users", label: "Users" },
    { to: "/startup-builder/pricing", label: "Pricing Manager" },
    { to: "/startup-builder/payments", label: "Payment Manager" },
    { to: "/startup-builder/templates", label: "Templates" },
    { to: "/startup-builder/categories", label: "Categories" },
    { to: "/startup-builder/subcategories", label: "SubCategories" },
    { to: "/startup-builder/contacts", label: "Contact Submissions" },
    { to: "/startup-builder/newsletter", label: "Newsletter" },
    { to: "/startup-builder/user-access", label: "User Access" },
  ];

  const hralva = [
    {to: "/hr-alva/dashboard", label: "Dashboard"},
    {to: "/hr-alva/tenant", label: "tenant"},
    {to: "/hr-alva/contact-query", label: "contact query"},
    {to: "/hr-alva/demo-request", label: "demo request"},
  ]

  const cybombDropdownCounts = useMemo(() => {
    return cybombItems.reduce((acc, item) => {
      if (item.countKey && cybombCounts[item.countKey] !== undefined) {
        acc[item.countKey] = cybombCounts[item.countKey];
      }
      return acc;
    }, {});
  }, [cybombCounts, cybombItems]);

  const rankSeoDropdownCounts = useMemo(() => {
    return rankSeoItems.reduce((acc, item) => {
      if (item.countKey && rankSeoCounts[item.countKey] !== undefined) {
        acc[item.countKey] = rankSeoCounts[item.countKey];
      }
      return acc;
    }, {});
  }, [rankSeoCounts, rankSeoItems]);

  const firstLetter = userName?.charAt(0)?.toUpperCase() || "A";

  return (
    <>
      {isMobileOpen && (
        <div className={styles.mobileOverlay} onClick={() => setIsMobileOpen(false)} />
      )}

      <div className={styles.mobileHeader}>
        <button className={styles.mobileToggle} onClick={() => setIsMobileOpen(!isMobileOpen)}>☰</button>
        <div className={styles.mobileBrand}>
          <div className={styles.brandLogo}>⚡</div>
          <span className="font-semibold">Super Admin</span>
        </div>
      </div>

      <aside className={`${styles.sidebar} ${isMobileOpen ? styles.sidebarOpen : ""} ${isCollapsed ? styles.sidebarCollapsed : ""}`}>
        <button
          className={`${styles.toggleBtn} ${isCollapsed ? styles.collapsedToggle : ""}`}
          onClick={toggleSidebar}
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? "»" : "«"}
        </button>

        <div className={`${styles.brand} ${isCollapsed ? styles.brandCollapsed : ""}`}>
          <div className={styles.brandLogoContainer}>
            <div className={styles.brandLogo}>⚡</div>
          </div>
          {!isCollapsed && (
            <div className={styles.brandTextContainer}>
              <div className={styles.brandTitle}>Super Admin</div>
              <div className={styles.brandSubtitle}>Administration Panel</div>
            </div>
          )}
        </div>

        <nav className={styles.nav}>
          <ul className={styles.menu}>
            <li className={styles.menuItem}>
              <NavLink
                to="/dashboard"
                className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ""}`}
                onClick={() => setIsMobileOpen(false)}
                title={isCollapsed ? "Dashboard" : ""}
              >
                <span className={styles.linkIcon}>📊</span>
                {!isCollapsed && <span className={styles.linkText}>Dashboard</span>}
              </NavLink>
            </li>

            {userRole === "superadmin" && (
              <Dropdown title="Admin" items={adminItems} icon="👨‍💼" counts={{}} onTabChange={onRankSeoTabChange} isCollapsed={isCollapsed} />
            )}

            <Dropdown title="Rank SEO" items={rankSeoItems} icon="📈" counts={rankSeoDropdownCounts} onTabChange={onRankSeoTabChange} isCollapsed={isCollapsed} />
            <Dropdown title="Cybomb" items={cybombItems} icon="🚀" counts={cybombDropdownCounts} onTabChange={onRankSeoTabChange} isCollapsed={isCollapsed} />
            <Dropdown title="Aitals Tech" items={aitals} icon="📄" counts={{}} onTabChange={onRankSeoTabChange} isCollapsed={isCollapsed} />
            <Dropdown title="PDF Works" items={pdfworks} icon="📄" counts={{}} onTabChange={onRankSeoTabChange} isCollapsed={isCollapsed} />
            <Dropdown title="Social Media" items={socialmedia} icon="💹" counts={{}} onTabChange={onRankSeoTabChange} isCollapsed={isCollapsed} />
            <Dropdown title="DjitTrading" items={djittrading} icon="💬" counts={{}} onTabChange={onRankSeoTabChange} isCollapsed={isCollapsed} />
            <Dropdown title="Startup Builder" items={startupbuilder} icon="🏗️" counts={{}} onTabChange={onRankSeoTabChange} isCollapsed={isCollapsed} />
            <Dropdown title="Rank SEO" items={rankSeoItems} icon="📈" counts={rankSeoDropdownCounts} onTabChange={onRankSeoTabChange} />
            <Dropdown title="Cybomb" items={cybombItems} icon="🚀" counts={cybombDropdownCounts} onTabChange={onRankSeoTabChange} />
            <Dropdown title="Aitals Tech" items={aitals} icon="📄" counts={{}} onTabChange={onRankSeoTabChange} />
            <Dropdown title="PDF Works" items={pdfworks} icon="📄" counts={{}} onTabChange={onRankSeoTabChange} />
            <Dropdown title="Social Media" items={socialmedia} icon="💹" counts={{}} onTabChange={onRankSeoTabChange} />
            <Dropdown title="DjitTrading" items={djittrading} icon="💬" counts={{}} onTabChange={onRankSeoTabChange} />
            <Dropdown title="Hralva" items={hralva} icon="💬" counts={{}} onTabChange={onRankSeoTabChange} />
          </ul>
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.userInfo}>
            <div className={styles.userAvatar}>{firstLetter}</div>
            {!isCollapsed && (
              <div className={styles.userDetails}>
                <div className={styles.userName}>{userName}</div>
                <div className={styles.userRole}>
                  {userRole === "superadmin" ? "Super Administrator" : "Administrator"}
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}