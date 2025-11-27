// PFDAdminManager.jsx
import React, { useState, useEffect } from 'react';
import styles from './PFDAdminManager.module.css';

const PFDAdminManager = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    role: 'admin'
  });

  const API_BASE = import.meta.env.VITE_PDF_API_URL;
  const API_ENDPOINTS = {
    GET_ADMINS: `${API_BASE}/api/admin`,
    GET_ADMIN: `${API_BASE}/api/admin`,
    CREATE_ADMIN: `${API_BASE}/api/admin`,
    UPDATE_ADMIN: `${API_BASE}/api/admin/update`,
    DELETE_ADMIN: `${API_BASE}/api/admin/delete`
  };

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.GET_ADMINS, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      if (data.success) {
        setAdmins(data.admins || data.data || []);
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
      const response = await fetch(API_ENDPOINTS.CREATE_ADMIN, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
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
      const response = await fetch(`${API_ENDPOINTS.UPDATE_ADMIN}/${editingAdmin.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
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

  const handleDeleteAdmin = async (adminId) => {
    if (!window.confirm('Are you sure you want to delete this admin?')) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${API_ENDPOINTS.DELETE_ADMIN}/${adminId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
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
      name: '',
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
      name: admin.name || '',
      username: admin.username || '',
      email: admin.email || '',
      password: '', // Don't show password for security
      role: admin.role || 'admin'
    });
    setShowModal(true);
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

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          <i className="fas fa-user-shield me-3"></i>
          PFD Works Admin Management
        </h1>
        <p className={styles.subtitle}>Manage administrator accounts and permissions with enhanced security</p>
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
            <i className="fas fa-crown"></i>
          </div>
          <div className={styles.statInfo}>
            <h3>{admins.filter(a => a.role === 'superadmin').length}</h3>
            <p>Super Admins</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <i className="fas fa-user-cog"></i>
          </div>
          <div className={styles.statInfo}>
            <h3>{admins.filter(a => a.role === 'admin').length}</h3>
            <p>Regular Admins</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <i className="fas fa-clock"></i>
          </div>
          <div className={styles.statInfo}>
            <h3>{admins.filter(a => new Date(a.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}</h3>
            <p>New This Week</p>
          </div>
        </div>
      </div>

      <div className={styles.controls}>
        <button 
          className={`btn ${styles.createBtn}`}
          onClick={openCreateModal}
          disabled={loading}
        >
          <i className="fas fa-plus me-2"></i>
          Add New Admin
        </button>
        
        <button 
          className={`btn ${styles.refreshBtn}`}
          onClick={fetchAdmins}
          disabled={loading}
        >
          <i className="fas fa-sync-alt me-2"></i>
          Refresh Data
        </button>
      </div>

      {loading && (
        <div className={styles.loading}>
          <div className="spinner-border" role="status" style={{ width: '3rem', height: '3rem', borderWidth: '3px' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <span className="ms-3">Loading administrators...</span>
        </div>
      )}

      <div className={styles.tableContainer}>
        {admins.length === 0 && !loading ? (
          <div className={styles.emptyState}>
            <i className="fas fa-users-slash fa-3x mb-4"></i>
            <h4>No Administrators Found</h4>
            <p>Get started by creating the first administrator account for PFD Works.</p>
            <button 
              className={`btn ${styles.createBtn}`}
              onClick={openCreateModal}
            >
              <i className="fas fa-user-plus me-2"></i>
              Create First Admin
            </button>
          </div>
        ) : (
          <div className="table-responsive">
            <table className={`table table-hover ${styles.table}`}>
              <thead className={styles.tableHeader}>
                <tr>
                  <th>Admin Profile</th>
                  <th>Role</th>
                  <th>Contact</th>
                  <th>Join Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {admins.map((admin) => (
                  <tr key={admin.id} className={styles.tableRow}>
                    <td>
                      <div className={styles.adminInfo}>
                        <div className={styles.avatar}>
                          {admin.role === 'superadmin' ? (
                            <i className="fas fa-crown"></i>
                          ) : (
                            <i className="fas fa-user-shield"></i>
                          )}
                        </div>
                        <div>
                          <div className={styles.adminName}>
                            {admin.name || admin.username}
                            {admin.role === 'superadmin' && (
                              <i className="fas fa-star ms-2" style={{ color: '#ffd700' }} title="Super Admin"></i>
                            )}
                          </div>
                          <small className={styles.adminId}>
                            @{admin.username} • ID: {admin.id?.slice(-8)}
                          </small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${getRoleBadgeClass(admin.role)}`}>
                        {admin.role === 'superadmin' ? 'Super Admin' : 'Admin'}
                      </span>
                    </td>
                    <td>
                      <div className={styles.emailCell}>
                        <i className="fas fa-envelope me-2"></i>
                        {admin.email}
                      </div>
                    </td>
                    <td>
                      <div className={styles.dateCell}>
                        <i className="fas fa-calendar-alt me-2"></i>
                        <span className={styles.date}>
                          {formatDate(admin.createdAt)}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className={styles.actionButtons}>
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => openEditModal(admin)}
                          title="Edit admin"
                          disabled={loading}
                        >
                          <i className="fas fa-edit me-1"></i>
                          Edit
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDeleteAdmin(admin.id)}
                          title="Delete admin"
                          disabled={loading || admin.role === 'superadmin'}
                        >
                          <i className="fas fa-trash me-1"></i>
                          Delete
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
                <h5 className="modal-title text-white">
                  <i className={`fas ${editingAdmin ? 'fa-edit' : 'fa-user-plus'} me-2`}></i>
                  {editingAdmin ? 'Edit Administrator' : 'Create New Administrator'}
                </h5>
                <button
                  type="button"
                  className={`btn-close ${styles.closeBtn}`}
                  onClick={() => setShowModal(false)}
                  disabled={loading}
                ></button>
              </div>
              <form onSubmit={editingAdmin ? handleUpdateAdmin : handleCreateAdmin}>
                <div className={`modal-body ${styles.modalBody}`}>
                  <div className="mb-3">
                    <label className="form-label text-white">
                      <i className="fas fa-id-card me-2"></i>
                      Full Name *
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter admin full name"
                      disabled={loading}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label text-white">
                      <i className="fas fa-at me-2"></i>
                      Username
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      placeholder="Enter username (optional)"
                      disabled={loading}
                    />
                    <div className="form-text" style={{ color: '#8892b0' }}>
                      If not provided, email will be used as username
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label text-white">
                      <i className="fas fa-envelope me-2"></i>
                      Email Address *
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter admin email address"
                      disabled={loading}
                    />
                  </div>

                  {!editingAdmin && (
                    <div className="mb-3">
                      <label className="form-label text-white">
                        <i className="fas fa-key me-2"></i>
                        Password *
                      </label>
                      <input
                        type="password"
                        className="form-control"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                        placeholder="Set secure password"
                        minLength="6"
                        disabled={loading}
                      />
                      <div className="form-text" style={{ color: '#8892b0' }}>
                        Minimum 6 characters required
                      </div>
                    </div>
                  )}

                  <div className="mb-3">
                    <label className="form-label text-white">
                      <i className="fas fa-user-tag me-2"></i>
                      Role *
                    </label>
                    <select
                      className="form-control"
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      required
                      disabled={loading}
                    >
                      <option value="admin">Admin</option>
                      <option value="superadmin">Super Admin</option>
                    </select>
                    <div className="form-text" style={{ color: '#8892b0' }}>
                      Super Admins have full system access
                    </div>
                  </div>
                </div>
                <div className={`modal-footer ${styles.modalFooter}`}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowModal(false)}
                    disabled={loading}
                  >
                    <i className="fas fa-times me-2"></i>
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`btn ${styles.createBtn}`}
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

export default PFDAdminManager;