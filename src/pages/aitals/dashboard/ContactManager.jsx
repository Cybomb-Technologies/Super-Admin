import React, { useEffect, useState } from "react";
import { 
  Mail, 
  Trash2, 
  User, 
  MessageSquare, 
  Calendar, 
  Search, 
  Filter,
  Eye,
  EyeOff,
  Phone,
  Building,
  Download,
  ChevronLeft,
  ChevronRight,
  Loader,
  ExternalLink
} from "lucide-react";
import styles from './ContactManager.module.css';

const API_BASE_URL = import.meta.env.VITE_AITALS_API_URL;

const HorizontalTableView = ({ contacts, onDelete, onToggleRead, onViewDetails }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Pagination
  const totalPages = Math.ceil(contacts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedContacts = contacts.slice(startIndex, startIndex + itemsPerPage);

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div className={styles.horizontalTableContainer}>
      {/* Table Container */}
      <div className={styles.tableWrapper}>
        <table className={styles.horizontalTable}>
          <thead>
            <tr>
              <th className={styles.th}>Contact Info</th>
              <th className={styles.th}>Subject</th>
              <th className={styles.th}>Message Preview</th>
              <th className={styles.th}>Date</th>
              <th className={styles.th}>Status</th>
              <th className={styles.thActions}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedContacts.map((contact, index) => (
              <tr key={contact._id || index} className={`${styles.tr} ${!contact.read ? styles.unreadRow : ''}`}>
                {/* Contact Info Column */}
                <td className={styles.td}>
                  <div className={styles.contactCell}>
                    <div className={styles.avatar}>
                      <User className={styles.avatarIcon} />
                    </div>
                    <div className={styles.contactInfo}>
                      <div className={styles.name}>{contact.name || "Unknown"}</div>
                      <div className={styles.email}>
                        <Mail className={styles.smallIcon} />
                        {contact.email}
                      </div>
                      {contact.phone && (
                        <div className={styles.phone}>
                          <Phone className={styles.smallIcon} />
                          {contact.phone}
                        </div>
                      )}
                      {contact.company && (
                        <div className={styles.company}>
                          <Building className={styles.smallIcon} />
                          {contact.company}
                        </div>
                      )}
                    </div>
                  </div>
                </td>

                {/* Subject Column */}
                <td className={styles.td}>
                  <div className={styles.subjectCell}>
                    {contact.subject ? (
                      <span className={styles.subjectText}>{contact.subject}</span>
                    ) : (
                      <span className={styles.naText}>No Subject</span>
                    )}
                  </div>
                </td>

                {/* Message Preview Column */}
                <td className={styles.td}>
                  <div className={styles.messageCell}>
                    <MessageSquare className={styles.messageIcon} />
                    <div className={styles.messagePreview}>
                      {contact.message ? (
                        <>
                          {contact.message.length > 80 
                            ? `${contact.message.substring(0, 80)}...` 
                            : contact.message
                          }
                        </>
                      ) : (
                        <span className={styles.naText}>No message</span>
                      )}
                    </div>
                  </div>
                </td>

                {/* Date Column */}
                <td className={styles.td}>
                  <div className={styles.dateCell}>
                    <Calendar className={styles.dateIcon} />
                    <div>
                      <div className={styles.date}>{formatDate(contact.createdAt)}</div>
                      <div className={styles.time}>
                        {new Date(contact.createdAt).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Status Column */}
                <td className={styles.td}>
                  <div className={styles.statusCell}>
                    <button
                      onClick={() => onToggleRead(contact._id, contact.read)}
                      className={`${styles.statusButton} ${contact.read ? styles.read : styles.unread}`}
                      title={contact.read ? "Mark as unread" : "Mark as read"}
                    >
                      {contact.read ? (
                        <>
                          <Eye className={styles.statusIcon} />
                          <span>Read</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className={styles.statusIcon} />
                          <span>Unread</span>
                        </>
                      )}
                    </button>
                  </div>
                </td>

                {/* Actions Column */}
                <td className={styles.tdActions}>
                  <div className={styles.actionsCell}>
                    <button
                      onClick={() => onViewDetails(contact)}
                      className={styles.viewButton}
                      title="View full details"
                    >
                      <ExternalLink className={styles.actionIcon} />
                      <span>View</span>
                    </button>
                    
                    <button
                      onClick={() => onDelete(contact._id, 'contact')}
                      className={styles.deleteButton}
                      title="Delete contact"
                    >
                      <Trash2 className={styles.actionIcon} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {contacts.length > 0 && (
        <div className={styles.pagination}>
          <div className={styles.paginationInfo}>
            Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, contacts.length)} of {contacts.length} contacts
          </div>
          <div className={styles.paginationControls}>
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className={styles.paginationButton}
            >
              <ChevronLeft className={styles.paginationIcon} />
            </button>
            
            <div className={styles.pageNumbers}>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`${styles.pageButton} ${currentPage === page ? styles.activePage : ''}`}
                >
                  {page}
                </button>
              ))}
            </div>
            
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className={styles.paginationButton}
            >
              <ChevronRight className={styles.paginationIcon} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Contact Details Modal Component
const ContactDetailsModal = ({ contact, onClose, onToggleRead, onDelete }) => {
  if (!contact) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div className={styles.modalTitleSection}>
            <div className={styles.modalAvatar}>
              <User className={styles.modalAvatarIcon} />
            </div>
            <div>
              <h3 className={styles.modalTitle}>Contact Details</h3>
              <p className={styles.modalSubtitle}>Submitted on {formatDate(contact.createdAt)}</p>
            </div>
          </div>
          <button 
            className={styles.modalClose}
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.detailSections}>
            {/* Personal Information */}
            <div className={styles.detailSection}>
              <h4 className={styles.sectionTitle}>
                <User className={styles.sectionIcon} />
                Personal Information
              </h4>
              <div className={styles.detailGrid}>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Full Name:</span>
                  <span className={styles.detailValue}>{contact.name || "Not provided"}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Email:</span>
                  <a href={`mailto:${contact.email}`} className={styles.detailLink}>
                    {contact.email}
                  </a>
                </div>
                {contact.phone && (
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Phone:</span>
                    <a href={`tel:${contact.phone}`} className={styles.detailLink}>
                      {contact.phone}
                    </a>
                  </div>
                )}
                {contact.company && (
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Company:</span>
                    <span className={styles.detailValue}>{contact.company}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Message Details */}
            <div className={styles.detailSection}>
              <h4 className={styles.sectionTitle}>
                <MessageSquare className={styles.sectionIcon} />
                Message Details
              </h4>
              {contact.subject && (
                <div className={styles.detailItemFull}>
                  <span className={styles.detailLabel}>Subject:</span>
                  <span className={styles.detailValue}>{contact.subject}</span>
                </div>
              )}
              <div className={styles.detailItemFull}>
                <span className={styles.detailLabel}>Message:</span>
                <div className={styles.messageContent}>
                  {contact.message || "No message provided"}
                </div>
              </div>
            </div>

            {/* Technical Information */}
            <div className={styles.detailSection}>
              <h4 className={styles.sectionTitle}>
                <Calendar className={styles.sectionIcon} />
                Technical Information
              </h4>
              <div className={styles.detailGrid}>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Contact ID:</span>
                  <span className={styles.detailValueCode}>{contact._id}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Status:</span>
                  <span className={`${styles.statusBadge} ${contact.read ? styles.read : styles.unread}`}>
                    {contact.read ? 'Read' : 'Unread'}
                  </span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Submitted:</span>
                  <span className={styles.detailValue}>{formatDate(contact.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.modalFooter}>
          <div className={styles.modalActions}>
            <button
              onClick={() => onToggleRead(contact._id, contact.read)}
              className={styles.secondaryButton}
            >
              {contact.read ? (
                <>
                  <EyeOff className={styles.buttonIcon} />
                  Mark as Unread
                </>
              ) : (
                <>
                  <Eye className={styles.buttonIcon} />
                  Mark as Read
                </>
              )}
            </button>
            <button
              onClick={() => {
                if (window.confirm("Are you sure you want to delete this contact?")) {
                  onDelete(contact._id, 'contact');
                  onClose();
                }
              }}
              className={styles.dangerButton}
            >
              <Trash2 className={styles.buttonIcon} />
              Delete Contact
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ✅ Contact Manager Component
const ContactManager = ({ contacts = [], onDelete }) => {
  const [data, setData] = useState(contacts);
  const [loading, setLoading] = useState(!contacts.length);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedContact, setSelectedContact] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      // const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API_BASE_URL}/api/contact`, {
        // headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      const contactsData = json.data || json;
      // Add read status if not present
      const enrichedContacts = contactsData.map(contact => ({
        ...contact,
        read: contact.read || false,
        createdAt: contact.createdAt || new Date().toISOString()
      }));
      setData(enrichedContacts);
    } catch (err) {
      console.error("Error fetching contacts:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, type) => {
    if (!window.confirm("Are you sure you want to delete this contact?")) return;
    try {
      // const token = localStorage.getItem("adminToken");
      await fetch(`${API_BASE_URL}/api/${type}/${id}`, {
        method: "DELETE",
        // headers: { Authorization: `Bearer ${token}` },
      });
      fetchContacts();
    } catch (err) {
      console.error("Error deleting:", err);
    }
  };

  const toggleReadStatus = async (id, currentStatus) => {
    try {
      // const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API_BASE_URL}/api/contact/${id}`, {
        method: "PATCH",
        headers: {
          // "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ read: !currentStatus })
      });
      
      if (res.ok) {
        fetchContacts();
      }
    } catch (err) {
      console.error("Error updating read status:", err);
    }
  };

  const handleViewDetails = (contact) => {
    setSelectedContact(contact);
    setShowDetailsModal(true);
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Company', 'Subject', 'Message', 'Date', 'Status'];
    const csvData = filteredContacts.map(contact => [
      contact.name,
      contact.email,
      contact.phone || 'N/A',
      contact.company || 'N/A',
      contact.subject || 'N/A',
      contact.message,
      new Date(contact.createdAt).toLocaleDateString(),
      contact.read ? 'Read' : 'Unread'
    ]);
    
    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contacts-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Filter contacts
  const filteredContacts = data.filter(contact => {
    const matchesSearch = 
      contact.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.subject?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = 
      filterStatus === "all" || 
      (filterStatus === "read" && contact.read) ||
      (filterStatus === "unread" && !contact.read);

    return matchesSearch && matchesStatus;
  });

  useEffect(() => {
    if (!contacts.length) fetchContacts();
  }, []);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Loader className={styles.loadingSpinner} />
        <span className={styles.loadingText}>Loading contacts...</span>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header Section */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.titleSection}>
            <div className={styles.titleIcon}>
              <Mail className={styles.titleIconSvg} />
            </div>
            <div>
              <h1 className={styles.title}>Contact Manager</h1>
              <p className={styles.subtitle}>
                Manage all contact form submissions
              </p>
            </div>
          </div>
          <div className={styles.stats}>
            <div className={styles.statCard}>
              <span className={styles.statNumber}>{data.length}</span>
              <span className={styles.statLabel}>Total</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statNumber}>
                {data.filter(contact => !contact.read).length}
              </span>
              <span className={styles.statLabel}>Unread</span>
            </div>
          </div>
        </div>
      </div>

      {/* Controls Section */}
      <div className={styles.controls}>
        <div className={styles.searchBox}>
          <Search className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        
        <div className={styles.controlGroup}>
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All Contacts</option>
            <option value="unread">Unread Only</option>
            <option value="read">Read Only</option>
          </select>
          
          <button 
            onClick={exportToCSV}
            className={styles.exportButton}
          >
            <Download className={styles.exportIcon} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Horizontal Table View */}
      <HorizontalTableView
        contacts={filteredContacts}
        onDelete={onDelete || handleDelete}
        onToggleRead={toggleReadStatus}
        onViewDetails={handleViewDetails}
      />

      {/* Empty State */}
      {filteredContacts.length === 0 && (
        <div className={styles.emptyState}>
          <Mail className={styles.emptyIcon} />
          <h3 className={styles.emptyTitle}>
            {searchTerm || filterStatus !== "all" 
              ? "No contacts found" 
              : "No contact messages yet"
            }
          </h3>
          <p className={styles.emptyText}>
            {searchTerm || filterStatus !== "all" 
              ? "Try adjusting your search or filter criteria"
              : "Contact form submissions will appear here once users start submitting."
            }
          </p>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && (
        <ContactDetailsModal
          contact={selectedContact}
          onClose={() => setShowDetailsModal(false)}
          onToggleRead={toggleReadStatus}
          onDelete={onDelete || handleDelete}
        />
      )}
    </div>
  );
};

export default ContactManager;