"use client";
import { useState, useEffect } from "react";
import Header from "./Header";
import OverviewTab from "./OverviewTab";
import LoadingSpinner from "./LoadingSpinner";
import styles from './dashboard.module.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_URL}/api/admin/dashboard`);

      if (response.ok) {
        const result = await response.json();
        setData(result);
      } else {
        throw new Error("Failed to fetch dashboard data");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to load dashboard data. Please try again.");
      // Fallback data
      setData({
        totalLogins: 0,
        uniqueUsers: 0,
        activeUsers: 0,
        premiumUsers: 0,
        totalActivities: 0,
        auditData: [],
        users: [],
        businessNameData: [],
        keycheckData: [],
        keyScrapeData: [],
        keywordData: [],
        allToolData: []
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshData = () => {
    fetchDashboardData();
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <Header onRefresh={refreshData} error={error} />
        {data && <OverviewTab data={data} />}
      </div>
    </div>
  );
}