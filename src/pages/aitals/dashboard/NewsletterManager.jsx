import React, { useState, useEffect } from "react";
import {
  Download,
  Search,
  Filter,
  Mail,
  Users,
  TrendingUp,
  UserCheck,
  UserX,
  Calendar,
  Loader,
  Sparkles,
  FileDown
} from "lucide-react";
import styles from './NewsletterManager.module.css';

const API_BASE_URL = import.meta.env.VITE_AITALS_API_URL;

const NewsletterManager = () => {
  const [subscribers, setSubscribers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [exportLoading, setExportLoading] = useState(false);

  const fetchSubscribers = async (page = 1) => {
    try {
      const token = localStorage.getItem("adminToken");
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== "all" && { status: statusFilter }),
      });

      const response = await fetch(
        `${API_BASE_URL}/api/newsletter/subscribers?${params}`,
        {
          // headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSubscribers(data.data);
        setTotalPages(data.pagination.pages);
        setCurrentPage(data.pagination.current);
      }
    } catch (error) {
      console.error("Error fetching subscribers:", error);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(`${API_BASE_URL}/api/newsletter/stats`, {
        // headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchSubscribers(), fetchStats()]);
      setLoading(false);
    };
    loadData();
  }, []);

  useEffect(() => {
    fetchSubscribers(1);
  }, [searchTerm, statusFilter]);

  const handleExport = async () => {
    try {
      setExportLoading(true);
      const token = localStorage.getItem("adminToken");
      const response = await fetch(`${API_BASE_URL}/api/newsletter/export`, {
        // headers: { Authorization: `Bearer ${token}` },
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className={styles.loadingState}>
        <Loader className={styles.loadingSpinner} />
        <span>Loading newsletter data...</span>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>Newsletter Manager</h1>
        <p className={styles.subtitle}>Manage your newsletter subscribers and track performance</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className={styles.statsGrid}>
          {/* Total Subscribers */}
          <div className={`${styles.statCard} ${styles.statTotal}`}>
            <div className={styles.statContent}>
              <div className={styles.statInfo}>
                <div className={styles.statLabel}>Total Subscribers</div>
                <div className={styles.statValue}>{stats.totalSubscribers}</div>
              </div>
              <div className={styles.statIcon}>
                <Users className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Active Subscribers */}
          <div className={`${styles.statCard} ${styles.statActive}`}>
            <div className={styles.statContent}>
              <div className={styles.statInfo}>
                <div className={styles.statLabel}>Active Subscribers</div>
                <div className={styles.statValue}>{stats.activeSubscribers}</div>
              </div>
              <div className={styles.statIcon}>
                <UserCheck className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* This Month */}
          <div className={`${styles.statCard} ${styles.statMonthly}`}>
            <div className={styles.statContent}>
              <div className={styles.statInfo}>
                <div className={styles.statLabel}>New This Month</div>
                <div className={styles.statValue}>{stats.newSubscribersThisMonth}</div>
              </div>
              <div className={styles.statIcon}>
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Inactive */}
          <div className={`${styles.statCard} ${styles.statInactive}`}>
            <div className={styles.statContent}>
              <div className={styles.statInfo}>
                <div className={styles.statLabel}>Inactive</div>
                <div className={styles.statValue}>{stats.inactiveSubscribers}</div>
              </div>
              <div className={styles.statIcon}>
                <UserX className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Controls Section */}
      <div className={styles.controls}>
        <div className={styles.controlsContent}>
          <div className={styles.controlsLeft}>
            {/* Search */}
            <div className={styles.searchContainer}>
              <Search className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search subscribers by email or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Export Button */}
          <button
            onClick={handleExport}
            disabled={exportLoading}
            className={styles.exportButton}
          >
            {exportLoading ? (
              <Loader className={`w-4 h-4 ${styles.loadingSpinner}`} />
            ) : (
              <FileDown className="w-4 h-4" />
            )}
            {exportLoading ? "Exporting..." : "Export Excel"}
          </button>
        </div>
      </div>

      {/* Subscribers Table */}
      <div className={styles.tableContainer}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead className={styles.tableHead}>
              <tr>
                <th className={styles.tableHeader}>Subscriber</th>
                <th className={styles.tableHeader}>Source</th>
                <th className={styles.tableHeader}>Status</th>
                <th className={styles.tableHeader}>Subscribed Date</th>
              </tr>
            </thead>
            <tbody>
              {subscribers.map((subscriber) => (
                <tr key={subscriber._id} className={styles.tableRow}>
                  <td className={styles.tableCell}>
                    <div className={styles.subscriberInfo}>
                      <div className={styles.subscriberEmail}>
                        {subscriber.email}
                      </div>
                      {subscriber.name && (
                        <div className={styles.subscriberName}>
                          {subscriber.name}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className={styles.tableCell}>
                    <span className={styles.sourceBadge}>
                      {subscriber.source}
                    </span>
                  </td>
                  <td className={styles.tableCell}>
                    <span
                      className={`${styles.statusBadge} ${
                        subscriber.isActive ? styles.statusActive : styles.statusInactive
                      }`}
                    >
                      {subscriber.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className={styles.tableCell}>
                    <div className={styles.dateText}>
                      {formatDate(subscriber.subscribedAt)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className={styles.pagination}>
            <div className={styles.paginationInfo}>
              Page {currentPage} of {totalPages}
            </div>
            <div className={styles.paginationControls}>
              <button
                onClick={() => fetchSubscribers(currentPage - 1)}
                disabled={currentPage === 1}
                className={styles.paginationButton}
              >
                Previous
              </button>
              <button
                onClick={() => fetchSubscribers(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={styles.paginationButton}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Empty State */}
      {subscribers.length === 0 && (
        <div className={styles.emptyState}>
          <Mail className={styles.emptyIcon} />
          <h3 className={styles.emptyTitle}>No subscribers found</h3>
          <p className={styles.emptyText}>
            {searchTerm || statusFilter !== "all" 
              ? "Try adjusting your search or filter criteria" 
              : "Start building your newsletter audience!"}
          </p>
        </div>
      )}
    </div>
  );
};

export default NewsletterManager;