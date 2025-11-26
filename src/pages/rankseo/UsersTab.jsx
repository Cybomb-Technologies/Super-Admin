// UsersTab.jsx
"use client";
import React, { useState, useEffect, useMemo } from "react";
import UserProfileModal from "./UserProfileModal";
import styles from "./UsersTab.module.css";
import { normalizeDashboardData } from "./dashboardApi"; 

const API_URL = import.meta.env.VITE_RANKSEO_API_URL || "";

const getDashboardEndpoint = () => {
  return API_URL ? `${API_URL}/api/admin/dashboard` : `/api/admin/dashboard`;
};

// Data validation
const validateUsersData = (data) => {
  if (!data || typeof data !== "object") {
    return { users: [] };
  }
  return { users: Array.isArray(data.users) ? data.users : [] };
};

export default function UsersTab({ data }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Local fetching state
  const [fetchedData, setFetchedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Table state
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [selectedUsers, setSelectedUsers] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const hasPropData = data && typeof data === "object";

  // Fetch logic
  useEffect(() => {
    if (hasPropData) return;
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem("token") || localStorage.getItem("authToken");
        const headers = { "Content-Type": "application/json" };
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const res = await fetch(getDashboardEndpoint(), { method: "GET", headers });
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        
        const raw = await res.json();
        setFetchedData(normalizeDashboardData(raw));
      } catch (err) {
        console.error("UsersTab fetch error:", err);
        setError(err.message || "Failed to load users");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [hasPropData]);

  // Data Source
  const sourceData = hasPropData ? data : fetchedData;
  const { users: safeUsers } = validateUsersData(sourceData);

  // --- Process Data helpers ---
  const getDisplayPlan = (user) => {
    if (!user) return "Free";
    if (user.planName && user.planName !== "Free") return user.planName;
    if (user.plan && typeof user.plan === "object" && user.plan.name) return user.plan.name;
    return user.subscriptionStatus === "active" ? "Premium" : "Free";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Never";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric", month: "short", day: "numeric"
      });
    } catch { return "Invalid Date"; }
  };

  const processedUsers = safeUsers.map((user) => ({
    ...user,
    displayPlan: getDisplayPlan(user),
    formattedLastLogin: formatDate(user.lastLogin),
    formattedCreatedAt: formatDate(user.createdAt),
  }));

  const filteredUsers = processedUsers.filter((user) => {
    const search = searchTerm.toLowerCase();
    const matchesSearch =
      (user.name?.toLowerCase().includes(search)) ||
      (user.email?.toLowerCase().includes(search)) ||
      (user.displayPlan?.toLowerCase().includes(search));

    const matchesPlan = selectedPlan === "all" || user.displayPlan?.toLowerCase() === selectedPlan.toLowerCase();
    return matchesSearch && matchesPlan;
  });

  useEffect(() => { setCurrentPage(1); }, [searchTerm, selectedPlan]);

  // --- Sorting & Pagination ---
  const sortedUsers = useMemo(() => {
    if (!sortConfig.key) return [...filteredUsers];
    return [...filteredUsers].sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];
      
      if (sortConfig.key === "user") {
        aVal = a.name || a.email || "";
        bVal = b.name || b.email || "";
      }
      
      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredUsers, sortConfig]);

  const totalPages = Math.ceil(sortedUsers.length / itemsPerPage) || 1;
  const paginatedUsers = sortedUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };





  const handleExport = () => {
    if (filteredUsers.length === 0) return;
    const headers = ["Name", "Email", "Plan", "Status", "Joined"];
    const rows = filteredUsers.map(u => [
      `"${u.name || ""}"`, `"${u.email}"`, `"${u.displayPlan}"`, `"${u.subscriptionStatus}"`, `"${u.formattedCreatedAt}"`
    ]);
    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "users_export.csv";
    link.click();
  };

  // --- UI Helpers ---
  const uniquePlans = Array.from(new Set(processedUsers.map(u => u.displayPlan))).filter(p => p && p !== "Free").sort();

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return "bi-arrow-down-up";
    return sortConfig.direction === "asc" ? "bi-arrow-up" : "bi-arrow-down";
  };

  const getStatusBadge = (status) => {
    let color = "secondary";
    if (status === "active") color = "success";
    if (status === "cancelled") color = "danger";
    if (status === "expired") color = "warning";
    return <span className={`badge bg-${color}`}>{status || "inactive"}</span>;
  };

  const quickStats = [
    { label: "Total Users", value: safeUsers.length, color: "blue", icon: "bi-people" },
    { label: "Active Subs", value: processedUsers.filter(u => u.subscriptionStatus === "active").length, color: "green", icon: "bi-check-circle" },
    { label: "Premium", value: processedUsers.filter(u => u.displayPlan !== "Free").length, color: "purple", icon: "bi-star" },
    { label: "Verified", value: processedUsers.filter(u => u.isVerified).length, color: "orange", icon: "bi-shield-check" },
  ];

  if (!hasPropData && loading) return <div className="text-center text-white py-5">Loading...</div>;
  if (!hasPropData && error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className={styles.wrapper}>
      {/* 1. Stats Grid */}
      <div className={styles.quickStatsGrid}>
        {quickStats.map((stat) => (
          <div key={stat.label} className={`${styles.quickStatsCard} ${styles[stat.color + 'Border']}`}>
            <div className={styles.quickStatsContent}>
              <div>
                <div className={styles.statValue}>{stat.value}</div>
                <div className={styles.statLabel}>{stat.label}</div>
              </div>
              <i className={`bi ${stat.icon} ${styles.statIcon} text-${stat.color === 'blue' ? 'primary' : stat.color === 'green' ? 'success' : stat.color === 'purple' ? 'info' : 'warning'}`} />
            </div>
          </div>
        ))}
      </div>

      {/* 2. Filter Panel (RENAMED from card to avoid bootstrap white bg) */}
      <div className={styles.filterPanel}>
        <div className={styles.filtersRow}>
          <div className={styles.planSelectWrapper}>
            <span className={styles.label}>Filter by Plan</span>
            <select value={selectedPlan} onChange={(e) => setSelectedPlan(e.target.value)} className={styles.select}>
              <option value="all">All Plans</option>
              <option value="free">Free</option>
              {uniquePlans.map(p => <option key={p} value={p.toLowerCase()}>{p}</option>)}
            </select>
          </div>

          <div className={styles.searchWrapper}>
            <span className={styles.label}>Search Users</span>
            <div className={styles.searchInner}>
              <i className={`bi bi-search ${styles.searchIcon}`} />
              <input 
                type="text" 
                placeholder="Name, email, or plan..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                className={styles.input} 
              />
            </div>
          </div>
        </div>

        {/* Active Filters */}
        {(selectedPlan !== "all" || searchTerm) && (
          <div className={styles.filterMetaRow}>
            {selectedPlan !== "all" && (
              <button className={styles.filterPill} onClick={() => setSelectedPlan("all")}>
                Plan: {selectedPlan} <span className={styles.filterClearBtn}>×</span>
              </button>
            )}
            {searchTerm && (
              <button className={styles.filterPillWarning} onClick={() => setSearchTerm("")}>
                "{searchTerm}" <span className={styles.filterClearBtn}>×</span>
              </button>
            )}
            <span className={styles.filterCount}>Found {filteredUsers.length} users</span>
          </div>
        )}
      </div>

      {/* 3. Users Table (Gradient Header + Dark Body) */}
      <div className={styles.usersCard}>
        <div className={styles.usersHeader}>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <div className={styles.usersHeaderTitle}>
                <i className="bi bi-people-fill"></i> User Management
              </div>
              <p className={styles.usersHeaderSubtitle}>
                Page {currentPage} of {totalPages}
              </p>
            </div>
            <div className={styles.headerActions}>
              <button className={styles.exportButton} onClick={handleExport} disabled={filteredUsers.length === 0}>
                <i className="bi bi-download"></i> Export
              </button>
            </div>
          </div>
        </div>

        <div className={styles.usersBody}>
          <div className={`table-responsive ${styles.usersTableWrapper}`}>
            <table className="table mb-0">
              <thead>
                <tr>
                  
                  <th onClick={() => handleSort("user")} style={{cursor: 'pointer'}}>
                    USER <i className={`bi ${getSortIcon("user")} ${styles.sortIcon}`} />
                  </th>
                  <th>PLAN & STATUS</th>
                  <th>LOGIN METHOD</th>
                  <th onClick={() => handleSort("lastLogin")} style={{cursor: 'pointer'}}>
                    LAST LOGIN <i className={`bi ${getSortIcon("lastLogin")} ${styles.sortIcon}`} />
                  </th>
                  <th onClick={() => handleSort("createdAt")} style={{cursor: 'pointer'}}>
                    JOINED <i className={`bi ${getSortIcon("createdAt")} ${styles.sortIcon}`} />
                  </th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.length > 0 ? (
                  paginatedUsers.map((user) => (
                    <tr key={user._id}>
                    
                      <td>
                        <div className="d-flex align-items-center gap-3">
                          {user.profilePicture ? (
                            <img src={user.profilePicture} alt="" className="rounded-circle" width="36" height="36" />
                          ) : (
                            <div className={styles.avatarCircle}>
                              {(user.name?.[0] || user.email?.[0] || "U").toUpperCase()}
                            </div>
                          )}
                          <div>
                            <div className="fw-bold text-white">{user.name || "Unknown"}</div>
                            <div className="small text-white">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="d-flex flex-column gap-1 align-items-start">
                          <span className={`badge ${user.displayPlan !== "Free" ? "bg-warning text-dark" : "bg-secondary"}`}>
                            {user.displayPlan} {user.displayPlan !== "Free" && <i className="bi bi-star-fill small"></i>}
                          </span>
                          {getStatusBadge(user.subscriptionStatus)}
                        </div>
                      </td>
                      <td>
                        <span className="badge bg-dark border border-secondary">{user.loginMethod || "Email"}</span>
                      </td>
                      <td>{user.formattedLastLogin}</td>
                      <td>{user.formattedCreatedAt}</td>
                      <td>
                        <button className="btn btn-sm btn-outline-light" onClick={() => { setSelectedUser(user); setIsModalOpen(true); }}>
                          <i className="bi bi-eye"></i> View
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-5 text-white">
                      No users found matching your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className={styles.usersFooter}>
           <div className="d-flex justify-content-between align-items-center">
             <small className="text-white">Showing {paginatedUsers.length} of {filteredUsers.length} results</small>
             <div className="btn-group">
                <button className="btn btn-sm btn-outline-secondary" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>Prev</button>
                <button className="btn btn-sm btn-outline-secondary" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>Next</button>
             </div>
           </div>
        </div>
      </div>

      <UserProfileModal user={selectedUser} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}