import React, { useEffect, useState } from "react";
import styles from './Newsletter.module.css';

const API_URL = import.meta.env.VITE_API_BASE;

function Newsletter() {
  const [subscribers, setSubscribers] = useState([]);
  const [filteredSubscribers, setFilteredSubscribers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch newsletter subscribers
  const fetchSubscribers = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/footer-mail`);
      const data = await res.json();
      setSubscribers(data);
      setFilteredSubscribers(data);
    } catch (error) {
      console.error("Error fetching newsletter data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, []);

  // Search filter
  useEffect(() => {
    const results = subscribers.filter((sub) =>
      sub.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredSubscribers(results);
  }, [searchTerm, subscribers]);

  // Delete subscriber
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this subscriber?")) {
      try {
        await fetch(`${API_URL}/api/footer-mail/${id}`, { method: "DELETE" });
        fetchSubscribers();
      } catch (error) {
        console.error("Error deleting subscriber:", error);
      }
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRecentSubscribers = () => {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return subscribers.filter(sub => new Date(sub.createdAt) > oneWeekAgo).length;
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.titleSection}>
            <h1 className={styles.title}>Newsletter Subscribers</h1>
            <p className={styles.subtitle}>Manage your email subscribers list</p>
          </div>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>📧</div>
          <div className={styles.statContent}>
            <div className={styles.statNumber}>{subscribers.length}</div>
            <div className={styles.statLabel}>Total Subscribers</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>🆕</div>
          <div className={styles.statContent}>
            <div className={styles.statNumber}>{getRecentSubscribers()}</div>
            <div className={styles.statLabel}>This Week</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>🔍</div>
          <div className={styles.statContent}>
            <div className={styles.statNumber}>{filteredSubscribers.length}</div>
            <div className={styles.statLabel}>Filtered Results</div>
          </div>
        </div>
      </div>

      <div className={styles.controls}>
        <div className={styles.searchContainer}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search subscribers by email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className={styles.resultsBadge}>
          <span className={styles.badgeIcon}>👥</span>
          {filteredSubscribers.length} {filteredSubscribers.length === 1 ? 'Subscriber' : 'Subscribers'}
        </div>
      </div>

      {loading ? (
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Loading subscribers...</p>
        </div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.subscriberTable}>
            <thead>
              <tr>
                <th className={styles.emailColumn}>Email Address</th>
                <th className={styles.dateColumn}>Subscription Date</th>
                <th className={styles.actionsColumn}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubscribers.map((sub) => (
                <tr key={sub._id} className={styles.tableRow}>
                  <td className={styles.emailCell}>
                    <div className={styles.emailWrapper}>
                      <span className={styles.emailIcon}>✉️</span>
                      <span className={styles.emailText}>{sub.email}</span>
                    </div>
                  </td>
                  <td className={styles.dateCell}>
                    <div className={styles.dateWrapper}>
                      <span className={styles.dateText}>{formatDate(sub.createdAt)}</span>
                    </div>
                  </td>
                  <td className={styles.actionsCell}>
                    <button
                      className={styles.deleteButton}
                      onClick={() => handleDelete(sub._id)}
                    >
                      <span className={styles.deleteIcon}>🗑️</span>
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredSubscribers.length === 0 && !loading && (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>📭</div>
              <h3>No subscribers found</h3>
              <p>
                {searchTerm 
                  ? `No results found for "${searchTerm}"`
                  : "Your newsletter subscribers will appear here."
                }
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Newsletter;