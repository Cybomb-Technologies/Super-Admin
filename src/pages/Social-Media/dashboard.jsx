import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import styles from "./dashboard.module.css";

const API_URL = import.meta.env.VITE_SOCIAL_API_URL;

const Dashboard = () => {
  const [orders, setOrders] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalUsers: 0,
    revenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/orders?limit=100`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to fetch orders");

      const result = await response.json();

      if (result.success) {
        setOrders(result.data);

        const sorted = [...result.data].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setRecentOrders(sorted.slice(0, 8));

        return result.data;
      } else throw new Error("Failed to fetch data");
    } catch (err) {
      console.error(err);
      setError("Failed to load orders");
      return [];
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/auth/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Failed to fetch users");

      const result = await response.json();
      if (result.success) {
        setUsers(result.data);
        return result.data;
      } else throw new Error(result.message || "Failed to load users");
    } catch (err) {
      console.error(err);
      return [];
    }
  };

  const calculateStats = (orders, users) => {
    const totalOrders = orders.length;
    const pendingOrders = orders.filter((o) => o.status === "pending").length;
    const completedOrders = orders.filter((o) => o.status === "completed").length;
    const totalUsers = users.length;
    const revenue = orders.reduce((sum, o) => {
      const match = o.serviceBudget?.match(/\$(\d+)/);
      return sum + (match ? parseInt(match[1]) : 0);
    }, 0);

    return { totalOrders, pendingOrders, completedOrders, totalUsers, revenue };
  };

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [ordersData, usersData] = await Promise.all([fetchOrders(), fetchUsers()]);
      setStats(calculateStats(ordersData, usersData));
    } catch (err) {
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const refreshData = () => loadData();

  const getStatusColor = (status) => {
    const colors = {
      pending: "#f59e0b",
      confirmed: "#3b82f6",
      "in-progress": "#8b5cf6",
      completed: "#10b981",
      cancelled: "#ef4444",
    };
    return colors[status] || "#6b7280";
  };

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const services = orders
    .reduce((acc, o) => {
      const existing = acc.find((s) => s.name === o.service);
      if (existing) existing.count += 1;
      else
        acc.push({
          name: o.service,
          count: 1,
          icon: "🌟",
          platform: o.platform,
        });
      return acc;
    }, [])
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  const statsData = [
    { value: stats.totalOrders, label: "Total Orders", icon: "📦", color: "blue" },
    { value: stats.pendingOrders, label: "Pending Orders", icon: "⏳", color: "orange" },
    { value: stats.completedOrders, label: "Completed", icon: "✅", color: "green" },
  ];

  if (loading)
    return (
      <div className={styles.dashboardContainer}>
        <div className={styles.loadingContainer}>Loading dashboard data...</div>
      </div>
    );

  return (
    <div className={styles.dashboardContainer}>
      {error && (
        <div className={styles.errorContainer}>
          <span>{error}</span>
          <button className={styles.retryButton} onClick={refreshData}>
            Retry
          </button>
        </div>
      )}

      <div className={styles.dashboardHeader}>
        <div>
          <h1 className={styles.dashboardTitle}>Order Dashboard</h1>
          <p className={styles.dashboardSubtitle}>
            Manage customer orders and service requests
          </p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.btnSecondary} onClick={refreshData}>
            ↻ Refresh Data
          </button>
          <Link to="/admin/orders" style={{ textDecoration: "none" }}>
            <button className={styles.btnPrimary}>+ View All Orders</button>
          </Link>
        </div>
      </div>

      <div className={styles.statsGrid}>
        {statsData.map((stat, i) => (
          <div key={i} className={styles.statCard}>
            <div className={styles.statContent}>
              <div>
                <h3 className={styles.statLabel}>{stat.label}</h3>
                <p className={`${styles.statValue} ${styles[stat.color]}`}>
                  {stat.value}
                </p>
              </div>
              <div className={styles.statIcon}>{stat.icon}</div>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.dashboardContent}>
        {/* Recent Orders */}
        <div className={styles.contentCard}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Recent Orders</h2>
            <Link to="/admin/orders">
              <button className={styles.textLink}>View All</button>
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <div className={styles.emptyState}>No orders found</div>
          ) : (
            <table className={styles.table}>
              <thead className={styles.tableHeader}>
                <tr>
                  <th>Customer</th>
                  <th>Service</th>
                  <th>Platform</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((o) => (
                  <tr key={o._id}>
                    <td>
                      <div>
                        <div className={styles.customerName}>{o.name}</div>
                        <div className={styles.customerEmail}>{o.email}</div>
                      </div>
                    </td>
                    <td>{o.service}</td>
                    <td>{o.platform}</td>
                    <td>
                      <span
                        className={styles.statusBadge}
                        style={{
                          background: `${getStatusColor(o.status)}20`,
                          color: getStatusColor(o.status),
                        }}
                      >
                        {o.status.charAt(0).toUpperCase() + o.status.slice(1)}
                      </span>
                    </td>
                    <td>{formatDate(o.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Popular Services */}
        <div className={styles.contentCard}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Popular Services</h2>
          </div>
          <div className={styles.servicesGrid}>
            {services.map((s, i) => (
              <div key={i} className={styles.serviceItem}>
                <div className={styles.serviceInfo}>
                  <span className={styles.serviceIcon}>{s.icon}</span>
                  <div>
                    <div className={styles.serviceName}>{s.name}</div>
                    <span className={styles.servicePlatform}>{s.platform}</span>
                  </div>
                </div>
                <span className={styles.serviceCount}>{s.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
