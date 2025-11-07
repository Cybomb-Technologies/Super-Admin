// ApplicationManagerCybomb.jsx
import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  Trash2, 
  FileText, 
  Search,
  Download,
  RefreshCw,
  AlertCircle,
  Eye,
  User,
  Mail,
  Calendar,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import styles from './ApplicationManagerCybomb.module.css';

const API_BASE_URL = import.meta.env.VITE_CYBOMB_API_BASE || 'http://localhost:5002';

const ApplicationManagerCybomb = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [resumeLoading, setResumeLoading] = useState(false);
  const [resumeUrl, setResumeUrl] = useState(null);
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/api/application`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch applications: ${response.status}`);
      }
      
      const result = await response.json();
      
      // Handle different response structures
      const applicationsData = Array.isArray(result?.data) ? result.data : 
                              Array.isArray(result) ? result : [];
      
      setApplications(applicationsData);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.message);
      console.error('Error fetching applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this application?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/application/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete application');
      }

      setApplications(prev => prev.filter(application => application._id !== id));
    } catch (err) {
      setError(err.message);
      console.error('Error deleting application:', err);
    }
  };

  const handleViewDetails = (application) => {
    setSelectedApplication(application);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedApplication(null);
    if (resumeUrl) {
      window.URL.revokeObjectURL(resumeUrl);
      setResumeUrl(null);
    }
  };

  const handleViewResume = async (applicationId, fileName) => {
    try {
      setResumeLoading(true);
      
      const response = await fetch(
        `${API_BASE_URL}/api/application/${applicationId}/resume`
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        setResumeUrl(url);
        
        // Open in new tab
        window.open(url, '_blank');
      } else {
        throw new Error('Failed to fetch resume');
      }
    } catch (error) {
      console.error('Error viewing resume:', error);
      alert('Error opening resume file');
    } finally {
      setResumeLoading(false);
    }
  };

  const downloadResume = async (applicationId, fileName) => {
    try {
      setResumeLoading(true);
      
      const response = await fetch(
        `${API_BASE_URL}/api/application/${applicationId}/resume`
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName || 'resume.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else {
        throw new Error('Failed to download resume');
      }
    } catch (error) {
      console.error('Error downloading resume:', error);
      alert('Error downloading resume file');
    } finally {
      setResumeLoading(false);
    }
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

  const toggleRowExpand = (id) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const filteredApplications = applications.filter(application => {
    const matchesSearch = 
      application.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      application.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      application.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      application.coverLetter?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = 
      roleFilter === 'all' || 
      application.role?.toLowerCase().includes(roleFilter.toLowerCase());

    return matchesSearch && matchesRole;
  });

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Role', 'Phone', 'Experience', 'Cover Letter', 'Date'];
    const csvContent = [
      headers.join(','),
      ...filteredApplications.map(application => [
        `"${application.name || ''}"`,
        `"${application.email || ''}"`,
        `"${application.role || ''}"`,
        `"${application.phone || ''}"`,
        `"${application.experience || ''}"`,
        `"${(application.coverLetter || '').replace(/"/g, '""')}"`,
        `"${formatDate(application.createdAt)}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `applications-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const ApplicationModal = () => {
    if (!selectedApplication) return null;

    return (
      <div className={styles.modalOverlay} onClick={closeModal}>
        <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
          <div className={styles.modalHeader}>
            <h3 className={styles.modalTitle}>
              <Briefcase className={styles.modalIcon} />
              Application Details
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
                    <span>{selectedApplication.name || 'N/A'}</span>
                  </div>
                </div>
              </div>
              
              <div className={styles.detailItem}>
                <label className={styles.detailLabel}>Email</label>
                <div className={styles.detailValue}>
                  <a 
                    href={`mailto:${selectedApplication.email}`} 
                    className={styles.emailLink}
                  >
                    <Mail className={styles.detailIcon} />
                    {selectedApplication.email || 'N/A'}
                  </a>
                </div>
              </div>
              
              <div className={styles.detailItem}>
                <label className={styles.detailLabel}>Role</label>
                <div className={styles.detailValue}>
                  <span className={styles.roleBadge}>
                    {selectedApplication.role || 'N/A'}
                  </span>
                </div>
              </div>
              
              <div className={styles.detailItem}>
                <label className={styles.detailLabel}>Phone</label>
                <div className={styles.detailValue}>
                  {selectedApplication.phone ? (
                    <a 
                      href={`tel:${selectedApplication.phone}`} 
                      className={styles.phoneLink}
                    >
                      {selectedApplication.phone}
                    </a>
                  ) : (
                    <span className={styles.noData}>Not provided</span>
                  )}
                </div>
              </div>

              <div className={styles.detailItem}>
                <label className={styles.detailLabel}>Experience</label>
                <div className={styles.detailValue}>
                  {selectedApplication.experience || 'Not specified'}
                </div>
              </div>

              <div className={styles.detailItem}>
                <label className={styles.detailLabel}>Resume</label>
                <div className={styles.detailValue}>
                  {selectedApplication.resume ? (
                    <div className={styles.resumeActions}>
                      <button
                        onClick={() => handleViewResume(selectedApplication._id, selectedApplication.resume.originalName)}
                        disabled={resumeLoading}
                        className={styles.viewResumeButton}
                      >
                        <Eye className={styles.buttonIcon} />
                        {resumeLoading ? 'Loading...' : 'View Resume'}
                      </button>
                      <button
                        onClick={() => downloadResume(selectedApplication._id, selectedApplication.resume.originalName)}
                        disabled={resumeLoading}
                        className={styles.downloadResumeButton}
                      >
                        <Download className={styles.buttonIcon} />
                        Download
                      </button>
                    </div>
                  ) : (
                    <span className={styles.noData}>No resume uploaded</span>
                  )}
                </div>
              </div>
            </div>
            
            <div className={styles.coverLetterSection}>
              <label className={styles.detailLabel}>Cover Letter</label>
              <div className={styles.coverLetterContent}>
                {selectedApplication.coverLetter || 'No cover letter provided'}
              </div>
            </div>
            
            {selectedApplication.createdAt && (
              <div className={styles.dateSection}>
                <label className={styles.detailLabel}>Submitted</label>
                <div className={styles.dateContent}>
                  <Calendar className={styles.detailIcon} />
                  {formatDate(selectedApplication.createdAt)}
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
                handleDelete(selectedApplication._id);
                closeModal();
              }}
            >
              <Trash2 className={styles.buttonIcon} />
              Delete Application
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderMobileCard = (application) => (
    <div key={application._id} className={styles.mobileCard}>
      <div className={styles.cardHeader}>
        <div className={styles.userInfo}>
          <div className={styles.userAvatar}>
            <User />
          </div>
          <div>
            <div className={styles.userName}>{application.name || 'N/A'}</div>
            <div className={styles.userRole}>{application.role || 'N/A'}</div>
          </div>
        </div>
        <div className={styles.cardActions}>
          <button
            onClick={() => handleViewDetails(application)}
            className={styles.viewButton}
            title="View details"
          >
            <Eye />
          </button>
          <button
            onClick={() => toggleRowExpand(application._id)}
            className={styles.expandButton}
          >
            {expandedRows.has(application._id) ? <ChevronUp /> : <ChevronDown />}
          </button>
        </div>
      </div>

      <div className={styles.cardContent}>
        <div className={styles.cardField}>
          <span className={styles.fieldLabel}>Email:</span>
          <a href={`mailto:${application.email}`} className={styles.emailLink}>
            {application.email || 'N/A'}
          </a>
        </div>
        
        <div className={styles.cardField}>
          <span className={styles.fieldLabel}>Resume:</span>
          {application.resume ? (
            <div className={styles.resumeActions}>
              <button
                onClick={() => handleViewResume(application._id, application.resume.originalName)}
                disabled={resumeLoading}
                className={styles.viewResumeButton}
              >
                <Eye className={styles.smallIcon} />
                View
              </button>
              <button
                onClick={() => downloadResume(application._id, application.resume.originalName)}
                disabled={resumeLoading}
                className={styles.downloadResumeButton}
              >
                <Download className={styles.smallIcon} />
              </button>
            </div>
          ) : (
            <span className={styles.noData}>No resume</span>
          )}
        </div>

        {expandedRows.has(application._id) && (
          <div className={styles.expandedContent}>
            <div className={styles.cardField}>
              <span className={styles.fieldLabel}>Phone:</span>
              <span>{application.phone || 'Not provided'}</span>
            </div>
            <div className={styles.cardField}>
              <span className={styles.fieldLabel}>Experience:</span>
              <span>{application.experience || 'Not specified'}</span>
            </div>
            <div className={styles.cardField}>
              <span className={styles.fieldLabel}>Cover Letter:</span>
              <div className={styles.coverLetterPreview}>
                {application.coverLetter?.substring(0, 100) || 'No cover letter'}
                {application.coverLetter && application.coverLetter.length > 100 && '...'}
              </div>
            </div>
            <div className={styles.cardField}>
              <span className={styles.fieldLabel}>Submitted:</span>
              <span>{formatDate(application.createdAt)}</span>
            </div>
            <div className={styles.cardActions}>
              <button
                onClick={() => handleDelete(application._id)}
                className={styles.deleteButton}
              >
                <Trash2 className={styles.smallIcon} />
                Delete
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderTableRow = (application) => (
    <tr 
      key={application._id} 
      className={styles.tableRow}
      onClick={() => handleViewDetails(application)}
    >
      <td className={styles.tableCell}>
        <div className={styles.userCell}>
          <div className={styles.userAvatar}>
            <User />
          </div>
          <div className={styles.userInfo}>
            <div className={styles.userName}>{application.name || 'N/A'}</div>
            <div className={styles.userDate}>
              <Calendar className={styles.smallIcon} />
              {formatDate(application.createdAt)}
            </div>
          </div>
        </div>
      </td>
      
      <td className={styles.tableCell}>
        <a 
          href={`mailto:${application.email}`}
          className={styles.emailLink}
          onClick={(e) => e.stopPropagation()}
        >
          <Mail className={styles.smallIcon} />
          {application.email || 'N/A'}
        </a>
      </td>
      
      <td className={styles.tableCell}>
        <span className={styles.roleBadge}>
          {application.role || 'N/A'}
        </span>
      </td>
      
      <td className={styles.tableCell}>
        {application.resume ? (
          <div className={styles.resumeActions}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleViewResume(application._id, application.resume.originalName);
              }}
              disabled={resumeLoading}
              className={styles.viewResumeButton}
              title="View resume"
            >
              <Eye className={styles.smallIcon} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                downloadResume(application._id, application.resume.originalName);
              }}
              disabled={resumeLoading}
              className={styles.downloadResumeButton}
              title="Download resume"
            >
              <Download className={styles.smallIcon} />
            </button>
          </div>
        ) : (
          <span className={styles.noData}>No resume</span>
        )}
      </td>
      
      <td className={styles.tableCell}>
        <div className={styles.actionCell}>
          <button
            className={styles.viewButton}
            onClick={(e) => {
              e.stopPropagation();
              handleViewDetails(application);
            }}
            title="View details"
          >
            <Eye />
          </button>
          <button
            className={styles.deleteButton}
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(application._id);
            }}
            title="Delete application"
          >
            <Trash2 />
          </button>
        </div>
      </td>
    </tr>
  );

  if (loading && applications.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <h3>Loading Applications...</h3>
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
            <Briefcase className={styles.headerIcon} />
            Career Applications
          </h1>
          <p className={styles.subtitle}>
            Manage all job applications from candidates
          </p>
          {lastUpdated && (
            <p className={styles.lastUpdated}>
              Last updated: {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
        </div>
        <div className={styles.headerStats}>
          <div className={styles.statBadge}>
            <span className={styles.statNumber}>{applications.length}</span>
            <span className={styles.statLabel}>Total Applications</span>
          </div>
          <button
            onClick={fetchApplications}
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
            placeholder="Search applications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        
        <div className={styles.filterGroup}>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All Roles</option>
            <option value="developer">Developer</option>
            <option value="designer">Designer</option>
            <option value="manager">Manager</option>
            <option value="analyst">Analyst</option>
          </select>
          
          <button
            onClick={exportToCSV}
            disabled={filteredApplications.length === 0}
            className={styles.exportButton}
          >
            <Download />
            Export CSV
          </button>
        </div>
      </div>

      {/* Content */}
      <div className={styles.content}>
        {filteredApplications.length === 0 ? (
          <div className={styles.emptyState}>
            <Briefcase className={styles.emptyIcon} />
            <h3>
              {applications.length === 0 ? 'No applications yet' : 'No applications found'}
            </h3>
            <p>
              {applications.length === 0 
                ? 'Job applications will appear here once candidates start applying.' 
                : 'Try adjusting your search or filter criteria.'
              }
            </p>
            {(searchTerm || roleFilter !== 'all') && (
              <button
                className={styles.clearButton}
                onClick={() => {
                  setSearchTerm('');
                  setRoleFilter('all');
                }}
              >
                Clear filters
              </button>
            )}
          </div>
        ) : isMobile ? (
          // Mobile Card View
          <div className={styles.mobileView}>
            {filteredApplications.map(renderMobileCard)}
          </div>
        ) : (
          // Desktop Table View
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead className={styles.tableHeader}>
                <tr>
                  <th>Candidate</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Resume</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody className={styles.tableBody}>
                {filteredApplications.map(renderTableRow)}
              </tbody>
            </table>
            
            <div className={styles.tableFooter}>
              <span className={styles.footerText}>
                Showing {filteredApplications.length} of {applications.length} applications
              </span>
              <span className={styles.footerText}>
                Last updated: {new Date().toLocaleTimeString()}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && <ApplicationModal />}
    </div>
  );
};

export default ApplicationManagerCybomb;