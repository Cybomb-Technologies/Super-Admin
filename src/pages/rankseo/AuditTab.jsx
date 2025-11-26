// AuditTab.jsx
import React, { useState, useEffect, useMemo } from "react";
import AuditTable from "./AuditTable";
import styles from "./AuditTab.module.css";
import { normalizeDashboardData } from "./dashboardApi";

const API_URL = import.meta.env.VITE_RANKSEO_API_URL || "";

const getInitials = (email) => {
  if (!email) return "U";
  return email.charAt(0).toUpperCase();
};

const validateAuditData = (data) => {
  if (!data || typeof data !== "object") {
    return {
      auditData: [],
      businessNameData: [],
      keycheckData: [],
      keyScrapeData: [],
      keywordData: [],
      allToolData: [],
      users: [],
    };
  }

  const auditData = data.auditData || data.seoAuditData || data.auditLogs || [];
  const businessNameData = data.businessNameData || data.nameGenData || [];
  const keycheckData = data.keycheckData || data.keywordCheckData || [];
  const keyScrapeData = data.keyScrapeData || data.keywordScrapeData || [];
  const keywordData = data.keywordData || data.keywordGenData || [];
  const allToolData = data.allToolData || data.activities || data.logs || [];
  const users = Array.isArray(data.users) ? data.users : [];

  return {
    auditData,
    businessNameData,
    keycheckData,
    keyScrapeData,
    keywordData,
    allToolData,
    users,
  };
};

const getDashboardEndpoint = () => {
  return API_URL ? `${API_URL}/api/admin/dashboard` : `/api/admin/dashboard`;
};

export default function AuditTab({ data }) {
  // --- State ---
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAction, setSelectedAction] = useState("all");
  const [selectedTool, setSelectedTool] = useState("all");
  const [fetchedData, setFetchedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const hasPropData = data && typeof data === "object";

  // --- Effects ---
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
        console.error("AuditTab fetch error:", err);
        setError(err.message || "Failed to load audit logs");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [hasPropData]);

  // --- Data Processing ---
  const sourceData = hasPropData ? data : fetchedData;
  const {
    auditData,
    businessNameData,
    keycheckData,
    keyScrapeData,
    keywordData,
    allToolData,
    users: safeUsers,
  } = validateAuditData(sourceData);

  const allActivityData = useMemo(() => {
    return allToolData && allToolData.length > 0
      ? allToolData
      : [...auditData, ...businessNameData, ...keycheckData, ...keyScrapeData, ...keywordData];
  }, [allToolData, auditData, businessNameData, keycheckData, keyScrapeData, keywordData]);

  // --- Filtering Logic ---
  const filteredAuditLogs = useMemo(() => {
    return allActivityData.filter((log) => {
      if (!log) return false;
      const url = log.url || log.mainUrl || log.path || "";
      const action = log.action || log.type || log.event || "";
      const tool = log.tool || log.toolName || "seo_audit";
      const userEmail = log.userEmail || log.user?.email || "";
      
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        searchTerm === "" ||
        url.toLowerCase().includes(searchLower) ||
        action.toLowerCase().includes(searchLower) ||
        userEmail.toLowerCase().includes(searchLower) ||
        (log.industry && log.industry.toLowerCase().includes(searchLower));

      const matchesAction = selectedAction === "all" || action === selectedAction;
      const matchesTool = selectedTool === "all" || tool === selectedTool;

      return matchesSearch && matchesAction && matchesTool;
    });
  }, [allActivityData, searchTerm, selectedAction, selectedTool]);

  // --- Stats Calculation ---
  const toolStats = useMemo(() => {
    const stats = {};
    allActivityData.forEach((log) => {
      if (!log) return;
      const tool = log.tool || log.toolName || "seo_audit";
      stats[tool] = (stats[tool] || 0) + 1;
    });
    return stats;
  }, [allActivityData]);

  const userStats = useMemo(() => {
    const userActivities = {};
    allActivityData.forEach((log) => {
      if (!log) return;
      const email = log.userEmail || log.user?.email || log.email || "Unknown";
      if (email !== "Unknown") userActivities[email] = (userActivities[email] || 0) + 1;
    });

    const activeUsers = Object.keys(userActivities).length;
    const topUsers = Object.entries(userActivities)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([email, count]) => ({ email, count }));

    return { activeUsers, topUsers };
  }, [allActivityData]);

  // --- Render Helpers ---
  const StatCard = ({ title, value, icon, bgClass }) => (
    <div className="col-12 col-sm-6 col-md-4 col-xl-2">
      <div className={`${styles.statCard} ${styles[bgClass]} text-white h-100 p-3`}>
        <div className="d-flex justify-content-between align-items-start position-relative z-1">
          <div>
            <h3 className={styles.statValue}>{value}</h3>
            <span className={styles.statLabel}>{title}</span>
          </div>
        </div>
        {/* Background Icon Watermark */}
        <i className={`bi ${icon} ${styles.cardIconOpacity}`} />
      </div>
    </div>
  );

  if (!hasPropData && loading && !sourceData) {
    return (
      <div className={styles.mainContainer}>
        <div className="text-center py-5">
            <div className="spinner-border text-primary mb-3" role="status" />
            <p className="text-white">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!hasPropData && error) {
    return (
        <div className={styles.mainContainer}>
            <div className="alert alert-danger mt-3">{error}</div>
        </div>
    );
  }

  return (
    // WRAPPED IN MAIN CONTAINER TO FORCE DARK THEME
    <div className={styles.mainContainer}>
      <div className="container-fluid px-0">
        
        {/* 1. Stats Row */}
        <div className="row g-3 mb-4">
          <StatCard 
            title="Total Activities" 
            value={allActivityData.length} 
            icon="bi-activity" 
            bgClass="cardBlue" 
          />
          <StatCard 
            title="Active Users" 
            value={userStats.activeUsers} 
            icon="bi-people-fill" 
            bgClass="cardGreen" 
          />
          <StatCard 
            title="SEO Audit" 
            value={toolStats["seo_audit"] || 0} 
            icon="bi-speedometer2" 
            bgClass="cardCyan" 
          />
          <StatCard 
            title="Business Name" 
            value={toolStats["business_name_generator"] || 0} 
            icon="bi-building" 
            bgClass="cardYellow" 
          />
          <StatCard 
            title="Keyword Tools" 
            value={(toolStats["keyword_checker"] || 0) + (toolStats["keyword_scraper"] || 0)} 
            icon="bi-search" 
            bgClass="cardRed" 
          />
          <StatCard 
            title="Keyword Gen" 
            value={toolStats["keyword_generator"] || 0} 
            icon="bi-magic" 
            bgClass="cardPurple" 
          />
        </div>

        {/* 2. Main Control Panel */}
        <div className={`card mb-4 ${styles.glassPanel}`}>
          <div className="card-body p-4">
            
            <div className="row g-3 align-items-center">
              {/* Search */}
              <div className="col-md-5">
                <div className="input-group">
                  <span className="input-group-text bg-transparent border-0 text-white ps-0">
                    <i className="bi bi-search" style={{fontSize: '1.2rem'}} />
                  </span>
                  <input
                    type="text"
                    placeholder="Search URL, user, action..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`form-control ${styles.searchInput}`}
                  />
                </div>
              </div>

              {/* Dropdowns */}
              <div className="col-md-3">
                <select
                  value={selectedAction}
                  onChange={(e) => setSelectedAction(e.target.value)}
                  className={`form-select ${styles.customSelect}`}
                >
                  <option value="all">All Actions</option>
                  <option value="seo_audit">SEO Audit</option>
                  <option value="name_generation">Name Gen</option>
                  <option value="keyword_analysis">Key Analysis</option>
                  <option value="keyword_scraping">Key Scraping</option>
                  <option value="keyword_generation">Key Gen</option>
                </select>
              </div>
              
              <div className="col-md-3">
                <select
                  value={selectedTool}
                  onChange={(e) => setSelectedTool(e.target.value)}
                  className={`form-select ${styles.customSelect}`}
                >
                  <option value="all">All Tools</option>
                  <option value="seo_audit">SEO Audit</option>
                  <option value="business_name_generator">Name Gen</option>
                  <option value="keyword_checker">Key Checker</option>
                  <option value="keyword_scraper">Key Scraper</option>
                  <option value="keyword_generator">Key Generator</option>
                </select>
              </div>

              {/* Result Counter */}
              <div className="col-md-1 text-end text-white small">
                  <div className="fw-bold text-white fs-5">{filteredAuditLogs.length}</div>
                  <div>Found</div>
              </div>
            </div>

            {/* Active Filters Display */}
            {(selectedAction !== "all" || selectedTool !== "all" || searchTerm) && (
              <div className="mt-3 d-flex flex-wrap gap-2 pt-3 border-top border-secondary border-opacity-25">
                <span className="text-white small me-2 align-self-center">Active Filters:</span>
                
                {selectedAction !== "all" && (
                  <span className={`badge bg-success ${styles.filterBadge}`}>
                    Action: {selectedAction}
                    <i className="bi bi-x ms-2" onClick={() => setSelectedAction("all")} style={{cursor: 'pointer'}}/>
                  </span>
                )}
                {selectedTool !== "all" && (
                  <span className={`badge bg-primary ${styles.filterBadge}`}>
                    Tool: {selectedTool}
                    <i className="bi bi-x ms-2" onClick={() => setSelectedTool("all")} style={{cursor: 'pointer'}}/>
                  </span>
                )}
                {searchTerm && (
                  <span className={`badge bg-warning text-dark ${styles.filterBadge}`}>
                    "{searchTerm}"
                    <i className="bi bi-x ms-2" onClick={() => setSearchTerm("")} style={{cursor: 'pointer'}}/>
                  </span>
                )}
                <button 
                    className="btn btn-sm btn-link text-white text-decoration-none" 
                    onClick={() => {setSearchTerm(""); setSelectedAction("all"); setSelectedTool("all")}}
                >
                  Clear all
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 3. Top Users & Table Layout */}
        <div className="row g-4">
          
          {/* Top Users Sidebar (Visible if users exist) */}
          {userStats.topUsers.length > 0 && (
            <div className="col-12">
              <div className={`card ${styles.glassPanel} mb-0`}>
                  <div className="card-body ">
                    <h6 className="card-title text-white mb-3 text-uppercase small opacity-75 fw-bold">
                      <i className="bi bi-trophy-fill text-warning me-2"></i>
                      Top Active Users
                    </h6>
                    <div className="row g-3">
                        {userStats.topUsers.map((user) => (
                          <div key={user.email} className="col-md-6 col-lg-3 col-xl-2">
                            <div className={`p-2 d-flex align-items-center ${styles.userCard}`}>
                              <div className={styles.avatarCircle}>
                                {getInitials(user.email)}
                              </div>
                              <div className="ms-3 overflow-hidden">
                                <div className="text-white small fw-bold text-truncate" title={user.email}>
                                  {user.email.split('@')[0]}
                                </div>
                                <div className="text-white small" style={{fontSize: '0.75rem'}}>
                                  {user.count} actions
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
              </div>
            </div>
          )}

          {/* Main Table */}
          <div className="col-12">
              <AuditTable
                auditLogs={filteredAuditLogs}
                totalLogs={allActivityData.length}
                users={safeUsers}
                showToolColumn={true}
              />
          </div>
        </div>
      </div>
    </div>
  );
}