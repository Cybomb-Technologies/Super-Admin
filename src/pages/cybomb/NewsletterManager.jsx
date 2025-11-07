// components/NewsletterManager.jsx
import React, { useState, useEffect } from "react";
import {
  Download,
  Search,
  Mail,
  Users,
  TrendingUp,
  UserCheck,
  UserX,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Bell, // Changed Mail to Bell for a different header icon, closer to contact manager's theme
} from "lucide-react";
import styles from './NewsletterManager.module.css';

const API_BASE_URL = import.meta.env.VITE_CYBOMB_API_BASE;

const NewsletterManagerCybomb = () => {
  const [subscribers, setSubscribers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchSubscribers = async (page = 1) => {
    try {
      // Set to true only if there's no data yet to show the full-screen loader
      if (subscribers.length === 0) setLoading(true); 

      const token = localStorage.getItem("adminToken");
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== "all" && { status: statusFilter }),
        // Check for 'all' as the default value when constructing the URL
        ...(sourceFilter !== "all" && { source: sourceFilter }),
      });

      const response = await fetch(
        `${API_BASE_URL}/api/newsletter/subscribers?${params}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSubscribers(data.data);
        setTotalPages(data.pagination.pages);
        setCurrentPage(data.pagination.current);
        setTotalItems(data.pagination.total);
      }
    } catch (error) {
      console.error("Error fetching subscribers:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(`${API_BASE_URL}/api/newsletter/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const loadData = async (initialLoad = true) => {
    // Only set loading to true for the initial load/full refresh, not for filter/search debounced calls if data exists
    if (initialLoad) setLoading(true); 
    await Promise.all([fetchSubscribers(1), fetchStats()]);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [refreshKey]);

  useEffect(() => {
    // Debounce for filter/search
    const timeoutId = setTimeout(() => {
      // Only call fetchSubscribers, no need for fetchStats on filter change
      fetchSubscribers(1); 
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, statusFilter, sourceFilter]);

  // Pagination Handler
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      fetchSubscribers(page);
    }
  };

  const handleExport = async () => {
    try {
      setExportLoading(true);
      const token = localStorage.getItem("adminToken");
      const response = await fetch(`${API_BASE_URL}/api/newsletter/export`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `newsletter-subscribers-${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error("Export error:", error);
    } finally {
      setExportLoading(false);
    }
  };

  const handleRefresh = () => {
    // Force a full data reload, resetting filters
    setSearchTerm("");
    setStatusFilter("all");
    setSourceFilter("all");
    setRefreshKey(prev => prev + 1);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const StatCard = ({ title, value, icon: Icon, variant, description }) => (
    <div className={styles.statCard}>
      <div className={`${styles.card} ${styles[variant]}`}>
        <div className={styles.cardBody}>
          <div className={styles.statContent}>
            <div className={styles.statText}>
              <p className={styles.statTitle}>{title}</p>
              <h3 className={styles.statValue}>{value}</h3>
              {description && (
                <p className={styles.statDescription}>{description}</p>
              )}
            </div>
            <div className={`${styles.statIcon} ${styles[variant]}`}>
              <Icon className={styles.icon} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Use a simplified check for full-screen loading state
  if (loading && !stats) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingContent}>
          <div className={styles.spinner} role="status">
            <span className={styles.visuallyHidden}>Loading...</span>
          </div>
          <p className={styles.loadingText}>Loading newsletter data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>
            <Bell className={styles.icon} /> {/* Using Bell icon for Newsletter */}
            Newsletter Subscribers
          </h1>
          <p className={styles.subtitle}>Manage and analyze your email subscribers</p>
        </div>
        <div className={styles.headerActions}>
          <button
            onClick={handleRefresh}
            className={`${styles.button} ${styles.outline}`}
            disabled={loading}
          >
            <RefreshCw className={`${styles.icon} ${loading ? styles.spin : ''}`} />
            Refresh
          </button>
          <button
            onClick={handleExport}
            disabled={exportLoading || totalItems === 0}
            className={`${styles.button} ${styles.primary}`}
          >
            <Download className={styles.icon} />
            {exportLoading ? 'Exporting...' : 'Export Excel'}
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className={styles.statsGrid}>
          <StatCard
            title="Total Subscribers"
            value={stats.totalSubscribers ? stats.totalSubscribers.toLocaleString() : '0'}
            icon={Users}
            variant="primary"
            description="All time subscriptions"
          />
          <StatCard
            title="Active Subscribers"
            value={stats.activeSubscribers ? stats.activeSubscribers.toLocaleString() : '0'}
            icon={UserCheck}
            variant="success"
            description="Currently engaged"
          />
          <StatCard
            title="New This Month"
            value={stats.newSubscribersThisMonth ? stats.newSubscribersThisMonth.toLocaleString() : '0'}
            icon={TrendingUp}
            variant="info"
            description="Monthly growth"
          />
          <StatCard
            title="Inactive"
            value={stats.inactiveSubscribers ? stats.inactiveSubscribers.toLocaleString() : '0'}
            icon={UserX}
            variant="secondary"
            description="Unsubscribed"
          />
        </div>
      )}

      {/* Filters and Search */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h5 className={styles.cardTitle}>Filters & Search</h5>
        </div>
        <div className={styles.cardBody}>
          <div className={styles.filtersGrid}>
            <div className={styles.filterGroup}>
              <label className={styles.label}>Search Subscribers</label>
              <div className={styles.searchInput}>
                <span className={styles.searchIcon}>
                  <Search className={styles.icon} />
                </span>
                <input
                  type="text"
                  placeholder="Search by email or name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={styles.input}
                />
              </div>
            </div>
            <div className={styles.filterGroup}>
              <label className={styles.label}>Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={styles.select}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            {/* <div className={styles.filterGroup}>
              <label className={styles.label}>Source</label>
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className={styles.select}
              >
                <option value="all">All Sources</option>
                <option value="blog">Blog</option>
                <option value="website">Website</option>
                <option value="website-footer">Website Footer</option>
              </select>
            </div> */}
            <div className={styles.filterGroup} style={{ justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  setSourceFilter("all");
                }}
                className={`${styles.button} ${styles.secondary}`}
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Subscribers Table */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.tableHeader}>
            <h5 className={styles.cardTitle}>
              Subscribers ({totalItems.toLocaleString()})
            </h5>
            <div className={styles.pageInfo}>
              Page {currentPage} of {totalPages}
            </div>
          </div>
        </div>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead className={styles.tableHead}>
              <tr>
                <th className={styles.th}>Subscriber</th>
                <th className={styles.th}>Source</th>
                <th className={styles.th}>Status</th>
                <th className={styles.th}>Subscription Date</th>
              </tr>
            </thead>
            <tbody className={styles.tableBody}>
              {subscribers.map((subscriber) => (
                <tr key={subscriber._id} className={styles.tableRow}>
                  <td className={styles.td}>
                    <div className={styles.subscriberInfo}>
                      <div className={styles.subscriberIcon}>
                        <Mail className={styles.icon} />
                      </div>
                      <div>
                        <div className={styles.email}>
                          {subscriber.email}
                        </div>
                        {subscriber.name && (
                          <div className={styles.name}>
                            {subscriber.name}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className={styles.td}>
                    <span className={`${styles.badge} ${styles[subscriber.source] || styles.default}`}>
                      {subscriber.source}
                    </span>
                  </td>
                  <td className={styles.td}>
                    <span className={`${styles.badge} ${subscriber.isActive ? styles.active : styles.inactive}`}>
                      {subscriber.isActive ? (
                        <>
                          <UserCheck className={styles.badgeIcon} />
                          Active
                        </>
                      ) : (
                        <>
                          <UserX className={styles.badgeIcon} />
                          Inactive
                        </>
                      )}
                    </span>
                  </td>
                  <td className={`${styles.td} ${styles.date}`}>
                    {formatDate(subscriber.subscribedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Loading State for More Data (e.g., when a filter is applied) */}
          {loading && subscribers.length > 0 && (
            <div className={styles.tableLoading}>
              <div className={styles.smallSpinner} role="status">
                <span className={styles.visuallyHidden}>Loading...</span>
              </div>
              <span className={styles.loadingText}>Loading more subscribers...</span>
            </div>
          )}

          {/* Empty State */}
          {subscribers.length === 0 && !loading && (
            <div className={styles.emptyState}>
              <Mail className={styles.emptyIcon} />
              <h5 className={styles.emptyTitle}>No subscribers found</h5>
              <p className={styles.emptyText}>
                {searchTerm || statusFilter !== "all" || sourceFilter !== "all" 
                  ? "Try adjusting your filters to see more results" 
                  : "Subscribers will appear here once they sign up for your newsletter"}
              </p>
              {(searchTerm || statusFilter !== "all" || sourceFilter !== "all") && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("all");
                    setSourceFilter("all");
                  }}
                  className={`${styles.button} ${styles.primary}`}
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className={styles.cardFooter}>
            <div className={styles.pagination}>
              <div className={styles.paginationInfo}>
                Showing {subscribers.length} of {totalItems.toLocaleString()} subscribers
              </div>
              <div className={styles.paginationControls}>
                <button
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                  className={styles.paginationButton}
                >
                  <ChevronsLeft className={styles.icon} />
                </button>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={styles.paginationButton}
                >
                  <ChevronLeft className={styles.icon} />
                  Previous
                </button>
                <div className={styles.pageNumbers}>
                  Page {currentPage} of {totalPages}
                </div>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={styles.paginationButton}
                >
                  Next
                  <ChevronRight className={styles.icon} />
                </button>
                <button
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages}
                  className={styles.paginationButton}
                >
                  <ChevronsRight className={styles.icon} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsletterManagerCybomb;