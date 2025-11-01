import React, { useEffect, useState } from "react";
import {
  TrendingUp,
  Trash2,
  Mail,
  User,
  Building,
  Phone,
  Loader,
  Search,
  Filter,
  Calendar,
  Eye,
  EyeOff,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Download
} from "lucide-react";
import styles from './EnquiryManager.module.css';

const API_BASE_URL1 = import.meta.env.VITE_AITALS_API_URL;
const API_BASE_URL = `${API_BASE_URL1}`;

function EnquiryManager() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [expandedEnquiry, setExpandedEnquiry] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");

  // ✅ Fetch all enquiries
  const fetchEnquiries = async () => {
    setLoading(true);
    try {
      // const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API_BASE_URL}/api/enquiry`, {
        // headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch enquiries");
      const data = await res.json();
      const enquiriesData = data.data || data;
      // Add status and read status if not present
      const enrichedEnquiries = enquiriesData.map(enquiry => ({
        ...enquiry,
        status: enquiry.status || 'new',
        read: enquiry.read || false,
        createdAt: enquiry.createdAt || new Date().toISOString()
      }));
      setEnquiries(enrichedEnquiries);
    } catch (err) {
      console.error(err);
      alert("Error fetching enquiries");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Delete an enquiry
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this enquiry?")) return;
    try {
      // const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API_BASE_URL}/api/enquiry/${id}`, {
        method: "DELETE",
        // headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        fetchEnquiries();
        if (selectedEnquiry?._id === id) {
          setSelectedEnquiry(null);
        }
      } else {
        throw new Error("Failed to delete enquiry");
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting enquiry");
    }
  };

  // ✅ Mark as read/unread
  const toggleReadStatus = async (id, currentStatus) => {
    try {
      // const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API_BASE_URL}/api/enquiry/${id}`, {
        method: "PATCH",
        headers: {
          // "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ read: !currentStatus })
      });
      
      if (res.ok) {
        fetchEnquiries();
      }
    } catch (err) {
      console.error("Error updating read status:", err);
    }
  };

  // ✅ Filter enquiries based on search and status
  const filteredEnquiries = enquiries.filter(enquiry => {
    const matchesSearch = 
      enquiry.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enquiry.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enquiry.message?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      filterStatus === "all" || 
      (filterStatus === "read" && enquiry.read) ||
      (filterStatus === "unread" && !enquiry.read) ||
      (filterStatus === "new" && enquiry.status === "new");

    return matchesSearch && matchesStatus;
  });

  // ✅ Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // ✅ Get status badge class
  const getStatusBadgeClass = (enquiry) => {
    if (!enquiry.read) return styles.badgeNew;
    return enquiry.status === 'new' ? styles.badgeNew : styles.badgeRead;
  };

  // ✅ Export enquiries to CSV
  const exportToCSV = () => {
    const headers = ['Email', 'Subject', 'Message', 'Date', 'Status'];
    const csvData = filteredEnquiries.map(enquiry => [
      enquiry.email,
      enquiry.subject,
      enquiry.message,
      formatDate(enquiry.createdAt),
      enquiry.read ? 'Read' : 'Unread'
    ]);
    
    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `enquiries-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Loader className={styles.loadingSpinner} />
        <span className={styles.loadingText}>Loading enquiries...</span>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header Section */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerTitleSection}>
            <div className={styles.titleIcon}>
              <MessageSquare className={styles.titleIconSvg} />
            </div>
            <div>
              <h1 className={styles.title}>Enquiry Manager</h1>
              <p className={styles.subtitle}>
                Manage and track all enquiry submissions from your site
              </p>
            </div>
          </div>
          <div className={styles.stats}>
            <div className={styles.statCard}>
              <span className={styles.statNumber}>{enquiries.length}</span>
              <span className={styles.statLabel}>Total</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statNumber}>
                {enquiries.filter(e => !e.read).length}
              </span>
              <span className={styles.statLabel}>Unread</span>
            </div>
          </div>
        </div>
      </div>

      {/* Controls Section */}
      <div className={styles.controls}>
        <div className={styles.searchBox}>
          <Search className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search enquiries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        
        <div className={styles.controlGroup}>
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All Enquiries</option>
            <option value="unread">Unread Only</option>
            <option value="read">Read Only</option>
            <option value="new">New Only</option>
          </select>
          
          <button 
            onClick={exportToCSV}
            className={styles.exportButton}
          >
            <Download className={styles.exportIcon} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Enquiries List */}
      <div className={styles.enquiriesGrid}>
        {filteredEnquiries.length === 0 ? (
          <div className={styles.emptyState}>
            <MessageSquare className={styles.emptyIcon} />
            <h3 className={styles.emptyTitle}>No enquiries found</h3>
            <p className={styles.emptyText}>
              {searchTerm || filterStatus !== "all" 
                ? "Try adjusting your search or filter criteria"
                : "Enquiry submissions will appear here once users start contacting you."
              }
            </p>
          </div>
        ) : (
          filteredEnquiries.map((enquiry, index) => (
            <div 
              key={enquiry._id || index} 
              className={`${styles.enquiryCard} ${!enquiry.read ? styles.unread : ''}`}
            >
              <div className={styles.enquiryHeader}>
                <div className={styles.enquiryInfo}>
                  <div className={styles.emailSection}>
                    <Mail className={styles.emailIcon} />
                    <span className={styles.email}>{enquiry.email || "N/A"}</span>
                    <span className={getStatusBadgeClass(enquiry)}>
                      {!enquiry.read ? 'NEW' : 'READ'}
                    </span>
                  </div>
                  <div className={styles.date}>
                    <Calendar className={styles.dateIcon} />
                    {formatDate(enquiry.createdAt)}
                  </div>
                </div>
                <div className={styles.actions}>
                  <button
                    onClick={() => toggleReadStatus(enquiry._id, enquiry.read)}
                    className={styles.readButton}
                    title={enquiry.read ? "Mark as unread" : "Mark as read"}
                  >
                    {enquiry.read ? <EyeOff className={styles.actionIcon} /> : <Eye className={styles.actionIcon} />}
                  </button>
                  <button
                    onClick={() => setExpandedEnquiry(expandedEnquiry === enquiry._id ? null : enquiry._id)}
                    className={styles.expandButton}
                  >
                    {expandedEnquiry === enquiry._id ? 
                      <ChevronUp className={styles.actionIcon} /> : 
                      <ChevronDown className={styles.actionIcon} />
                    }
                  </button>
                  <button
                    onClick={() => handleDelete(enquiry._id)}
                    className={styles.deleteButton}
                    title="Delete enquiry"
                  >
                    <Trash2 className={styles.actionIcon} />
                  </button>
                </div>
              </div>

              <div className={styles.subject}>
                {enquiry.subject || "No Subject"}
              </div>

              {expandedEnquiry === enquiry._id && (
                <div className={styles.enquiryDetails}>
                  <div className={styles.messageSection}>
                    <h4 className={styles.detailLabel}>Message:</h4>
                    <p className={styles.message}>{enquiry.message || "No message provided"}</p>
                  </div>
                  <div className={styles.metaInfo}>
                    <div className={styles.metaItem}>
                      <span className={styles.metaLabel}>Enquiry ID:</span>
                      <span className={styles.metaValue}>{enquiry._id || "N/A"}</span>
                    </div>
                    <div className={styles.metaItem}>
                      <span className={styles.metaLabel}>Status:</span>
                      <span className={styles.metaValue}>
                        {enquiry.read ? 'Read' : 'Unread'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer Stats */}
      {filteredEnquiries.length > 0 && (
        <div className={styles.footer}>
          <div className={styles.footerStats}>
            Showing {filteredEnquiries.length} of {enquiries.length} enquiries
            {searchTerm && ` • Matching "${searchTerm}"`}
            {filterStatus !== "all" && ` • ${filterStatus} only`}
          </div>
        </div>
      )}
    </div>
  );
}

export default EnquiryManager;