import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import styles from "./PromotionRequests.module.css";

const API_URL = import.meta.env.VITE_SOCIAL_API_URL;

const PromotionRequests = () => {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch orders from API
  const fetchOrders = async (page = 1, statusFilter = "all") => {
    try {
      setLoading(true);
      let url = `${API_URL}/api/orders?page=${page}&limit=10`;
      
      if (statusFilter !== "all") {
        url += `&status=${statusFilter}`;
      }

      const response = await fetch(url);
      const result = await response.json();

      if (result.success) {
        setOrders(result.data);
        setTotalPages(result.pagination?.total || 1);
      } else {
        setError("Failed to fetch orders");
      }
    } catch (err) {
      setError("Error connecting to server");
      console.error("Fetch orders error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(currentPage, filter);
  }, [currentPage, filter]);

  // Filter orders based on search term
  const filteredOrders = orders.filter(order =>
    order.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.platform.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Export to Excel function
  const exportToExcel = () => {
    try {
      const exportData = orders.map((order) => ({
        "Customer Name": order.name,
        "Email": order.email,
        "Phone": order.phone,
        "Service": order.service,
        "Budget": order.serviceBudget,
        "Platform": order.platform,
        "Timeline": order.timeline,
        "Goals": order.goals,
        "Status": order.status.charAt(0).toUpperCase() + order.status.slice(1).replace("_", " "),
        "Source": order.source,
        "Created At": new Date(order.createdAt).toLocaleDateString(),
        "Updated At": new Date(order.updatedAt).toLocaleDateString(),
      }));

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);
      XLSX.utils.book_append_sheet(wb, ws, "Orders");

      const fileName = `orders_export_${new Date().toISOString().split("T")[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);
    } catch (err) {
      console.error("Export error:", err);
      alert("Error exporting data to Excel");
    }
  };

  // Export filtered orders to Excel
  const exportFilteredToExcel = () => {
    try {
      const ordersToExport = filter === "all" ? orders : filteredOrders;

      const exportData = ordersToExport.map((order) => ({
        "Customer Name": order.name,
        "Email": order.email,
        "Phone": order.phone,
        "Service": order.service,
        "Budget": order.serviceBudget,
        "Platform": order.platform,
        "Timeline": order.timeline,
        "Goals": order.goals,
        "Status": order.status.charAt(0).toUpperCase() + order.status.slice(1).replace("_", " "),
        "Source": order.source,
        "Created At": new Date(order.createdAt).toLocaleDateString(),
        "Updated At": new Date(order.updatedAt).toLocaleDateString(),
      }));

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);
      XLSX.utils.book_append_sheet(wb, ws, "Orders");

      const fileName = `orders_${filter}_${new Date().toISOString().split("T")[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);
    } catch (err) {
      console.error("Export error:", err);
      alert("Error exporting data to Excel");
    }
  };

  // Status colors
  const getStatusColor = (status) => {
    const colors = {
      pending: { bg: "#fef3c7", text: "#92400e" },
      confirmed: { bg: "#dbeafe", text: "#1e40af" },
      in_progress: { bg: "#f0f9ff", text: "#0c4a6e" },
      completed: { bg: "#d1fae5", text: "#065f46" },
      cancelled: { bg: "#fee2e2", text: "#991b1b" },
    };
    return colors[status] || colors.pending;
  };

  // Platform colors
  const getPlatformColor = (platform) => {
    const colors = {
      Facebook: { bg: "#dbeafe", text: "#1e40af" },
      Instagram: { bg: "#fce7f3", text: "#be185d" },
      Twitter: { bg: "#e0f2fe", text: "#0369a1" },
      "X (Twitter)": { bg: "#e0f2fe", text: "#0369a1" },
      YouTube: { bg: "#fef2f2", text: "#dc2626" },
      LinkedIn: { bg: "#f0f9ff", text: "#0c4a6e" },
      TikTok: { bg: "#f5f3ff", text: "#7c3aed" },
      Other: { bg: "#f3f4f6", text: "#374151" },
    };
    return colors[platform] || colors.Other;
  };

  // Update order status
  const updateOrderStatus = async (id, newStatus) => {
    try {
      const response = await fetch(`${API_URL}/api/orders/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const result = await response.json();

      if (result.success) {
        setOrders(orders.map((order) =>
          order._id === id ? { ...order, status: newStatus } : order
        ));
      } else {
        alert("Failed to update order status");
      }
    } catch (err) {
      console.error("Update order error:", err);
      alert("Error updating order status");
    }
  };

  // Delete order
  const deleteOrder = async (id) => {
    if (window.confirm("Are you sure you want to delete this order?")) {
      try {
        const response = await fetch(`${API_URL}/api/orders/${id}`, {
          method: "DELETE",
        });

        const result = await response.json();

        if (result.success) {
          setOrders(orders.filter((order) => order._id !== id));
        } else {
          alert("Failed to delete order");
        }
      } catch (err) {
        console.error("Delete order error:", err);
        alert("Error deleting order");
      }
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Pagination handlers
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  if (loading) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.loading}>Loading orders...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.error}>
          <h3>Error</h3>
          <p>{error}</p>
          <button
            onClick={() => fetchOrders(currentPage, filter)}
            className={styles.retryButton}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.headerActions}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Order Management</h1>
          <p className={styles.pageSubtitle}>
            Manage and track all customer orders
          </p>
        </div>

        <div className={styles.exportButtons}>
          <button
            className={styles.exportBtn}
            onClick={exportToExcel}
            title="Export all orders to Excel"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Export All to Excel
          </button>

          {filter !== "all" && (
            <button
              className={`${styles.exportBtn} ${styles.exportFilteredBtn}`}
              onClick={exportFilteredToExcel}
              title={`Export ${filter} orders to Excel`}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              Export {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          )}
        </div>
      </div>

      {/* Search Box */}
      <input
        type="text"
        placeholder="Search orders by name, email, service, or platform..."
        className={styles.searchBox}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={`${styles.statValue} ${styles.statTotal}`}>
            {orders.length}
          </div>
          <div className={styles.statLabel}>Total Orders</div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.statValue} ${styles.statPending}`}>
            {orders.filter((o) => o.status === "pending").length}
          </div>
          <div className={styles.statLabel}>Pending</div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.statValue} ${styles.statConfirmed}`}>
            {orders.filter((o) => o.status === "confirmed").length}
          </div>
          <div className={styles.statLabel}>Confirmed</div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.statValue} ${styles.statInProgress}`}>
            {orders.filter((o) => o.status === "in_progress").length}
          </div>
          <div className={styles.statLabel}>In Progress</div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.statValue} ${styles.statCompleted}`}>
            {orders.filter((o) => o.status === "completed").length}
          </div>
          <div className={styles.statLabel}>Completed</div>
        </div>
      </div>

      <div className={styles.filters}>
        <button
          className={`${styles.filterBtn} ${filter === "all" ? styles.filterBtnActive : ""}`}
          onClick={() => setFilter("all")}
        >
          All Orders
        </button>
        <button
          className={`${styles.filterBtn} ${filter === "pending" ? styles.filterBtnActive : ""}`}
          onClick={() => setFilter("pending")}
        >
          Pending
        </button>
        <button
          className={`${styles.filterBtn} ${filter === "confirmed" ? styles.filterBtnActive : ""}`}
          onClick={() => setFilter("confirmed")}
        >
          Confirmed
        </button>
        <button
          className={`${styles.filterBtn} ${filter === "in_progress" ? styles.filterBtnActive : ""}`}
          onClick={() => setFilter("in_progress")}
        >
          In Progress
        </button>
        <button
          className={`${styles.filterBtn} ${filter === "completed" ? styles.filterBtnActive : ""}`}
          onClick={() => setFilter("completed")}
        >
          Completed
        </button>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead className={styles.tableHeader}>
            <tr>
              <th className={styles.tableHeaderCell}>Customer</th>
              <th className={styles.tableHeaderCell}>Service</th>
              <th className={styles.tableHeaderCell}>Platform</th>
              <th className={styles.tableHeaderCell}>Budget</th>
              <th className={styles.tableHeaderCell}>Timeline</th>
              <th className={styles.tableHeaderCell}>Status</th>
              <th className={styles.tableHeaderCell}>Created</th>
              <th className={styles.tableHeaderCell}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => {
              const statusColor = getStatusColor(order.status);
              const platformColor = getPlatformColor(order.platform);

              return (
                <tr key={order._id}>
                  <td className={styles.tableCell}>
                    <div>
                      <div className={styles.customerName}>
                        {order.name}
                      </div>
                      <div className={styles.customerEmail}>
                        {order.email}
                      </div>
                      <div className={styles.customerPhone}>
                        {order.phone}
                      </div>
                    </div>
                  </td>
                  <td className={styles.tableCell}>
                    <div className={styles.serviceName}>
                      {order.service}
                    </div>
                  </td>
                  <td className={styles.tableCell}>
                    <span
                      className={styles.platformBadge}
                      style={{
                        background: platformColor.bg,
                        color: platformColor.text,
                      }}
                    >
                      {order.platform}
                    </span>
                  </td>
                  <td className={styles.tableCell}>{order.serviceBudget}</td>
                  <td className={styles.tableCell}>{order.timeline}</td>
                  <td className={styles.tableCell}>
                    <span
                      className={styles.statusBadge}
                      style={{
                        background: statusColor.bg,
                        color: statusColor.text,
                      }}
                    >
                      {order.status.charAt(0).toUpperCase() +
                        order.status.slice(1).replace("_", " ")}
                    </span>
                  </td>
                  <td className={styles.tableCell}>
                    <div className={styles.dateText}>
                      {formatDate(order.createdAt)}
                    </div>
                  </td>
                  <td className={styles.tableCell}>
                    <button
                      className={`${styles.actionBtn} ${styles.viewBtn}`}
                      onClick={() => setSelectedOrder(order)}
                    >
                      View
                    </button>
                    <select
                      value={order.status}
                      onChange={(e) =>
                        updateOrderStatus(order._id, e.target.value)
                      }
                      className={styles.statusSelect}
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    <button
                      className={`${styles.actionBtn} ${styles.deleteBtn}`}
                      onClick={() => deleteOrder(order._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Pagination */}
        <div className={styles.pagination}>
          <button
            className={styles.paginationBtn}
            onClick={handlePrevPage}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <div className={styles.paginationInfo}>
            Page {currentPage} of {totalPages}
          </div>
          <button
            className={styles.paginationBtn}
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      </div>

      {selectedOrder && (
        <div
          className={styles.modalOverlay}
          onClick={() => setSelectedOrder(null)}
        >
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>
              Order Details
            </h2>
            <div className={styles.detailGrid}>
              <div className={styles.detailItem}>
                <div className={styles.detailLabel}>Customer Name</div>
                <div className={styles.detailValue}>{selectedOrder.name}</div>
              </div>
              <div className={styles.detailItem}>
                <div className={styles.detailLabel}>Email</div>
                <div className={styles.detailValue}>{selectedOrder.email}</div>
              </div>
              <div className={styles.detailItem}>
                <div className={styles.detailLabel}>Phone</div>
                <div className={styles.detailValue}>{selectedOrder.phone}</div>
              </div>
              <div className={styles.detailItem}>
                <div className={styles.detailLabel}>Service</div>
                <div className={styles.detailValue}>{selectedOrder.service}</div>
              </div>
              <div className={styles.detailItem}>
                <div className={styles.detailLabel}>Budget</div>
                <div className={styles.detailValue}>{selectedOrder.serviceBudget}</div>
              </div>
              <div className={styles.detailItem}>
                <div className={styles.detailLabel}>Platform</div>
                <div className={styles.detailValue}>
                  <span
                    className={styles.platformBadge}
                    style={{
                      background: getPlatformColor(selectedOrder.platform).bg,
                      color: getPlatformColor(selectedOrder.platform).text,
                    }}
                  >
                    {selectedOrder.platform}
                  </span>
                </div>
              </div>
              <div className={styles.detailItem}>
                <div className={styles.detailLabel}>Timeline</div>
                <div className={styles.detailValue}>{selectedOrder.timeline}</div>
              </div>
              <div className={styles.detailItem}>
                <div className={styles.detailLabel}>Status</div>
                <div className={styles.detailValue}>
                  <span
                    className={styles.statusBadge}
                    style={{
                      background: getStatusColor(selectedOrder.status).bg,
                      color: getStatusColor(selectedOrder.status).text,
                    }}
                  >
                    {selectedOrder.status.charAt(0).toUpperCase() +
                      selectedOrder.status.slice(1).replace("_", " ")}
                  </span>
                </div>
              </div>
              <div className={styles.detailItem}>
                <div className={styles.detailLabel}>Source</div>
                <div className={styles.detailValue}>{selectedOrder.source}</div>
              </div>
              <div className={styles.detailItem}>
                <div className={styles.detailLabel}>Created</div>
                <div className={styles.detailValue}>
                  {formatDate(selectedOrder.createdAt)}
                </div>
              </div>
              <div className={styles.detailItem}>
                <div className={styles.detailLabel}>Last Updated</div>
                <div className={styles.detailValue}>
                  {formatDate(selectedOrder.updatedAt)}
                </div>
              </div>
            </div>
            <div className={styles.detailItem}>
              <div className={styles.detailLabel}>Goals</div>
              <div className={styles.messageBox}>{selectedOrder.goals}</div>
            </div>
            {selectedOrder.message && (
              <div className={styles.detailItem}>
                <div className={styles.detailLabel}>Additional Message</div>
                <div className={styles.messageBox}>{selectedOrder.message}</div>
              </div>
            )}
            <button
              className={styles.closeButton}
              onClick={() => setSelectedOrder(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromotionRequests;