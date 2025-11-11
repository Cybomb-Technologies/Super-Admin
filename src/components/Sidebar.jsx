// Sidebar.jsx
import React, { useState, useEffect, useMemo } from "react";
import { NavLink, useLocation } from "react-router-dom";
// IMPORT THE CSS MODULE
import styles from "./Sidebar.module.css";

const API_BASE_URL = import.meta.env.VITE_CYBOMB_API_BASE || 'http://localhost:5002';

const Dropdown = ({ title, items, icon, counts = {} }) => {
  const [open, setOpen] = useState(false);
  const loc = useLocation();

  // Open dropdown if any sub-item is active
  useEffect(() => {
    if (items.some((i) => loc.pathname.startsWith(i.to))) setOpen(true);
  }, [loc.pathname, items]);

  // Get count for specific route
  const getCountForRoute = (label) => {
    // Map the human-readable label back to the count key used in cybombDropdownCounts
    const keyMap = {
      'Contacts Submission': 'contacts',
      'Enquiry Submission': 'popupforms',
      'Career Application': 'applications',
      'Job Openings': 'jobopenings',
      'Blog Management': 'blogs',
      'Press Release': 'pressreleases',
    };
    
    // Only process for Cybomb dropdown, which is the only one passing counts
    const lookupKey = keyMap[label];
    
    return counts[lookupKey] || 0;
  };

  return (
    <li className={styles.menuItem}> {/* Use li wrapper with CSS Module class */}
      <button
        // Use CSS Module classes for button and open state
        className={`${styles.menuButton} ${
          open ? styles.menuButtonOpen : ""
        }`}
        onClick={() => setOpen((s) => !s)}
      >
        <div className={styles.menuButtonContent}>
          <span className={styles.linkIcon}>{icon}</span>
          <span className={styles.linkText}>{title}</span>
        </div>
        {/* Use CSS Module classes for arrow animation */}
        <span className={`${styles.arrow} ${open ? styles.menuButtonOpen : ""}`}>
          &#9660; {/* Unicode arrow for better styling */}
        </span>
      </button>
      {open && (
        <ul className={styles.submenu}> {/* Use ul with CSS Module class */}
          {items.map((it) => {
            const itemCount = getCountForRoute(it.label);
            return (
              <li key={it.to}>
                <NavLink
                  to={it.to}
                  // Use CSS Module classes for link and active state
                  className={({ isActive }) =>
                    `${styles.link} ${isActive ? styles.active : ""}`
                  }
                  onClick={() => {
                    // Close mobile sidebar on link click
                    if (window.innerWidth <= 768) {
                        document.querySelector(`.${styles.sidebar}`).classList.remove(styles.sidebarOpen);
                        document.querySelector(`.${styles.mobileOverlay}`).style.display = 'none';
                    }
                  }}
                >
                  <span className={styles.linkText}>{it.label}</span>
                  {itemCount > 0 && (
                    // Keep Tailwind classes for the dynamic badge for simplicity
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
  const [cybombCounts, setCybombCounts] = useState({});
  const [loading, setLoading] = useState(true);

  // Fetch Cybomb data counts
  const fetchCybombCounts = async () => {
    try {
      setLoading(true);
      
      const endpoints = [
        { key: 'popupforms', url: `${API_BASE_URL}/api/popup-mail` },
        { key: 'contacts', url: `${API_BASE_URL}/api/contact` },
        { key: 'applications', url: `${API_BASE_URL}/api/application` },
        { key: 'blogs', url: `${API_BASE_URL}/api/blog` },
        { key: 'jobopenings', url: `${API_BASE_URL}/api/applications` },
        { key: 'pressreleases', url: `${API_BASE_URL}/api/pressrelease` },
      ];

      const results = {};

      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint.url);
          if (response.ok) {
            const data = await response.json();
            
            // Handle different response structures
            if (endpoint.key === 'popupforms') {
              results[endpoint.key] = Array.isArray(data) ? data.length : 0;
            } else {
              results[endpoint.key] = Array.isArray(data?.data) ? data.data.length : 
                                    Array.isArray(data) ? data.length : 0;
            }
          } else {
            results[endpoint.key] = 0;
          }
        } catch (error) {
          console.error(`Error fetching ${endpoint.key}:`, error);
          results[endpoint.key] = 0;
        }
      }

      setCybombCounts(results);
    } catch (error) {
      console.error("Error fetching Cybomb counts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCybombCounts();
    
    // Refresh counts every 30 seconds
    const interval = setInterval(fetchCybombCounts, 30000);
    return () => clearInterval(interval);
  }, []);

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

  // Prepare counts for Cybomb dropdown - Map to the dropdown's expected keys
  const cybombDropdownCounts = useMemo(() => {
    return cybombItems.reduce((acc, item) => {
      if (item.countKey && cybombCounts[item.countKey] !== undefined) {
        // Use the countKey directly as the key for the dropdown component
        acc[item.countKey] = cybombCounts[item.countKey];
      }
      return acc;
    }, {});
  }, [cybombCounts, cybombItems]);
  
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
  
  const livechat = [
    { to: "/live-chat/djitrading", label: "Djit Trading" },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        // Use CSS Module class for overlay
        <div
          className={styles.mobileOverlay}
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile Header */}
      {/* Use CSS Module class for mobile header */}
      <div className={styles.mobileHeader}> 
        <button
          className={styles.mobileToggle}
          onClick={() => setIsMobileOpen(!isMobileOpen)}
        >
          ☰
        </button>
        <div className={styles.mobileBrand}>
          <div className={styles.brandLogo}>⚡</div>
          <span className="font-semibold">Cybomb Admin</span>
        </div>
      </div>

      {/* Sidebar */}
      <aside
        // Use CSS Module classes for the sidebar container
        className={`${styles.sidebar} ${
          isMobileOpen ? styles.sidebarOpen : ""
        }`}
      >
        {/* Brand Section */}
        <div className={styles.brand}>
          <div className={styles.brandLogo}>
            ⚡
          </div>
          <div>
            <div className={styles.brandTitle}>Super Admin</div>
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
                // Use CSS Module classes for link and active state
                className={({ isActive }) =>
                  `${styles.link} ${isActive ? styles.active : ""}`
                }
                onClick={() => setIsMobileOpen(false)}
              >
                <span className={styles.linkIcon}>📊</span>
                <span className={styles.linkText}>Dashboard</span>
              </NavLink>
            </li>

            {/* Cybomb Dropdown */}
            <Dropdown 
              title="Cybomb" 
              items={cybombItems} 
              icon="🚀" 
              counts={cybombDropdownCounts}
            />
            
            {/* Other Dropdowns */}
            <Dropdown title="Aitals Tech" items={aitals} icon="📄" counts={{}} />
            <Dropdown title="PDF Works" items={pdfworks} icon="📄" counts={{}} />
            <Dropdown title="Social Media" items={socialmedia} icon="💹" counts={{}} />
            <Dropdown title="Live Chat" items={livechat} icon="💬" counts={{}} />
          </ul>
        </nav>

        {/* Sidebar Footer */}
        <div className={styles.sidebarFooter}>
          <div className={styles.userInfo}>
            <div className={styles.userAvatar}>
              AD
            </div>
            <div className={styles.userDetails}>
              <div className={styles.userName}>Admin User</div>
              <div className={styles.userRole}>Administrator</div>
            </div>
          </div>
        
        </div>
      </aside>
    </>
  );
}