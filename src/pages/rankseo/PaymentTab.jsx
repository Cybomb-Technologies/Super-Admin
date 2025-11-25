// app/admin/payments/page.jsx
"use client";

import React, { useState, useEffect } from "react";
import styles from './PaymentTab.module.css';

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [message, setMessage] = useState(null);

  // Filters and pagination
  const [filters, setFilters] = useState({
    status: 'all',
    search: '',
    startDate: '',
    endDate: '',
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalPayments: 0,
    hasNext: false,
    hasPrev: false
  });

  // Define API base URL - Vite uses import.meta.env
  const API_BASE = import.meta.env.VITE_RANKSEO_API_URL || "http://localhost:5000";

  useEffect(() => {
    fetchPayments();
    fetchStats();
  }, [filters]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value.toString());
      });

      const response = await fetch(`${API_BASE}/api/admin/payments?${queryParams}`, {
        // headers: { Authorization: `Bearer ${token}` }, // REMOVED
      });

      if (response.ok) {
        const data = await response.json();
        setPayments(data.payments || []);
        setPagination(data.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalPayments: 0,
          hasNext: false,
          hasPrev: false
        });
      } else {
        throw new Error("Failed to fetch payments");
      }
    } catch (error) {
      console.error("Error fetching payments:", error);
      setMessage({ type: 'error', text: 'Failed to load payments data' });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/admin/payments/stats`, {
        // headers: { Authorization: `Bearer ${token}` }, // REMOVED
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const updatePaymentStatus = async (paymentId, newStatus) => {
    try {
      setUpdating(paymentId);
      
      const response = await fetch(`${API_BASE}/api/admin/payments/${paymentId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          // Authorization: `Bearer ${token}`, // REMOVED
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setPayments(prevPayments =>
          prevPayments.map(payment =>
            payment._id === paymentId ? { ...payment, status: newStatus } : payment
          )
        );
        setMessage({ type: 'success', text: 'Payment status updated successfully!' });
        setTimeout(() => setMessage(null), 3000);
        fetchStats(); // Refresh stats
      } else {
        throw new Error("Failed to update payment status");
      }
    } catch (error) {
      console.error("Error updating payment status:", error);
      setMessage({ type: 'error', text: 'Failed to update payment status' });
    } finally {
      setUpdating(null);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const formatCurrency = (amount, currency = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      success: { class: styles.successBadge, label: 'Success' },
      failed: { class: styles.failedBadge, label: 'Failed' },
      pending: { class: styles.pendingBadge, label: 'Pending' }
    };
    
    const config = statusConfig[status] || { class: styles.defaultBadge, label: status };
    return (
      <span className={`${styles.badge} ${config.class}`}>
        {config.label}
      </span>
    );
  };

  const getRenewalStatusBadge = (status) => {
    const statusConfig = {
      scheduled: { class: styles.scheduledBadge, label: 'Scheduled' },
      processing: { class: styles.processingBadge, label: 'Processing' },
      pending: { class: styles.pendingBadge, label: 'Pending' },
      failed: { class: styles.failedBadge, label: 'Failed' },
      cancelled: { class: styles.cancelledBadge, label: 'Cancelled' }
    };
    
    const config = statusConfig[status] || { class: styles.defaultBadge, label: status };
    return (
      <span className={`${styles.badge} ${config.class}`}>
        {config.label}
      </span>
    );
  };

  if (loading && payments.length === 0) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingText}>Loading payments data...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.title}>Payment Management</h1>
          <p className={styles.subtitle}>
            View and manage all payment transactions and subscriptions
          </p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statContent}>
                <div>
                  <p className={styles.statLabel}>Total Revenue</p>
                  <p className={styles.statValue}>
                    {formatCurrency(stats.totalRevenue)}
                  </p>
                </div>
                <div className={styles.statIconSuccess}>
                  <svg className={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statContent}>
                <div>
                  <p className={styles.statLabel}>Monthly Revenue</p>
                  <p className={styles.statValue}>
                    {formatCurrency(stats.monthlyRevenue)}
                  </p>
                </div>
                <div className={styles.statIconBlue}>
                  <svg className={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statContent}>
                <div>
                  <p className={styles.statLabel}>Successful Payments</p>
                  <p className={styles.statValue}>
                    {stats.paymentStatusCounts.find(s => s._id === 'success')?.count || 0}
                  </p>
                </div>
                <div className={styles.statIconSuccess}>
                  <svg className={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statContent}>
                <div>
                  <p className={styles.statLabel}>Total Payments</p>
                  <p className={styles.statValue}>
                    {pagination.totalPayments}
                  </p>
                </div>
                <div className={styles.statIconPurple}>
                  <svg className={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Message */}
        {message && (
          <div className={`${styles.message} ${message.type === 'success' ? styles.successMessage : styles.errorMessage}`}>
            {message.text}
          </div>
        )}

        {/* Filters */}
        <div className={styles.filtersContainer}>
          <div className={styles.filtersGrid}>
            <div>
              <label className={styles.filterLabel}>Search</label>
              <input
                type="text"
                placeholder="Search by transaction, plan, or user..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className={styles.input}
              />
            </div>
            
            <div>
              <label className={styles.filterLabel}>Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className={styles.select}
              >
                <option value="all">All Status</option>
                <option value="success">Success</option>
                <option value="failed">Failed</option>
                <option value="pending">Pending</option>
              </select>
            </div>

            <div>
              <label className={styles.filterLabel}>From Date</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className={styles.input}
              />
            </div>

            <div>
              <label className={styles.filterLabel}>To Date</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className={styles.input}
              />
            </div>
          </div>

          <div className={styles.filtersFooter}>
            <div className={styles.resultsCount}>
              Showing {payments.length} of {pagination.totalPayments} payments
            </div>
            <button
              onClick={() => setFilters({
                status: 'all',
                search: '',
                startDate: '',
                endDate: '',
                page: 1,
                limit: 10,
                sortBy: 'createdAt',
                sortOrder: 'desc'
              })}
              className={styles.clearButton}
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Payments Table */}
        <div className={styles.tableContainer}>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead className={styles.tableHeader}>
                <tr>
                  <th className={styles.tableHead}>Transaction</th>
                  <th className={styles.tableHead}>User</th>
                  <th className={styles.tableHead}>Plan & Amount</th>
                  <th className={styles.tableHead}>Status</th>
                  <th className={styles.tableHead}>Renewal</th>
                  <th className={styles.tableHead}>Date</th>
                  <th className={styles.tableHead}>Actions</th>
                </tr>
              </thead>
              <tbody className={styles.tableBody}>
                {payments.map((payment) => (
                  <tr key={payment._id} className={styles.tableRow}>
                    <td className={styles.tableCell}>
                      <div className={styles.transactionId}>
                        {payment.transactionId}
                      </div>
                      {payment.cashfreeOrderId && (
                        <div className={styles.cashfreeId}>
                          CF: {payment.cashfreeOrderId}
                        </div>
                      )}
                    </td>
                    <td className={styles.tableCell}>
                      <div className={styles.userName}>
                        {payment.userId?.name || 'N/A'}
                      </div>
                      <div className={styles.userEmail}>
                        {payment.userId?.email}
                      </div>
                    </td>
                    <td className={styles.tableCell}>
                      <div className={styles.planName}>
                        {payment.planName}
                      </div>
                      <div className={styles.amount}>
                        {formatCurrency(payment.amount, payment.currency)}
                      </div>
                      <div className={styles.paymentDetails}>
                        {payment.billingCycle} • {payment.paymentMethod || 'N/A'}
                      </div>
                    </td>
                    <td className={styles.tableCell}>
                      {getStatusBadge(payment.status)}
                    </td>
                    <td className={styles.tableCell}>
                      <div className={styles.renewalContainer}>
                        {getRenewalStatusBadge(payment.renewalStatus)}
                        {payment.autoRenewal && (
                          <span className={styles.autoRenewalBadge}>
                            Auto-renew
                          </span>
                        )}
                      </div>
                    </td>
                    <td className={styles.tableCell}>
                      <div className={styles.date}>{formatDate(payment.createdAt)}</div>
                      <div className={styles.expiryDate}>
                        Expires: {formatDate(payment.expiryDate)}
                      </div>
                    </td>
                    <td className={styles.tableCell}>
                      <div className={styles.actions}>
                        <select
                          value={payment.status}
                          onChange={(e) => updatePaymentStatus(payment._id, e.target.value)}
                          disabled={updating === payment._id}
                          className={styles.statusSelect}
                        >
                          <option value="success">Success</option>
                          <option value="failed">Failed</option>
                          <option value="pending">Pending</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {payments.length === 0 && !loading && (
            <div className={styles.emptyState}>
              <div className={styles.emptyText}>No payments found</div>
              <div className={styles.emptySubtext}>
                {filters.search || filters.status !== 'all' ? 'Try adjusting your filters' : 'No payment transactions yet'}
              </div>
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className={styles.pagination}>
              <div className={styles.paginationInfo}>
                Page {pagination.currentPage} of {pagination.totalPages}
              </div>
              <div className={styles.paginationButtons}>
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={!pagination.hasPrev}
                  className={styles.paginationButton}
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={!pagination.hasNext}
                  className={`${styles.paginationButton} ${styles.paginationButtonPrimary}`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}