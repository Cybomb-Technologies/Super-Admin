import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, Users, MessageSquare, MonitorPlay } from "lucide-react";
import axios from "axios";
import styles from "./hralva.module.css";

const API_URL = import.meta.env.VITE_HRALVA_API_URL;

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalTenants: 0,
    activeTenants: 0,
    totalDemoRequests: 0,
    pendingQueries: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("hrms_token");
      // In a real scenario, you might have a dedicated stats endpoint.
      // For now, we'll just mock or fetch lists if endpoints exist,
      // but to be safe and quick, we will fetch tenants to count them.

      const tenantsRes = await axios.get(`${API_URL}/api/tenants`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const contactsRes = await axios.get(`${API_URL}/api/contact`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const demoRes = await axios.get(`${API_URL}/api/demo-requests`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (tenantsRes.data.success) {
        const tenants = tenantsRes.data.data;
        setStats((prev) => ({
          ...prev,
          totalTenants: tenants.length,
          activeTenants: tenants.filter((t) => t.status === "active").length,
        }));
      }

      if (contactsRes.data.success) {
        setStats((prev) => ({
          ...prev,
          pendingQueries:
            contactsRes.data.count || contactsRes.data.data.length,
        }));
      }

      if (demoRes.data.success) {
        setStats((prev) => ({
          ...prev,
          totalDemoRequests: demoRes.data.count || demoRes.data.data.length,
        }));
      }
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, variant = "primary" }) => (
    <div className={`${styles.statCard} ${styles[variant]}`}>
        <div className={styles.statContent}>
            <div className={styles.statInfo}>
                <p className={styles.statTitle}>{title}</p>
                <h3 className={styles.statValue}>{loading ? "..." : value}</h3>
            </div>
            <div className={styles.statIcon}>
                <Icon />
            </div>
        </div>
    </div>
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Super Admin Dashboard</h1>
        <p className={styles.subtitle}>
          Overview of system performance and tenant management.
        </p>
      </div>

      <div className={styles.statsGrid}>
        <StatCard
          title="Total Organizations"
          value={stats.totalTenants}
          icon={Building}
          variant="primary"
        />
        <StatCard
          title="Active Organizations"
          value={stats.activeTenants}
          icon={Users}
          variant="success"
        />
        {/* Placeholders for future stats */}
        <StatCard
          title="Demo Requests"
          value={stats.totalDemoRequests}
          icon={MonitorPlay}
          variant="warning"
        />
        <StatCard
          title="Contact Queries"
          value={stats.pendingQueries}
          icon={MessageSquare}
          variant="info"
        />
      </div>

      <div className={`grid gap-6 md:grid-cols-2 lg:grid-cols-7`}>
        <div className={`col-span-4 ${styles.tableCard}`}>
          <div className={styles.tableHeader}>
            <h3 className={styles.tableTitle}>Recent Activity</h3>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">
              System logs and recent events will appear here.
            </p>
          </div>
        </div>
        <div className={`col-span-3 ${styles.tableCard}`}>
          <div className={styles.tableHeader}>
            <h3 className={styles.tableTitle}>Quick Actions</h3>
          </div>
          <div>
            <div className="space-y-4">
              {/* Links or buttons could go here */}
              <p className="text-sm text-muted-foreground">
                Use the sidebar to manage tenants and requests.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
