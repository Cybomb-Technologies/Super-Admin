// Sidebar.jsx
import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import styles from "./Sidebar.module.css";

const Dropdown = ({ title, items, icon }) => {
  const [open, setOpen] = useState(false);
  const loc = useLocation();

  React.useEffect(() => {
    if (items.some((i) => loc.pathname.startsWith(i.to))) setOpen(true);
  }, [loc.pathname, items]);

  return (
    <div className={styles.menuItem}>
      <button
        className={`${styles.menuButton} ${open ? styles.menuButtonOpen : ""}`}
        onClick={() => setOpen((s) => !s)}
      >
        <span className={styles.linkIcon}>{icon}</span>
        <span className={styles.linkText}>{title}</span>
        <span className={styles.arrow}>{open ? "▾" : "▸"}</span>
      </button>
      {open && (
        <div className={styles.submenu}>
          {items.map((it) => (
            <NavLink
              key={it.to}
              to={it.to}
              className={({ isActive }) =>
                `${styles.link} ${isActive ? styles.active : ""}`
              }
            >
              {it.label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
};

export default function Sidebar() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const cybomb = [
    { to: "/cybomb/dashboard", label: "Dashboard" },
    { to: "/cybomb/form-submission", label: "Form Submission" },
    { to: "/cybomb/career-application", label: "Careerb Application" },
    { to: "/cybomb/blog-management", label: "Blog Management" },
    { to: "/cybomb/press-release", label: "Press Release" },
    { to: "/cybomb/news-letter", label: "Newsletter" },
  ];
  const socialmedia = [
    { to: "/social-media/dashboad", label: "Dashboard" },
    { to: "/social-media/promotional-request", label: "Promotional Request" },
    { to: "/social-media/customers", label: "Customers" },
    { to: "/social-media/users", label: "Users" },
    { to: "/social-media/contact", label: "Contact Message" },
    
  ];

  

  const orders = [
    { to: "/orders/list", label: "Order List" },
    { to: "/orders/detail", label: "Order Detail" },
  ];
  const settings = [
    { to: "/settings/general", label: "General" },
    { to: "/settings/security", label: "Security" },
  ];

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
          <span>Cybomb Admin</span>
        </div>
      </div>

      <aside
        className={`${styles.sidebar} ${
          isMobileOpen ? styles.sidebarOpen : ""
        }`}
      >
        <div className={styles.brand}>
          {/* <div className={styles.brandLogo}>⚡</div> */}
          <div className={styles.brandText}>
            <div className={styles.brandTitle}>⚡ Super Admin</div>
            {/* <div className={styles.brandSubtitle}>Management Panel</div> */}
          </div>
        </div>

        <nav className={styles.nav}>
          <ul className={styles.menu}>
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

            <li>
              <Dropdown title="Cybomb" items={cybomb} icon="🚀" />
            </li>
            <li>
              <Dropdown title="PDF Works" items={orders} icon="📄" />
            </li>
            <li>
              <Dropdown title="Rank SEO" items={orders} icon="🔍" />
            </li>
            <li>
              <Dropdown title="Djit Trading" items={settings} icon="💹" />
            </li>
            <li>
              <Dropdown title="Social Media" items={socialmedia} icon="💹" />
            </li>
           
          </ul>
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.userInfo}>
            <div className={styles.userAvatar}>AD</div>
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
