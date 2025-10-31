import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import styles from "./Users.module.css";

const API_URL = import.meta.env.VITE_SOCIAL_API_URL;

const Users = () => {
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_URL}/api/auth/profile`, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch customers: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        // Sort customers by createdAt in descending order (newest first)
        const sortedCustomers = data.data.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setCustomers(sortedCustomers);
      } else {
        throw new Error(data.message || "Failed to load customers");
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to load customers. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Export to Excel function
  const exportToExcel = () => {
    try {
      // Prepare data for export (already sorted by recent first)
      const exportData = customers.map((customer) => ({
        "User ID": customer._id,
        Name: customer.name,
        Email: customer.email,
        Phone: customer.phone,
        Role: customer.role.charAt(0).toUpperCase() + customer.role.slice(1),
        Status: customer.status || "Active",
        "Join Date": customer.createdAt
          ? new Date(customer.createdAt).toLocaleDateString()
          : "N/A",
        "Join Time": customer.createdAt
          ? new Date(customer.createdAt).toLocaleTimeString()
          : "N/A",
        "Account Age": customer.createdAt
          ? getAccountAge(customer.createdAt)
          : "N/A",
      }));

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);

      // Set column widths for better formatting
      const colWidths = [
        { wch: 25 }, // User ID
        { wch: 20 }, // Name
        { wch: 30 }, // Email
        { wch: 15 }, // Phone
        { wch: 10 }, // Role
        { wch: 10 }, // Status
        { wch: 12 }, // Join Date
        { wch: 12 }, // Join Time
        { wch: 15 }, // Account Age
      ];
      ws["!cols"] = colWidths;

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, "Users");

      // Generate Excel file and trigger download
      const fileName = `users_export_${
        new Date().toISOString().split("T")[0]
      }.xlsx`;
      XLSX.writeFile(wb, fileName);
    } catch (err) {
      console.error("Export error:", err);
      alert("Error exporting data to Excel");
    }
  };

  // Export filtered customers to Excel
  const exportFilteredToExcel = () => {
    try {
      const customersToExport = filteredCustomers;

      const exportData = customersToExport.map((customer) => ({
        "User ID": customer._id,
        Name: customer.name,
        Email: customer.email,
        Phone: customer.phone,
        Role: customer.role.charAt(0).toUpperCase() + customer.role.slice(1),
        Status: customer.status || "Active",
        "Join Date": customer.createdAt
          ? new Date(customer.createdAt).toLocaleDateString()
          : "N/A",
        "Join Time": customer.createdAt
          ? new Date(customer.createdAt).toLocaleTimeString()
          : "N/A",
        "Account Age": customer.createdAt
          ? getAccountAge(customer.createdAt)
          : "N/A",
      }));

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);

      // Set column widths
      const colWidths = [
        { wch: 25 }, // User ID
        { wch: 20 }, // Name
        { wch: 30 }, // Email
        { wch: 15 }, // Phone
        { wch: 10 }, // Role
        { wch: 10 }, // Status
        { wch: 12 }, // Join Date
        { wch: 12 }, // Join Time
        { wch: 15 }, // Account Age
      ];
      ws["!cols"] = colWidths;

      XLSX.utils.book_append_sheet(wb, ws, "Users");

      const fileName = `users_filtered_${
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

  // Filter and sort customers - maintain recent first order
  const filteredCustomers = customers
    .filter(
      (customer) =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone.includes(searchTerm)
    )
    // Maintain the sorted order (already sorted by createdAt descending)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

  const handleViewDetails = (customer) => {
    setSelectedCustomer(customer);
    setShowDetailsModal(true);
  };

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Get relative time (e.g., "2 days ago")
  const getRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffTime / (1000 * 60));

    if (diffMinutes < 60) {
      return `${diffMinutes} minute${diffMinutes !== 1 ? "s" : ""} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
    } else {
      return formatDate(dateString);
    }
  };

  if (loading) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.loadingText}>Loading customers...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.errorText}>{error}</div>
        <button
          onClick={fetchCustomers}
          className={styles.retryButton}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.headerActions}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>User Management</h1>
          <p className={styles.pageSubtitle}>
            Manage User information and track their activity
          </p>
        </div>

        <div className={styles.searchExportContainer}>
          <div className={styles.exportButtons}>
            <button
              className={styles.exportBtn}
              onClick={exportToExcel}
              title="Export all users to Excel"
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
              Export All
            </button>

            {searchTerm && filteredCustomers.length > 0 && (
              <button
                className={styles.exportFilteredBtn}
                onClick={exportFilteredToExcel}
                title="Export filtered users to Excel"
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
                Export Filtered
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Updated Stats Grid - Removed Admin and Filtered User stats */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={`${styles.statValue} ${styles.statValuePrimary}`}>
            {customers.length}
          </div>
          <div className={styles.statLabel}>Total Users</div>
        </div>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead className={styles.tableHeader}>
            <tr>
              <th className={styles.tableHeaderCell}>Name</th>
              <th className={styles.tableHeaderCell}>Contact</th>
              <th className={styles.tableHeaderCell}>Join Date</th>
              <th className={styles.tableHeaderCell}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className={styles.noDataCell}
                >
                  {customers.length === 0
                    ? "No users found"
                    : "No users match your search"}
                </td>
              </tr>
            ) : (
              filteredCustomers.map((customer, index) => {
                const isRecent = index < 5; // Highlight first 5 as most recent
                return (
                  <tr key={customer._id}>
                    <td className={styles.tableCell}>
                      <div className={styles.nameContainer}>
                        {customer.name}
                        {isRecent && (
                          <span className={styles.recentBadge}>New</span>
                        )}
                      </div>
                    </td>
                    <td className={styles.tableCell}>
                      <div>{customer.email}</div>
                      <div className={styles.phoneText}>{customer.phone}</div>
                    </td>
                    <td className={styles.tableCell}>
                      <div>
                        {customer.createdAt
                          ? formatDate(customer.createdAt)
                          : "N/A"}
                      </div>
                      <div className={styles.relativeTime}>
                        {customer.createdAt
                          ? getRelativeTime(customer.createdAt)
                          : ""}
                      </div>
                    </td>
                    <td className={styles.tableCell}>
                      <button
                        className={styles.actionBtn}
                        onClick={() => handleViewDetails(customer)}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Customer Details Modal */}
      {showDetailsModal && selectedCustomer && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowDetailsModal(false)}
        >
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>User Details</h3>
            <div>
              <p>
                <strong>Name:</strong> {selectedCustomer.name}
              </p>
              <p>
                <strong>Email:</strong> {selectedCustomer.email}
              </p>
              <p>
                <strong>Phone:</strong> {selectedCustomer.phone}
              </p>
              <p>
                <strong>Role:</strong> {selectedCustomer.role}
              </p>
              <p>
                <strong>Join Date:</strong>{" "}
                {selectedCustomer.createdAt
                  ? formatDate(selectedCustomer.createdAt)
                  : "N/A"}
              </p>
              <p>
                <strong>Joined:</strong>{" "}
                {selectedCustomer.createdAt
                  ? getRelativeTime(selectedCustomer.createdAt)
                  : "N/A"}
              </p>
              <p>
                <strong>User ID:</strong> {selectedCustomer._id}
              </p>
            </div>
            <div className={styles.modalActions}>
              <button
                className={styles.closeBtn}
                onClick={() => setShowDetailsModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;