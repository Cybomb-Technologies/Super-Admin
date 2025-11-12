import React, { useState, useEffect } from "react";
import "./AdminDetails.css";

 
const API_URL = import.meta.env.VITE_SUPERADMIN_API_URL;

function AdminDetails({ adminId, onBack }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [actionLoading, setActionLoading] = useState({
    update: false,
    delete: false
  });
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: ""
  });
  const [formErrors, setFormErrors] = useState({});

  // Form validation
  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = "Name is required";
    } else if (formData.name.length < 2) {
      errors.name = "Name must be at least 2 characters";
    }
    
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Email is invalid";
    }
    
    if (formData.password && formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }
    
    return errors;
  };

  // Fetch admin details
  const fetchAdminDetails = async () => {
    try {
      setLoading(true);
      setError("");
      console.log("Fetching admin details for ID:", adminId);
      
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/api/admin/${adminId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Admin not found");
        }
        throw new Error(`Failed to load admin details. Status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log("Admin data received:", result);
      
      if (result.success && result.admin) {
        const adminData = result.admin;
        setAdmin(adminData);
        setFormData({
          name: adminData.name || "",
          email: adminData.email || "",
          password: adminData.password || "" // Show actual password from DB
        });
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Error fetching admin details:", error);
      setError(error.message || "Failed to load admin details. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (adminId) {
      fetchAdminDetails();
    }
  }, [adminId]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    if (!window.confirm("Are you sure you want to update this admin's information?")) {
      return;
    }

    try {
      setActionLoading(prev => ({ ...prev, update: true }));
      
      const updateData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password // Send password as plain text
      };

      console.log("Updating admin with data:", updateData);

      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/api/admin/update/${adminId}`, {
        method: "PUT",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData),
      });

      const result = await response.json();
      console.log("Update response:", result);

      if (response.ok && result.success) {
        setAdmin(result.admin);
        setEditMode(false);
        setFormErrors({});
        alert("✅ Admin updated successfully!");
        fetchAdminDetails(); // Refresh data
      } else {
        throw new Error(result.error || result.message || "Failed to update admin");
      }
    } catch (error) {
      console.error("Error updating admin:", error);
      const errorMessage = error.message.includes("NetworkError") 
        ? "Network error: Please check your connection and try again."
        : error.message;
      alert(`❌ Error: ${errorMessage}`);
    } finally {
      setActionLoading(prev => ({ ...prev, update: false }));
    }
  };

  // Delete admin
  const handleDelete = async () => {
    if (!window.confirm("🚨 ARE YOU SURE?\n\nThis will permanently delete this admin account. This action cannot be undone!")) {
      return;
    }

    try {
      setActionLoading(prev => ({ ...prev, delete: true }));
      
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/api/admin/delete/${adminId}`, {
        method: "DELETE",
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();

      if (response.ok && result.success) {
        alert("✅ Admin deleted successfully!");
        if (onBack) {
          onBack(); // Go back to admin list
        }
      } else {
        throw new Error(result.error || result.message || "Failed to delete admin");
      }
    } catch (error) {
      console.error("Error deleting admin:", error);
      alert(`❌ Error: ${error.message}`);
    } finally {
      setActionLoading(prev => ({ ...prev, delete: false }));
    }
  };

  // Copy to clipboard
  const copyToClipboard = (text, label = "text") => {
    if (!text) {
      alert(`No ${label} to copy`);
      return;
    }
    
    navigator.clipboard.writeText(text)
      .then(() => {
        alert(`✅ ${label.charAt(0).toUpperCase() + label.slice(1)} copied to clipboard!`);
      })
      .catch(err => {
        console.error("Failed to copy: ", err);
        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        alert(`📋 ${label.charAt(0).toUpperCase() + label.slice(1)} copied to clipboard!`);
      });
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return "Invalid date";
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="admin-details-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading admin details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-details-container">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h3>Error Loading Admin</h3>
          <p>{error}</p>
          <div className="error-actions">
            <button className="retry-button" onClick={fetchAdminDetails}>
              🔄 Retry
            </button>
            <button className="back-button" onClick={onBack}>
              ← Back to Admin List
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!admin) {
    return (
      <div className="admin-details-container">
        <div className="not-found-container">
          <div className="not-found-icon">👤</div>
          <h3>Admin Not Found</h3>
          <p>The requested admin could not be found. It may have been deleted or the ID is incorrect.</p>
          <button className="back-button" onClick={onBack}>
            ← Back to Admin List
          </button>
        </div>
      </div>
    );
  }

  const displayName = admin.name || "Unknown Admin";

  return (
    <div className="admin-details-container">
      {/* Header */}
      <div className="details-header">
        <button className="back-button" onClick={onBack}>
          ← Back to Admin List
        </button>
        <h1 className="details-title">Admin Details</h1>
        <div className="header-actions">
          {!editMode && (
            <>
              <button
                className="edit-toggle-button"
                onClick={() => setEditMode(true)}
                disabled={actionLoading.delete}
              >
                ✏️ Edit Admin
              </button>
              <button
                className="delete-main-button"
                onClick={handleDelete}
                disabled={actionLoading.delete}
              >
                {actionLoading.delete ? "⏳ Deleting..." : "🗑️ Delete Admin"}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Admin Information Card */}
      <div className="details-card">
        <div className="card-header">
          <div className="admin-avatar">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="admin-basic-info">
            <h2 className="admin-name">{displayName}</h2>
            <p className="admin-role">Administrator</p>
            <div className="admin-status">
              <span className="status-badge active">🟢 Active</span>
              <span className="admin-id">ID: {admin._id}</span>
            </div>
          </div>
        </div>

        {editMode ? (
          /* Edit Form */
          <form onSubmit={handleSubmit} className="edit-form">
            <div className="form-section">
              <h3 className="section-title">✏️ Edit Admin Information</h3>
              
              <div className="form-group">
                <label className="form-label">Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`form-input ${formErrors.name ? 'error' : ''}`}
                  placeholder="Enter admin name"
                  required
                />
                {formErrors.name && (
                  <span className="error-message">{formErrors.name}</span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`form-input ${formErrors.email ? 'error' : ''}`}
                  placeholder="Enter email address"
                  required
                />
                {formErrors.email && (
                  <span className="error-message">{formErrors.email}</span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Password *</label>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`form-input ${formErrors.password ? 'error' : ''}`}
                  placeholder="Enter password"
                  required
                />
                <div className="password-actions-inline">
                  <button
                    type="button"
                    className="visibility-button small"
                    onClick={() => setShowPassword(!showPassword)}
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
                {formErrors.password && (
                  <span className="error-message">{formErrors.password}</span>
                )}
                <small className="form-help">
                  🔒 Password must be at least 6 characters
                </small>
              </div>

              <div className="security-warning">
                <strong>⚠️ Security Notice:</strong> Passwords are stored as plain text in the database.
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => {
                    setEditMode(false);
                    setFormData({
                      name: admin.name || "",
                      email: admin.email || "",
                      password: admin.password || ""
                    });
                    setFormErrors({});
                  }}
                  disabled={actionLoading.update}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="save-button"
                  disabled={actionLoading.update}
                >
                  {actionLoading.update ? "⏳ Saving..." : "💾 Save Changes"}
                </button>
              </div>
            </div>
          </form>
        ) : (
          /* View Mode */
          <div className="info-sections">
            {/* Admin Information */}
            <div className="info-section">
              <h3 className="section-title">👤 Admin Information</h3>
              <div className="info-grid">
                <div className="info-item">
                  <label className="info-label">Name</label>
                  <div className="info-value">
                    <span className="username-text">{displayName}</span>
                    <button
                      className="copy-icon-button"
                      onClick={() => copyToClipboard(displayName, "name")}
                      title="Copy name"
                    >
                      📋
                    </button>
                  </div>
                </div>
                
                <div className="info-item">
                  <label className="info-label">Email</label>
                  <div className="info-value">
                    <span className="email-text">{admin.email || "No email"}</span>
                    {admin.email && (
                      <button
                        className="copy-icon-button"
                        onClick={() => copyToClipboard(admin.email, "email")}
                        title="Copy email"
                      >
                        📋
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Login Credentials */}
            <div className="info-section">
              <h3 className="section-title">🔑 Login Credentials</h3>
              <div className="info-grid">
                <div className="info-item">
                  <label className="info-label">Password</label>
                  <div className="info-value">
                    <span className="password-display">
                      {showPassword ? (admin.password || "No password set") : "••••••••"}
                    </span>
                    <div className="password-actions">
                      <button
                        className="visibility-button"
                        onClick={() => setShowPassword(!showPassword)}
                        title={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? "👁️" : "👁️‍🗨️"}
                      </button>
                      {admin.password && (
                        <button
                          className="copy-icon-button"
                          onClick={() => copyToClipboard(admin.password, "password")}
                          title="Copy password"
                        >
                          📋
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="info-item">
                  <label className="info-label">Admin ID</label>
                  <div className="info-value">
                    <code className="id-code">{admin._id}</code>
                    <button
                      className="copy-icon-button"
                      onClick={() => copyToClipboard(admin._id, "Admin ID")}
                      title="Copy ID"
                    >
                      📋
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Information */}
            <div className="info-section">
              <h3 className="section-title">📊 Account Information</h3>
              <div className="info-grid">
                <div className="info-item">
                  <label className="info-label">Created At</label>
                  <div className="info-value">
                    <span>{formatDate(admin.createdAt)}</span>
                  </div>
                </div>
                
                <div className="info-item">
                  <label className="info-label">Last Updated</label>
                  <div className="info-value">
                    <span>{formatDate(admin.updatedAt)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="info-section">
              <h3 className="section-title">⚡ Quick Actions</h3>
              <div className="quick-actions">
                <button
                  className="action-button primary"
                  onClick={() => setEditMode(true)}
                >
                  ✏️ Edit Admin
                </button>
                <button
                  className="action-button secondary"
                  onClick={() => copyToClipboard(admin.email, "email")}
                >
                  📋 Copy Email
                </button>
                <button
                  className="action-button warning"
                  onClick={handleDelete}
                  disabled={actionLoading.delete}
                >
                  {actionLoading.delete ? "⏳ Deleting..." : "🗑️ Delete Admin"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDetails;