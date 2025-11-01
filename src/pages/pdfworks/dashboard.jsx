import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Users, 
  FileText, 
  DollarSign, 
  Activity, 
  Crown,
  Download,
  Settings,
  Shield,
  BarChart3,
  RefreshCw,
  Mail,
  Calendar
} from "lucide-react";
import styles from './dashboard.module.css';

const API_URL = import.meta.env.VITE_PDF_API_URL;

function PDFdashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalFiles: 0,
    revenue: 0,
    activeUsers: 0,
  });

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        // const token = localStorage.getItem("pdfpro_admin_token");
        // if (!token) {
        //   alert("No admin token found");
        //   return;
        // }

        const res = await fetch(`${API_URL}/api/auth/users`, {
          headers: {
            "Content-Type": "application/json",
            // Authorization: `Bearer ${token}`,
          },
        });

        if (res.status === 401) {
          alert("Unauthorized: You are not allowed to access this data");
          return;
        }

        const data = await res.json();

        if (!data.success || !data.users) {
          alert("Invalid data received from server");
          return;
        }

        let totalFiles = 0;
        let revenue = 0;
        let activeUsers = 0;

        const mappedUsers = data.users.map((user, index) => {
          const plan =
            index % 3 === 0 ? "pro" : index % 3 === 1 ? "business" : "free";
          const files = Math.floor(Math.random() * 10);

          totalFiles += files;
          if (plan === "pro") revenue += 12;
          if (plan === "business") revenue += 49;
          if (files > 0) activeUsers++;

          return {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role || "user",
            plan,
            createdAt: user.createdAt || new Date().toISOString(),
            files,
          };
        });

        setUsers(mappedUsers);
        setStats({
          totalUsers: mappedUsers.length,
          totalFiles,
          revenue,
          activeUsers,
        });
        setLastUpdated(new Date());
      } catch (error) {
        console.error("Error fetching users:", error);
        alert("Failed to fetch users");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
    
    // Auto-refresh every 2 minutes
    const interval = setInterval(fetchUsers, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/api/auth/users`, {
          headers: { "Content-Type": "application/json" },
        });
        const data = await res.json();
        
        if (data.success && data.users) {
          // Recalculate stats (same logic as above)
          let totalFiles = 0;
          let revenue = 0;
          let activeUsers = 0;

          const mappedUsers = data.users.map((user, index) => {
            const plan = index % 3 === 0 ? "pro" : index % 3 === 1 ? "business" : "free";
            const files = Math.floor(Math.random() * 10);

            totalFiles += files;
            if (plan === "pro") revenue += 12;
            if (plan === "business") revenue += 49;
            if (files > 0) activeUsers++;

            return {
              id: user._id,
              name: user.name,
              email: user.email,
              role: user.role || "user",
              plan,
              createdAt: user.createdAt || new Date().toISOString(),
              files,
            };
          });

          setUsers(mappedUsers);
          setStats({
            totalUsers: mappedUsers.length,
            totalFiles,
            revenue,
            activeUsers,
          });
          setLastUpdated(new Date());
        }
      } catch (error) {
        console.error("Error refreshing data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  };

  const formatTimeAgo = (date) => {
    if (!date) return "Never";
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  if (loading && users.length === 0) {
    return (
      <div className={styles.loadingState}>
        <RefreshCw className={styles.loadingSpinner} />
        <span>Loading dashboard data...</span>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={styles.header}
      >
        <h1 className={styles.title}>
          PDF Pro Admin Dashboard
          <span className={styles.crownIcon}>👑</span>
        </h1>
        <p className={styles.subtitle}>
          Manage users and monitor platform activity
          {lastUpdated && ` • Last updated: ${formatTimeAgo(lastUpdated)}`}
        </p>
      </motion.div>

      {/* Stats Section */}
      <div className={styles.statsGrid}>
        {/* Total Users */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`${styles.statCard} ${styles.usersCard}`}
        >
          <div className={styles.statContent}>
            <div className={styles.statInfo}>
              <div className={styles.statLabel}>Total Users</div>
              <div className={styles.statValue}>{stats.totalUsers}</div>
            </div>
            <div className={styles.statIcon}>
              <Users className="w-6 h-6" />
            </div>
          </div>
        </motion.div>

        {/* Total Files */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`${styles.statCard} ${styles.filesCard}`}
        >
          <div className={styles.statContent}>
            <div className={styles.statInfo}>
              <div className={styles.statLabel}>Total Files Processed</div>
              <div className={styles.statValue}>{stats.totalFiles}</div>
            </div>
            <div className={styles.statIcon}>
              <FileText className="w-6 h-6" />
            </div>
          </div>
        </motion.div>

        {/* Monthly Revenue */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`${styles.statCard} ${styles.revenueCard}`}
        >
          <div className={styles.statContent}>
            <div className={styles.statInfo}>
              <div className={styles.statLabel}>Monthly Revenue</div>
              <div className={styles.statValue}>${stats.revenue}</div>
            </div>
            <div className={styles.statIcon}>
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
        </motion.div>

        {/* Active Users */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className={`${styles.statCard} ${styles.activeCard}`}
        >
          <div className={styles.statContent}>
            <div className={styles.statInfo}>
              <div className={styles.statLabel}>Active Users</div>
              <div className={styles.statValue}>{stats.activeUsers}</div>
            </div>
            <div className={styles.statIcon}>
              <Activity className="w-6 h-6" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className={styles.controls}
      >
        <button onClick={handleRefresh} className={styles.refreshButton}>
          <RefreshCw className="w-5 h-5" />
          Refresh Data
        </button>
      </motion.div>

      {/* User Table Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className={styles.userSection}
      >
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            <Users className="w-6 h-6" />
            All Users
            <span className={styles.userCount}>{users.length}</span>
          </h2>
        </div>

        {users.length === 0 ? (
          <div className={styles.emptyState}>
            <Users className={styles.emptyIcon} />
            <h3 className={styles.emptyTitle}>No Users Found</h3>
            <p className={styles.emptyText}>There are no users in the system yet.</p>
          </div>
        ) : (
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead className={styles.tableHead}>
                <tr>
                  <th className={styles.tableHeader}>Name</th>
                  <th className={styles.tableHeader}>Email</th>
                  <th className={styles.tableHeader}>Plan</th>
                  <th className={styles.tableHeader}>Role</th>
                  <th className={styles.tableHeader}>Files</th>
                  <th className={styles.tableHeader}>Joined Date</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className={styles.tableRow}
                  >
                    <td className={styles.tableCell}>
                      <div className={styles.userName}>{user.name}</div>
                    </td>
                    <td className={styles.tableCell}>
                      <div className={styles.userEmail}>{user.email}</div>
                    </td>
                    <td className={styles.tableCell}>
                      <span
                        className={`${styles.planBadge} ${
                          user.plan === "free"
                            ? styles.planFree
                            : user.plan === "pro"
                            ? styles.planPro
                            : styles.planBusiness
                        }`}
                      >
                        {user.plan}
                      </span>
                    </td>
                    <td className={styles.tableCell}>
                      <span
                        className={`${styles.roleBadge} ${
                          user.role === "admin"
                            ? styles.roleAdmin
                            : styles.roleUser
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className={styles.tableCell}>
                      <span className={styles.fileCount}>{user.files}</span>
                    </td>
                    <td className={styles.tableCell}>
                      <div className={styles.dateText}>
                        {new Date(user.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className={styles.quickActions}
      >
        <button className={styles.actionButton}>
          <Download className="w-5 h-5" />
          Export Users
        </button>
        <button className={styles.actionButton}>
          <Mail className="w-5 h-5" />
          Send Newsletter
        </button>
        <button className={styles.actionButton}>
          <BarChart3 className="w-5 h-5" />
          View Analytics
        </button>
        <button className={styles.actionButton}>
          <Settings className="w-5 h-5" />
          Settings
        </button>
      </motion.div>
    </div>
  );
}

export default PDFdashboard;