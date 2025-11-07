import React, { useEffect, useState, useMemo } from "react";
import * as XLSX from "xlsx";
import axios from "axios";

const API_URL = import.meta.env.VITE_PDF_API_URL;

function Pdfcontact() {
  const [contacts, setContacts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exportLoading, setExportLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [templateLoading, setTemplateLoading] = useState(false);
  const [fileInputKey, setFileInputKey] = useState(Date.now());

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const res = await fetch(`${API_URL}/api/contact`, {
          headers: {
            "Content-Type": "application/json",
          },
          cache: "no-store",
        });

        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

        const data = await res.json();
        console.log("Full API response:", data);

        if (data.success && data.contacts) {
          setContacts(data.contacts);
        } else if (Array.isArray(data)) {
          setContacts(data);
        } else if (data.contacts && Array.isArray(data.contacts)) {
          setContacts(data.contacts);
        } else {
          console.warn("Unexpected data structure:", data);
          setContacts([]);
        }
      } catch (err) {
        console.error("Failed to fetch contacts:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContacts();
  }, []);

  const filteredContacts = useMemo(() => {
    if (!contacts || !Array.isArray(contacts)) return [];
    return contacts.filter((contact) => {
      if (!contact) return false;
      const searchLower = searchTerm.toLowerCase();
      return (
        contact.name?.toLowerCase().includes(searchLower) ||
        contact.email?.toLowerCase().includes(searchLower) ||
        contact.message?.toLowerCase().includes(searchLower)
      );
    });
  }, [contacts, searchTerm]);

  const exportToExcel = async () => {
    try {
      setExportLoading(true);

      const response = await fetch(`${API_URL}/api/contact/export`, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `contacts-${new Date().toISOString().split("T")[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        throw new Error("Export failed");
      }
    } catch (error) {
      console.error("Export error:", error);
      alert("Export failed. Please try again.");
    } finally {
      setExportLoading(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      setTemplateLoading(true);

      const response = await fetch(`${API_URL}/api/contact/template`, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `contact-import-template.xlsx`;
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

      const response = await axios.post(
        `${API_URL}/api/contact/import`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        alert(response.data.message);
        // Refresh contacts data
        const res = await fetch(`${API_URL}/api/contact`, {
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = await res.json();
        if (data.success && data.contacts) {
          setContacts(data.contacts);
        } else if (Array.isArray(data)) {
          setContacts(data);
        }
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

  // Styles
  const styles = {
    container: {
      padding: "30px",
      background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
      minHeight: "100vh",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    },
    card: {
      background: "white",
      borderRadius: "20px",
      padding: "30px",
      boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
      backdropFilter: "blur(10px)",
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "30px",
      flexWrap: "wrap",
      gap: "20px",
    },
    title: {
      fontSize: "32px",
      fontWeight: "700",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      margin: 0,
    },
    searchContainer: {
      display: "flex",
      gap: "15px",
      alignItems: "center",
      flexWrap: "wrap",
    },
    searchBox: { position: "relative", display: "flex", alignItems: "center" },
    searchIcon: {
      position: "absolute",
      left: "15px",
      width: "20px",
      height: "20px",
      color: "#667eea",
    },
    searchInput: {
      padding: "12px 20px 12px 45px",
      border: "2px solid #e2e8f0",
      borderRadius: "15px",
      fontSize: "16px",
      width: "300px",
      outline: "none",
      transition: "all 0.3s ease",
      background: "white",
    },
    actionButtons: {
      display: "flex",
      gap: "10px",
      flexWrap: "wrap",
    },
    button: {
      border: "none",
      padding: "12px 25px",
      borderRadius: "15px",
      fontSize: "16px",
      fontWeight: "600",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      transition: "all 0.3s ease",
    },
    exportButton: {
      background: "linear-gradient(135deg, #4CAF50 0%, #45a049 100%)",
      color: "white",
    },
    importButton: {
      background: "linear-gradient(135deg, #2196F3 0%, #1976D2 100%)",
      color: "white",
    },
    templateButton: {
      background: "linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)",
      color: "white",
    },
    disabledButton: {
      opacity: 0.7,
      cursor: "not-allowed",
    },
    fileInput: {
      display: "none",
    },
    statsContainer: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
      gap: "20px",
      marginBottom: "30px",
    },
    statCard: {
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      color: "white",
      padding: "20px",
      borderRadius: "15px",
      textAlign: "center",
    },
    statValue: { fontSize: "32px", fontWeight: "700", margin: 0 },
    statLabel: { fontSize: "14px", opacity: "0.9", margin: 0 },
    tableContainer: {
      overflow: "hidden",
      borderRadius: "15px",
      background: "white",
      boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
    },
    table: { width: "100%", borderCollapse: "collapse" },
    tableHeader: {
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      color: "white",
    },
    tableHeaderCell: {
      padding: "18px 20px",
      textAlign: "left",
      fontWeight: "600",
    },
    tableCell: { padding: "16px 20px", color: "#475569" },
    messageCell: {
      maxWidth: "300px",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    },
    noData: {
      textAlign: "center",
      padding: "50px",
      color: "#64748b",
      fontSize: "18px",
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>Contact Messages</h1>
          <div style={styles.searchContainer}>
            <div style={styles.searchBox}>
              <svg
                style={styles.searchIcon}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Search contacts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={styles.searchInput}
              />
            </div>
            <div style={styles.actionButtons}>
              {/* Import Button */}
              <div style={{ position: "relative" }}>
                <input
                  key={fileInputKey}
                  type="file"
                  id="import-contact-file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleImport}
                  style={styles.fileInput}
                  disabled={importLoading}
                />
                <label
                  htmlFor="import-contact-file"
                  style={{
                    ...styles.button,
                    ...styles.importButton,
                    ...(importLoading && styles.disabledButton),
                  }}
                >
                  {importLoading ? "Importing..." : "Import"}
                </label>
              </div>

              {/* Export Button */}
              <button
                onClick={exportToExcel}
                disabled={exportLoading}
                style={{
                  ...styles.button,
                  ...styles.exportButton,
                  ...(exportLoading && styles.disabledButton),
                }}
              >
                {exportLoading ? "Exporting..." : "Export"}
              </button>

              {/* Download Template Button */}
              <button
                onClick={handleDownloadTemplate}
                disabled={templateLoading}
                style={{
                  ...styles.button,
                  ...styles.templateButton,
                  ...(templateLoading && styles.disabledButton),
                }}
              >
                {templateLoading ? "Downloading..." : "Download Template"}
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={styles.statsContainer}>
          <div style={styles.statCard}>
            <div style={styles.statValue}>{contacts.length}</div>
            <div style={styles.statLabel}>Total Contacts</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statValue}>{filteredContacts.length}</div>
            <div style={styles.statLabel}>Filtered Results</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statValue}>
              {new Set(contacts.map((c) => c?.email).filter(Boolean)).size}
            </div>
            <div style={styles.statLabel}>Unique Emails</div>
          </div>
        </div>

        {/* Table */}
        {isLoading ? (
          <div style={{ textAlign: "center", padding: "50px" }}>
            <div
              style={{
                width: "50px",
                height: "50px",
                border: "5px solid #f3f3f3",
                borderTop: "5px solid #667eea",
                borderRadius: "50%",
                margin: "auto",
                animation: "spin 1s linear infinite",
              }}
            ></div>
            <p>Loading contact messages...</p>
          </div>
        ) : filteredContacts.length === 0 ? (
          <div style={styles.noData}>
            {searchTerm
              ? "No contacts found matching your search."
              : "No contact messages available."}
          </div>
        ) : (
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead style={styles.tableHeader}>
                <tr>
                  <th style={styles.tableHeaderCell}>Name</th>
                  <th style={styles.tableHeaderCell}>Email</th>
                  <th style={styles.tableHeaderCell}>Message</th>
                  <th style={styles.tableHeaderCell}>Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredContacts.map((contact, index) => (
                  <tr key={contact?._id || index}>
                    <td style={styles.tableCell}>{contact?.name || "N/A"}</td>
                    <td style={styles.tableCell}>{contact?.email || "N/A"}</td>
                    <td
                      style={{ ...styles.tableCell, ...styles.messageCell }}
                      title={contact?.message}
                    >
                      {contact?.message || "No message"}
                    </td>
                    <td style={styles.tableCell}>
                      {contact?.createdAt
                        ? new Date(contact.createdAt).toLocaleDateString(
                            "en-US",
                            { year: "numeric", month: "short", day: "numeric" }
                          )
                        : "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Pdfcontact;
