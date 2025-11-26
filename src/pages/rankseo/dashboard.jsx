// dashboard.jsx
import { useState, useEffect } from "react";
import OverviewTab from "./OverviewTab";
import UsersTab from "./UsersTab";
import AuditTab from "./AuditTab";
import PricingTab from "./PricingTab";
import AdminPaymentsPage from "./PaymentTab";
import LoadingSpinner from "./LoadingSpinner";
import AdminNewsletterPage from "./NewsletterTab";
import SupportTab from "./SupportTab";
import styles from "./dashboard.module.css";


import { normalizeDashboardData } from "./dashboardApi";

const API_URL = import.meta.env.VITE_RANKSEO_API_URL || "";

const emptyDashboardData = {
  totalActivities: 0,
  uniqueUsers: 0,
  activeUsers: 0,
  premiumUsers: 0,
  auditData: [],
  businessNameData: [],
  keycheckData: [],
  keyScrapeData: [],
  keywordData: [],
  allToolData: [],
  users: [],
  toolStats: {
    seo_audit: 0,
    business_name_generator: 0,
    keyword_checker: 0,
    keyword_scraper: 0,
    keyword_generator: 0,
  },
};

const getDashboardEndpoint = () => {
  if (API_URL) {
    return `${API_URL}/api/admin/dashboard`;
  }
  return `/api/admin/dashboard`;
};

const fetchDashboardDataFromAPI = async () => {
  try {
    const token =
      localStorage.getItem("token") || localStorage.getItem("authToken");

    const headers = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const endpoint = getDashboardEndpoint();
    console.log("🌐 Making API request to:", endpoint);

    const response = await fetch(endpoint, {
      method: "GET",
      headers,
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const raw = await response.json();
    console.log("✅ Raw API response received:", raw);

    const normalized = normalizeDashboardData(raw);
    console.log("🧮 Normalized dashboard data:", normalized);

    return normalized;
  } catch (error) {
    console.error("❌ Error fetching dashboard data:", error);
    return emptyDashboardData;
  }
};

export default function AdminDashboard() {
  console.log("🧭 AdminDashboard COMPONENT MOUNTED");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("🔄 Fetching dashboard data...");

      const dashboardData = await fetchDashboardDataFromAPI();
      console.log("✅ Dashboard data set:", dashboardData);
      setData(dashboardData);
    } catch (error) {
      console.error("❌ Error in fetchDashboardData:", error);
      setError(
        error.message || "Failed to load dashboard data. Please try again."
      );
      setData(emptyDashboardData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const refreshData = () => {
    fetchDashboardData();
  };

  if (loading && !data) {
    return <LoadingSpinner />;
  }

  console.log("🎯 Dashboard rendering with data:", data);

  const safeData = data || emptyDashboardData;

  return (
    <div className={`${styles.dashboard} dark-theme`}>
      <div className="container-fluid p-0">
        

        <div className={styles.content}>
          <div className="container-fluid py-4">
            {activeTab === "overview" && <OverviewTab data={safeData} />}
            {activeTab === "users" && <UsersTab data={safeData} />}
            {activeTab === "audit" && <AuditTab data={safeData} />}
            {activeTab === "pricing" && <PricingTab data={safeData} />}
            {activeTab === "payments" && (
              <AdminPaymentsPage data={safeData} />
            )}
            {activeTab === "newsletter" && (
              <AdminNewsletterPage data={safeData} />
            )}
            {activeTab === "support" && <SupportTab data={safeData} />}
          </div>
        </div>
      </div>
    </div>
  );
}
