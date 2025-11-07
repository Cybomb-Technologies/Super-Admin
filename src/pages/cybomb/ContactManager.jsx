// ContactManagerCybomb.jsx
import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Trash2, 
  User, 
  MessageSquare, 
  Calendar, 
  Phone, 
  Bell,
  Search,
  Download,
  Eye,
  RefreshCw,
  AlertCircle,
  Filter
} from 'lucide-react';
import styles from './ContactManagerCybomb.module.css';

const API_BASE_URL = import.meta.env.VITE_CYBOMB_API_BASE || 'http://localhost:5002';

const ContactManagerCybomb = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedContact, setSelectedContact] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/api/contact`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch contacts: ${response.status}`);
      }
      
      const result = await response.json();
      
      // Handle different response structures
      const contactsData = Array.isArray(result?.data) ? result.data : 
                          Array.isArray(result) ? result : [];
      
      setContacts(contactsData);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.message);
      console.error('Error fetching contacts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this contact message?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/contact/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete contact');
      }

      setContacts(prev => prev.filter(contact => contact._id !== id));
    } catch (err) {
      setError(err.message);
      console.error('Error deleting contact:', err);
    }
  };

  const handleViewDetails = (contact) => {
    setSelectedContact(contact);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedContact(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = 
      contact.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.message?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'subscribed' && contact.subscribe) ||
      (statusFilter === 'not-subscribed' && !contact.subscribe);

    return matchesSearch && matchesStatus;
  });

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Message', 'Subscribe', 'Date'];
    const csvContent = [
      headers.join(','),
      ...filteredContacts.map(contact => [
        `"${contact.name || ''}"`,
        `"${contact.email || ''}"`,
        `"${contact.phone || ''}"`,
        `"${(contact.message || '').replace(/"/g, '""')}"`,
        `"${contact.subscribe ? 'Subscribed' : 'Not Subscribed'}"`,
        `"${formatDate(contact.createdAt)}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contact-messages-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const ContactModal = () => {
    if (!selectedContact) return null;

    return (
      <div className={styles.modalOverlay} onClick={closeModal}>
        <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
          <div className={styles.modalHeader}>
            <h3 className={styles.modalTitle}>
              <MessageSquare className={styles.modalIcon} />
              Contact Message Details
            </h3>
            <button className={styles.closeButton} onClick={closeModal}>
              ×
            </button>
          </div>
          
          <div className={styles.modalBody}>
            <div className={styles.detailGrid}>
              <div className={styles.detailItem}>
                <label className={styles.detailLabel}>Name</label>
                <div className={styles.detailValue}>
                  <div className={styles.userInfo}>
                    <div className={styles.userAvatar}>
                      <User />
                    </div>
                    <span>{selectedContact.name || 'N/A'}</span>
                  </div>
                </div>
              </div>
              
              <div className={styles.detailItem}>
                <label className={styles.detailLabel}>Email</label>
                <div className={styles.detailValue}>
                  <a 
                    href={`mailto:${selectedContact.email}`} 
                    className={styles.emailLink}
                  >
                    <Mail className={styles.detailIcon} />
                    {selectedContact.email || 'N/A'}
                  </a>
                </div>
              </div>
              
              <div className={styles.detailItem}>
                <label className={styles.detailLabel}>Phone</label>
                <div className={styles.detailValue}>
                  {selectedContact.phone ? (
                    <a 
                      href={`tel:${selectedContact.phone}`} 
                      className={styles.phoneLink}
                    >
                      <Phone className={styles.detailIcon} />
                      {selectedContact.phone}
                    </a>
                  ) : (
                    <span className={styles.noData}>Not provided</span>
                  )}
                </div>
              </div>
              
              <div className={styles.detailItem}>
                <label className={styles.detailLabel}>Newsletter</label>
                <div className={styles.detailValue}>
                  <div className={styles.subscriptionStatus}>
                    <Bell className={`${styles.detailIcon} ${
                      selectedContact.subscribe ? styles.subscribed : styles.notSubscribed
                    }`} />
                    <span className={`${styles.statusBadge} ${
                      selectedContact.subscribe ? styles.subscribedBadge : styles.notSubscribedBadge
                    }`}>
                      {selectedContact.subscribe ? 'Subscribed' : 'Not Subscribed'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className={styles.messageSection}>
              <label className={styles.detailLabel}>Message</label>
              <div className={styles.messageContent}>
                {selectedContact.message || 'N/A'}
              </div>
            </div>
            
            {selectedContact.createdAt && (
              <div className={styles.dateSection}>
                <label className={styles.detailLabel}>Submitted</label>
                <div className={styles.dateContent}>
                  <Calendar className={styles.detailIcon} />
                  {formatDate(selectedContact.createdAt)}
                </div>
              </div>
            )}
          </div>
          
          <div className={styles.modalFooter}>
            <button className={styles.secondaryButton} onClick={closeModal}>
              Close
            </button>
            <button 
              className={styles.dangerButton}
              onClick={() => {
                handleDelete(selectedContact._id);
                closeModal();
              }}
            >
              <Trash2 className={styles.buttonIcon} />
              Delete Message
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderTableRow = (contact) => (
    <tr 
      key={contact._id} 
      className={styles.tableRow}
      onClick={() => handleViewDetails(contact)}
    >
      <td className={styles.tableCell}>
        <div className={styles.userCell}>
          <div className={styles.userAvatar}>
            <User />
          </div>
          <div className={styles.userInfo}>
            <div className={styles.userName}>{contact.name || 'N/A'}</div>
            <div className={styles.userDate}>
              <Calendar className={styles.smallIcon} />
              {formatDate(contact.createdAt)}
            </div>
          </div>
        </div>
      </td>
      
      <td className={styles.tableCell}>
        <a 
          href={`mailto:${contact.email}`}
          className={styles.emailLink}
          onClick={(e) => e.stopPropagation()}
        >
          <Mail className={styles.smallIcon} />
          {contact.email || 'N/A'}
        </a>
      </td>
      
      <td className={styles.tableCell}>
        {contact.phone ? (
          <a 
            href={`tel:${contact.phone}`}
            className={styles.phoneLink}
            onClick={(e) => e.stopPropagation()}
          >
            <Phone className={styles.smallIcon} />
            {contact.phone}
          </a>
        ) : (
          <span className={styles.noData}>Not provided</span>
        )}
      </td>
      
      <td className={styles.tableCell}>
        <div className={styles.messageCell}>
          <MessageSquare className={styles.smallIcon} />
          <span className={styles.messagePreview}>
            {contact.message?.substring(0, 60) || 'N/A'}
            {contact.message && contact.message.length > 60 && '...'}
          </span>
        </div>
      </td>
      
      <td className={styles.tableCell}>
        <div className={styles.subscriptionCell}>
          <Bell className={`${styles.smallIcon} ${
            contact.subscribe ? styles.subscribed : styles.notSubscribed
          }`} />
          <span className={`${styles.statusBadge} ${
            contact.subscribe ? styles.subscribedBadge : styles.notSubscribedBadge
          }`}>
            {contact.subscribe ? 'Subscribed' : 'Not Subscribed'}
          </span>
        </div>
      </td>
      
      <td className={styles.tableCell}>
        <div className={styles.actionCell}>
          <button
            className={styles.viewButton}
            onClick={(e) => {
              e.stopPropagation();
              handleViewDetails(contact);
            }}
            title="View details"
          >
            <Eye />
          </button>
          <button
            className={styles.deleteButton}
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(contact._id);
            }}
            title="Delete message"
          >
            <Trash2 />
          </button>
        </div>
      </td>
    </tr>
  );

  if (loading && contacts.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <h3>Loading Contact Messages...</h3>
          <p>Please wait while we fetch your data</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>
            <Mail className={styles.headerIcon} />
            Contact Manager
          </h1>
          <p className={styles.subtitle}>
            Manage all contact form submissions from your Cybomb website
          </p>
          {lastUpdated && (
            <p className={styles.lastUpdated}>
              Last updated: {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
        </div>
        <button
          onClick={fetchContacts}
          disabled={loading}
          className={styles.refreshButton}
        >
          <RefreshCw className={loading ? styles.spin : ''} />
          Refresh
        </button>
      </div>

      {error && (
        <div className={styles.alert}>
          <AlertCircle className={styles.alertIcon} />
          <div>
            <p className={styles.alertTitle}>Error loading data</p>
            <p className={styles.alertMessage}>{error}</p>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className={styles.controls}>
        <div className={styles.searchBox}>
          <Search className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search messages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        
        <div className={styles.filterGroup}>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All Status</option>
            <option value="subscribed">Subscribed</option>
            <option value="not-subscribed">Not Subscribed</option>
          </select>
          
          <button
            onClick={exportToCSV}
            disabled={filteredContacts.length === 0}
            className={styles.exportButton}
          >
            <Download />
            Export CSV
          </button>
        </div>
      </div>

      {/* Content */}
      <div className={styles.content}>
        {filteredContacts.length === 0 ? (
          <div className={styles.emptyState}>
            <Mail className={styles.emptyIcon} />
            <h3>
              {contacts.length === 0 ? 'No contact messages yet' : 'No messages found'}
            </h3>
            <p>
              {contacts.length === 0 
                ? 'Contact form submissions will appear here once users start submitting.' 
                : 'Try adjusting your search or filter criteria.'
              }
            </p>
            {(searchTerm || statusFilter !== 'all') && (
              <button
                className={styles.clearButton}
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                }}
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead className={styles.tableHeader}>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Message</th>
                  <th>Subscribe</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody className={styles.tableBody}>
                {filteredContacts.map(renderTableRow)}
              </tbody>
            </table>
            
            <div className={styles.tableFooter}>
              <span className={styles.footerText}>
                Showing {filteredContacts.length} of {contacts.length} messages
              </span>
              <span className={styles.footerText}>
                Last updated: {new Date().toLocaleTimeString()}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && <ContactModal />}
    </div>
  );
};

export default ContactManagerCybomb;