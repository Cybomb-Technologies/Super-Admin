import React, { useEffect, useState, useMemo } from "react";
import * as XLSX from "xlsx"; // npm install xlsx
import axios from "axios";

const API_URL = import.meta.env.VITE_PDF_API_URL;

function PDFuser() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [templateLoading, setTemplateLoading] = useState(false);
  const [fileInputKey, setFileInputKey] = useState(Date.now());

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        // const token = localStorage.getItem("pdfpro_admin_token");
        // if (!token) {
        //   alert("No admin token found");
        //   return;
        // }

        const res = await fetch(`${API_URL}/api/auth/users`, {
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await res.json();
        if (!data.success || !data.users) {
          alert("Invalid data received");
          return;
        }

        setUsers(data.users);
      } catch (err) {
        console.error(err);
        alert("Failed to fetch users");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter(
      (user) =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.plan?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  const exportToExcel = async () => {
    try {
      setExportLoading(true);
      // const token = localStorage.getItem("pdfpro_admin_token");

      const response = await fetch(`${API_URL}/api/auth/users/export`, {
        // headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `users-${new Date().toISOString().split("T")[0]}.xlsx`;
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
      // const token = localStorage.getItem("pdfpro_admin_token");

      const response = await fetch(`${API_URL}/api/auth/users/template`, {
        // headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `user-import-template.xlsx`;
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

      // const token = localStorage.getItem("pdfpro_admin_token");
      const response = await axios.post(
        `${API_URL}/api/auth/users/import`,
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
        // Refresh users data
        const res = await fetch(`${API_URL}/api/auth/users`, {
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = await res.json();
        if (data.success && data.users) {
          setUsers(data.users);
        }
      } else {
        alert(`Import failed: ${response.data.error}`);
      }
    } catch (error) {
      console.error("Import error:", error);
      const errorMessage =
        error.response?.data?.error || "Import failed. Please try again.";
      alert(`Import error: ${errorMessage}`);
    } finally {
      setImportLoading(false);
      // Reset file input
      setFileInputKey(Date.now());
    }
  };

  const styles = {
    container: {
      padding: "30px",
      background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
      minHeight: "100vh",
    },
    card: {
      background: "white",
      borderRadius: "20px",
      padding: "30px",
      boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
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
    searchBox: {
      position: "relative",
      display: "flex",
      alignItems: "center",
    },
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
    tableContainer: {
      overflow: "hidden",
      borderRadius: "15px",
      background: "white",
      boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
    },
    tableHeader: {
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      color: "white",
    },
    tableHeaderCell: {
      padding: "18px 20px",
      textAlign: "left",
      fontWeight: "600",
    },
    tableCell: {
      padding: "16px 20px",
      color: "#475569",
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>Users Management</h1>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
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
                placeholder="Search users..."
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
                  id="import-user-file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleImport}
                  style={styles.fileInput}
                  disabled={importLoading}
                />
                <label
                  htmlFor="import-user-file"
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

        {isLoading ? (
          <p style={{ textAlign: "center", padding: "30px" }}>
            Loading users...
          </p>
        ) : filteredUsers.length === 0 ? (
          <p style={{ textAlign: "center", padding: "30px" }}>
            No users found.
          </p>
        ) : (
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead style={styles.tableHeader}>
                <tr>
                  <th style={styles.tableHeaderCell}>Name</th>
                  <th style={styles.tableHeaderCell}>Email</th>
                  <th style={styles.tableHeaderCell}>Role</th>
                  <th style={styles.tableHeaderCell}>Plan</th>
                  <th style={styles.tableHeaderCell}>Joined Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user._id}>
                    <td style={styles.tableCell}>{user.name}</td>
                    <td style={styles.tableCell}>{user.email}</td>
                    <td style={styles.tableCell}>{user.role}</td>
                    <td style={styles.tableCell}>{user.plan || "free"}</td>
                    <td style={styles.tableCell}>
                      {new Date(user.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
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

export default PDFuser;
