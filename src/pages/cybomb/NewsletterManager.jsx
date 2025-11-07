// components/NewsletterManager.jsx
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
  RefreshCw,
  MoreVertical,
  Eye,
  Trash2,
  MailOpen,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
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
      const token = localStorage.getItem("adminToken");
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== "all" && { status: statusFilter }),
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

  const loadData = async () => {
    setLoading(true);
    await Promise.all([fetchSubscribers(), fetchStats()]);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [refreshKey]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchSubscribers(1);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, statusFilter, sourceFilter]);

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
    setRefreshKey(prev => prev + 1);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getStatusBadgeVariant = (isActive) => {
    return isActive ? "success" : "secondary";
  };

  const getSourceBadgeVariant = (source) => {
    const variants = {
      blog: "primary",
      website: "info",
      'website-footer': 'success',
      default: "secondary"
    };
    return variants[source] || variants.default;
  };

  const StatCard = ({ title, value, icon: Icon, variant, description }) => (
    <div className="col-xl-3 col-lg-6 col-md-6 col-12 mb-4">
      <div className={`card border-0 shadow-sm border-start border-${variant} border-4`}>
        <div className="card-body">
          <div className="d-flex align-items-center">
            <div className="flex-grow-1">
              <p className="text-muted small fw-semibold mb-1 text-uppercase">{title}</p>
              <h3 className="fw-bold text-dark mb-1">{value}</h3>
              {description && (
                <p className="text-muted small mb-0">{description}</p>
              )}
            </div>
            <div className={`bg-${variant} bg-opacity-10 p-3 rounded`}>
              <Icon className={`text-${variant}`} style={{width: '24px', height: '24px'}} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading && !subscribers.length) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "400px" }}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" style={{width: '3rem', height: '3rem'}} role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted">Loading newsletter data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 fw-bold text-dark mb-1">Newsletter Subscribers</h1>
          <p className="text-muted mb-0">Manage and analyze your email subscribers</p>
        </div>
        <div className="d-flex gap-2">
          <button
            onClick={handleRefresh}
            className="btn btn-outline-primary d-flex align-items-center"
            disabled={loading}
          >
            <RefreshCw className={`me-2 ${loading ? 'spin' : ''}`} style={{width: '16px', height: '16px'}} />
            Refresh
          </button>
          <button
            onClick={handleExport}
            disabled={exportLoading || totalItems === 0}
            className="btn btn-success d-flex align-items-center"
          >
            <Download className="me-2" style={{width: '16px', height: '16px'}} />
            {exportLoading ? 'Exporting...' : 'Export Excel'}
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="row mb-4">
          <StatCard
            title="Total Subscribers"
            value={stats.totalSubscribers.toLocaleString()}
            icon={Users}
            variant="primary"
            description="All time subscriptions"
          />
          <StatCard
            title="Active Subscribers"
            value={stats.activeSubscribers.toLocaleString()}
            icon={UserCheck}
            variant="success"
            description="Currently engaged"
          />
          <StatCard
            title="New This Month"
            value={stats.newSubscribersThisMonth.toLocaleString()}
            icon={TrendingUp}
            variant="info"
            description="Monthly growth"
          />
          <StatCard
            title="Inactive"
            value={stats.inactiveSubscribers.toLocaleString()}
            icon={UserX}
            variant="secondary"
            description="Unsubscribed"
          />
        </div>
      )}

      {/* Filters and Search */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-header bg-transparent py-3">
          <h5 className="card-title mb-0 fw-semibold">Filters & Search</h5>
        </div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-xl-4 col-lg-6 col-md-6">
              <label className="form-label small fw-semibold text-uppercase text-muted">Search Subscribers</label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <Search className="text-muted" style={{width: '16px', height: '16px'}} />
                </span>
                <input
                  type="text"
                  placeholder="Search by email or name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-control border-start-0"
                />
              </div>
            </div>
            <div className="col-xl-3 col-lg-6 col-md-6">
              <label className="form-label small fw-semibold text-uppercase text-muted">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="form-select"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="col-xl-3 col-lg-6 col-md-6">
              <label className="form-label small fw-semibold text-uppercase text-muted">Source</label>
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className="form-select"
              >
                <option value="all">All Sources</option>
                <option value="blog">Blog</option>
                <option value="website">Website</option>
                <option value="website-footer">Footer</option>
              </select>
            </div>
            <div className="col-xl-2 col-lg-6 col-md-6 d-flex align-items-end">
              <button
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  setSourceFilter("all");
                }}
                className="btn btn-outline-secondary w-100"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Subscribers Table */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-transparent py-3">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="card-title mb-0 fw-semibold">
              Subscribers ({totalItems.toLocaleString()})
            </h5>
            <div className="text-muted small">
              Page {currentPage} of {totalPages}
            </div>
          </div>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="ps-4 text-nowrap">Subscriber</th>
                  <th className="text-nowrap">Source</th>
                  <th className="text-nowrap">Status</th>
                  <th className="text-nowrap">Subscription Date</th>
              
                </tr>
              </thead>
              <tbody>
                {subscribers.map((subscriber) => (
                  <tr key={subscriber._id} className="border-bottom">
                    <td className="ps-4">
                      <div className="d-flex align-items-center">
                        <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-3">
                          <Mail className="text-primary" style={{width: '16px', height: '16px'}} />
                        </div>
                        <div>
                          <div className="fw-medium text-dark text-truncate" style={{maxWidth: '500px'}}>
                            {subscriber.email}
                          </div>
                          {subscriber.name && (
                            <div className="text-muted small text-truncate" style={{maxWidth: '200px'}}>
                              {subscriber.name}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge bg-${getSourceBadgeVariant(subscriber.source)} text-capitalize`}>
                        {subscriber.source}
                      </span>
                    </td>
                    <td>
                      <span className={`badge bg-${getStatusBadgeVariant(subscriber.isActive)}`}>
                        {subscriber.isActive ? (
                          <>
                            <UserCheck className="me-1" style={{width: '12px', height: '12px'}} />
                            Active
                          </>
                        ) : (
                          <>
                            <UserX className="me-1" style={{width: '12px', height: '12px'}} />
                            Inactive
                          </>
                        )}
                      </span>
                    </td>
                    <td className="text-muted small">
                      {formatDate(subscriber.subscribedAt)}
                    </td>
                   
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Loading State */}
          {loading && subscribers.length > 0 && (
            <div className="text-center py-3">
              <div className="spinner-border spinner-border-sm text-primary me-2" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <span className="text-muted">Loading more subscribers...</span>
            </div>
          )}

          {/* Empty State */}
          {subscribers.length === 0 && !loading && (
            <div className="text-center py-5">
              <Mail className="text-muted mb-3 opacity-50" style={{width: '64px', height: '64px'}} />
              <h5 className="text-muted mb-2">No subscribers found</h5>
              <p className="text-muted mb-3">
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
                  className="btn btn-primary"
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="card-footer bg-transparent">
            <div className="d-flex justify-content-between align-items-center">
              <div className="text-muted small">
                Showing {subscribers.length} of {totalItems.toLocaleString()} subscribers
              </div>
              <div className="d-flex gap-1">
                <button
                  onClick={() => fetchSubscribers(1)}
                  disabled={currentPage === 1}
                  className="btn btn-outline-secondary btn-sm d-flex align-items-center"
                >
                  <ChevronsLeft style={{width: '16px', height: '16px'}} />
                </button>
                <button
                  onClick={() => fetchSubscribers(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="btn btn-outline-secondary btn-sm d-flex align-items-center"
                >
                  <ChevronLeft style={{width: '16px', height: '16px'}} />
                  Previous
                </button>
                <div className="px-3 d-flex align-items-center small fw-semibold">
                  Page {currentPage} of {totalPages}
                </div>
                <button
                  onClick={() => fetchSubscribers(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="btn btn-outline-secondary btn-sm d-flex align-items-center"
                >
                  Next
                  <ChevronRight style={{width: '16px', height: '16px'}} />
                </button>
                <button
                  onClick={() => fetchSubscribers(totalPages)}
                  disabled={currentPage === totalPages}
                  className="btn btn-outline-secondary btn-sm d-flex align-items-center"
                >
                  <ChevronsRight style={{width: '16px', height: '16px'}} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .table > :not(caption) > * > * {
          padding: 1rem 0.5rem;
        }
      `}</style>
    </div>
  );
};

export default NewsletterManagerCybomb;