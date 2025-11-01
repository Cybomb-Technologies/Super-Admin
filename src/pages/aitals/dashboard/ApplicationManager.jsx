import React, { useState, useEffect } from "react";
import {
  Briefcase,
  Trash2,
  FileText,
  X,
  Loader,
  Search,
  ChevronDown,
  ChevronUp,
  Download,
  FileDown,
  Users,
  Mail,
  UserCheck,
  CheckCircle
} from "lucide-react";
import * as XLSX from 'xlsx';
import styles from './ApplicationManager.module.css';

const API_BASE_URL = import.meta.env.VITE_AITALS_API_URL;

const ApplicationManager = ({ applications = [], onDelete }) => {
  const [data, setData] = useState(applications);
  const [loading, setLoading] = useState(!applications.length);
  const [resumePopup, setResumePopup] = useState({
    isOpen: false,
    content: null,
    fileName: "",
    isLoading: false,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [exportLoading, setExportLoading] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  // ✅ Fetch applications (if not passed as props)
  const fetchApplications = async () => {
    try {
      setLoading(true);
      // const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API_BASE_URL}/api/application`, {
        // headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch applications");
      const json = await res.json();
      setData(json.data || json);
    } catch (err) {
      console.error("Error fetching applications:", err);
      alert("Error fetching applications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!applications.length) fetchApplications();
  }, []);

  // ✅ Delete handler (can work standalone)
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this application?")) return;
    try {
      // const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API_BASE_URL}/api/application/${id}`, {
        method: "DELETE",
        // headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Delete failed");
      fetchApplications();
    } catch (err) {
      console.error("Error deleting application:", err);
      alert("Error deleting application");
    }
  };

  // ✅ Resume view
  const handleViewResume = async (applicationId, fileName) => {
    try {
      setResumePopup({ isOpen: true, isLoading: true, fileName });
      // const token = localStorage.getItem("adminToken");
      const response = await fetch(
        `${API_BASE_URL}/api/application/${applicationId}/resume`,
        {
          // headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        setResumePopup({ isOpen: true, isLoading: false, content: url, fileName });
      } else {
        throw new Error("Failed to fetch resume");
      }
    } catch (error) {
      console.error("Error viewing resume:", error);
      alert("Error opening resume file");
      closeResumePopup();
    }
  };

  const closeResumePopup = () => {
    if (resumePopup.content) window.URL.revokeObjectURL(resumePopup.content);
    setResumePopup({ isOpen: false, content: null, fileName: "", isLoading: false });
  };

  // ✅ Export to Excel functionality
  const exportToExcel = () => {
    setExportLoading(true);
    
    try {
      // Prepare data for export
      const exportData = filteredData.map((item, index) => ({
        'No.': index + 1,
        'Name': item.name || 'N/A',
        'Email': item.email || 'N/A',
        'Role': item.role || 'N/A',
        'Phone': item.phone || 'N/A',
        'Experience': item.experience || 'N/A',
        'Education': item.education || 'N/A',
        'Skills': item.skills ? item.skills.join(', ') : 'N/A',
        'Resume File': item.resume?.originalName || 'No Resume',
        'Applied Date': item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A',
        'Status': item.status || 'Applied'
      }));

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);

      // Style the header row
      const headerStyle = {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "6666CC" } },
        border: {
          top: { style: "thin", color: { rgb: "4444AA" } },
          bottom: { style: "thin", color: { rgb: "4444AA" } },
          left: { style: "thin", color: { rgb: "4444AA" } },
          right: { style: "thin", color: { rgb: "4444AA" } }
        }
      };

      // Apply header styles
      const range = XLSX.utils.decode_range(ws['!ref']);
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const address = XLSX.utils.encode_cell({ r: 0, c: C });
        if (!ws[address]) continue;
        ws[address].s = headerStyle;
      }

      // Set column widths
      ws['!cols'] = [
        { wch: 5 },  // No.
        { wch: 20 }, // Name
        { wch: 25 }, // Email
        { wch: 15 }, // Role
        { wch: 15 }, // Phone
        { wch: 12 }, // Experience
        { wch: 20 }, // Education
        { wch: 25 }, // Skills
        { wch: 20 }, // Resume File
        { wch: 15 }, // Applied Date
        { wch: 12 }  // Status
      ];

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, "Applications");

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `applications_${timestamp}.xlsx`;

      // Save the file
      XLSX.writeFile(wb, filename);

      // Show success message
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);

    } catch (error) {
      console.error('Error exporting to Excel:', error);
      alert('Error exporting data to Excel');
    } finally {
      setExportLoading(false);
    }
  };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ✅ Filter & sort
  const filteredData = data
    .filter((item) => {
      if (!searchTerm) return true;
      return Object.values(item)
        .join(" ")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    })
    .sort((a, b) => {
      if (!sortConfig.key) return 0;
      const aVal = a[sortConfig.key]?.toString().toLowerCase() || "";
      const bVal = b[sortConfig.key]?.toString().toLowerCase() || "";
      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });

  const handleSort = (key) => {
    setSortConfig((current) => ({
      key,
      direction: current.key === key && current.direction === "asc" ? "desc" : "asc",
    }));
  };

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey)
      return <ChevronDown className="w-4 h-4 opacity-30" />;
    return sortConfig.direction === "asc" ? (
      <ChevronUp className="w-4 h-4" />
    ) : (
      <ChevronDown className="w-4 h-4" />
    );
  };

  // Calculate statistics
  const stats = {
    total: data.length,
    withResume: data.filter(item => item.resume?.filename).length,
    uniqueRoles: [...new Set(data.map(item => item.role))].length,
    recentApplications: data.filter(item => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(item.createdAt) > weekAgo;
    }).length
  };

  if (loading) {
    return (
      <div className={styles.loadingState}>
        <Loader className={styles.loadingSpinner} />
        <span>Loading applications...</span>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header Section */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <div className={styles.titleBadge}>
            <Briefcase className={styles.titleIcon} />
            Application Manager ({filteredData.length})
          </div>
        </div>

        <div className={styles.controls}>
          <div className={styles.searchContainer}>
            <Search className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search applications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <button 
            onClick={exportToExcel} 
            disabled={exportLoading || filteredData.length === 0}
            className={styles.exportButton}
          >
            {exportLoading ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <FileDown className="w-4 h-4" />
            )}
            {exportLoading ? 'Exporting...' : 'Export Excel'}
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className={styles.statsContainer}>
        <div className={styles.statCard}>
          <div className={styles.statNumber}>{stats.total}</div>
          <div className={styles.statLabel}>
            <Users className="w-4 h-4 inline mr-1" />
            Total Applications
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statNumber}>{stats.withResume}</div>
          <div className={styles.statLabel}>
            <FileText className="w-4 h-4 inline mr-1" />
            With Resume
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statNumber}>{stats.uniqueRoles}</div>
          <div className={styles.statLabel}>
            <UserCheck className="w-4 h-4 inline mr-1" />
            Unique Roles
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statNumber}>{stats.recentApplications}</div>
          <div className={styles.statLabel}>
            <Mail className="w-4 h-4 inline mr-1" />
            This Week
          </div>
        </div>
      </div>

      {/* Applications Table */}
      {filteredData.length === 0 ? (
        <div className={styles.emptyState}>
          No applications found. {searchTerm && 'Try changing your search terms.'}
        </div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead className={styles.tableHead}>
              <tr>
                {["Name", "Email", "Role", "Resume"].map((header) => {
                  const key = header.toLowerCase();
                  return (
                    <th
                      key={header}
                      className={styles.tableHeader}
                      onClick={() => handleSort(key)}
                    >
                      <div className={styles.sortContainer}>
                        <span>{header}</span>
                        <SortIcon columnKey={key} />
                      </div>
                    </th>
                  );
                })}
                <th className={styles.tableHeader}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item) => (
                <tr key={item._id} className={styles.tableRow}>
                  <td className={styles.tableCell}>
                    <strong>{item.name}</strong>
                  </td>
                  <td className={styles.tableCell}>
                    {item.email}
                  </td>
                  <td className={styles.tableCell}>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                      {item.role}
                    </span>
                  </td>
                  <td className={styles.tableCell}>
                    {item.resume?.filename ? (
                      <button
                        onClick={() =>
                          handleViewResume(item._id, item.resume.originalName)
                        }
                        className={styles.resumeButton}
                      >
                        <FileText className="w-4 h-4" />
                        View Resume
                      </button>
                    ) : (
                      <span className="text-gray-400 italic text-sm">No Resume</span>
                    )}
                  </td>
                  <td className={styles.tableCell}>
                    <button
                      onClick={() => (onDelete ? onDelete(item._id) : handleDelete(item._id))}
                      className={styles.deleteButton}
                      title="Delete Application"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ✅ Resume Popup */}
      {resumePopup.isOpen && (
        <div
          className={styles.modalOverlay}
          onClick={(e) => e.target === e.currentTarget && closeResumePopup()}
        >
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                <FileText className="w-5 h-5" />
                Resume: {resumePopup.fileName}
              </h3>
              <button onClick={closeResumePopup} className={styles.modalClose}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className={styles.modalBody}>
              {resumePopup.isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader className="w-8 h-8 animate-spin text-[#6666CC]" />
                  <span className="ml-3">Loading Resume...</span>
                </div>
              ) : resumePopup.content ? (
                <iframe
                  src={resumePopup.content}
                  className={styles.resumeFrame}
                  title="Resume Preview"
                />
              ) : (
                <p className="text-center text-gray-500">Unable to load resume.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Export Success Notification */}
      {exportSuccess && (
        <div className={styles.exportSuccess}>
          <CheckCircle className="w-5 h-5" />
          <span>Data exported successfully!</span>
        </div>
      )}
    </div>
  );
};

export default ApplicationManager;