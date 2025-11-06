import React, { useEffect, useState } from "react";
import styles from "./admin-management.module.css";

const API_URL = "http://localhost:5000";

function AdminManagement() {
  const [admins, setAdmins] = useState([]);
  const [filteredAdmins, setFilteredAdmins] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState({}); // Track visibility per admin

  // ✅ Fetch admins safely
  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/admin`);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      console.log("Fetched admins:", data);

      const adminsArray = Array.isArray(data) ? data : [];
      setAdmins(adminsArray);
      setFilteredAdmins(adminsArray);
      
      // Initialize showPassword state for each admin
      const passwordVisibility = {};
      adminsArray.forEach(admin => {
        passwordVisibility[admin._id || admin.id] = true; // Default to visible
      });
      setShowPassword(passwordVisibility);
    } catch (error) {
      console.error("Error fetching admins:", error);
      setAdmins([]);
      setFilteredAdmins([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  // ✅ Handle search
  useEffect(() => {
    const results = admins.filter((admin) =>
      admin.username?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredAdmins(results);
  }, [searchTerm, admins]);

  // ✅ Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // ✅ Toggle password visibility
  const togglePasswordVisibility = (adminId) => {
    setShowPassword(prev => ({
      ...prev,
      [adminId]: !prev[adminId]
    }));
  };

  // ✅ Submit form (Add/Edit)
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.username || (!editId && !formData.password)) {
      alert("Please fill in all required fields");
      return;
    }

    const adminData = {
      username: formData.username.trim(),
      password: formData.password,
    };

    console.log("Sending data:", adminData);

    const url = editId
      ? `${API_URL}/admin/update/${editId}`
      : `${API_URL}/admin/register`;

    const method = editId ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(adminData),
      });

      console.log("Response status:", response.status);
      
      const result = await response.json();
      console.log("Response data:", result);
      
      if (response.ok) {
        setFormData({
          username: "",
          password: "",
        });
        setEditId(null);
        setShowModal(false);
        fetchAdmins();
        alert(editId ? "Admin updated successfully!" : "Admin created successfully!");
      } else {
        const errorMessage = result.msg || result.message || result.error || `Server error: ${response.status}`;
        alert(`Error: ${errorMessage}`);
      }
      
    } catch (error) {
      console.error("Network error:", error);
      alert("Network error: Failed to connect to server.");
    }
  };

  // ✅ Delete admin
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this admin?")) {
      try {
        const response = await fetch(`${API_URL}/admin/delete/${id}`, {
          method: "DELETE" 
        });
        
        if (response.ok) {
          fetchAdmins();
          alert("Admin deleted successfully!");
        } else {
          const result = await response.json();
          alert(result.msg || result.message || "Failed to delete admin");
        }
      } catch (error) {
        console.error("Error deleting admin:", error);
        alert("Failed to delete admin. Please try again.");
      }
    }
  };

  // ✅ Edit admin
  const handleEdit = (admin) => {
    setFormData({
      username: admin.username,
      password: admin.password || "", // Pre-fill current password
    });
    setEditId(admin._id || admin.id);
    setShowModal(true);
  };

  // ✅ Copy password to clipboard
  const copyPassword = (password) => {
    navigator.clipboard.writeText(password)
      .then(() => {
        alert("Password copied to clipboard!");
      })
      .catch(err => {
        console.error("Failed to copy password: ", err);
      });
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.titleSection}>
            <h1 className={styles.title}>Admin Management</h1>
            <p className={styles.subtitle}>Manage system administrators - Passwords Visible</p>
          </div>

          <div className={styles.controls}>
            <div className={styles.searchContainer}>
              <span className={styles.searchIcon}>🔍</span>
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Search admins by username..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <button
              className={styles.addButton}
              onClick={() => {
                setEditId(null);
                setFormData({
                  username: "",
                  password: "",
                });
                setShowModal(true);
              }}
            >
              <span className={styles.addIcon}>+</span>
              Create New Admin
            </button>
          </div>
        </div>
      </div>

      {/* ✅ Stats */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>👥</div>
          <div className={styles.statContent}>
            <div className={styles.statNumber}>{admins.length}</div>
            <div className={styles.statLabel}>Total Admins</div>
          </div>
        </div>
      </div>

      {/* ✅ Admin Table */}
      <div className={styles.tableContainer}>
        {loading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <p>Loading admins...</p>
          </div>
        ) : (
          <>
            <table className={styles.adminTable}>
              <thead>
                <tr>
                  <th className={styles.usernameColumn}>Username</th>
                  <th className={styles.passwordColumn}>Password</th>
                  <th className={styles.actionsColumn}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAdmins.map((admin) => (
                  <tr key={admin._id || admin.id} className={styles.tableRow}>
                    <td className={styles.usernameCell}>
                      <div className={styles.adminUsername}>{admin.username}</div>
                    </td>
                    <td className={styles.passwordCell}>
  <div className={styles.passwordContainer}>
    <span className={styles.passwordText}> {/* ✅ Added CSS class */}
      {showPassword[admin._id || admin.id] 
        ? (admin.password || "No password set")
        : "••••••••"
      }
    </span>
    <div className={styles.passwordActions}> {/* ✅ Added CSS class */}
      <button
        className={styles.visibilityButton}
        onClick={() => togglePasswordVisibility(admin._id || admin.id)}
        title={showPassword[admin._id || admin.id] ? "Hide password" : "Show password"}
      >
        {showPassword[admin._id || admin.id] ? "👁️" : "👁️‍🗨️"}
      </button>
      <button
        className={styles.copyButton}
        onClick={() => copyPassword(admin.password)}
        title="Copy password"
      >
        📋
      </button>
    </div>
  </div>
</td>
                    <td className={styles.actionsCell}>
                      <div className={styles.actionButtons}>
                        <button
                          className={styles.editButton}
                          onClick={() => handleEdit(admin)}
                        >
                          <span className={styles.editIcon}>✏️</span>Edit
                        </button>
                        <button
                          className={styles.deleteButton}
                          onClick={() => handleDelete(admin._id || admin.id)}
                        >
                          <span className={styles.deleteIcon}>🗑️</span>Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredAdmins.length === 0 && !loading && (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>👥</div>
                <h3>No admins found</h3>
                <p>
                  {searchTerm
                    ? `No results found for "${searchTerm}"`
                    : "Get started by creating your first admin account!"}
                </p>
                {!searchTerm && (
                  <button
                    className={styles.addButton}
                    onClick={() => setShowModal(true)}
                  >
                    <span className={styles.addIcon}>+</span>
                    Create Your First Admin
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* ✅ Add/Edit Admin Modal */}
      {showModal && (
        <div
          className={styles.modalBackdrop}
          onClick={() => setShowModal(false)}
        >
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h2>{editId ? "Edit Admin" : "Create New Admin"}</h2>
              <button
                className={styles.modalClose}
                onClick={() => setShowModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.modalForm}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Username *</label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className={styles.formInput}
                    placeholder="Enter username"
                    required
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    {editId ? "New Password (leave blank to keep current)" : "Password *"}
                  </label>
                  <input
                    type="text" // Changed to text so password is visible during input
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={styles.formInput}
                    placeholder="Enter password"
                    required={!editId}
                    minLength="6"
                  />
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className={styles.submitButton}>
                  {editId ? "Update Admin" : "Create Admin"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminManagement;