// app/admin/newsletter/page.jsx
"use client";

import React, { useState, useEffect } from "react";
import styles from './NewsletterTab.module.css';

// CSS variables for dark/light theme
const lightTheme = {
  '--bg-primary': '#f9fafb',
  '--bg-secondary': '#f3f4f6',
  '--bg-card': '#ffffff',
  '--bg-input': '#ffffff',
  '--bg-success': '#f0fdf4',
  '--bg-error': '#fef2f2',
  '--text-primary': '#111827',
  '--text-secondary': '#6b7280',
  '--text-tertiary': '#9ca3af',
  '--text-success': '#166534',
  '--text-error': '#dc2626',
  '--border-color': '#e5e7eb',
  '--border-input': '#d1d5db',
  '--border-focus': '#3b82f6',
  '--border-success': '#bbf7d0',
  '--border-error': '#fecaca',
  '--ring-color': '#3b82f680',
  '--checkbox-color': '#2563eb',
  '--button-primary-bg': '#2563eb',
  '--button-primary-text': '#ffffff',
  '--button-primary-hover': '#1d4ed8',
  '--button-danger-bg': '#dc2626',
  '--button-danger-text': '#ffffff',
  '--button-danger-hover': '#b91c1c',
  '--button-success-bg': '#16a34a',
  '--button-success-text': '#ffffff',
  '--button-success-hover': '#15803d',
  '--button-secondary-bg': '#d1d5db',
  '--button-secondary-text': '#374151',
  '--button-secondary-hover': '#9ca3af',
  '--button-ghost-text': '#dc2626',
  '--button-ghost-hover': '#b91c1c',
  '--icon-blue-bg': '#dbeafe',
  '--icon-blue': '#2563eb',
  '--icon-green-bg': '#dcfce7',
  '--icon-green': '#16a34a',
  '--icon-purple-bg': '#f3e8ff',
  '--icon-purple': '#9333ea',
  '--icon-orange-bg': '#ffedd5',
  '--icon-orange': '#ea580c',
};

const darkTheme = {
  '--bg-primary': '#111827',
  '--bg-secondary': '#1f2937',
  '--bg-card': '#374151',
  '--bg-input': '#4b5563',
  '--bg-success': '#064e3b',
  '--bg-error': '#7f1d1d',
  '--text-primary': '#f9fafb',
  '--text-secondary': '#d1d5db',
  '--text-tertiary': '#9ca3af',
  '--text-success': '#4ade80',
  '--text-error': '#fca5a5',
  '--border-color': '#4b5563',
  '--border-input': '#6b7280',
  '--border-focus': '#60a5fa',
  '--border-success': '#065f46',
  '--border-error': '#991b1b',
  '--ring-color': '#60a5fa80',
  '--checkbox-color': '#60a5fa',
  '--button-primary-bg': '#2563eb',
  '--button-primary-text': '#ffffff',
  '--button-primary-hover': '#1d4ed8',
  '--button-danger-bg': '#dc2626',
  '--button-danger-text': '#ffffff',
  '--button-danger-hover': '#b91c1c',
  '--button-success-bg': '#16a34a',
  '--button-success-text': '#ffffff',
  '--button-success-hover': '#15803d',
  '--button-secondary-bg': '#4b5563',
  '--button-secondary-text': '#e5e7eb',
  '--button-secondary-hover': '#6b7280',
  '--button-ghost-text': '#fca5a5',
  '--button-ghost-hover': '#f87171',
  '--icon-blue-bg': '#1e3a8a',
  '--icon-blue': '#60a5fa',
  '--icon-green-bg': '#065f46',
  '--icon-green': '#4ade80',
  '--icon-purple-bg': '#581c87',
  '--icon-purple': '#c084fc',
  '--icon-orange-bg': '#7c2d12',
  '--icon-orange': '#fdba74',
};

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
  const [isDark, setIsDark] = useState(false);
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

  // Enhanced API base URL resolver
  const getApiBase = () => {
    // Priority 1: Vite environment variable (client-side)
    if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_RANKSEO_API_URL) {
      return import.meta.env.VITE_RANKSEO_API_URL;
    }
    
    // Priority 2: Node.js environment variable (server-side)
    if (typeof process !== 'undefined' && process.env?.VITE_RANKSEO_API_URL) {
      return process.env.VITE_RANKSEO_API_URL;
    }
    
    // Priority 3: Check for common development ports
    if (typeof window !== 'undefined') {
      // Try multiple common backend ports
      const ports = [5000, 3001, 8000, 8080];
      for (const port of ports) {
        const testUrl = `http://localhost:${port}`;
        // We'll use a simple check - if we're in development mode, assume localhost
        if (process.env.NODE_ENV === 'development' || import.meta.env?.MODE === 'development') {
          return testUrl;
        }
      }
    }
    
    // Priority 4: Relative path (same origin)
    return '';
  };

  // Check if we should use mock data
  const shouldUseMockData = () => {
    // Check for explicit mock flag
    if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_USE_MOCK_DATA === 'true') {
      return true;
    }
    
    // Use mock after connection errors
    if (useMock) {
      return true;
    }
    
    return false;
  };

  // Apply theme based on user preference or system preference
  useEffect(() => {
    const applyTheme = (theme) => {
      const root = document.documentElement;
      Object.entries(theme).forEach(([key, value]) => {
        root.style.setProperty(key, value);
      });
    };

    // Check system preference
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDark(systemPrefersDark);
    applyTheme(systemPrefersDark ? darkTheme : lightTheme);

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      setIsDark(e.matches);
      applyTheme(e.matches ? darkTheme : lightTheme);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    fetchSubscribers();
    fetchStats();
  }, [filters]);

  const fetchSubscribers = async () => {
    // Use mock data if enabled
    if (shouldUseMockData()) {
      setLoading(true);
      setTimeout(() => {
        const filteredSubscribers = mockSubscribers.filter(subscriber =>
          subscriber.email.toLowerCase().includes(filters.search.toLowerCase())
        );
        
        setSubscribers(filteredSubscribers);
        setPagination({
          currentPage: 1,
          totalPages: 1,
          totalSubscribers: filteredSubscribers.length,
          hasNext: false,
          hasPrev: false
        });
        setLoading(false);
      }, 800);
      return;
    }

    try {
      setLoading(true);
      setConnectionError(false);
      const API_BASE = getApiBase();
      
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value.toString());
      });

      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(`${API_BASE}/api/admin/newsletter?${queryParams}`, {
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setSubscribers(data.subscribers || []);
      setPagination(data.pagination || {
        currentPage: 1,
        totalPages: 1,
        totalSubscribers: 0,
        hasNext: false,
        hasPrev: false
      });
      if (data.stats) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Error fetching subscribers:", error);
      
      if (error.name === 'AbortError') {
        setMessage({ 
          type: 'error', 
          text: 'Request timeout. Server is not responding. Using demo data.' 
        });
        setConnectionError(true);
        setUseMock(true);
        // Retry with mock data
        fetchSubscribers();
      } else if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        setMessage({ 
          type: 'error', 
          text: 'Cannot connect to server. Using demo data. Make sure backend is running on localhost:5000' 
        });
        setConnectionError(true);
        setUseMock(true);
        // Retry with mock data
        fetchSubscribers();
      } else {
        setMessage({ type: 'error', text: 'Failed to load newsletter subscribers' });
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    // Use mock data if enabled
    if (shouldUseMockData()) {
      setTimeout(() => {
        setStats(mockStats);
      }, 500);
      return;
    }

    try {
      setConnectionError(false);
      const API_BASE = getApiBase();
      
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${API_BASE}/api/admin/newsletter/stats`, {
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setStats(data.stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      
      if (error.name === 'AbortError' || (error.name === 'TypeError' && error.message.includes('Failed to fetch'))) {
        setConnectionError(true);
        setStats(mockStats); // Use mock stats
      }
    }
  };

  const addSubscriber = async (e) => {
    e.preventDefault();
    if (!newSubscriberEmail.trim()) return;

    // Mock implementation
    if (shouldUseMockData()) {
      setActionLoading('add');
      setTimeout(() => {
        const newSub = {
          _id: Date.now().toString(),
          email: newSubscriberEmail,
          createdAt: new Date().toISOString()
        };
        setSubscribers(prev => [newSub, ...prev]);
        setMessage({ type: 'success', text: 'Subscriber added successfully! (Demo mode)' });
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
      
      const response = await fetch(`${API_BASE}/api/admin/newsletter`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: newSubscriberEmail }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: data.message || 'Subscriber added successfully!' });
        setNewSubscriberEmail('');
        setShowAddForm(false);
        fetchSubscribers();
        fetchStats();
        setTimeout(() => setMessage(null), 3000);
      } else {
        throw new Error(data.message || 'Failed to add subscriber');
      }
    } catch (error) {
      console.error("Error adding subscriber:", error);
      setMessage({ type: 'error', text: error.message || 'Failed to add subscriber' });
    } finally {
      setActionLoading(null);
    }
  };

  const removeSubscriber = async (subscriberId) => {
    // Mock implementation
    if (shouldUseMockData()) {
      setActionLoading(subscriberId);
      setTimeout(() => {
        setSubscribers(prev => prev.filter(sub => sub._id !== subscriberId));
        setSelectedSubscribers(prev => prev.filter(id => id !== subscriberId));
        setMessage({ type: 'success', text: 'Subscriber removed successfully! (Demo mode)' });
        setActionLoading(null);
        setTimeout(() => setMessage(null), 3000);
      }, 800);
      return;
    }

    try {
      setActionLoading(subscriberId);
      const API_BASE = getApiBase();
      
      const response = await fetch(`${API_BASE}/api/admin/newsletter/${subscriberId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Subscriber removed successfully!' });
        fetchSubscribers();
        fetchStats();
        setTimeout(() => setMessage(null), 3000);
      } else {
        throw new Error("Failed to remove subscriber");
      }
    } catch (error) {
      console.error("Error removing subscriber:", error);
      setMessage({ type: 'error', text: 'Failed to remove subscriber' });
    } finally {
      setActionLoading(null);
    }
  };

  const removeMultipleSubscribers = async () => {
    if (selectedSubscribers.length === 0) return;

    // Mock implementation
    if (shouldUseMockData()) {
      setActionLoading('multiple');
      setTimeout(() => {
        setSubscribers(prev => prev.filter(sub => !selectedSubscribers.includes(sub._id)));
        setSelectedSubscribers([]);
        setMessage({ type: 'success', text: `${selectedSubscribers.length} subscribers removed successfully! (Demo mode)` });
        setActionLoading(null);
        setTimeout(() => setMessage(null), 3000);
      }, 800);
      return;
    }

    try {
      setActionLoading('multiple');
      const API_BASE = getApiBase();
      
      const response = await fetch(`${API_BASE}/api/admin/newsletter`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ids: selectedSubscribers }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: data.message || 'Subscribers removed successfully!' });
        setSelectedSubscribers([]);
        fetchSubscribers();
        fetchStats();
        setTimeout(() => setMessage(null), 3000);
      } else {
        throw new Error(data.message || 'Failed to remove subscribers');
      }
    } catch (error) {
      console.error("Error removing subscribers:", error);
      setMessage({ type: 'error', text: error.message || 'Failed to remove subscribers' });
    } finally {
      setActionLoading(null);
    }
  };

  const exportSubscribers = async () => {
    // Mock implementation
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
        
        setMessage({ type: 'success', text: 'Subscribers exported successfully! (Demo mode)' });
        setActionLoading(null);
        setTimeout(() => setMessage(null), 3000);
      }, 1000);
      return;
    }

    try {
      setActionLoading('export');
      const API_BASE = getApiBase();
      
      const response = await fetch(`${API_BASE}/api/admin/newsletter/export`);

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'newsletter-subscribers.csv';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        setMessage({ type: 'success', text: 'Subscribers exported successfully!' });
        setTimeout(() => setMessage(null), 3000);
      } else {
        throw new Error("Failed to export subscribers");
      }
    } catch (error) {
      console.error("Error exporting subscribers:", error);
      setMessage({ type: 'error', text: 'Failed to export subscribers' });
    } finally {
      setActionLoading(null);
    }
  };

  const retryConnection = () => {
    setUseMock(false);
    setConnectionError(false);
    setMessage({ type: 'info', text: 'Retrying connection to server...' });
    fetchSubscribers();
    fetchStats();
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const handleSelectSubscriber = (subscriberId) => {
    setSelectedSubscribers(prev =>
      prev.includes(subscriberId)
        ? prev.filter(id => id !== subscriberId)
        : [...prev, subscriberId]
    );
  };

  const handleSelectAll = () => {
    if (selectedSubscribers.length === subscribers.length) {
      setSelectedSubscribers([]);
    } else {
      setSelectedSubscribers(subscribers.map(s => s._id));
    }
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

  if (loading && subscribers.length === 0) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingText}>Loading newsletter subscribers...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className={styles.header}>
          <div className="flex justify-between items-start">
            <div>
              <h1 className={styles.title}>Newsletter Subscriptions</h1>
              <p className={styles.subtitle}>
                Manage your newsletter subscribers and track subscription growth
                {useMock && " (Demo Mode - Using sample data)"}
              </p>
            </div>
            {connectionError && (
              <button
                onClick={retryConnection}
                className={`${styles.button} ${styles.buttonPrimary}`}
              >
                Retry Connection
              </button>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statContent}>
                <div>
                  <p className={styles.statLabel}>Total Subscribers</p>
                  <p className={styles.statValue}>
                    {stats.total.toLocaleString()}
                  </p>
                </div>
                <div className={`${styles.statIcon} ${styles.iconBlue}`}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statContent}>
                <div>
                  <p className={styles.statLabel}>Today</p>
                  <p className={styles.statValue}>
                    {stats.today.toLocaleString()}
                  </p>
                </div>
                <div className={`${styles.statIcon} ${styles.iconGreen}`}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statContent}>
                <div>
                  <p className={styles.statLabel}>This Week</p>
                  <p className={styles.statValue}>
                    {stats.thisWeek.toLocaleString()}
                  </p>
                </div>
                <div className={`${styles.statIcon} ${styles.iconPurple}`}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statContent}>
                <div>
                  <p className={styles.statLabel}>This Month</p>
                  <p className={styles.statValue}>
                    {stats.thisMonth.toLocaleString()}
                  </p>
                </div>
                <div className={`${styles.statIcon} ${styles.iconOrange}`}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Message */}
        {message && (
          <div
            className={`${styles.message} ${
              message.type === 'success' ? styles.messageSuccess : 
              message.type === 'error' ? styles.messageError : 
              styles.messageInfo
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Action Bar */}
        <div className={styles.actionBar}>
          <div className={styles.actionBarContent}>
            <div className={styles.actionButtons}>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className={`${styles.button} ${styles.buttonPrimary}`}
              >
                + Add Subscriber
              </button>
              
              {selectedSubscribers.length > 0 && (
                <button
                  onClick={removeMultipleSubscribers}
                  disabled={actionLoading === 'multiple'}
                  className={`${styles.button} ${styles.buttonDanger}`}
                >
                  {actionLoading === 'multiple' ? 'Removing...' : `Remove Selected (${selectedSubscribers.length})`}
                </button>
              )}
              
              <button
                onClick={exportSubscribers}
                disabled={actionLoading === 'export' || subscribers.length === 0}
                className={`${styles.button} ${styles.buttonSuccess}`}
              >
                {actionLoading === 'export' ? 'Exporting...' : 'Export CSV'}
              </button>
            </div>

            <div className={styles.searchInput}>
              <input
                type="text"
                placeholder="Search subscribers by email..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className={styles.input}
              />
            </div>
          </div>

          {/* Add Subscriber Form */}
          {showAddForm && (
            <div className={styles.addFormContainer}>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Add New Subscriber</h3>
              <form onSubmit={addSubscriber} className={styles.addForm}>
                <input
                  type="email"
                  placeholder="Enter email address"
                  value={newSubscriberEmail}
                  onChange={(e) => setNewSubscriberEmail(e.target.value)}
                  className={styles.input}
                  required
                />
                <button
                  type="submit"
                  disabled={actionLoading === 'add' || !newSubscriberEmail.trim()}
                  className={`${styles.button} ${styles.buttonSuccess}`}
                >
                  {actionLoading === 'add' ? 'Adding...' : 'Add'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className={`${styles.button} ${styles.buttonSecondary}`}
                >
                  Cancel
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Subscribers Table */}
        <div className={styles.tableContainer}>
          <div className="overflow-x-auto">
            <table className={styles.table}>
              <thead className={styles.tableHead}>
                <tr>
                  <th className={styles.tableHeader} style={{ width: '3rem' }}>
                    <input
                      type="checkbox"
                      checked={selectedSubscribers.length === subscribers.length && subscribers.length > 0}
                      onChange={handleSelectAll}
                      className={styles.checkbox}
                    />
                  </th>
                  <th className={styles.tableHeader}>
                    Email Address
                  </th>
                  <th className={styles.tableHeader}>
                    Subscription Date
                  </th>
                  <th className={styles.tableHeader}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className={styles.tableBody}>
                {subscribers.map((subscriber) => (
                  <tr key={subscriber._id} className={styles.tableRow}>
                    <td className={styles.tableCell}>
                      <input
                        type="checkbox"
                        checked={selectedSubscribers.includes(subscriber._id)}
                        onChange={() => handleSelectSubscriber(subscriber._id)}
                        className={styles.checkbox}
                      />
                    </td>
                    <td className={styles.tableCell}>
                      <div className={styles.emailCell}>
                        {subscriber.email}
                      </div>
                    </td>
                    <td className={styles.tableCell}>
                      <div className={styles.dateCell}>
                        {formatDate(subscriber.createdAt)}
                      </div>
                    </td>
                    <td className={styles.tableCell}>
                      <button
                        onClick={() => removeSubscriber(subscriber._id)}
                        disabled={actionLoading === subscriber._id}
                        className={`${styles.button} ${styles.buttonGhost}`}
                      >
                        {actionLoading === subscriber._id ? 'Removing...' : 'Remove'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {subscribers.length === 0 && !loading && (
            <div className={styles.emptyState}>
              <div className={styles.emptyText}>No subscribers found</div>
              <div className={styles.emptySubtext}>
                {filters.search ? 'Try adjusting your search filter' : 'No newsletter subscribers yet'}
              </div>
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className={styles.pagination}>
              <div className={styles.paginationContent}>
                <div className={styles.paginationText}>
                  Showing {subscribers.length} of {pagination.totalSubscribers.toLocaleString()} subscribers
                </div>
                <div className={styles.paginationButtons}>
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={!pagination.hasPrev}
                    className={`${styles.button} ${styles.buttonSecondary}`}
                  >
                    Previous
                  </button>
                  <div className="flex items-center px-4 text-sm text-gray-700">
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </div>
                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={!pagination.hasNext}
                    className={`${styles.button} ${styles.buttonPrimary}`}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}