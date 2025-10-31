import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import styles from "./Customers.module.css";

const API_URL = import.meta.env.VITE_SOCIAL_API_URL;

const Customers = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [hoveredExport, setHoveredExport] = useState(null);
  const [hoveredFilteredExport, setHoveredFilteredExport] = useState(false);

  // Fetch orders from API
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/orders`);
      const result = await response.json();

      if (result.success) {
        setOrders(result.data);
      } else {
        setError(result.msg || "Failed to fetch orders");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      setError("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Export to Excel function
  const exportToExcel = () => {
    try {
      // Prepare data for export
      const exportData = orders.map((order) => ({
        "Customer Name": order.name,
        "Email": order.email,
        "Phone": order.phone,
        "Service": order.service,
        "Budget": order.serviceBudget,
        "Platform": order.platform,
        "Timeline": order.timeline,
        "Status": order.status.charAt(0).toUpperCase() + order.status.slice(1).replace("_", " "),
        "Created Date": new Date(order.createdAt).toLocaleDateString(),
        "Created Time": new Date(order.createdAt).toLocaleTimeString(),
        "Account Age": getAccountAge(order.createdAt),
      }));

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);

      // Set column widths for better formatting
      const colWidths = [
        { wch: 20 }, // Customer Name
        { wch: 30 }, // Email
        { wch: 15 }, // Phone
        { wch: 25 }, // Service
        { wch: 15 }, // Budget
        { wch: 15 }, // Platform
        { wch: 15 }, // Timeline
        { wch: 12 }, // Status
        { wch: 12 }, // Created Date
        { wch: 12 }, // Created Time
        { wch: 15 }, // Account Age
      ];
      ws["!cols"] = colWidths;

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, "Orders");

      // Generate Excel file and trigger download
      const fileName = `orders_export_${
        new Date().toISOString().split("T")[0]
      }.xlsx`;
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
        "Status": order.status.charAt(0).toUpperCase() + order.status.slice(1).replace("_", " "),
        "Created Date": new Date(order.createdAt).toLocaleDateString(),
        "Created Time": new Date(order.createdAt).toLocaleTimeString(),
        "Account Age": getAccountAge(order.createdAt),
      }));

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);

      // Set column widths
      const colWidths = [
        { wch: 20 }, // Customer Name
        { wch: 30 }, // Email
        { wch: 15 }, // Phone
        { wch: 25 }, // Service
        { wch: 15 }, // Budget
        { wch: 15 }, // Platform
        { wch: 15 }, // Timeline
        { wch: 12 }, // Status
        { wch: 12 }, // Created Date
        { wch: 12 }, // Created Time
        { wch: 15 }, // Account Age
      ];
      ws["!cols"] = colWidths;

      XLSX.utils.book_append_sheet(wb, ws, "Orders");

      const fileName = `orders_${filter}_${
        new Date().toISOString().split("T")[0]
      }.xlsx`;
      XLSX.writeFile(wb, fileName);
    } catch (err) {
      console.error("Export error:", err);
      alert("Error exporting data to Excel");
    }
  };

  // Calculate account age
  const getAccountAge = (createdAt) => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "1 day";
    if (diffDays < 30) return `${diffDays} days`;
    if (diffDays < 60) return "1 month";

    const months = Math.floor(diffDays / 30);
    return `${months} months`;
  };

  // Filter orders based on status
  const filteredOrders = orders.filter(
    (order) => filter === "all" || order.status === filter
  );

  // Get status color
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

  // Get platform color
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

  const getExportButtonStyle = () => {
    const baseStyle = `${styles.exportBtn} ${hoveredExport === 'all' ? styles.exportBtnHover : ''}`;
    return baseStyle;
  };

  const getFilteredExportButtonStyle = () => {
    const baseStyle = `${styles.exportBtn} ${styles.exportBtnFiltered} ${hoveredFilteredExport ? styles.exportBtnFilteredHover : ''}`;
    return baseStyle;
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Order Management</h1>
          <p className={styles.pageSubtitle}>
            View and manage customer orders and services
          </p>
        </div>

        <div className={styles.headerActions}>
          <button
            className={getExportButtonStyle()}
            onClick={exportToExcel}
            title="Export all orders to Excel"
            onMouseEnter={() => setHoveredExport('all')}
            onMouseLeave={() => setHoveredExport(null)}
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
              className={getFilteredExportButtonStyle()}
              onClick={exportFilteredToExcel}
              title={`Export ${filter} orders to Excel`}
              onMouseEnter={() => setHoveredFilteredExport(true)}
              onMouseLeave={() => setHoveredFilteredExport(false)}
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
              Export {filter.charAt(0).toUpperCase() + filter.slice(1).replace("_", " ")}
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className={styles.errorState}>
          <strong>Error:</strong> {error}
          <button
            onClick={() => setError(null)}
            className={styles.errorCloseBtn}
          >
            ×
          </button>
        </div>
      )}

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={`${styles.statValue} ${styles.statValueTotal}`}>
            {orders.length}
          </div>
          <div className={styles.statLabel}>Total Orders</div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.statValue} ${styles.statValuePending}`}>
            {orders.filter((o) => o.status === "pending").length}
          </div>
          <div className={styles.statLabel}>Pending Orders</div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.statValue} ${styles.statValueCompleted}`}>
            {orders.filter((o) => o.status === "completed").length}
          </div>
          <div className={styles.statLabel}>Completed</div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.statValue} ${styles.statValueProgress}`}>
            {orders.filter((o) => o.status === "in_progress").length}
          </div>
          <div className={styles.statLabel}>In Progress</div>
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

      {loading ? (
        <div className={styles.loadingState}>
          <div>Loading orders...</div>
        </div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead className={styles.tableHeader}>
              <tr>
                <th className={styles.tableHeaderCell}>Customer</th>
                <th className={styles.tableHeaderCell}>Service</th>
                <th className={styles.tableHeaderCell}>Platform</th>
                <th className={styles.tableHeaderCell}>Timeline</th>
                <th className={styles.tableHeaderCell}>Status</th>
                <th className={styles.tableHeaderCell}>Created At</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => {
                const statusColor = getStatusColor(order.status);
                const platformColor = getPlatformColor(order.platform);
                
                return (
                  <tr
                    key={order._id}
                    className={styles.tableRow}
                  >
                    <td className={styles.tableCell}>
                      <div>
                        <strong className={styles.customerName}>
                          {order.name}
                        </strong>
                        <div className={styles.customerEmail}>
                          {order.email}
                        </div>
                        <div className={styles.customerPhone}>
                          {order.phone}
                        </div>
                      </div>
                    </td>
                    <td className={styles.tableCell}>
                      <strong className={styles.serviceName}>
                        {order.service}
                      </strong>
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
                    <td className={styles.tableCell}>{order.timeline}</td>
                    <td className={styles.tableCell}>
                      <span
                        className={styles.statusBadge}
                        style={{
                          background: statusColor.bg,
                          color: statusColor.text,
                        }}
                      >
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1).replace("_", " ")}
                      </span>
                    </td>
                    <td className={styles.tableCell}>
                      {new Date(order.createdAt).toLocaleDateString()}
                      <div className={styles.createdTime}>
                        {new Date(order.createdAt).toLocaleTimeString()}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Customers;