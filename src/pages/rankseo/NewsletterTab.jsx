// app/admin/newsletter/page.jsx
"use client";

import React, { useState, useEffect } from "react";
import styles from './NewsletterTab.module.css';

// Mock data for development
const mockSubscribers = [
  { _id: '1', email: 'john.doe@example.com', createdAt: new Date().toISOString() },
  { _id: '2', email: 'jane.smith@example.com', createdAt: new Date(Date.now() - 86400000).toISOString() },
  { _id: '3', email: 'mike.wilson@example.com', createdAt: new Date(Date.now() - 172800000).toISOString() },
  { _id: '4', email: 'sarah.johnson@example.com', createdAt: new Date(Date.now() - 259200000).toISOString() },
  { _id: '5', email: 'alex.brown@example.com', createdAt: new Date(Date.now() - 345600000).toISOString() },
];

const mockStats = {
  total: 1250,
  today: 12,
  thisWeek: 89,
  thisMonth: 234
};

export default function AdminNewsletterPage() {
  const [subscribers, setSubscribers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [message, setMessage] = useState(null);
  const [selectedSubscribers, setSelectedSubscribers] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSubscriberEmail, setNewSubscriberEmail] = useState('');
  const [useMock, setUseMock] = useState(false);
  const [connectionError, setConnectionError] = useState(false);

  // Filters and pagination
  const [filters, setFilters] = useState({
    search: '',
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalSubscribers: 0,
    hasNext: false,
    hasPrev: false
  });

  // Helper to resolve API URL
  const getApiBase = () => {
    if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_RANKSEO_API_URL) {
      return import.meta.env.VITE_RANKSEO_API_URL;
    }
    if (typeof process !== 'undefined' && process.env?.VITE_RANKSEO_API_URL) {
      return process.env.VITE_RANKSEO_API_URL;
    }
    if (typeof window !== 'undefined') {
      const ports = [5000, 3001, 8000, 8080];
      for (const port of ports) {
        if (process.env.NODE_ENV === 'development' || import.meta.env?.MODE === 'development') {
          return `http://localhost:${port}`;
        }
      }
    }
    return '';
  };

  const getAuthToken = () => {
    return localStorage.getItem("token") || localStorage.getItem("adminToken") || localStorage.getItem("authToken");
  };

  const shouldUseMockData = () => {
    if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_USE_MOCK_DATA === 'true') return true;
    if (useMock) return true;
    return false;
  };

  useEffect(() => {
    fetchSubscribers();
    fetchStats();
  }, [filters]);

  const fetchSubscribers = async () => {
    if (shouldUseMockData()) {
      setLoading(true);
      setTimeout(() => {
        const filteredSubscribers = mockSubscribers.filter(subscriber =>
          subscriber.email.toLowerCase().includes(filters.search.toLowerCase())
        );
        setSubscribers(filteredSubscribers);
        setPagination({
          currentPage: 1, totalPages: 1, totalSubscribers: filteredSubscribers.length, hasNext: false, hasPrev: false
        });
        setLoading(false);
      }, 800);
      return;
    }

    try {
      setLoading(true);
      setConnectionError(false);
      const API_BASE = getApiBase();
      const token = getAuthToken();
      const queryParams = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value.toString());
      });

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(`${API_BASE}/api/admin/newsletter?${queryParams}`, { 
        signal: controller.signal,
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      clearTimeout(timeoutId);

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      setSubscribers(data.subscribers || []);
      setPagination(data.pagination || { currentPage: 1, totalPages: 1, totalSubscribers: 0, hasNext: false, hasPrev: false });
      if (data.stats) setStats(data.stats);
    } catch (error) {
      console.error("Error fetching subscribers:", error);
      if (error.name === 'AbortError' || (error.name === 'TypeError' && error.message.includes('Failed to fetch'))) {
        setMessage({ type: 'error', text: 'Connection failed. Switched to demo mode.' });
        setConnectionError(true);
        setUseMock(true);
        fetchSubscribers(); // Retry with mock
      } else {
        setMessage({ type: 'error', text: 'Failed to load subscribers' });
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    if (shouldUseMockData()) {
      setTimeout(() => setStats(mockStats), 500);
      return;
    }
    try {
      const API_BASE = getApiBase();
      const token = getAuthToken();
      const response = await fetch(`${API_BASE}/api/admin/newsletter/stats`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error(`HTTP error!`);
      const data = await response.json();
      setStats(data.stats);
    } catch (error) {
      setStats(mockStats);
    }
  };

  const addSubscriber = async (e) => {
    e.preventDefault();
    if (!newSubscriberEmail.trim()) return;

    if (shouldUseMockData()) {
      setActionLoading('add');
      setTimeout(() => {
        const newSub = { _id: Date.now().toString(), email: newSubscriberEmail, createdAt: new Date().toISOString() };
        setSubscribers(prev => [newSub, ...prev]);
        setMessage({ type: 'success', text: 'Subscriber added (Demo)' });
        setNewSubscriberEmail('');
        setShowAddForm(false);
        setActionLoading(null);
        setTimeout(() => setMessage(null), 3000);
      }, 1000);
      return;
    }

    try {
      setActionLoading('add');
      const API_BASE = getApiBase();
      const token = getAuthToken();

      const response = await fetch(`${API_BASE}/api/admin/newsletter`, {
        method: "POST", 
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }, 
        body: JSON.stringify({ email: newSubscriberEmail }),
      });
      const data = await response.json();
      if (response.ok) {
        setMessage({ type: 'success', text: data.message || 'Subscriber added!' });
        setNewSubscriberEmail('');
        setShowAddForm(false);
        fetchSubscribers();
        fetchStats();
      } else {
        throw new Error(data.message || 'Failed to add');
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setActionLoading(null);
    }
  };

  const removeSubscriber = async (subscriberId) => {
    if (shouldUseMockData()) {
      setActionLoading(subscriberId);
      setTimeout(() => {
        setSubscribers(prev => prev.filter(sub => sub._id !== subscriberId));
        setMessage({ type: 'success', text: 'Removed (Demo)' });
        setActionLoading(null);
        setTimeout(() => setMessage(null), 3000);
      }, 800);
      return;
    }

    try {
      setActionLoading(subscriberId);
      const API_BASE = getApiBase();
      const token = getAuthToken();

      const response = await fetch(`${API_BASE}/api/admin/newsletter/${subscriberId}`, { 
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (response.ok) {
        setMessage({ type: 'success', text: 'Subscriber removed' });
        fetchSubscribers();
        fetchStats();
      } else throw new Error("Failed to remove");
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to remove' });
    } finally {
      setActionLoading(null);
    }
  };

  const removeMultipleSubscribers = async () => {
    if (selectedSubscribers.length === 0) return;
    if (shouldUseMockData()) {
      setActionLoading('multiple');
      setTimeout(() => {
        setSubscribers(prev => prev.filter(sub => !selectedSubscribers.includes(sub._id)));
        setSelectedSubscribers([]);
        setMessage({ type: 'success', text: 'Selected removed (Demo)' });
        setActionLoading(null);
        setTimeout(() => setMessage(null), 3000);
      }, 800);
      return;
    }

    try {
      setActionLoading('multiple');
      const API_BASE = getApiBase();
      const token = getAuthToken();

      const response = await fetch(`${API_BASE}/api/admin/newsletter`, {
        method: "DELETE", 
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }, 
        body: JSON.stringify({ ids: selectedSubscribers }),
      });
      if (response.ok) {
        setMessage({ type: 'success', text: 'Selected subscribers removed' });
        setSelectedSubscribers([]);
        fetchSubscribers();
        fetchStats();
      } else throw new Error('Failed to remove');
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setActionLoading(null);
    }
  };

  // --- UPDATED EXPORT FUNCTION ---
  const exportSubscribers = async () => {
    // 1. Mock Data Fallback
    if (shouldUseMockData()) {
      setActionLoading('export');
      setTimeout(() => {
        const csvContent = "data:text/csv;charset=utf-8," 
          + "Email,Subscription Date\n"
          + subscribers.map(sub => `"${sub.email}","${new Date(sub.createdAt).toLocaleDateString()}"`).join("\n");
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "newsletter-subscribers-demo.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setMessage({ type: 'success', text: 'Exported (Demo)' });
        setActionLoading(null);
        setTimeout(() => setMessage(null), 3000);
      }, 1000);
      return;
    }

    // 2. Real API Export Logic
    try {
      setActionLoading('export');
      const API_BASE = getApiBase();
      const token = getAuthToken();

      const response = await fetch(`${API_BASE}/api/admin/newsletter/export`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.ok) {
        // Convert response to blob
        const blob = await response.blob();
        
        // Create a temporary URL for the blob
        const url = window.URL.createObjectURL(blob);
        
        // Create invisible link and click it
        const a = document.createElement('a');
        a.href = url;
        a.download = 'newsletter-subscribers.csv';
        document.body.appendChild(a);
        a.click();
        
        // Clean up
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        setMessage({ type: 'success', text: 'Subscribers exported successfully!' });
      } else {
        throw new Error("Failed to export subscribers");
      }
    } catch (error) {
      console.error("Error exporting subscribers:", error);
      setMessage({ type: 'error', text: 'Failed to export subscribers' });
    } finally {
      setActionLoading(null);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleSelectAll = () => {
    setSelectedSubscribers(selectedSubscribers.length === subscribers.length ? [] : subscribers.map(s => s._id));
  };

  const handleSelectSubscriber = (id) => {
    setSelectedSubscribers(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  if (loading && subscribers.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
           <div className="spinner-border text-primary me-2" role="status"></div>
           <span>Loading newsletter data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Newsletter Management</h1>
            <p className={styles.subtitle}>
              Track subscriptions and manage your mailing list
              {useMock && " (Demo Mode)"}
            </p>
          </div>
          {connectionError && (
            <button onClick={() => { setUseMock(false); fetchSubscribers(); }} className={`${styles.button} ${styles.buttonSecondary}`}>
              <i className="bi bi-arrow-clockwise"></i> Retry Connection
            </button>
          )}
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className={styles.statsGrid}>
            <StatCard label="Total Subscribers" value={stats.total} icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />} styleClass="iconBlue" />
            <StatCard label="Today" value={stats.today} icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />} styleClass="iconGreen" />
            <StatCard label="This Week" value={stats.thisWeek} icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />} styleClass="iconPurple" />
            <StatCard label="This Month" value={stats.thisMonth} icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />} styleClass="iconOrange" />
          </div>
        )}

        {/* Global Message */}
        {message && (
          <div className={`${styles.message} ${message.type === 'success' ? styles.messageSuccess : styles.messageError}`}>
            <i className={`bi ${message.type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'}`}></i>
            {message.text}
          </div>
        )}

        {/* Control Panel */}
        <div className={styles.actionBar}>
          <div className={styles.actionBarContent}>
            <div className={styles.actionButtons}>
              <button onClick={() => setShowAddForm(!showAddForm)} className={`${styles.button} ${styles.buttonPrimary}`}>
                <i className={`bi ${showAddForm ? 'bi-dash' : 'bi-plus-lg'}`}></i> Add Subscriber
              </button>
              
              {selectedSubscribers.length > 0 && (
                <button onClick={removeMultipleSubscribers} disabled={actionLoading === 'multiple'} className={`${styles.button} ${styles.buttonDanger}`}>
                  <i className="bi bi-trash"></i> {actionLoading === 'multiple' ? 'Removing...' : `Remove (${selectedSubscribers.length})`}
                </button>
              )}
              
              <button onClick={exportSubscribers} disabled={actionLoading === 'export' || subscribers.length === 0} className={`${styles.button} ${styles.buttonSuccess}`}>
                <i className="bi bi-download"></i> {actionLoading === 'export' ? 'Exporting...' : 'Export CSV'}
              </button>
            </div>

            <div className={styles.searchInputWrapper}>
              <input 
                type="text" 
                placeholder="Search emails..." 
                value={filters.search} 
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))} 
                className={styles.input} 
              />
            </div>
          </div>

          {/* Add Form Dropdown */}
          {showAddForm && (
            <div className={styles.addFormContainer}>
              <h5 className="text-white mb-3 text-sm uppercase tracking-wide">Add New Subscription</h5>
              <form onSubmit={addSubscriber} className={styles.addForm}>
                <input 
                  type="email" 
                  placeholder="subscriber@example.com" 
                  value={newSubscriberEmail} 
                  onChange={(e) => setNewSubscriberEmail(e.target.value)} 
                  className={styles.input} 
                  style={{flex: 1}}
                  required 
                />
                <button type="submit" disabled={actionLoading === 'add' || !newSubscriberEmail.trim()} className={`${styles.button} ${styles.buttonPrimary}`}>
                  {actionLoading === 'add' ? 'Adding...' : 'Add User'}
                </button>
                <button type="button" onClick={() => setShowAddForm(false)} className={`${styles.button} ${styles.buttonSecondary}`}>
                  Cancel
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Subscribers Table Card */}
        <div className={styles.tableCard}>
            <div className={styles.tableHeaderGradient}>
               <h3 className={styles.tableTitle}>Subscriber List</h3>
               <span className="badge bg-dark bg-opacity-25 border border-white border-opacity-25 rounded-pill px-3 py-1 text-white small">
                 Total: {pagination.totalSubscribers}
               </span>
            </div>
          
            <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead className={styles.tableHead}>
                <tr>
                  <th style={{ width: '3rem' }}>
                    <input type="checkbox" checked={selectedSubscribers.length === subscribers.length && subscribers.length > 0} onChange={handleSelectAll} className={styles.checkbox} />
                  </th>
                  <th>Email Address</th>
                  <th>Subscription Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody className={styles.tableBody}>
                {subscribers.length > 0 ? (
                  subscribers.map((subscriber) => (
                    <tr key={subscriber._id} className={styles.tableRow}>
                      <td>
                        <input type="checkbox" checked={selectedSubscribers.includes(subscriber._id)} onChange={() => handleSelectSubscriber(subscriber._id)} className={styles.checkbox} />
                      </td>
                      <td>
                        <div className={styles.emailText}>{subscriber.email}</div>
                      </td>
                      <td>
                        <div className={styles.dateText}>
                          {new Date(subscriber.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td>
                        <button onClick={() => removeSubscriber(subscriber._id)} disabled={actionLoading === subscriber._id} className={`${styles.button} ${styles.buttonGhost}`}>
                          <i className="bi bi-trash"></i> {actionLoading === subscriber._id ? '...' : ''}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className={styles.emptyState}>
                      <i className="bi bi-envelope-open display-4 mb-3 d-block opacity-50"></i>
                      No subscribers found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className={styles.pagination}>
                <span className={styles.paginationText}>
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>
                <div className={styles.paginationButtons}>
                  <button onClick={() => setFilters(prev => ({...prev, page: pagination.currentPage - 1}))} disabled={!pagination.hasPrev} className={`${styles.button} ${styles.buttonSecondary} py-1 px-3`}>
                    Prev
                  </button>
                  <button onClick={() => setFilters(prev => ({...prev, page: pagination.currentPage + 1}))} disabled={!pagination.hasNext} className={`${styles.button} ${styles.buttonPrimary} py-1 px-3`}>
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

// Helper Component for Stats
function StatCard({ label, value, icon, styleClass }) {
  return (
    <div className={styles.statCard}>
      <div className={styles.statContent}>
        <div>
          <p className={styles.statLabel}>{label}</p>
          <p className={styles.statValue}>{value?.toLocaleString() || 0}</p>
        </div>
        <div className={`${styles.statIcon} ${styles[styleClass]}`}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{width:'24px', height:'24px'}}>
            {icon}
          </svg>
        </div>
      </div>
    </div>
  );
}