import { useState, useEffect } from "react";
import { toast } from "sonner";
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
      const token = localStorage.getItem("adminToken");
      
      if (!token) {
        toast.error("No authentication token found");
        return;
      }

      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        ...(filters.status !== "all" && { status: filters.status }),
        ...(filters.search && { search: filters.search }),
      });

      const response = await fetch(
        `${API_URL}/api/contact?${queryParams}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          toast.error("Session expired. Please login again.");
          localStorage.removeItem("adminToken");
          window.location.href = "/admin/login";
          return;
        }
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
      if (error instanceof Error) {
        toast.error(error.message || "Network error");
      } else {
        toast.error("Failed to fetch messages");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [filters]);

  const updateStatus = async (id, newStatus) => {
    try {
      const token = localStorage.getItem("adminToken");
      
      if (!token) {
        toast.error("No authentication token found");
        return;
      }

      const response = await fetch(
        `${API_URL}/api/contact/${id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          toast.error("Session expired. Please login again.");
          localStorage.removeItem("adminToken");
          window.location.href = "/admin/login";
          return;
        }
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
      if (error instanceof Error) {
        toast.error(error.message || "Network error");
      } else {
        toast.error("Failed to update status");
      }
    }
  };

  const deleteMessage = async (id) => {
    if (!confirm("Are you sure you want to delete this message?")) return;

    try {
      const token = localStorage.getItem("adminToken");
      
      if (!token) {
        toast.error("No authentication token found");
        return;
      }

      const response = await fetch(
        `${API_URL}/api/contact/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          toast.error("Session expired. Please login again.");
          localStorage.removeItem("adminToken");
          window.location.href = "/admin/login";
          return;
        }
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
      if (error instanceof Error) {
        toast.error(error.message || "Network error");
      } else {
        toast.error("Failed to delete message");
      }
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      new: { background: "#dbeafe", color: "#1e40af" },
      read: { background: "#f3f4f6", color: "#374151" },
      replied: { background: "#dcfce7", color: "#166534" },
      archived: { background: "#f3e8ff", color: "#7e22ce" },
    };
    
    return colors[status] || { background: "#f3f4f6", color: "#374151" };
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
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>Contact Messages</h1>
          <button 
            onClick={handleRefresh}
            className={styles.refreshButton}
            disabled={loading}
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>
        <div className={styles.stats}>
          Total: {pagination.totalContacts} messages
          {filters.status !== "all" && ` • Filtered: ${messages.length}`}
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className={styles.filterSelect}
          disabled={loading}
        >
          <option value="all">All Status</option>
          <option value="new">New</option>
          <option value="read">Read</option>
          <option value="replied">Replied</option>
          <option value="archived">Archived</option>
        </select>

        <input
          type="text"
          placeholder="Search by name, email, or message..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          className={styles.searchInput}
          disabled={loading}
        />
      </div>

      {/* Messages Table */}
      <div className={styles.tableContainer}>
        {loading ? (
          <div className={styles.loadingState}>
            Loading messages...
          </div>
        ) : messages.length === 0 ? (
          <div className={styles.emptyState}>
            {filters.status !== "all" || filters.search ? "No messages match your filters" : "No messages found"}
          </div>
        ) : (
          <table className={styles.table}>
            <thead className={styles.tableHeader}>
              <tr>
                <th className={styles.tableHeaderCell}>Name</th>
                <th className={styles.tableHeaderCell}>Email</th>
                <th className={styles.tableHeaderCell}>Phone</th>
                <th className={styles.tableHeaderCell}>Message</th>
                <th className={styles.tableHeaderCell}>Status</th>
                <th className={styles.tableHeaderCell}>Date</th>
                <th className={styles.tableHeaderCell}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {messages.map((message) => {
                const statusColor = getStatusColor(message.status);
                return (
                  <tr key={message._id} className={styles.tableRow}>
                    <td className={styles.tableCell}>
                      <strong>{message.name}</strong>
                    </td>
                    <td className={styles.tableCell}>
                      <a
                        href={`mailto:${message.email}`}
                        className={styles.emailLink}
                      >
                        {message.email}
                      </a>
                    </td>
                    <td className={styles.tableCell}>
                      {message.phone ? (
                        <a
                          href={`tel:${message.phone}`}
                          className={styles.phoneLink}
                        >
                          {message.phone}
                        </a>
                      ) : (
                        <span className={styles.notAvailable}>N/A</span>
                      )}
                    </td>
                    <td className={styles.tableCell}>
                      <div
                        className={styles.messagePreview}
                        title={message.message}
                      >
                        {message.message}
                      </div>
                    </td>
                    <td className={styles.tableCell}>
                      <span
                        className={styles.statusBadge}
                        style={{
                          backgroundColor: statusColor.background,
                          color: statusColor.color,
                        }}
                      >
                        {message.status.charAt(0).toUpperCase() + message.status.slice(1)}
                      </span>
                    </td>
                    <td className={styles.tableCell}>
                      <div className={styles.date}>
                        {formatDate(message.createdAt)}
                      </div>
                    </td>
                    <td className={styles.tableCell}>
                      <div className={styles.actionGroup}>
                        <select
                          value={message.status}
                          onChange={(e) =>
                            updateStatus(
                              message._id,
                              e.target.value
                            )
                          }
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
                          title="Delete message"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
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
              className={`${styles.paginationButton} ${
                (!pagination.hasPrev || loading) ? styles.paginationButtonDisabled : ""
              }`}
            >
              Previous
            </button>
            <button
              onClick={() => fetchMessages(pagination.currentPage + 1)}
              disabled={!pagination.hasNext || loading}
              className={`${styles.paginationButton} ${
                (!pagination.hasNext || loading) ? styles.paginationButtonDisabled : ""
              }`}
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