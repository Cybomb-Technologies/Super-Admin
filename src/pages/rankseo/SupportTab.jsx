// app/admin/support/SupportTab.jsx
"use client";

import React, { useState, useEffect } from "react";
import styles from './SupportTab.module.css';

export default function SupportTab() {
  const [messages, setMessages] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [deletingId, setDeletingId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [replyTarget, setReplyTarget] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [isSendingReply, setIsSendingReply] = useState(false);

  const [filters, setFilters] = useState({
    type: "all", priority: "all", status: "all", search: "",
    page: 1, limit: 10, sortBy: "createdAt", sortOrder: "desc"
  });

  const [pagination, setPagination] = useState({
    currentPage: 1, totalPages: 1, totalMessages: 0, hasNext: false, hasPrev: false
  });

  const getApiBase = () => import.meta.env.VITE_RANKSEO_API_URL || "http://localhost:5000";

  useEffect(() => { fetchMessages(); fetchStats(); }, [filters]);

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
          user: msg.user || { _id: 'unknown', email: msg.userEmail || 'unknown', name: msg.userName || 'Unknown' }
        }));
        setMessages(processedMessages);
        setPagination(data.pagination || pagination);
      }
    } catch (error) { console.error(error); } 
    finally { setLoading(false); }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${getApiBase()}/api/admin/support/stats`);
      if (response.ok) { const data = await response.json(); setStats(data.stats); }
    } catch (e) { console.error(e); }
  };

  // --- REPLY LOGIC ---
  const openReplyModal = (msg) => {
    setReplyTarget(msg);
    setReplyText(`Hi ${msg.user?.name || msg.userName || 'User'},\n\nRegarding ticket "${msg.subject}":\n\n`);
    setReplyModalOpen(true);
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyTarget || !replyText.trim()) return;
    try {
      setIsSendingReply(true);
      const res = await fetch(`${getApiBase()}/api/admin/support/messages/${replyTarget._id}/reply`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: replyText, subject: `Re: ${replyTarget.subject}` }),
      });
      if (res.ok) { alert("Reply sent!"); setReplyModalOpen(false); fetchMessages(); }
    } catch (e) { alert("Failed to reply"); }
    finally { setIsSendingReply(false); }
  };

  const deleteMessage = async (id) => {
    if(!window.confirm("Delete this ticket?")) return;
    try {
      setDeletingId(id);
      const res = await fetch(`${getApiBase()}/api/admin/support/messages/${id}`, { method: "DELETE" });
      if (res.ok) { setMessages(prev => prev.filter(m => m._id !== id)); fetchStats(); }
    } catch(e) { alert("Delete failed"); }
    finally { setDeletingId(null); }
  };

  const updateStatus = async (id, status) => {
    setUpdatingId(id);
    try {
      await fetch(`${getApiBase()}/api/admin/support/messages/${id}/status`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      setMessages(prev => prev.map(m => m._id === id ? { ...m, status } : m));
      fetchStats();
    } catch(e) {} finally { setUpdatingId(null); }
  };

  // Helpers
  const formatDate = (date) => new Date(date).toLocaleString('en-US', { month:'short', day:'numeric', year:'numeric', hour:'2-digit', minute:'2-digit' });
  const getTypeColor = (type) => styles[`type${(type||'general').charAt(0).toUpperCase() + (type||'general').slice(1)}`];
  const getPriorityColor = (p) => styles[`priority${(p||'medium').charAt(0).toUpperCase() + (p||'medium').slice(1)}`];
  const getStatusColor = (s) => styles[`status${(s === 'in_progress' ? 'Progress' : (s||'new').charAt(0).toUpperCase() + (s||'new').slice(1))}`];

  if (loading && messages.length === 0) return <div className={styles.loadingContainer}>Loading Support Center...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        
        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.title}><i className="bi bi-headset"></i> Support Center</h1>
          <p className={styles.subtitle}>Manage customer inquiries and tickets</p>
        </div>

        {/* Stats */}
        {stats && (
          <div className={styles.statsGrid}>
            <StatBox label="Total Tickets" val={stats.total} icon="bi-chat-square-text" color="iconBlue" />
            <StatBox label="Recent" val={stats.recent} icon="bi-clock-history" color="iconGreen" />
            <StatBox label="Urgent" val={stats.byPriority?.urgent || 0} icon="bi-exclamation-circle" color="iconRed" />
            <StatBox label="Technical" val={stats.byType?.technical || 0} icon="bi-cpu" color="iconPurple" />
            <StatBox label="New" val={stats.byStatus?.new || 0} icon="bi-stars" color="iconOrange" />
          </div>
        )}

        {/* Filters */}
        <div className={styles.filterSection}>
          <div className={styles.filterGrid}>
             <FilterGroup label="Search" child={<input type="text" placeholder="Search..." value={filters.search} onChange={e => setFilters({...filters, search: e.target.value, page:1})} className={styles.filterInput} />} />
             <FilterGroup label="Type" child={
                <select value={filters.type} onChange={e => setFilters({...filters, type: e.target.value, page:1})} className={styles.filterSelect}>
                   <option value="all">All Types</option><option value="technical">Technical</option><option value="billing">Billing</option><option value="general">General</option>
                </select>
             } />
             <FilterGroup label="Priority" child={
                <select value={filters.priority} onChange={e => setFilters({...filters, priority: e.target.value, page:1})} className={styles.filterSelect}>
                   <option value="all">All</option><option value="urgent">Urgent</option><option value="high">High</option><option value="medium">Medium</option>
                </select>
             } />
             <FilterGroup label="Status" child={
                <select value={filters.status} onChange={e => setFilters({...filters, status: e.target.value, page:1})} className={styles.filterSelect}>
                   <option value="all">All</option><option value="new">New</option><option value="in_progress">In Progress</option><option value="resolved">Resolved</option>
                </select>
             } />
             <FilterGroup label="Sort By" child={
                <select value={filters.sortBy} onChange={e => setFilters({...filters, sortBy: e.target.value})} className={styles.filterSelect}>
                   <option value="createdAt">Date</option><option value="priority">Priority</option>
                </select>
             } />
          </div>
        </div>

        {/* Message List */}
        <div className={styles.messagesContainer}>
          {messages.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyText}>No tickets found</div>
              <div className={styles.emptySubtext}>Try adjusting filters</div>
            </div>
          ) : (
            messages.map(msg => (
              <div key={msg._id} className={styles.messageItem}>
                
                {/* 1. Top Bar */}
                <div className={styles.topBar}>
                   <div className={styles.tagsContainer}>
                      <span className={`${styles.tag} ${getTypeColor(msg.type)}`}>{msg.type}</span>
                      <span className={`${styles.tag} ${getPriorityColor(msg.priority)}`}>{msg.priority}</span>
                   </div>
                   <div className={styles.actionsContainer}>
                      <select 
                        value={msg.status} 
                        onChange={(e) => updateStatus(msg._id, e.target.value)} 
                        className={`${styles.statusSelect} ${getStatusColor(msg.status)}`}
                        disabled={updatingId === msg._id}
                      >
                         <option value="new">New</option><option value="in_progress">In Progress</option><option value="resolved">Resolved</option><option value="closed">Closed</option>
                      </select>
                      
                      <button onClick={() => openReplyModal(msg)} className={styles.replyButton}>
                         Reply
                      </button>

                      <button onClick={() => deleteMessage(msg._id)} disabled={deletingId === msg._id} className={styles.deleteButton} title="Delete">
                         <i className="bi bi-trash"></i>
                      </button>
                   </div>
                </div>

                {/* 2. Subject Line */}
                <h3 className={styles.subject}>{msg.subject}</h3>

                {/* 3. User Info Bar */}
                <div className={styles.userInfoBar}>
                   <div className={styles.userInfoLeft}>
                      <div className={styles.userNameRow}>
                         {msg.user?.name || msg.userName || 'Unknown User'} 
                         <span className={styles.separator}>|</span>
                         <a href={`mailto:${msg.user?.email || msg.userEmail}`} className={styles.userEmailLink}>{msg.user?.email || msg.userEmail}</a>
                      </div>
                      <div className={styles.planRow}>
                         Plan: <span className={styles.planBadge}>{msg.user?.planName || 'FREE'} ({msg.user?.subscriptionStatus || 'INACTIVE'})</span>
                      </div>
                   </div>
                   <div className={styles.userInfoRight}>
                      Received: {formatDate(msg.createdAt)}
                   </div>
                </div>

                {/* 4. Message Content */}
                <div className={styles.messageBody}>
                   {msg.message}
                </div>

              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
           <div className={styles.pagination}>
              <span className={styles.paginationInfo}>Page {pagination.currentPage} of {pagination.totalPages}</span>
              <div className={styles.paginationButtons}>
                 <button className={styles.pageBtn} onClick={() => setFilters({...filters, page: filters.page-1})} disabled={!pagination.hasPrev}>Prev</button>
                 <button className={styles.pageBtn} onClick={() => setFilters({...filters, page: filters.page+1})} disabled={!pagination.hasNext}>Next</button>
              </div>
           </div>
        )}

      </div>

      {/* Reply Window (Modal) */}
      {replyModalOpen && (
         <div className={styles.modalOverlay}>
            <div className={styles.modal}>
               <div className={styles.modalHeader}>
                  <div className={styles.modalTitle}>
                     <i className="bi bi-reply-fill text-primary"></i> 
                     Compose Reply
                  </div>
                  <button onClick={() => setReplyModalOpen(false)} className={styles.modalClose}>
                     <i className="bi bi-x-lg"></i>
                  </button>
               </div>
               
               <form onSubmit={handleSendReply} className={styles.modalBody}>
                  <div className={styles.fieldGroup}>
                     <label className={styles.fieldLabel}>To</label>
                     <div className={styles.readOnlyField}>
                        {replyTarget?.user?.email || replyTarget?.userEmail}
                     </div>
                  </div>

                  <div className={styles.fieldGroup}>
                     <label className={styles.fieldLabel}>Subject</label>
                     <div className={styles.readOnlyField}>
                        Re: {replyTarget?.subject}
                     </div>
                  </div>

                  <div className={styles.fieldGroup}>
                     <label className={styles.fieldLabel}>Message</label>
                     <textarea 
                        value={replyText} 
                        onChange={e => setReplyText(e.target.value)} 
                        className={styles.messageTextarea} 
                        placeholder="Type your response here..."
                        autoFocus
                        required 
                     />
                  </div>

                  <div className={styles.modalFooter}>
                     <button type="button" onClick={() => setReplyModalOpen(false)} className={styles.cancelButton}>
                        Cancel
                     </button>
                     <button type="submit" disabled={isSendingReply} className={styles.submitButton}>
                        {isSendingReply ? (
                           <>Sending...</>
                        ) : (
                           <>Send Reply <i className="bi bi-send-fill"></i></>
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

// Sub-components
const StatBox = ({ label, val, icon, color }) => (
  <div className={styles.statCard}>
    <div className={styles.statContent}>
      <div className={styles.statInfo}>
        <span className={styles.statLabel}>{label}</span>
        <span className={styles.statValue}>{val}</span>
      </div>
      <div className={`${styles.statIcon} ${styles[color]}`}><i className={`bi ${icon}`}></i></div>
    </div>
  </div>
);

const FilterGroup = ({ label, child }) => (
  <div className={styles.filterGroup}>
    <label className={styles.filterLabel}>{label}</label>
    {child}
  </div>
);