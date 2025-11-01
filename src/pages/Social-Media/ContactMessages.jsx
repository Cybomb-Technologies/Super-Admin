import { useState, useEffect } from "react";
import { toast } from "sonner";
import { 
  RefreshCw, 
  Mail, 
  Phone, 
  Calendar,
  Search,
  Filter,
  User,
  MessageCircle,
  Archive,
  Trash2
} from "lucide-react";
import styles from "./ContactMessages.module.css";

const API_URL = import.meta.env.VITE_SOCIAL_API_URL;

const ContactMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalContacts: 0,
    hasNext: false,
    hasPrev: false,
  });
  const [filters, setFilters] = useState({
    status: "all",
    search: "",
  });

  const fetchMessages = async (page = 1) => {
    try {
      setLoading(true);

      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        ...(filters.status !== "all" && { status: filters.status }),
        ...(filters.search && { search: filters.search }),
      });

      const response = await fetch(`${API_URL}/api/contact?${queryParams}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setMessages(data.data || []);
        setPagination(data.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalContacts: 0,
          hasNext: false,
          hasPrev: false,
        });
      } else {
        toast.error(data.msg || data.message || "Failed to fetch messages");
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error(error.message || "Failed to fetch messages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [filters]);

  const updateStatus = async (id, newStatus) => {
    try {
      const response = await fetch(`${API_URL}/api/contact/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        toast.success(data.msg || "Status updated successfully");
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === id ? { ...msg, status: newStatus } : msg
          )
        );
      } else {
        toast.error(data.msg || data.message || "Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error(error.message || "Failed to update status");
    }
  };

  const deleteMessage = async (id) => {
    if (!confirm("Are you sure you want to delete this message?")) return;

    try {
      const response = await fetch(`${API_URL}/api/contact/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        toast.success(data.msg || "Message deleted successfully");
        setMessages((prev) => prev.filter((msg) => msg._id !== id));
        fetchMessages(pagination.currentPage);
      } else {
        toast.error(data.msg || data.message || "Failed to delete message");
      }
    } catch (error) {
      console.error("Error deleting message:", error);
      toast.error(error.message || "Failed to delete message");
    }
  };

  const getStatusClass = (status) => {
    const statusClasses = {
      new: styles.statusNew,
      read: styles.statusRead,
      replied: styles.statusReplied,
      archived: styles.statusArchived,
    };
    return statusClasses[status] || styles.statusRead;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleRefresh = () => {
    fetchMessages(pagination.currentPage);
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>Contact Messages</h1>
          <button 
            onClick={handleRefresh}
            className={styles.refreshButton}
            disabled={loading}
          >
            <RefreshCw className={loading ? styles.loadingSpinner : ""} size={16} />
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>
        <div className={styles.stats}>
          📩 Total: {pagination.totalContacts} messages
          {filters.status !== "all" && ` • Filtered: ${messages.length}`}
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <div style={{ position: 'relative' }}>
          <Filter size={16} style={{ 
            position: 'absolute', 
            left: '12px', 
            top: '50%', 
            transform: 'translateY(-50%)', 
            color: '#9CA3AF',
            zIndex: 1 
          }} />
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className={styles.filterSelect}
            disabled={loading}
            style={{ paddingLeft: '2.5rem' }}
          >
            <option value="all">All Status</option>
            <option value="new">New</option>
            <option value="read">Read</option>
            <option value="replied">Replied</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        <div style={{ position: 'relative' }}>
          <Search size={16} style={{ 
            position: 'absolute', 
            left: '12px', 
            top: '50%', 
            transform: 'translateY(-50%)', 
            color: '#9CA3AF',
            zIndex: 1 
          }} />
          <input
            type="text"
            placeholder="Search by name, email, or message..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className={styles.searchInput}
            disabled={loading}
            style={{ paddingLeft: '2.5rem' }}
          />
        </div>
      </div>

      {/* Messages Table */}
      <div className={styles.tableContainer}>
        {loading ? (
          <div className={styles.loadingState}>
            <RefreshCw className={styles.loadingSpinner} />
            <span>Loading messages...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className={styles.emptyState}>
            <MessageCircle className={styles.emptyIcon} />
            <h3 className={styles.emptyTitle}>
              {filters.status !== "all" || filters.search
                ? "No messages match your filters"
                : "No messages found"}
            </h3>
            <p className={styles.emptyText}>
              {filters.status !== "all" || filters.search
                ? "Try adjusting your search criteria"
                : "Contact messages will appear here once received"}
            </p>
          </div>
        ) : (
          <table className={styles.table}>
            <thead className={styles.tableHead}>
              <tr>
                <th className={styles.tableHeaderCell}>
                  <User size={14} style={{ display: 'inline', marginRight: '8px' }} />
                  Name
                </th>
                <th className={styles.tableHeaderCell}>
                  <Mail size={14} style={{ display: 'inline', marginRight: '8px' }} />
                  Email
                </th>
                <th className={styles.tableHeaderCell}>
                  <Phone size={14} style={{ display: 'inline', marginRight: '8px' }} />
                  Phone
                </th>
                <th className={styles.tableHeaderCell}>
                  <MessageCircle size={14} style={{ display: 'inline', marginRight: '8px' }} />
                  Message
                </th>
                <th className={styles.tableHeaderCell}>Status</th>
                <th className={styles.tableHeaderCell}>
                  <Calendar size={14} style={{ display: 'inline', marginRight: '8px' }} />
                  Date
                </th>
                <th className={styles.tableHeaderCell}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {messages.map((message, index) => (
                <tr key={message._id} className={styles.tableRow} style={{ animationDelay: `${index * 0.05}s` }}>
                  <td className={styles.tableCell}>
                    <strong>{message.name}</strong>
                  </td>
                  <td className={styles.tableCell}>
                    <a href={`mailto:${message.email}`} className={styles.emailLink}>
                      {message.email}
                    </a>
                  </td>
                  <td className={styles.tableCell}>
                    {message.phone ? (
                      <a href={`tel:${message.phone}`} className={styles.phoneLink}>
                        {message.phone}
                      </a>
                    ) : (
                      <span className={styles.notAvailable}>N/A</span>
                    )}
                  </td>
                  <td className={styles.tableCell}>
                    <div title={message.message} className={styles.messagePreview}>
                      {message.message}
                    </div>
                  </td>
                  <td className={styles.tableCell}>
                    <span className={`${styles.statusBadge} ${getStatusClass(message.status)}`}>
                      {message.status.charAt(0).toUpperCase() + message.status.slice(1)}
                    </span>
                  </td>
                  <td className={styles.tableCell}>
                    <div className={styles.date}>{formatDate(message.createdAt)}</div>
                  </td>
                  <td className={styles.tableCell}>
                    <div className={styles.actionGroup}>
                      <select
                        value={message.status}
                        onChange={(e) => updateStatus(message._id, e.target.value)}
                        className={styles.statusSelect}
                        disabled={loading}
                      >
                        <option value="new">New</option>
                        <option value="read">Read</option>
                        <option value="replied">Replied</option>
                        <option value="archived">Archived</option>
                      </select>
                      <button
                        onClick={() => deleteMessage(message._id)}
                        className={styles.deleteButton}
                        disabled={loading}
                      >
                        <Trash2 size={14} style={{ marginRight: '4px' }} />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {messages.length > 0 && (
        <div className={styles.pagination}>
          <div className={styles.paginationInfo}>
            Showing {(pagination.currentPage - 1) * 10 + 1} to{" "}
            {Math.min(pagination.currentPage * 10, pagination.totalContacts)} of{" "}
            {pagination.totalContacts} messages
          </div>
          <div className={styles.paginationButtons}>
            <button
              onClick={() => fetchMessages(pagination.currentPage - 1)}
              disabled={!pagination.hasPrev || loading}
              className={styles.paginationButton}
            >
              Previous
            </button>
            <button
              onClick={() => fetchMessages(pagination.currentPage + 1)}
              disabled={!pagination.hasNext || loading}
              className={styles.paginationButton}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactMessages;