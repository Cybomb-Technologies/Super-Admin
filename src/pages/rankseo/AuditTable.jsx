import { useState, useMemo } from "react";
import styles from "./AuditTable.module.css";

export default function AuditTable({ 
  auditLogs, 
  totalLogs, 
  users = [], 
  showToolColumn = true 
}) {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Safe checks
  const safeAuditLogs = auditLogs || [];
  const safeTotalLogs = totalLogs || 0;
  const safeUsers = users || [];

  const findUserForLog = (log) => {
    if (log.userId) return safeUsers.find(user => user._id === log.userId);
    if (log.userEmail) return safeUsers.find(user => user.email === log.userEmail);
    if (log.email) return safeUsers.find(user => user.email === log.email);
    return null;
  };

  const getActionVariant = (action, tool = '') => {
    const combined = (action + tool).toLowerCase();
    if (combined.includes('login')) return "success";
    if (combined.includes('delete') || combined.includes('fail') || combined.includes('error')) return "danger";
    if (combined.includes('create') || combined.includes('register')) return "primary";
    if (combined.includes('update')) return "warning";
    if (combined.includes('keyword')) return "info";
    return "secondary";
  };

  // Helper to get formatted details (omitted heavy logic for brevity, kept structure)
  const getDisplayUrl = (log) => {
    if (log.url) return log.url;
    if (log.tool === 'business_name_generator') return `Industry: ${log.industry || 'N/A'}`;
    if (log.tool === 'keyword_checker') return `URL: ${log.mainUrl || 'N/A'}`;
    return log.path || log.mainUrl || 'N/A';
  };

  // Sorting Logic
  const sortedLogs = useMemo(() => {
    const sortable = [...safeAuditLogs];
    if (sortConfig.key) {
      sortable.sort((a, b) => {
        let aVal = a[sortConfig.key] || '';
        let bVal = b[sortConfig.key] || '';
        // Add specific key handling if needed (e.g. nested props)
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortable;
  }, [safeAuditLogs, sortConfig]);

  const handleSort = (key) => {
    setSortConfig(curr => ({
      key,
      direction: curr.key === key && curr.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Pagination Logic
  const totalPages = Math.ceil(sortedLogs.length / itemsPerPage);
  const paginatedLogs = sortedLogs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className={`card bg-dark border-secondary shadow-lg ${styles.tableCard}`}>
      <div className="card-header border-secondary bg-transparent py-3 d-flex justify-content-between align-items-center">
        <div>
          <h5 className="card-title mb-0 text-white fw-bold">
            <i className="bi bi-list-check me-2 text-primary"></i>
            Activity Logs
          </h5>
          <small className="text-white">Total: {safeTotalLogs} activities</small>
        </div>
      </div>
      
      <div className="table-responsive">
        <table className={`table table-dark table-hover mb-0 ${styles.customTable}`}>
          <thead className="bg-secondary bg-opacity-10">
            <tr>
              <th onClick={() => handleSort('userName')} className={styles.sortableHeader}>User <i className="bi bi-arrow-down-up small ms-1"></i></th>
              <th onClick={() => handleSort('action')} className={styles.sortableHeader}>Action <i className="bi bi-arrow-down-up small ms-1"></i></th>
              {showToolColumn && <th>Tool</th>}
              <th>Details</th>
              <th onClick={() => handleSort('timestamp')} className="text-end pe-4">Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {paginatedLogs.length === 0 ? (
              <tr><td colSpan="5" className="text-center py-5 text-muted">No logs found</td></tr>
            ) : (
              paginatedLogs.map((log, idx) => {
                const user = findUserForLog(log);
                const name = log.userName || user?.name || 'Anonymous';
                const email = log.userEmail || user?.email || 'Unknown';
                const timestamp = log.timestamp || log.createdAt;
                
                return (
                  <tr key={idx} className={styles.tableRow}>
                    <td className="align-middle py-3">
                      <div className="d-flex align-items-center">
                        <div className={`${styles.avatar} rounded-circle bg-secondary d-flex align-items-center justify-content-center me-3`}>
                          {name.charAt(0)}
                        </div>
                        <div className="d-flex flex-column">
                          <span className="text-white fw-medium font-sm">{name}</span>
                          <span className="text-white extra-small">{email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="align-middle">
                      <span className={`badge bg-${getActionVariant(log.action, log.tool)} bg-opacity-75 rounded-pill fw-normal px-3`}>
                        {log.action?.replace(/_/g, ' ') || 'Action'}
                      </span>
                    </td>
                    {showToolColumn && (
                      <td className="align-middle text-white small text-capitalize">
                        {log.tool?.replace(/_/g, ' ')}
                      </td>
                    )}
                    <td className="align-middle">
                      <div className={styles.detailsCell} title={getDisplayUrl(log)}>
                        {getDisplayUrl(log)}
                      </div>
                    </td>
                    <td className="align-middle text-end pe-4">
                      <div className="text-white small">
                        {timestamp ? new Date(timestamp).toLocaleDateString() : '-'}
                      </div>
                      <div className="text-white extra-small">
                        {timestamp ? new Date(timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Simplified Pagination */}
      {totalPages > 1 && (
        <div className="card-footer bg-transparent border-secondary py-3">
          <div className="d-flex justify-content-end gap-2">
            <button className="btn btn-sm btn-outline-secondary text-white" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>Prev</button>
            <span className="btn btn-sm btn-secondary disabled text-white">{currentPage} / {totalPages}</span>
            <button className="btn btn-sm btn-outline-secondary text-white" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>Next</button>
          </div>
        </div>
      )}
    </div>
  );
}