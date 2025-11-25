// app/admin/support/SupportTab.jsx
"use client";

import React, { useState, useEffect } from "react";
import styles from './SupportTab.module.css';

export default function SupportTab() {
  // Data State
  const [messages, setMessages] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Action State
  const [deletingId, setDeletingId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  
  // Reply Modal State
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [replyTarget, setReplyTarget] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [isSendingReply, setIsSendingReply] = useState(false);

  // Filters State
  const [filters, setFilters] = useState({
    type: "all",
    priority: "all",
    status: "all",
    search: "",
    page: 1,
    limit: 10,
    sortBy: "createdAt",
    sortOrder: "desc"
  });

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalMessages: 0,
    hasNext: false,
    hasPrev: false
  });

  // Get API base URL - fixed for Vite
  const getApiBase = () => {
    return import.meta.env.VITE_RANKSEO_API_URL || "http://localhost:5000";
  };

  useEffect(() => {
    fetchMessages();
    fetchStats();
  }, [filters]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const API_BASE = getApiBase();
      
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== "all") queryParams.append(key, value.toString());
      });

      const response = await fetch(`${API_BASE}/api/admin/support/messages?${queryParams}`);

      if (response.ok) {
        const data = await response.json();
        const processedMessages = (data.messages || []).map((msg) => ({
          ...msg,
          status: msg.status || "new",
          priority: msg.priority || "medium",
          type: msg.type || "general",
          user: msg.user || { 
            _id: msg.user?._id || 'unknown',
            email: msg.userEmail || 'unknown@example.com',
            name: msg.userName || 'Unknown User'
          },
          userEmail: msg.userEmail || msg.user?.email || 'unknown@example.com',
          userName: msg.userName || msg.user?.name || 'Unknown User'
        }));
        setMessages(processedMessages);
        setPagination(data.pagination || pagination);
      } else {
        throw new Error("Failed to fetch messages");
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const API_BASE = getApiBase();
      
      const response = await fetch(`${API_BASE}/api/admin/support/stats`);

      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  // --- REPLY FUNCTIONALITY START ---

  const openReplyModal = (message) => {
    setReplyTarget(message);
    setReplyText(`Hi ${getSafeUserName(message)},\n\nRegarding your ticket "${message.subject}":\n\n`);
    setReplyModalOpen(true);
  };

  const closeReplyModal = () => {
    setReplyModalOpen(false);
    setReplyTarget(null);
    setReplyText("");
    setIsSendingReply(false);
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyTarget || !replyText.trim()) return;

    try {
      setIsSendingReply(true);
      const API_BASE = getApiBase();

      const response = await fetch(`${API_BASE}/api/admin/support/messages/${replyTarget._id}/reply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: replyText,
          subject: `Re: ${replyTarget.subject}`
        }),
      });

      const result = await response.json();

      if (response.ok) {
        fetchMessages();
        fetchStats();
        alert(result.message || "Reply sent successfully!");
        closeReplyModal();
      } else {
        throw new Error(result.message || "Failed to send reply");
      }
    } catch (error) {
      console.error("Error sending reply:", error);
      alert(error.message || "Failed to send email. Please try again.");
    } finally {
      setIsSendingReply(false);
    }
  };

  // Fallback: Open external mail client
  const handleQuickEmail = (email, subject, originalBody) => {
    const emailSubject = subject ? `Re: ${subject}` : 'Response to your support inquiry';
    const bodyContext = originalBody ? `\n\n\n--- Original Message ---\n${originalBody}` : '';
    const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(bodyContext)}`;
    window.location.href = mailtoLink;
  };

  // --- REPLY FUNCTIONALITY END ---

  const deleteMessage = async (id) => {
    if(!window.confirm("Are you sure you want to delete this message?")) return;
    
    try {
      setDeletingId(id);
      const API_BASE = getApiBase();
      
      const response = await fetch(`${API_BASE}/api/admin/support/messages/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setMessages(messages.filter(msg => msg._id !== id));
        fetchStats();
      } else {
        throw new Error("Failed to delete message");
      }
    } catch (error) {
      console.error("Error deleting message:", error);
      alert("Failed to delete message");
    } finally {
      setDeletingId(null);
    }
  };

  const updateMessageStatus = async (id, status) => {
    try {
      setUpdatingId(id);
      const API_BASE = getApiBase();
      
      const response = await fetch(`${API_BASE}/api/admin/support/messages/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        setMessages(messages.map(msg => 
          msg._id === id ? { ...msg, status } : msg
        ));
        fetchStats();
      } else {
        throw new Error("Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  // Helpers
  const getPriorityColor = (priority) => {
    switch (priority) {
      case "urgent": return styles.priorityUrgent;
      case "high": return styles.priorityHigh;
      case "medium": return styles.priorityMedium;
      case "low": return styles.priorityLow;
      default: return styles.priorityMedium;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "technical": return styles.typeTechnical;
      case "billing": return styles.typeBilling;
      case "feature": return styles.typeFeature;
      case "general": return styles.typeGeneral;
      default: return styles.typeGeneral;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "new": return styles.statusNew;
      case "in_progress": return styles.statusInProgress;
      case "resolved": return styles.statusResolved;
      case "closed": return styles.statusClosed;
      default: return styles.statusNew;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown date";
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
      });
    } catch (error) { return "Invalid date"; }
  };

  const formatUserPlan = (user) => {
    if (!user) return "No user data";
    if (!user.planName && !user.subscriptionStatus) return "No plan";
    return `${user.planName || 'Free'} (${user.subscriptionStatus || 'Unknown'})`;
  };

  const getSafeStatus = (message) => { return message.status || "new"; };
  const getSafeUserName = (message) => { return message.userName || message.user?.name || "Unknown User"; };
  const getSafeUserEmail = (message) => { return message.userEmail || message.user?.email || "unknown@example.com"; };

  if (loading && messages.length === 0) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingPulse}>
          <div className={styles.loadingDot}></div>
          <div className={styles.loadingText}>Loading support messages...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.title}>Support Messages</h1>
          <p className={styles.subtitle}>Manage and review customer support inquiries and feedback</p>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statContent}>
                <div className={styles.statInfo}>
                  <p className={styles.statLabel}>Total Messages</p>
                  <p className={styles.statValue}>{stats.total}</p>
                </div>
                <div className={`${styles.statIcon} ${styles.iconBlue}`}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statContent}>
                <div className={styles.statInfo}>
                  <p className={styles.statLabel}>Last 7 Days</p>
                  <p className={styles.statValue}>{stats.recent}</p>
                </div>
                <div className={`${styles.statIcon} ${styles.iconGreen}`}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statContent}>
                <div className={styles.statInfo}>
                  <p className={styles.statLabel}>Urgent Priority</p>
                  <p className={styles.statValue}>{stats.byPriority.urgent || 0}</p>
                </div>
                <div className={`${styles.statIcon} ${styles.iconRed}`}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statContent}>
                <div className={styles.statInfo}>
                  <p className={styles.statLabel}>Technical Issues</p>
                  <p className={styles.statValue}>{stats.byType.technical || 0}</p>
                </div>
                <div className={`${styles.statIcon} ${styles.iconPurple}`}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                </div>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statContent}>
                <div className={styles.statInfo}>
                  <p className={styles.statLabel}>New Messages</p>
                  <p className={styles.statValue}>{stats.byStatus.new || 0}</p>
                </div>
                <div className={`${styles.statIcon} ${styles.iconOrange}`}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.5 17.5L9 13l2.5 2.5L16 10l4.5 4.5" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className={styles.filterSection}>
          <div className={styles.filterGrid}>
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Search</label>
              <input
                type="text"
                placeholder="Search messages..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className={styles.filterInput}
              />
            </div>
            
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Type</label>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange("type", e.target.value)}
                className={styles.filterSelect}
              >
                <option value="all">All Types</option>
                <option value="technical">Technical</option>
                <option value="billing">Billing</option>
                <option value="general">General</option>
                <option value="feature">Feature Request</option>
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Priority</label>
              <select
                value={filters.priority}
                onChange={(e) => handleFilterChange("priority", e.target.value)}
                className={styles.filterSelect}
              >
                <option value="all">All Priorities</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className={styles.filterSelect}
              >
                <option value="all">All Status</option>
                <option value="new">New</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Sort By</label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                className={styles.filterSelect}
              >
                <option value="createdAt">Date</option>
                <option value="priority">Priority</option>
                <option value="type">Type</option>
                <option value="status">Status</option>
              </select>
            </div>
          </div>
        </div>

        {/* Messages List */}
        <div className={styles.messagesContainer}>
          {messages.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyText}>No messages found</div>
              <div className={styles.emptySubtext}>Try adjusting your filters</div>
            </div>
          ) : (
            <div className={styles.messagesList}>
              {messages.map((message) => {
                const safeStatus = getSafeStatus(message);
                const safeUserName = getSafeUserName(message);
                const safeUserEmail = getSafeUserEmail(message);
                
                return (
                  <div key={message._id} className={styles.messageItem}>
                    <div className={styles.messageHeader}>
                      <div className={styles.messageTitle}>
                        <h3 className={styles.messageSubject}>
                          {message.subject}
                        </h3>
                        
                        {/* Tags */}
                        <div className={styles.tagsContainer}>
                          <span className={`${styles.tag} ${getTypeColor(message.type)}`}>
                            {message.type?.charAt(0).toUpperCase() + message.type?.slice(1) || 'General'}
                          </span>
                          <span className={`${styles.tag} ${getPriorityColor(message.priority)}`}>
                            {message.priority?.charAt(0).toUpperCase() + message.priority?.slice(1) || 'Medium'}
                          </span>
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className={styles.messageActions}>
                        <select
                          value={safeStatus}
                          onChange={(e) => updateMessageStatus(message._id, e.target.value)}
                          disabled={updatingId === message._id}
                          className={`${styles.statusSelect} ${getStatusColor(safeStatus)}`}
                        >
                          <option value="new">New</option>
                          <option value="in_progress">In Progress</option>
                          <option value="resolved">Resolved</option>
                          <option value="closed">Closed</option>
                        </select>
                        
                        <button
                          onClick={() => openReplyModal(message)}
                          className={`${styles.actionButton} ${styles.replyButton}`}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                          </svg>
                          <span>Reply</span>
                        </button>

                        <button
                          onClick={() => deleteMessage(message._id)}
                          disabled={deletingId === message._id}
                          className={`${styles.actionButton} ${styles.deleteButton}`}
                        >
                          {deletingId === message._id ? '...' : 'Delete'}
                        </button>
                      </div>
                    </div>

                    {/* User Information */}
                    <div className={styles.userInfo}>
                      <div className={styles.userDetails}>
                        <div className={styles.userName}>
                          <span>{safeUserName}</span>
                          <span>|</span>
                          <button
                            onClick={() => handleQuickEmail(safeUserEmail, message.subject, message.message)}
                            className={styles.userEmail}
                            title="Open in Default Mail Client"
                          >
                            {safeUserEmail}
                          </button>
                        </div>
                        <div className={styles.userPlan}>
                          <span>Plan:</span>
                          <span className={`${styles.planBadge} ${
                            message.user?.subscriptionStatus === 'active' 
                              ? styles.planActive 
                              : styles.planInactive
                          }`}>
                            {formatUserPlan(message.user)}
                          </span>
                        </div>
                      </div>
                      <div className={styles.userMeta}>
                        <div><span>Received:</span> {formatDate(message.createdAt)}</div>
                      </div>
                    </div>
                    
                    {/* Message Content */}
                    <div className={styles.messageContent}>
                      <p className={styles.messageText}>
                        {message.message}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className={styles.pagination}>
            <div className={styles.paginationInfo}>
              Showing {((filters.page - 1) * filters.limit) + 1} to {Math.min(filters.page * filters.limit, pagination.totalMessages)} of {pagination.totalMessages} messages
            </div>
            <div className={styles.paginationButtons}>
              <button
                onClick={() => handlePageChange(filters.page - 1)}
                disabled={!pagination.hasPrev}
                className={styles.paginationButton}
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(filters.page + 1)}
                disabled={!pagination.hasNext}
                className={styles.paginationButton}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* --- REPLY MODAL --- */}
      {replyModalOpen && replyTarget && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            {/* Modal Header */}
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
                Reply to Support Ticket
              </h3>
              <button 
                onClick={closeReplyModal}
                className={styles.modalClose}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSendReply} className={styles.modalBody}>
              <div className={styles.recipientGrid}>
                <div className={styles.recipientField}>
                  <span className={styles.recipientLabel}>To</span>
                  <div className={styles.recipientValue}>{getSafeUserEmail(replyTarget)}</div>
                </div>
                <div className={styles.recipientField}>
                  <span className={styles.recipientLabel}>Subject</span>
                  <div className={styles.recipientValue}>Re: {replyTarget.subject}</div>
                </div>
              </div>

              <div>
                <label className={styles.filterLabel}>Message</label>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows={8}
                  className={styles.messageTextarea}
                  placeholder="Type your reply here..."
                  required
                />
              </div>

              <div className={styles.modalFooter}>
                <button
                  type="button"
                  onClick={closeReplyModal}
                  className={styles.cancelButton}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSendingReply}
                  className={styles.submitButton}
                >
                  {isSendingReply ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Reply
                      <svg className="ml-2 -mr-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}