import { useState, useEffect } from 'react';
import styles from './career-application.module.css';

const API_URL = import.meta.env.VITE_API_BASE;

function Careerapplication() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const response = await fetch(`${API_URL}/api/career`);
        if (!response.ok) throw new Error('Failed to fetch data');

        const data = await response.json();
        const basicData = data.map(c => ({
          _id: c._id,
          name: c.name,
          email: c.email,
          phone: c.phone,
          jobTitle: c.jobTitle || 'Not mentioned',
          createdAt: c.createdAt
        }));
        setCandidates(basicData);
      } catch (error) {
        console.error('Error fetching candidates:', error);
        setCandidates([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCandidates();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredCandidates = candidates.filter(candidate => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      candidate.name.toLowerCase().includes(searchLower) ||
      candidate.email.toLowerCase().includes(searchLower) ||
      candidate.jobTitle.toLowerCase().includes(searchLower) ||
      candidate.phone.toLowerCase().includes(searchLower)
    );
  });

  const handleViewResume = async (id, name) => {
    try {
      const res = await fetch(`${API_URL}/api/career/${id}/resume`);
      if (!res.ok) throw new Error('Failed to fetch resume');

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${name}-Resume.pdf`;
      link.click();
      
      // Clean up
      setTimeout(() => URL.revokeObjectURL(url), 100);
    } catch (err) {
      console.error(err);
      alert('Failed to download resume');
    }
  };

  const handleViewDetails = (candidate) => {
    setSelectedCandidate(candidate);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedCandidate(null);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Loading career applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Career Applications</h1>
        <p className={styles.subtitle}>Manage and review job applications</p>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>📄</div>
          <div className={styles.statContent}>
            <div className={styles.statNumber}>{candidates.length}</div>
            <div className={styles.statLabel}>Total Applications</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>🎯</div>
          <div className={styles.statContent}>
            <div className={styles.statNumber}>{new Set(candidates.map(c => c.jobTitle)).size}</div>
            <div className={styles.statLabel}>Different Roles</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>📅</div>
          <div className={styles.statContent}>
            <div className={styles.statNumber}>
              {candidates.filter(c => new Date(c.createdAt) > new Date(Date.now() - 7 * 86400000)).length}
            </div>
            <div className={styles.statLabel}>This Week</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>🔍</div>
          <div className={styles.statContent}>
            <div className={styles.statNumber}>{filteredCandidates.length}</div>
            <div className={styles.statLabel}>Filtered Results</div>
          </div>
        </div>
      </div>

      <div className={styles.controls}>
        <div className={styles.searchContainer}>
          <div className={styles.searchWrapper}>
            <span className={styles.searchIcon}>🔍</span>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search candidates by name, email, job title or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className={styles.resultsBadge}>
          <span className={styles.badgeIcon}>📋</span>
          {filteredCandidates.length} {filteredCandidates.length === 1 ? 'Application' : 'Applications'}
        </div>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.applicationsTable}>
          <thead>
            <tr>
              <th className={styles.serialColumn}>#</th>
              <th className={styles.nameColumn}>Candidate</th>
              <th className={styles.jobColumn}>Job Title</th>
              <th className={styles.resumeColumn}>Resume</th>
              <th className={styles.dateColumn}>Date Applied</th>
              <th className={styles.actionColumn}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCandidates.length > 0 ? (
              filteredCandidates.map((candidate, index) => (
                <tr key={candidate._id} className={styles.tableRow}>
                  <td className={styles.serialCell}>{index + 1}</td>
                  <td className={styles.nameCell}>
                    <div className={styles.candidateInfo}>
                      <div className={styles.candidateName}>{candidate.name}</div>
                      <div className={styles.candidateEmail}>{candidate.email}</div>
                    </div>
                  </td>
                  <td className={styles.jobCell}>
                    <span className={styles.jobBadge}>
                      {candidate.jobTitle}
                    </span>
                  </td>
                  <td className={styles.resumeCell}>
                    <button
                      onClick={() => handleViewResume(candidate._id, candidate.name)}
                      className={styles.resumeButton}
                    >
                      <span className={styles.pdfIcon}>📄</span>
                      Download CV
                    </button>
                  </td>
                  <td className={styles.dateCell}>
                    <div className={styles.dateWrapper}>
                      <span className={styles.dateText}>{formatDate(candidate.createdAt)}</span>
                    </div>
                  </td>
                  <td className={styles.actionCell}>
                    <button
                      onClick={() => handleViewDetails(candidate)}
                      className={styles.viewButton}
                    >
                      <span className={styles.eyeIcon}>👁️</span>
                      Details
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className={styles.noDataCell}>
                  <div className={styles.noData}>
                    <div className={styles.noDataIcon}>📭</div>
                    <h3>No applications found</h3>
                    {searchTerm && <p>No results found for "{searchTerm}"</p>}
                    {!searchTerm && <p>No career applications have been submitted yet.</p>}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && selectedCandidate && (
        <div className={styles.modalBackdrop} onClick={closeModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Candidate Details</h2>
              <button className={styles.modalClose} onClick={closeModal}>
                ✕
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.detailSection}>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Full Name:</span>
                  <span className={styles.detailValue}>{selectedCandidate.name}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Email Address:</span>
                  <span className={styles.detailValue}>{selectedCandidate.email}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Phone Number:</span>
                  <span className={styles.detailValue}>{selectedCandidate.phone}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Position Applied:</span>
                  <span className={styles.detailValue}>{selectedCandidate.jobTitle}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Date Applied:</span>
                  <span className={styles.detailValue}>{formatDate(selectedCandidate.createdAt)}</span>
                </div>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button
                className={styles.downloadButton}
                onClick={() => handleViewResume(selectedCandidate._id, selectedCandidate.name)}
              >
                <span className={styles.downloadIcon}>📥</span>
                Download Resume
              </button>
              <button className={styles.closeButton} onClick={closeModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Careerapplication;