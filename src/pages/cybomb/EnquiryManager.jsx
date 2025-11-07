// EnquiryManagerCybomb.jsx
import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Trash2, 
  Mail, 
  User, 
  Phone, 
  Eye, 
  Calendar,
  Search,
  Download,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import styles from './EnquiryManagerCybomb.module.css';

const API_BASE_URL = import.meta.env.VITE_CYBOMB_API_BASE || 'http://localhost:5002';

const EnquiryManagerCybomb = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [subscriptionFilter, setSubscriptionFilter] = useState('all');
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchEnquiries = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/api/popup-mail`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch enquiries: ${response.status}`);
      }
      
      const result = await response.json();
      
      // Handle different response structures
      const enquiriesData = Array.isArray(result?.data) ? result.data : 
                           Array.isArray(result) ? result : [];
      
      setEnquiries(enquiriesData);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.message);
      console.error('Error fetching enquiries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this enquiry?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/popup-mail/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete enquiry');
      }

      setEnquiries(prev => prev.filter(enquiry => enquiry._id !== id));
    } catch (err) {
      setError(err.message);
      console.error('Error deleting enquiry:', err);
    }
  };

  const handleViewDetails = (enquiry) => {
    setSelectedEnquiry(enquiry);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedEnquiry(null);
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

  const filteredEnquiries = enquiries.filter(enquiry => {
    const matchesSearch = 
      enquiry.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enquiry.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enquiry.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enquiry.message?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSubscription = 
      subscriptionFilter === 'all' || 
      (subscriptionFilter === 'subscribed' && enquiry.subscribe) ||
      (subscriptionFilter === 'not-subscribed' && !enquiry.subscribe);

    return matchesSearch && matchesSubscription;
  });

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Message', 'Subscribe', 'Date'];
    const csvContent = [
      headers.join(','),
      ...filteredEnquiries.map(enquiry => [
        `"${enquiry.name || ''}"`,
        `"${enquiry.email || ''}"`,
        `"${enquiry.phone || ''}"`,
        `"${(enquiry.message || '').replace(/"/g, '""')}"`,
        `"${enquiry.subscribe ? 'Subscribed' : 'Not Subscribed'}"`,
        `"${formatDate(enquiry.createdAt)}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `enquiries-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const EnquiryModal = () => {
    if (!selectedEnquiry) return null;

    return (
      <div className={styles.modalOverlay} onClick={closeModal}>
        <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
          <div className={styles.modalHeader}>
            <h3 className={styles.modalTitle}>
              <MessageSquare className={styles.modalIcon} />
              Popup Form Details
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
                    <span>{selectedEnquiry.name || 'N/A'}</span>
                  </div>
                </div>
              </div>
              
              <div className={styles.detailItem}>
                <label className={styles.detailLabel}>Email</label>
                <div className={styles.detailValue}>
                  <a 
                    href={`mailto:${selectedEnquiry.email}`} 
                    className={styles.emailLink}
                  >
                    <Mail className={styles.detailIcon} />
                    {selectedEnquiry.email || 'N/A'}
                  </a>
                </div>
              </div>
              
              <div className={styles.detailItem}>
                <label className={styles.detailLabel}>Phone</label>
                <div className={styles.detailValue}>
                  {selectedEnquiry.phone ? (
                    <a 
                      href={`tel:${selectedEnquiry.phone}`} 
                      className={styles.phoneLink}
                    >
                      <Phone className={styles.detailIcon} />
                      {selectedEnquiry.phone}
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
                    <Mail className={`${styles.detailIcon} ${
                      selectedEnquiry.subscribe ? styles.subscribed : styles.notSubscribed
                    }`} />
                    <span className={`${styles.statusBadge} ${
                      selectedEnquiry.subscribe ? styles.subscribedBadge : styles.notSubscribedBadge
                    }`}>
                      {selectedEnquiry.subscribe ? 'Subscribed' : 'Not Subscribed'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className={styles.messageSection}>
              <label className={styles.detailLabel}>Message</label>
              <div className={styles.messageContent}>
                {selectedEnquiry.message || 'No message provided'}
              </div>
            </div>
            
            {selectedEnquiry.createdAt && (
              <div className={styles.dateSection}>
                <label className={styles.detailLabel}>Submitted</label>
                <div className={styles.dateContent}>
                  <Calendar className={styles.detailIcon} />
                  {formatDate(selectedEnquiry.createdAt)}
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
                handleDelete(selectedEnquiry._id);
                closeModal();
              }}
            >
              <Trash2 className={styles.buttonIcon} />
              Delete Enquiry
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderTableRow = (enquiry) => (
    <tr 
      key={enquiry._id} 
      className={styles.tableRow}
      onClick={() => handleViewDetails(enquiry)}
    >
      <td className={styles.tableCell}>
        <div className={styles.userCell}>
          <div className={styles.userAvatar}>
            <User />
          </div>
          <div className={styles.userInfo}>
            <div className={styles.userName}>{enquiry.name || 'N/A'}</div>
            <div className={styles.userDate}>
              <Calendar className={styles.smallIcon} />
              {formatDate(enquiry.createdAt)}
            </div>
          </div>
        </div>
      </td>
      
      <td className={styles.tableCell}>
        <a 
          href={`mailto:${enquiry.email}`}
          className={styles.emailLink}
          onClick={(e) => e.stopPropagation()}
        >
          <Mail className={styles.smallIcon} />
          {enquiry.email || 'N/A'}
        </a>
      </td>
      
      <td className={styles.tableCell}>
        {enquiry.phone ? (
          <a 
            href={`tel:${enquiry.phone}`}
            className={styles.phoneLink}
            onClick={(e) => e.stopPropagation()}
          >
            <Phone className={styles.smallIcon} />
            {enquiry.phone}
          </a>
        ) : (
          <span className={styles.noData}>Not provided</span>
        )}
      </td>
      
      <td className={styles.tableCell}>
        <div className={styles.messageCell}>
          <MessageSquare className={styles.smallIcon} />
          <span className={styles.messagePreview}>
            {enquiry.message?.substring(0, 60) || 'No message'}
            {enquiry.message && enquiry.message.length > 60 && '...'}
          </span>
        </div>
      </td>
      
      <td className={styles.tableCell}>
        <div className={styles.subscriptionCell}>
          <Mail className={`${styles.smallIcon} ${
            enquiry.subscribe ? styles.subscribed : styles.notSubscribed
          }`} />
          <span className={`${styles.statusBadge} ${
            enquiry.subscribe ? styles.subscribedBadge : styles.notSubscribedBadge
          }`}>
            {enquiry.subscribe ? 'Subscribed' : 'Not Subscribed'}
          </span>
        </div>
      </td>
      
      <td className={styles.tableCell}>
        <div className={styles.actionCell}>
          <button
            className={styles.viewButton}
            onClick={(e) => {
              e.stopPropagation();
              handleViewDetails(enquiry);
            }}
            title="View details"
          >
            <Eye />
          </button>
          <button
            className={styles.deleteButton}
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(enquiry._id);
            }}
            title="Delete enquiry"
          >
            <Trash2 />
          </button>
        </div>
      </td>
    </tr>
  );

  if (loading && enquiries.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <h3>Loading Enquiries...</h3>
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
            <MessageSquare className={styles.headerIcon} />
            Popup Form Submissions
          </h1>
          <p className={styles.subtitle}>
            Manage all contact form submissions from the website popup
          </p>
          {lastUpdated && (
            <p className={styles.lastUpdated}>
              Last updated: {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
        </div>
        <div className={styles.headerStats}>
          <div className={styles.statBadge}>
            <span className={styles.statNumber}>{enquiries.length}</span>
            <span className={styles.statLabel}>Total Submissions</span>
          </div>
          <button
            onClick={fetchEnquiries}
            disabled={loading}
            className={styles.refreshButton}
          >
            <RefreshCw className={loading ? styles.spin : ''} />
            Refresh
          </button>
        </div>
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
            placeholder="Search enquiries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        
        <div className={styles.filterGroup}>
          <select
            value={subscriptionFilter}
            onChange={(e) => setSubscriptionFilter(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All Subscriptions</option>
            <option value="subscribed">Subscribed</option>
            <option value="not-subscribed">Not Subscribed</option>
          </select>
          
          <button
            onClick={exportToCSV}
            disabled={filteredEnquiries.length === 0}
            className={styles.exportButton}
          >
            <Download />
            Export CSV
          </button>
        </div>
      </div>

      {/* Content */}
      <div className={styles.content}>
        {filteredEnquiries.length === 0 ? (
          <div className={styles.emptyState}>
            <MessageSquare className={styles.emptyIcon} />
            <h3>
              {enquiries.length === 0 ? 'No popup form submissions yet' : 'No enquiries found'}
            </h3>
            <p>
              {enquiries.length === 0 
                ? 'Popup form submissions will appear here once users start contacting you.' 
                : 'Try adjusting your search or filter criteria.'
              }
            </p>
            {(searchTerm || subscriptionFilter !== 'all') && (
              <button
                className={styles.clearButton}
                onClick={() => {
                  setSearchTerm('');
                  setSubscriptionFilter('all');
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
                  <th>Subscription</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody className={styles.tableBody}>
                {filteredEnquiries.map(renderTableRow)}
              </tbody>
            </table>
            
            <div className={styles.tableFooter}>
              <span className={styles.footerText}>
                Showing {filteredEnquiries.length} of {enquiries.length} enquiries
              </span>
              <span className={styles.footerText}>
                Last updated: {new Date().toLocaleTimeString()}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && <EnquiryModal />}
    </div>
  );
};

export default EnquiryManagerCybomb;