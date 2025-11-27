// aitalsadmin.jsx
import React, { useState, useEffect } from 'react';
import styles from './aitalsadmin.module.css';

const AitalsAdmin = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    isAdmin: true
  });

  const API_BASE_URL = import.meta.env.VITE_AITALS_API_URL || 'http://localhost:5003';
  const API_ENDPOINTS = {
    GET_ADMINS: `${API_BASE_URL}/api/admin/admin`,
    CREATE_ADMIN: `${API_BASE_URL}/api/admin/register`,
    UPDATE_ADMIN: `${API_BASE_URL}/api/admin/admin`,
    DELETE_ADMIN: `${API_BASE_URL}/api/admin/admin`
  };

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.GET_ADMINS);
      const data = await response.json();
      if (data.success) {
        setAdmins(data.admins);
      } else {
        console.error('Failed to fetch admins:', data.message);
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
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch(API_ENDPOINTS.CREATE_ADMIN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      
      if (data.success) {
        setAdmins(prev => [data.user, ...prev]);
        setShowModal(false);
        resetForm();
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
      const response = await fetch(`${API_ENDPOINTS.UPDATE_ADMIN}/${editingAdmin.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      
      if (data.success) {
        setAdmins(prev => prev.map(admin => 
          admin.id === editingAdmin.id ? data.user : admin
        ));
        setShowModal(false);
        setEditingAdmin(null);
        resetForm();
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

  const handleDeleteAdmin = async (adminId) => {
    if (!window.confirm('Are you sure you want to delete this admin?')) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${API_ENDPOINTS.DELETE_ADMIN}/${adminId}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      
      if (data.success) {
        setAdmins(prev => prev.filter(admin => admin.id !== adminId));
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
      name: '',
      email: '',
      password: '',
      isAdmin: true
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
      name: admin.name,
      email: admin.email,
      password: admin.password,
      isAdmin: admin.isAdmin
    });
    setShowModal(true);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          <i className="fas fa-users-cog me-3"></i>
          Aitals Admin Management
        </h1>
        <p className={styles.subtitle}>Manage administrator accounts and access credentials</p>
      </div>

      <div className={styles.controls}>
        <button 
          className={`btn btn-primary ${styles.createBtn}`}
          onClick={openCreateModal}
          disabled={loading}
        >
          <i className="fas fa-plus me-2"></i>
          Add New Admin
        </button>
        
        <button 
          className={`btn btn-outline-secondary ${styles.refreshBtn}`}
          onClick={fetchAdmins}
          disabled={loading}
        >
          <i className="fas fa-sync-alt me-2"></i>
          Refresh List
        </button>
      </div>

      {loading && (
        <div className={styles.loading}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <span className="ms-2">Loading administrators...</span>
        </div>
      )}

      <div className={styles.tableContainer}>
        {admins.length === 0 && !loading ? (
          <div className={styles.emptyState}>
            <i className="fas fa-user-shield fa-3x mb-3"></i>
            <h4>No Administrators Found</h4>
            <p>Create the first administrator account to manage your system.</p>
            <button 
              className="btn btn-primary"
              onClick={openCreateModal}
            >
              Create Admin Account
            </button>
          </div>
        ) : (
          <div className="table-responsive">
            <table className={`table table-dark table-hover ${styles.table}`}>
              <thead className={styles.tableHeader}>
                <tr>
                  <th>Administrator</th>
                  <th>Email</th>
                  <th>Password</th>
                  <th>Role</th>
                  <th>Created Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {admins.map((admin) => (
                  <tr key={admin.id} className={styles.tableRow}>
                    <td>
                      <div className={styles.userInfo}>
                        <i className="fas fa-user-tie me-2"></i>
                        {admin.name}
                      </div>
                    </td>
                    <td>
                      <div className={styles.emailCell}>
                        {admin.email}
                        <button
                          className={`btn btn-sm btn-outline-secondary ${styles.copyBtn}`}
                          onClick={() => copyToClipboard(admin.email)}
                          title="Copy email"
                        >
                          <i className="fas fa-copy"></i>
                        </button>
                      </div>
                    </td>
                    <td>
                      <div className={styles.passwordCell}>
                        <code className={styles.passwordText}>
                          {admin.password || 'No password set'}
                        </code>
                        <button
                          className={`btn btn-sm btn-outline-warning ${styles.copyBtn}`}
                          onClick={() => copyToClipboard(admin.password)}
                          title="Copy password"
                        >
                          <i className="fas fa-copy"></i>
                        </button>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${admin.isAdmin ? 'bg-success' : 'bg-secondary'}`}>
                        <i className="fas fa-shield-alt me-1"></i>
                        {admin.isAdmin ? 'Administrator' : 'User'}
                      </span>
                    </td>
                    <td>
                      <span className={styles.date}>
                        {formatDate(admin.createdAt)}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actionButtons}>
                        <button
                          className="btn btn-sm btn-outline-primary me-1"
                          onClick={() => openEditModal(admin)}
                          title="Edit administrator"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDeleteAdmin(admin.id)}
                          title="Delete administrator"
                          disabled={loading}
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
                  {editingAdmin ? 'Edit Administrator' : 'Create New Administrator'}
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
                    <label className="form-label">Full Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter administrator's full name"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Email Address *</label>
                    <input
                      type="email"
                      className="form-control"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter email address"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">
                      Password {!editingAdmin && <span className="text-warning">*</span>}
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required={!editingAdmin}
                      placeholder="Enter password (minimum 6 characters)"
                      minLength="6"
                    />
                    <div className="form-text text-info">
                      <i className="fas fa-info-circle me-1"></i>
                      Password will be securely stored and visible for admin management
                    </div>
                  </div>
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      name="isAdmin"
                      checked={formData.isAdmin}
                      onChange={handleInputChange}
                    />
                    <label className="form-check-label">
                      <i className="fas fa-shield-alt me-1"></i>
                      Grant Administrator Privileges
                    </label>
                  </div>
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
                        {editingAdmin ? 'Update Administrator' : 'Create Administrator'}
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

export default AitalsAdmin;