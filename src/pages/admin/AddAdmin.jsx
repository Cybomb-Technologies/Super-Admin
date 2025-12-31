import { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Card, Badge, Tabs, Tab } from "react-bootstrap";
import { 
  PlusCircle, 
  Edit3, 
  Trash2, 
  Users, 
  Loader,
  Shield,
  Mail,
  User,
  Eye,
  Settings,
  Key,
  Calendar,
  EyeOff
} from "react-feather";

import styles from "./AddAdmin.module.css";

const API_BASE_URL = import.meta.env.VITE_SUPERADMIN_API_URL;

function AddAdmin() {
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [activeTab, setActiveTab] = useState("admin");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "admin",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (res.ok) {
        setAllUsers(data.users || []);
      } else {
        setError("Failed to fetch admin data");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  // Filter users based on role
  const admins = allUsers.filter(user => user.role === "admin");
  const superAdmins = allUsers.filter(user => user.role === "superadmin");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleOpenModal = (admin = null) => {
    if (admin) {
      setEditingAdmin(admin);
      setFormData({
        name: admin.name,
        email: admin.email,
        password: "",
        role: admin.role,
      });
    } else {
      setEditingAdmin(null);
      setFormData({ 
        name: "", 
        email: "", 
        password: "", 
        role: activeTab === "admin" ? "admin" : "superadmin" 
      });
    }
    setShowModal(true);
  };

  const handleViewAdmin = (admin) => {
    setSelectedAdmin(admin);
    setShowViewModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const url = editingAdmin
        ? `${API_BASE_URL}/api/admin/users/${editingAdmin._id}`
        : `${API_BASE_URL}/api/admin/add-admin`;
      const method = editingAdmin ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save admin");

      setMessage(editingAdmin ? "Admin updated successfully!" : "Admin created successfully!");
      setShowModal(false);
      setFormData({ name: "", email: "", password: "", role: "admin" });
      setEditingAdmin(null);
      fetchAdmins();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this admin?")) return;
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete admin");
      setMessage("Admin deleted successfully!");
      fetchAdmins();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeVariant = (role) => {
    return role === "superadmin" ? "danger" : "primary";
  };

  const getCurrentAdmins = () => {
    return activeTab === "admin" ? admins : superAdmins;
  };

  const canEditDelete = (admin) => {
    return true;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className={styles.container}>
      {/* Header Section */}
      <div className={styles.heroSection}>
        <div className={styles.heroContent}>
          <div className={styles.heroText}>
            <h1 className={styles.heroTitle}>
              <Shield className={styles.heroIcon} />
              Admin Management
            </h1>
            <p className={styles.heroSubtitle}>
              Manage administrator accounts and permissions with ease
            </p>
          </div>
          <Button 
            className={styles.heroButton}
            onClick={() => handleOpenModal()}
          >
            {/* <PlusCircle size={20} className={styles.buttonIcon} /> */}
            <span style={{fontSize:"18px", fontWeight:"500", marginRight:"3px"}}>+</span>
            Create {activeTab === "admin" ? "Admin" : "Super Admin"}
          </Button>
        </div>
        <div className={styles.heroBackground}></div>
      </div>

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <Card className={styles.statCard}>
          <Card.Body className={styles.statBody}>
            <div className={styles.statIconWrapper}>
              <Users className={styles.statIcon} />
            </div>
            <div className={styles.statInfo}>
              <h3 className={styles.statNumber}>{admins.length}</h3>
              <p className={styles.statLabel}>Admins</p>
            </div>
          </Card.Body>
        </Card>
        
        <Card className={styles.statCard}>
          <Card.Body className={styles.statBody}>
            <div className={styles.statIconWrapper}>
              <Shield className={styles.statIcon} />
            </div>
            <div className={styles.statInfo}>
              <h3 className={styles.statNumber}>{superAdmins.length}</h3>
              <p className={styles.statLabel}>Super Admins</p>
            </div>
          </Card.Body>
        </Card>

        <Card className={styles.statCard}>
          <Card.Body className={styles.statBody}>
            <div className={styles.statIconWrapper}>
              <Settings className={styles.statIcon} />
            </div>
            <div className={styles.statInfo}>
              <h3 className={styles.statNumber}>{allUsers.length}</h3>
              <p className={styles.statLabel}>Total Admins</p>
            </div>
          </Card.Body>
        </Card>
      </div>

      {/* Messages */}
      {message && (
        <div className={styles.successAlert}>
          <div className={styles.alertContent}>
            <div className={styles.alertIconSuccess}>✓</div>
            <div>
              <div className={styles.alertTitle}>Success</div>
              <div className={styles.alertMessage}>{message}</div>
            </div>
          </div>
        </div>
      )}
      
      {error && (
        <div className={styles.errorAlert}>
          <div className={styles.alertContent}>
            <div className={styles.alertIconError}>⚠</div>
            <div>
              <div className={styles.alertTitle}>Error</div>
              <div className={styles.alertMessage}>{error}</div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <Card className={styles.mainCard}>
        <Card.Header className={styles.cardHeader} style={{justifyContent:"space-between"}}>
          <div className={styles.headerContent}>
            <div className={styles.headerTitle}>
              <Users size={24} className={styles.headerIcon} />
              <div>
                <h2 className={styles.title}>Administrator Accounts</h2>
                <p className={styles.subtitle}>
                  Manage and monitor all administrator accounts in your system
                </p>
              </div>
            </div>
            {/* <div className={styles.headerActions}>
              <Button 
                className={styles.createBtn}
                onClick={() => handleOpenModal()}
              >
                <PlusCircle size={18} className={styles.btnIcon} />
                Add New
              </Button>
            </div> */}
          </div>

          {/* Tabs */}
          <Tabs
            activeKey={activeTab}
            onSelect={(tab) => setActiveTab(tab)}
            className={styles.customTabs}
           
          >
            <Tab 
              eventKey="admin" 
              title={
                <div className={styles.tabTitle}>
                  <Users size={18} />
                  <span>Administrators</span>
                  <Badge bg="primary" className={styles.tabBadge}>
                    {admins.length}
                  </Badge>
                </div>
              }
            />
            <Tab 
              eventKey="superadmin" 
              title={
                <div className={styles.tabTitle}>
                  <Shield size={18} />
                  <span>Super Admins</span>
                  <Badge bg="danger" className={styles.tabBadge}>
                    {superAdmins.length}
                  </Badge>
                </div>
              }
            />
          </Tabs>
        </Card.Header>
        
        <Card.Body className={styles.cardBody}>
          {loading ? (
            <div className={styles.loadingContainer}>
              <Loader className={styles.spinner} />
              <p className={styles.loadingText}>Loading {activeTab === "admin" ? "administrators" : "super administrators"}...</p>
            </div>
          ) : getCurrentAdmins().length > 0 ? (
            <div className={styles.tableContainer}>
              <Table hover className={styles.dataTable}>
                <thead className={styles.tableHeader}>
                  <tr>
                    <th className={styles.th}>#</th>
                    <th className={styles.th}>User</th>
                    <th className={styles.th}>Contact</th>
                    <th className={styles.th}>Role</th>
                    <th className={styles.th}>Joined</th>
                    <th className={styles.thActions}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {getCurrentAdmins().map((admin, index) => (
                    <tr key={admin._id} className={styles.tableRow}>
                      <td className={styles.indexCell}>
                        <div className={styles.indexNumber}>{index + 1}</div>
                      </td>
                      <td className={styles.userCell}>
                        <div className={styles.userInfo}>
                          <div className={`${styles.avatar} ${admin.role === 'superadmin' ? styles.avatarSuper : ''}`}>
                            {admin.role === 'superadmin' ? <Shield size={16} /> : <User size={16} />}
                          </div>
                          <div className={styles.userDetails}>
                            <div className={styles.userName}>{admin.name}</div>
                            <div className={styles.userRole}>
                              {admin.role === 'superadmin' ? 'Super Administrator' : 'Administrator'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className={styles.emailCell}>
                        <div className={styles.emailInfo}>
                          <Mail size={16} className={styles.emailIcon} />
                          <span>{admin.email}</span>
                        </div>
                      </td>
                      <td className={styles.roleCell}>
                        <Badge 
                          bg={getRoleBadgeVariant(admin.role)} 
                          className={styles.roleBadge}
                        >
                          {admin.role}
                        </Badge>
                      </td>
                      <td className={styles.dateCell}>
                        <div className={styles.dateInfo}>
                          <Calendar size={14} className={styles.dateIcon} />
                          {formatDate(admin.createdAt || new Date())}
                        </div>
                      </td>
                      <td className={styles.actionsCell}>
                        <div className={styles.actionButtons}>
                          <Button
                            variant="outline-info"
                            size="sm"
                            className={styles.actionBtn}
                            onClick={() => handleViewAdmin(admin)}
                            title="View Details"
                          >
                            <Eye size={14} />
                          </Button>
                          {canEditDelete(admin) && (
                            <>
                              <Button
                                variant="outline-primary"
                                size="sm"
                                className={styles.actionBtn}
                                onClick={() => handleOpenModal(admin)}
                                title="Edit Admin"
                              >
                                <Edit3 size={14} />
                              </Button>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                className={styles.actionBtn}
                                onClick={() => handleDelete(admin._id)}
                                title="Delete Admin"
                              >
                                <Trash2 size={14} />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyIconWrapper}>
                {activeTab === "admin" ? (
                  <Users size={64} className={styles.emptyIcon} />
                ) : (
                  <Shield size={64} className={styles.emptyIcon} />
                )}
              </div>
              <h3 className={styles.emptyTitle}>
                No {activeTab === "admin" ? "Administrators" : "Super Administrators"} Found
              </h3>
              <p className={styles.emptyText}>
                {activeTab === "admin" 
                  ? "Get started by creating your first administrator account." 
                  : "Get started by creating your first super administrator account."
                }
              </p>
              <Button 
                variant="primary"
                onClick={() => handleOpenModal()}
                className={styles.emptyButton}
               
              >
                <PlusCircle size={18} className="me-2" />
                Create {activeTab === "admin" ? "Admin" : "Super Admin"}
              </Button>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Create/Edit Modal */}
      <Modal 
        show={showModal} 
        onHide={() => setShowModal(false)} 
        centered
        className={styles.modal}
       
      >
        <Modal.Header closeButton className={styles.modalHeader}>
          <Modal.Title className={styles.modalTitle}>
            <div className={styles.modalTitleIcon}>
              {editingAdmin ? <Edit3 size={24} /> : <PlusCircle size={24} />}
            </div>
            <div>
              <div className={styles.modalTitleMain}>
                {editingAdmin ? 'Edit' : 'Create New'} {activeTab === "admin" ? "Admin" : "Super Admin"}
              </div>
              <div className={styles.modalTitleSub}>
                {editingAdmin ? 'Update administrator details' : 'Add a new administrator to your system'}
              </div>
            </div>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className={styles.modalBody}>
          <Form onSubmit={handleSubmit}>
            <div className={styles.formGrid}>
              <Form.Group className={styles.formGroup}>
                <Form.Label className={styles.formLabel}>
                  <User size={18} className={styles.labelIcon} />
                  Full Name
                </Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  placeholder="Enter full name"
                  value={formData.name}
                  onChange={handleChange}
                  className={styles.formControl}
                  required
                />
              </Form.Group>

              <Form.Group className={styles.formGroup}>
                <Form.Label className={styles.formLabel}>
                  <Shield size={18} className={styles.labelIcon} />
                  Role
                </Form.Label>
                <Form.Select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className={styles.formControl}
                  required
                >
                  <option value="admin">Administrator</option>
                  <option value="superadmin">Super Administrator</option>
                </Form.Select>
              </Form.Group>
            </div>

            <Form.Group className={styles.formGroup}>
              <Form.Label className={styles.formLabel}>
                <Mail size={18} className={styles.labelIcon} />
                Email Address
              </Form.Label>
              <Form.Control
                type="email"
                name="email"
                placeholder="Enter email address"
                value={formData.email}
                onChange={handleChange}
                className={styles.formControl}
                required
              />
            </Form.Group>

              <Form.Group className={styles.formGroup}>
                <Form.Label className={styles.formLabel}>
                  <Key size={18} className={styles.labelIcon} />
                  Password
                </Form.Label>
                <div style={{ position: "relative" }}>
                  <Form.Control
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder={editingAdmin ? "Leave blank to keep current password" : "Enter secure password"}
                    value={formData.password}
                    onChange={handleChange}
                    className={styles.formControl}
                    minLength={editingAdmin ? 0 : 6}
                    required={!editingAdmin}
                  />
                  <div 
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: "absolute",
                      right: "10px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      cursor: "pointer",
                      color: "#6c757d"
                    }}
                  >
                    {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                  </div>
                </div>
                {editingAdmin && (
                  <Form.Text className={styles.helpText}>
                    Leave password blank to keep the current password
                  </Form.Text>
                )}
              </Form.Group>

            <div className={styles.modalActions}>
              <Button
                variant="outline-secondary"
                className={styles.cancelBtn}
                onClick={() => setShowModal(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="primary"
                className={styles.submitBtn}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader className={styles.buttonSpinner} />
                    {editingAdmin ? "Updating..." : "Creating..."}
                  </>
                ) : editingAdmin ? (
                  `Update ${formData.role === "superadmin" ? "Super Admin" : "Admin"}`
                ) : (
                  `Create ${formData.role === "superadmin" ? "Super Admin" : "Admin"}`
                )}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* View Admin Modal */}
      <Modal 
        show={showViewModal} 
        onHide={() => setShowViewModal(false)} 
        centered
        className={styles.modal}
      >
        <Modal.Header closeButton className={styles.modalHeader}>
          <Modal.Title className={styles.modalTitle}>
            <div className={styles.modalTitleIcon}>
              <Eye size={24} />
            </div>
            <div>
              <div className={styles.modalTitleMain}>
                {selectedAdmin?.role === "superadmin" ? "Super Admin" : "Admin"} Details
              </div>
              <div className={styles.modalTitleSub}>
                View administrator information
              </div>
            </div>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className={styles.modalBody}>
          {selectedAdmin && (
            <div className={styles.viewAdminContent}>
              <div className={styles.viewAdminAvatar}>
                {selectedAdmin.role === "superadmin" ? (
                  <Shield size={48} />
                ) : (
                  <User size={48} />
                )}
              </div>
              
              <div className={styles.viewAdminInfo}>
                <div className={styles.viewAdminField}>
                  <label className={styles.viewAdminLabel}>Full Name</label>
                  <p className={styles.viewAdminValue}>{selectedAdmin.name}</p>
                </div>
                
                <div className={styles.viewAdminField}>
                  <label className={styles.viewAdminLabel}>Email Address</label>
                  <p className={styles.viewAdminValue}>{selectedAdmin.email}</p>
                </div>
                
                <div className={styles.viewAdminField}>
                  <label className={styles.viewAdminLabel}>Role</label>
                  <div>
                    <Badge 
                      bg={getRoleBadgeVariant(selectedAdmin.role)} 
                      className={styles.viewAdminBadge}
                    >
                      {selectedAdmin.role === "superadmin" ? "Super Administrator" : "Administrator"}
                    </Badge>
                  </div>
                </div>
                
                <div className={styles.viewAdminField}>
                  <label className={styles.viewAdminLabel}>User ID</label>
                  <p className={styles.viewAdminId}>{selectedAdmin._id}</p>
                </div>

                <div className={styles.viewAdminField}>
                  <label className={styles.viewAdminLabel}>Joined Date</label>
                  <p className={styles.viewAdminValue}>
                    <Calendar size={14} className="me-2" />
                    {formatDate(selectedAdmin.createdAt || new Date())}
                  </p>
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className={styles.modalFooter}>
          <Button
            variant="outline-secondary"
            className={styles.cancelBtn}
            onClick={() => setShowViewModal(false)}
          >
            Close
          </Button>
          {selectedAdmin && canEditDelete(selectedAdmin) && (
            <Button
              variant="primary"
              className={styles.submitBtn}
              onClick={() => {
                setShowViewModal(false);
                handleOpenModal(selectedAdmin);
              }}
            >
              <Edit3 size={16} className="me-2" />
              Edit {selectedAdmin.role === "superadmin" ? "Super Admin" : "Admin"}
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default AddAdmin;