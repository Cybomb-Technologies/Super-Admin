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
  Download,
  Upload,
  FileText,
  FileDown,
} from "lucide-react";
import styles from "./EnquiryManager.module.css";
import axios from "axios";

const API_BASE_URL1 = import.meta.env.VITE_AITALS_API_URL;
const API_BASE_URL = `${API_BASE_URL1}`;

function EnquiryManager() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [expandedEnquiry, setExpandedEnquiry] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [exportLoading, setExportLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [templateLoading, setTemplateLoading] = useState(false);
  const [fileInputKey, setFileInputKey] = useState(Date.now());

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
      const enrichedEnquiries = enquiriesData.map((enquiry) => ({
        ...enquiry,
        status: enquiry.status || "new",
        read: enquiry.read || false,
        createdAt: enquiry.createdAt || new Date().toISOString(),
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
    if (!window.confirm("Are you sure you want to delete this enquiry?"))
      return;
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
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ read: !currentStatus }),
      });

      if (res.ok) {
        fetchEnquiries();
      }
    } catch (err) {
      console.error("Error updating read status:", err);
    }
  };

  // ✅ Export enquiries to Excel
  const handleExport = async () => {
    try {
      setExportLoading(true);
      const token = localStorage.getItem("adminToken");
      const response = await fetch(`${API_BASE_URL}/api/enquiry/export`, {
        // headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `enquiries-${new Date().toISOString().split("T")[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error("Export error:", error);
      alert("Export failed. Please try again.");
    } finally {
      setExportLoading(false);
    }
  };

  // ✅ Download enquiry import template
  const handleDownloadTemplate = async () => {
    try {
      setTemplateLoading(true);
      const token = localStorage.getItem("adminToken");
      const response = await fetch(`${API_BASE_URL}/api/enquiry/template`, {
        // headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `enquiry-import-template.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        throw new Error("Failed to download template");
      }
    } catch (error) {
      console.error("Download template error:", error);
      alert("Failed to download template. Please try again.");
    } finally {
      setTemplateLoading(false);
    }
  };

  // ✅ Import enquiries from file
  const handleImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = [
      "text/csv",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];

    const validExtensions = [".csv", ".xls", ".xlsx"];
    const fileExtension = "." + file.name.split(".").pop().toLowerCase();

    if (
      !validTypes.includes(file.type) &&
      !validExtensions.includes(fileExtension)
    ) {
      alert("Please select a valid CSV or Excel file (.csv, .xls, .xlsx)");
      return;
    }

    try {
      setImportLoading(true);
      const formData = new FormData();
      formData.append("file", file);

      const token = localStorage.getItem("adminToken");
      const response = await axios.post(
        `${API_BASE_URL}/api/enquiry/import`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            // Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        alert(response.data.message);
        // Refresh data
        await fetchEnquiries();
      } else {
        alert(`Import failed: ${response.data.message}`);
      }
    } catch (error) {
      console.error("Import error:", error);
      const errorMessage =
        error.response?.data?.message || "Import failed. Please try again.";
      alert(`Import error: ${errorMessage}`);
    } finally {
      setImportLoading(false);
      // Reset file input
      setFileInputKey(Date.now());
    }
  };

  // ✅ Filter enquiries based on search and status
  const filteredEnquiries = enquiries.filter((enquiry) => {
    const matchesSearch =
      enquiry.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enquiry.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enquiry.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enquiry.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enquiry.budget?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "read" && enquiry.read) ||
      (filterStatus === "unread" && !enquiry.read) ||
      (filterStatus === "new" && enquiry.status === "new");

    return matchesSearch && matchesStatus;
  });

  // ✅ Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ✅ Get status badge class
  const getStatusBadgeClass = (enquiry) => {
    if (!enquiry.read) return styles.badgeNew;
    return enquiry.status === "new" ? styles.badgeNew : styles.badgeRead;
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
                {enquiries.filter((e) => !e.read).length}
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

          {/* Import Button */}
          <div className={styles.importContainer}>
            <input
              key={fileInputKey}
              type="file"
              id="import-enquiry-file"
              accept=".csv,.xlsx,.xls"
              onChange={handleImport}
              className={styles.fileInput}
              disabled={importLoading}
            />
            <label
              htmlFor="import-enquiry-file"
              className={`${styles.importButton} ${
                importLoading ? styles.importButtonDisabled : ""
              }`}
            >
              {importLoading ? (
                <Loader className={`w-4 h-4 ${styles.loadingSpinner}`} />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              {importLoading ? "Importing..." : "Import"}
            </label>
          </div>

          {/* Export Button */}
          <button
            onClick={handleExport}
            disabled={exportLoading}
            className={styles.exportButton}
          >
            {exportLoading ? (
              <Loader className={`w-4 h-4 ${styles.loadingSpinner}`} />
            ) : (
              <FileDown className="w-4 h-4" />
            )}
            {exportLoading ? "Exporting..." : "Export"}
          </button>

          {/* Download Template Button */}
          <button
            onClick={handleDownloadTemplate}
            disabled={templateLoading}
            className={styles.templateButton}
          >
            {templateLoading ? (
              <Loader className={`w-4 h-4 ${styles.loadingSpinner}`} />
            ) : (
              <FileText className="w-4 h-4" />
            )}
            {templateLoading ? "Downloading..." : "Download Template"}
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
                : "Enquiry submissions will appear here once users start contacting you."}
            </p>
          </div>
        ) : (
          filteredEnquiries.map((enquiry, index) => (
            <div
              key={enquiry._id || index}
              className={`${styles.enquiryCard} ${
                !enquiry.read ? styles.unread : ""
              }`}
            >
              <div className={styles.enquiryHeader}>
                <div className={styles.enquiryInfo}>
                  <div className={styles.emailSection}>
                    <Mail className={styles.emailIcon} />
                    <span className={styles.email}>
                      {enquiry.email || "N/A"}
                    </span>
                    <span className={getStatusBadgeClass(enquiry)}>
                      {!enquiry.read ? "NEW" : "READ"}
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
                    {enquiry.read ? (
                      <EyeOff className={styles.actionIcon} />
                    ) : (
                      <Eye className={styles.actionIcon} />
                    )}
                  </button>
                  <button
                    onClick={() =>
                      setExpandedEnquiry(
                        expandedEnquiry === enquiry._id ? null : enquiry._id
                      )
                    }
                    className={styles.expandButton}
                  >
                    {expandedEnquiry === enquiry._id ? (
                      <ChevronUp className={styles.actionIcon} />
                    ) : (
                      <ChevronDown className={styles.actionIcon} />
                    )}
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
                    <p className={styles.message}>
                      {enquiry.message || "No message provided"}
                    </p>
                  </div>
                  {(enquiry.company || enquiry.budget) && (
                    <div className={styles.additionalInfo}>
                      {enquiry.company && (
                        <div className={styles.infoItem}>
                          <Building className={styles.infoIcon} />
                          <span className={styles.infoLabel}>Company:</span>
                          <span className={styles.infoValue}>
                            {enquiry.company}
                          </span>
                        </div>
                      )}
                      {enquiry.budget && (
                        <div className={styles.infoItem}>
                          <TrendingUp className={styles.infoIcon} />
                          <span className={styles.infoLabel}>Budget:</span>
                          <span className={styles.infoValue}>
                            {enquiry.budget}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                  <div className={styles.metaInfo}>
                    <div className={styles.metaItem}>
                      <span className={styles.metaLabel}>Enquiry ID:</span>
                      <span className={styles.metaValue}>
                        {enquiry._id || "N/A"}
                      </span>
                    </div>
                    <div className={styles.metaItem}>
                      <span className={styles.metaLabel}>Status:</span>
                      <span className={styles.metaValue}>
                        {enquiry.read ? "Read" : "Unread"}
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
