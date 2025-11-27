// djiadmin.jsx
import React, { useState, useEffect } from 'react';
import styles from './djiadmin.module.css';

const DJIAdminManager = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'admin'
  });

  const API_BASE = import.meta.env.VITE_DJITTRADING_API_URL;
  const API_ENDPOINTS = {
    GET_ADMINS: `${API_BASE}/api/admin/auth/admins`,
    CREATE_ADMIN: `${API_BASE}/api/admin/auth/admins`,
    UPDATE_ADMIN: `${API_BASE}/api/admin/auth/admins`,
    DELETE_ADMIN: `${API_BASE}/api/admin/auth/admins`,
    RESET_PASSWORD: `${API_BASE}/api/admin/auth/admins`,
    UPDATE_PROFILE: `${API_BASE}/api/admin/auth/admins`
  };

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      
      const response = await fetch(API_ENDPOINTS.GET_ADMINS, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      
      const data = await response.json();
      if (data.success) {
        setAdmins(data.admins || []);
      } else {
        console.error('Failed to fetch admins:', data.message);
        // If unauthorized, try to get token from login
        if (data.message.includes('unauthorized') || data.message.includes('token')) {
          // Redirect to login or handle token refresh
          console.log('Token expired or invalid');
        }
      }
    } catch (error) {
      console.error('Error fetching admins:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(API_ENDPOINTS.CREATE_ADMIN, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      
      if (data.success) {
        setAdmins(prev => [data.admin, ...prev]);
        setShowModal(false);
        resetForm();
        alert('Admin created successfully!');
      } else {
        alert(data.message || 'Failed to create admin');
      }
    } catch (error) {
      console.error('Error creating admin:', error);
      alert('Error creating admin');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAdmin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_ENDPOINTS.UPDATE_ADMIN}/${editingAdmin.id}/profile`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email
        })
      });
      const data = await response.json();
      
      if (data.success) {
        setAdmins(prev => prev.map(admin => 
          admin.id === editingAdmin.id ? data.admin : admin
        ));
        setShowModal(false);
        setEditingAdmin(null);
        resetForm();
        alert('Admin updated successfully!');
      } else {
        alert(data.message || 'Failed to update admin');
      }
    } catch (error) {
      console.error('Error updating admin:', error);
      alert('Error updating admin');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (adminId) => {
    const newPassword = prompt('Enter new password (min 6 characters):');
    if (!newPassword || newPassword.length < 6) {
      alert('Password must be at least 6 characters long');
      return;
    }

    if (!window.confirm('Are you sure you want to reset this admin\'s password?')) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_ENDPOINTS.RESET_PASSWORD}/${adminId}/reset-password`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ newPassword })
      });
      const data = await response.json();
      
      if (data.success) {
        alert('Password reset successfully!');
        fetchAdmins(); // Refresh to show updated data
      } else {
        alert(data.message || 'Failed to reset password');
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      alert('Error resetting password');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (adminId, currentStatus) => {
    const newStatus = !currentStatus;
    const action = newStatus ? 'activate' : 'deactivate';
    
    if (!window.confirm(`Are you sure you want to ${action} this admin account?`)) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_ENDPOINTS.UPDATE_ADMIN}/${adminId}/status`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isActive: newStatus })
      });
      const data = await response.json();
      
      if (data.success) {
        setAdmins(prev => prev.map(admin => 
          admin.id === adminId ? { ...admin, isActive: newStatus } : admin
        ));
        alert(`Admin account ${action}d successfully!`);
      } else {
        alert(data.message || `Failed to ${action} admin`);
      }
    } catch (error) {
      console.error(`Error ${action}ing admin:`, error);
      alert(`Error ${action}ing admin`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAdmin = async (adminId) => {
    if (!window.confirm('Are you sure you want to delete this admin? This action cannot be undone.')) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_ENDPOINTS.DELETE_ADMIN}/${adminId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setAdmins(prev => prev.filter(admin => admin.id !== adminId));
        alert('Admin deleted successfully!');
      } else {
        alert(data.message || 'Failed to delete admin');
      }
    } catch (error) {
      console.error('Error deleting admin:', error);
      alert('Error deleting admin');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      password: '',
      role: 'admin'
    });
  };

  const openCreateModal = () => {
    setEditingAdmin(null);
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (admin) => {
    setEditingAdmin(admin);
    setFormData({
      username: admin.username || '',
      email: admin.email,
      password: '', // Don't show current password for security
      role: admin.role || 'admin'
    });
    setShowModal(true);
  };

  const copyToClipboard = (text) => {
    if (!text || text === 'No password set') {
      alert('No password to copy');
      return;
    }
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'superadmin': return styles.superadminBadge;
      case 'admin': return styles.adminBadge;
      default: return styles.userBadge;
    }
  };

  const getStatusBadgeClass = (isActive) => {
    return isActive ? styles.activeBadge : styles.inactiveBadge;
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          <i className="fas fa-chart-line me-3"></i>
          DJI Trading Admin Management
        </h1>
        <p className={styles.subtitle}>Manage trading administrator accounts and access credentials</p>
      </div>

      <div className={styles.stats}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <i className="fas fa-users"></i>
          </div>
          <div className={styles.statInfo}>
            <h3>{admins.length}</h3>
            <p>Total Admins</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <i className="fas fa-shield-alt"></i>
          </div>
          <div className={styles.statInfo}>
            <h3>{admins.filter(a => a.role === 'superadmin').length}</h3>
            <p>Super Admins</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <i className="fas fa-user-check"></i>
          </div>
          <div className={styles.statInfo}>
            <h3>{admins.filter(a => a.isActive).length}</h3>
            <p>Active Admins</p>
          </div>
        </div>
      </div>

      <div className={styles.controls}>
        <button 
          className={`btn btn-primary ${styles.createBtn}`}
          onClick={openCreateModal}
          disabled={loading}
        >
          <i className="fas fa-plus me-2"></i>
          Add Trading Admin
        </button>
        
        <button 
          className={`btn btn-outline-secondary ${styles.refreshBtn}`}
          onClick={fetchAdmins}
          disabled={loading}
        >
          <i className="fas fa-sync-alt me-2"></i>
          Refresh Data
        </button>
      </div>

      {loading && (
        <div className={styles.loading}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <span className="ms-2">Loading trading administrators...</span>
        </div>
      )}

      <div className={styles.tableContainer}>
        {admins.length === 0 && !loading ? (
          <div className={styles.emptyState}>
            <i className="fas fa-chart-bar fa-3x mb-3"></i>
            <h4>No Trading Administrators</h4>
            <p>Create the first administrator account to manage your trading platform.</p>
            <button 
              className="btn btn-primary"
              onClick={openCreateModal}
            >
              <i className="fas fa-user-plus me-2"></i>
              Create Trading Admin
            </button>
          </div>
        ) : (
          <div className="table-responsive">
            <table className={`table table-dark table-hover ${styles.table}`}>
              <thead className={styles.tableHeader}>
                <tr>
                  <th>Admin Info</th>
                  <th>Role & Status</th>
                  <th>Last Login</th>
                  <th>Account Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {admins.map((admin) => (
                  <tr key={admin.id} className={styles.tableRow}>
                    <td>
                      <div className={styles.adminInfo}>
                        <div className={styles.avatar}>
                          <i className="fas fa-user-tie"></i>
                        </div>
                        <div className="text-white">
                          <div className={styles.adminName}>
                            {admin.username}
                            {admin.role === 'superadmin' && (
                              <i className="fas fa-crown ms-2 text-warning" title="Super Admin"></i>
                            )}
                          </div>
                          <div className={styles.adminEmail}>{admin.email}</div>
                          <small className={styles.adminId}>
                            ID: {admin.id?.slice(-8)}
                          </small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className={styles.roleSection}>
                        <span className={`badge ${getRoleBadgeClass(admin.role)} me-2`}>
                          {admin.role || 'admin'}
                        </span>
                        <span className={`badge ${getStatusBadgeClass(admin.isActive)}`}>
                          {admin.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className={styles.dateCell}>
                        <i className="fas fa-sign-in-alt me-1"></i>
                        <span className={styles.date}>
                          {admin.lastLogin ? formatDate(admin.lastLogin) : 'Never'}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className={styles.dateCell}>
                        <i className="fas fa-calendar me-1"></i>
                        <span className={styles.date}>
                          {formatDate(admin.createdAt)}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className={styles.actionButtons}>
                        <button
                          className="btn btn-sm btn-outline-primary me-1"
                          onClick={() => openEditModal(admin)}
                          title="Edit admin profile"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          className="btn btn-sm btn-outline-warning me-1"
                          onClick={() => handleResetPassword(admin.id)}
                          title="Reset password"
                          disabled={loading}
                        >
                          <i className="fas fa-key"></i>
                        </button>
                        <button
                          className={`btn btn-sm me-1 ${admin.isActive ? 'btn-outline-warning' : 'btn-outline-success'}`}
                          onClick={() => handleToggleStatus(admin.id, admin.isActive)}
                          title={admin.isActive ? 'Deactivate account' : 'Activate account'}
                          disabled={loading}
                        >
                          <i className={`fas ${admin.isActive ? 'fa-pause' : 'fa-play'}`}></i>
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDeleteAdmin(admin.id)}
                          title="Delete admin"
                          disabled={loading || admin.role === 'superadmin'}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className={`modal show d-block ${styles.modal}`} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className={`modal-content ${styles.modalContent}`}>
              <div className={`modal-header ${styles.modalHeader}`}>
                <h5 className="modal-title">
                  <i className={`fas ${editingAdmin ? 'fa-edit' : 'fa-user-plus'} me-2`}></i>
                  {editingAdmin ? 'Edit Trading Administrator' : 'Create Trading Administrator'}
                </h5>
                <button
                  type="button"
                  className={`btn-close ${styles.closeBtn}`}
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <form onSubmit={editingAdmin ? handleUpdateAdmin : handleCreateAdmin}>
                <div className={`modal-body ${styles.modalBody}`}>
                  <div className="mb-3">
                    <label className="form-label">
                      <i className="fas fa-user me-1"></i>
                      Username *
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter admin username"
                      minLength="3"
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">
                      <i className="fas fa-envelope me-1"></i>
                      Email Address *
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter professional email address"
                    />
                  </div>

                  {!editingAdmin && (
                    <div className="mb-3">
                      <label className="form-label">
                        <i className="fas fa-key me-1"></i>
                        Access Password *
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                        placeholder="Set secure password (min 6 characters)"
                        minLength="6"
                      />
                      <div className="form-text text-info">
                        <i className="fas fa-info-circle me-1"></i>
                        Password must be at least 6 characters long
                      </div>
                    </div>
                  )}

                  {!editingAdmin && (
                    <div className="mb-3">
                      <label className="form-label">
                        <i className="fas fa-user-tag me-1"></i>
                        Role *
                      </label>
                      <select
                        className="form-control"
                        name="role"
                        value={formData.role}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="admin">Admin</option>
                        <option value="superadmin">Super Admin</option>
                      </select>
                    </div>
                  )}

                  {editingAdmin && (
                    <div className="alert alert-info">
                      <i className="fas fa-info-circle me-2"></i>
                      To change password, use the "Reset Password" button in the actions column.
                    </div>
                  )}
                </div>
                <div className={`modal-footer ${styles.modalFooter}`}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowModal(false)}
                    disabled={loading}
                  >
                    <i className="fas fa-times me-1"></i>
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        {editingAdmin ? 'Updating...' : 'Creating...'}
                      </>
                    ) : (
                      <>
                        <i className={`fas ${editingAdmin ? 'fa-save' : 'fa-user-plus'} me-2`}></i>
                        {editingAdmin ? 'Update Admin' : 'Create Admin'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DJIAdminManager;