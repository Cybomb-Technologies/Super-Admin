import React, { useState, useEffect } from "react";
import "./AdminRegister.css";

const API_URL = "https://api.aitals.com";

function AdminManagement() {
  const [admins, setAdmins] = useState([]);
  const [filteredAdmins, setFilteredAdmins] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: ""
  });
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPasswords, setShowPasswords] = useState({});

  // Get auth token from localStorage
  const getAuthToken = () => {
    const token = localStorage.getItem('adminToken') || '';
    if (!token) {
      console.warn("No authentication token found");
    }
    return token;
  };

  // ✅ Fetch admins with passwords
  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      
      const response = await fetch(`${API_URL}/api/admin/admin-passwords`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log("📦 Admins data received:", result);
      
      if (result.success && Array.isArray(result.admins)) {
        const adminsArray = result.admins;
        setAdmins(adminsArray);
        setFilteredAdmins(adminsArray);
        
        // Initialize password visibility state
        const visibilityState = {};
        adminsArray.forEach(admin => {
          const adminId = admin.id || admin._id;
          visibilityState[adminId] = false;
        });
        setShowPasswords(visibilityState);
      } else {
        throw new Error(result.message || "Failed to fetch admins");
      }
    } catch (error) {
      console.error("❌ Error fetching admins:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  // ✅ Get stable admin ID (handles both id and _id)
  const getAdminId = (admin) => {
    return admin.id || admin._id || `admin-${Math.random().toString(36).substr(2, 9)}`;
  };

  // ✅ Toggle password visibility
  const togglePasswordVisibility = (adminId) => {
    setShowPasswords(prev => ({
      ...prev,
      [adminId]: !prev[adminId]
    }));
  };

  // ✅ Handle search
  useEffect(() => {
    const results = admins.filter((admin) =>
      admin.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredAdmins(results);
  }, [searchTerm, admins]);

  // ✅ Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // ✅ Fixed: Submit form (Add/Edit)
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.email.trim()) {
      alert("Name and email are required");
      return;
    }

    if (!editId && !formData.password) {
      alert("Password is required for new admin");
      return;
    }

    if (formData.password && formData.password.length < 6) {
      alert("Password must be at least 6 characters long");
      return;
    }

    const adminData = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      isAdmin: true
    };

    if (formData.password) {
      adminData.password = formData.password;
    }

    try {
      const token = getAuthToken();
      let url, method;

      if (editId) {
        url = `${API_URL}/api/admin/admin/${editId}`;
        method = "PUT";
      } else {
        url = `${API_URL}/api/admin/register`;
        method = "POST";
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(adminData),
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        setFormData({ name: "", email: "", password: "" });
        setEditId(null);
        setShowModal(false);
        fetchAdmins();
        alert(editId ? "Admin updated successfully!" : "Admin created successfully!");
      } else {
        alert(`Error: ${result.message}`);
      }
      
    } catch (error) {
      console.error("🌐 Network error:", error);
      alert("Network error: Failed to connect to server.");
    }
  };

  // ✅ FIXED: Delete admin function
  const handleDelete = async (admin) => {
    const adminId = getAdminId(admin);
    console.log("🔍 Debug - Admin ID to delete:", adminId);
    
    if (!adminId || adminId === "undefined") {
      alert("Error: Invalid admin ID");
      return;
    }

    if (window.confirm(`Are you sure you want to delete admin "${admin.name}"?`)) {
      try {
        const token = getAuthToken();
        console.log("🗑️ Deleting admin with ID:", adminId);
        
        const response = await fetch(`${API_URL}/api/admin/admin/${adminId}`, {
          method: "DELETE",
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        console.log("🗑️ Delete response status:", response.status);

        // Check if response is JSON
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const result = await response.json();
          
          if (response.ok && result.success) {
            fetchAdmins();
            alert("Admin deleted successfully!");
          } else {
            alert(result.message || "Failed to delete admin");
          }
        } else {
          const text = await response.text();
          console.error("Non-JSON response:", text);
          alert(`Server error: ${response.status}. Please check the console.`);
        }
      } catch (error) {
        console.error("❌ Error deleting admin:", error);
        alert("Failed to delete admin. Please try again.");
      }
    }
  };

  // ✅ Fixed: Edit admin
  const handleEdit = (admin) => {
    const adminId = getAdminId(admin);
    console.log("✏️ Editing admin:", admin);
    console.log("✏️ Admin ID:", adminId);
    
    if (!adminId) {
      alert("Error: Invalid admin data");
      return;
    }

    setFormData({
      name: admin.name,
      email: admin.email,
      password: ""
    });
    setEditId(adminId);
    setShowModal(true);
  };

  // ✅ Copy to clipboard
  const copyToClipboard = (text) => {
    if (!text || text === "No password set") {
      alert("No text to copy");
      return;
    }
    
    navigator.clipboard.writeText(text)
      .then(() => {
        alert("Copied to clipboard!");
      })
      .catch(err => {
        console.error("Failed to copy: ", err);
        const textArea = document.createElement("textarea");
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        alert("Copied to clipboard!");
      });
  };

  // ✅ Format password for display
  const formatPassword = (password, admin) => {
    if (!password || password === "No password set") {
      return "Not set";
    }
    
    const adminId = getAdminId(admin);
    if (showPasswords[adminId]) {
      return password;
    } else {
      return "••••••••";
    }
  };

  return (
    <div className="container">
      <div className="admin-section">
        <h2 className="section-title">Admin Management</h2>
        <p className="section-subtitle">Manage system administrators with real passwords</p>

        <div className="controls">
          <div className="search-container">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="search-input"
              placeholder="Search admins by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <button
            className="add-button"
            onClick={() => {
              setEditId(null);
              setFormData({ name: "", email: "", password: "" });
              setShowModal(true);
            }}
          >
            <span className="add-icon">+</span>
            Add New Admin
          </button>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-number">{admins.length}</div>
              <div className="stat-label">Total Admins</div>
            </div>
          </div>
        </div>

        <div className="table-container">
          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Loading admins...</p>
            </div>
          ) : (
            <>
              {filteredAdmins.length > 0 ? (
                <table className="tools-table">
                  <thead>
                    <tr>
                      <th className="name-column">Name</th>
                      <th className="email-column">Email</th>
                      <th className="password-column">Password</th>
                      <th className="actions-column">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAdmins.map((admin) => {
                      const adminId = getAdminId(admin);
                      return (
                        <tr key={adminId} className="table-row">
                          <td className="name-cell">
                            <div className="admin-name">{admin.name}</div>
                          </td>
                          <td className="email-cell">
                            <div className="email-container">
                              <span className="email-text">{admin.email}</span>
                              <button
                                className="copy-button"
                                onClick={() => copyToClipboard(admin.email)}
                                title="Copy email"
                              >
                                📋
                              </button>
                            </div>
                          </td>
                          <td className="password-cell">
                            <div className="password-container">
                              <span className="password-text">
                                {formatPassword(admin.password, admin)}
                              </span>
                              <div className="password-actions">
                                <button
                                  className="visibility-button"
                                  onClick={() => togglePasswordVisibility(adminId)}
                                  title={showPasswords[adminId] ? "Hide password" : "Show password"}
                                >
                                  {showPasswords[adminId] ? "👁️" : "👁️‍🗨️"}
                                </button>
                                <button
                                  className="copy-button"
                                  onClick={() => copyToClipboard(admin.password)}
                                  title="Copy password"
                                  disabled={!admin.password || admin.password === "No password set"}
                                >
                                  📋
                                </button>
                              </div>
                            </div>
                          </td>
                          <td className="actions-cell">
                            <div className="action-buttons">
                              <button
                                className="edit-button"
                                onClick={() => handleEdit(admin)}
                              >
                                <span className="edit-icon">✏️</span>Edit
                              </button>
                              <button
                                className="delete-button"
                                onClick={() => handleDelete(admin)}
                              >
                                <span className="delete-icon">🗑️</span>Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">👥</div>
                  <h3>No admins found</h3>
                  <p>
                    {searchTerm
                      ? `No results found for "${searchTerm}"`
                      : "Get started by creating your first admin account!"}
                  </p>
                  {!searchTerm && (
                    <button
                      className="add-button"
                      onClick={() => setShowModal(true)}
                    >
                      <span className="add-icon">+</span>
                      Create Your First Admin
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Add/Edit Admin Modal */}
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editId ? "Edit Admin" : "Create New Admin"}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter admin name"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter admin email"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">
                    {editId ? "New Password (leave blank to keep current)" : "Password *"}
                  </label>
                  <input
                    type="text"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter admin password"
                    required={!editId}
                    minLength="6"
                  />
                  <small className="form-help">
                    {editId 
                      ? "Leave blank to keep current password"
                      : "Password will be stored as plain text"
                    }
                  </small>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="submit-button">
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