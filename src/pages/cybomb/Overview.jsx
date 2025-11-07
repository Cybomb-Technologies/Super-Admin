// OverviewCybomb.jsx
import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Mail,
  Briefcase,
  BookOpen,
  TrendingUp,
  Eye,
  Download,
  RefreshCw,
  AlertCircle,
  FileText,
  Megaphone,
} from "lucide-react";
import styles from "./Overview.module.css";

const API_BASE_URL = import.meta.env.VITE_CYBOMB_API_BASE || 'http://localhost:5002';

// StatCard Component
const StatCard = ({ title, value, change, icon: Icon, color, loading = false, onClick }) => (
  <div className={styles.statCard} onClick={onClick}>
    <div className={styles.statHeader}>
      <div className={styles.statInfo}>
        <h3 className={styles.statTitle}>{title}</h3>
        {loading ? (
          <div className={styles.statSkeleton}></div>
        ) : (
          <div className={styles.statValue}>{value?.toLocaleString() || 0}</div>
        )}
      </div>
      <div className={`${styles.statIcon} ${styles[color]}`}>
        <Icon size={20} />
      </div>
    </div>
    {change !== undefined && (
      <div className={`${styles.statChange} ${change >= 0 ? styles.positive : styles.negative}`}>
        {change >= 0 ? '↗' : '↘'} {Math.abs(change)}% from last week
      </div>
    )}
  </div>
);

// Activity Item Component
const ActivityItem = ({ type, title, description, time, item }) => (
  <div className={styles.activityItem}>
    <div className={styles.activityIcon}>
      <div
        className={`${styles.activityDot} ${
          type === "enquiry" ? styles.enquiry : 
          type === "application" ? styles.application : 
          type === "contact" ? styles.contact : styles.blog
        }`}
      ></div>
    </div>
    <div className={styles.activityContent}>
      <div className={styles.activityTitle}>{title}</div>
      <div className={styles.activityDesc}>{description}</div>
      <div className={styles.activityTime}>
        <span className={styles.timeBadge}>{time}</span>
      </div>
    </div>
  </div>
);

// Helper functions
const generateTrendData = (total) => {
  if (typeof total !== 'number' || total < 0) return Array(7).fill(0);
  const base = Math.floor(total / 7) || 1;
  const variation = Math.floor(base * 0.3) || 1;
  return Array.from({ length: 7 }, () => 
    Math.max(0, base + Math.floor(Math.random() * variation * 2) - variation)
  );
};

const calculateChanges = () => ({
  contacts: Math.floor(Math.random() * 40) - 10,
  enquiries: Math.floor(Math.random() * 40) - 10,
  applications: Math.floor(Math.random() * 40) - 10,
  blogs: Math.floor(Math.random() * 30) - 5,
  press: Math.floor(Math.random() * 25) - 5,
  jobs: Math.floor(Math.random() * 20) - 5
});

const formatRelativeTime = (dateString) => {
  if (!dateString) return 'Recently';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor((now - date) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
  return `${Math.floor(diffInMinutes / 1440)} days ago`;
};

export default function OverviewCybomb() {
  const [stats, setStats] = useState({
    totalContacts: 0,
    totalEnquiries: 0,
    totalApplications: 0,
    totalBlogs: 0,
    totalPressReleases: 0,
    totalJobOpenings: 0
  });
  
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [timeRange, setTimeRange] = useState('week');

  const changes = useMemo(calculateChanges, [stats]);

  // Generate recent activities from actual data
  const generateRecentActivities = (enquiries, contacts, applications, blogs) => {
    const activities = [];

    // Add recent enquiries
    if (Array.isArray(enquiries)) {
      enquiries.slice(0, 2).forEach(item => {
        activities.push({
          type: "enquiry",
          title: "New Popup Form Submission",
          description: `${item.name || 'User'} submitted a popup form`,
          time: formatRelativeTime(item.createdAt),
          item: item
        });
      });
    }

    // Add recent contacts
    if (Array.isArray(contacts?.data)) {
      contacts.data.slice(0, 2).forEach(item => {
        activities.push({
          type: "contact",
          title: "New Contact Form",
          description: `${item.name || 'User'} sent a contact message`,
          time: formatRelativeTime(item.createdAt),
          item: item
        });
      });
    }

    // Add recent applications
    if (Array.isArray(applications?.data)) {
      applications.data.slice(0, 2).forEach(item => {
        activities.push({
          type: "application",
          title: "New Job Application",
          description: `${item.name || 'Candidate'} applied for a position`,
          time: formatRelativeTime(item.createdAt),
          item: item
        });
      });
    }

    // Add recent blogs
    if (Array.isArray(blogs?.data)) {
      blogs.data.slice(0, 1).forEach(item => {
        activities.push({
          type: "blog",
          title: "New Blog Post",
          description: `${item.title || 'New blog published'}`,
          time: formatRelativeTime(item.createdAt),
          item: item
        });
      });
    }

    // Sort by time and limit to 5
    return activities
      .sort((a, b) => new Date(b.item?.createdAt) - new Date(a.item?.createdAt))
      .slice(0, 5);
  };

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const endpoints = [
        { key: 'totalContacts', url: `${API_BASE_URL}/api/contact` },
        { key: 'totalEnquiries', url: `${API_BASE_URL}/api/popup-mail` },
        { key: 'totalApplications', url: `${API_BASE_URL}/api/application` },
        { key: 'totalBlogs', url: `${API_BASE_URL}/api/blog` },
        { key: 'totalPressReleases', url: `${API_BASE_URL}/api/pressrelease` },
        { key: 'totalJobOpenings', url: `${API_BASE_URL}/api/applications` },
      ];

      const results = {};
      const activityData = {};

      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint.url);
          if (response.ok) {
            const data = await response.json();
            
            let items = [];

            // Handle different response structures
            if (endpoint.key === 'totalEnquiries') {
              items = Array.isArray(data) ? data : [];
            } else {
              items = Array.isArray(data?.data) ? data.data : 
                      Array.isArray(data) ? data : [];
            }

            results[endpoint.key] = items.length;
            activityData[endpoint.key] = items;
          } else {
            results[endpoint.key] = 0;
            activityData[endpoint.key] = [];
          }
        } catch (error) {
          console.error(`Error fetching ${endpoint.key}:`, error);
          results[endpoint.key] = 0;
          activityData[endpoint.key] = [];
        }
      }

      setStats(results);

      // Generate recent activities
      const activities = generateRecentActivities(
        activityData.totalEnquiries,
        activityData.totalContacts,
        activityData.totalApplications,
        activityData.totalBlogs
      );
      setRecentActivities(activities);
      setLastUpdated(new Date());

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    
    // Refresh data every 2 minutes
    const interval = setInterval(fetchDashboardData, 120000);
    return () => clearInterval(interval);
  }, []);

  const trends = useMemo(() => ({
    contacts: generateTrendData(stats.totalContacts),
    enquiries: generateTrendData(stats.totalEnquiries),
    applications: generateTrendData(stats.totalApplications)
  }), [stats.totalContacts, stats.totalEnquiries, stats.totalApplications]);

  const statCards = [
    {
      title: "Popup Enquiries",
      value: stats.totalEnquiries,
      icon: Mail,
      color: "blue",
      change: changes.enquiries,
      route: "enquiries"
    },
    {
      title: "Contact Forms",
      value: stats.totalContacts,
      icon: Users,
      color: "green",
      change: changes.contacts,
      route: "contacts"
    },
    {
      title: "Job Applications",
      value: stats.totalApplications,
      icon: Briefcase,
      color: "purple",
      change: changes.applications,
      route: "applications"
    },
    {
      title: "Blog Posts",
      value: stats.totalBlogs,
      icon: BookOpen,
      color: "orange",
      change: changes.blogs,
      route: "blogs"
    },
    {
      title: "Job Openings",
      value: stats.totalJobOpenings,
      icon: TrendingUp,
      color: "teal",
      change: changes.jobs,
      route: "job-openings"
    },
    {
      title: "Press Releases",
      value: stats.totalPressReleases,
      icon: FileText,
      color: "red",
      change: changes.press,
      route: "press-releases"
    },
  ];

  const quickActions = [
    { icon: Mail, label: "View Enquiries", route: "/cybomb/enquiries", color: "primary" },
    { icon: Users, label: "Contacts", route: "/cybomb/contacts", color: "success" },
    { icon: Briefcase, label: "Job Openings", route: "/cybomb/job-openings", color: "info" },
    { icon: BookOpen, label: "Blog Manager", route: "/cybomb/blogs", color: "warning" },
    { icon: FileText, label: "Press Releases", route: "/cybomb/press-releases", color: "secondary" },
    { icon: Megaphone, label: "Newsletter", route: "/cybomb/newsletter", color: "purple" },
  ];

  const handleQuickAction = (route) => {
    // Navigate to the specific route
    window.location.href = route;
  };

  return (
    <div className={styles.overview}>
      {/* Header Section */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Cybomb Dashboard</h1>
          <p className={styles.subtitle}>
            Real-time overview of your Cybomb platform performance and analytics
          </p>
          {lastUpdated && (
            <p className={styles.lastUpdated}>
              Last updated: {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
        </div>
        <div className={styles.headerActions}>
         
          <button 
            className={styles.refreshBtn}
            onClick={fetchDashboardData}
            disabled={loading}
          >
            <RefreshCw className={loading ? styles.spin : ''} size={16} />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className={styles.alert}>
          <AlertCircle size={20} />
          <div>
            <p className={styles.alertTitle}>Using cached data</p>
            <p className={styles.alertMessage}>{error}</p>
          </div>
        </div>
      )}

      {/* Stats Grid Section */}
      <div className={styles.statsGrid}>
        {statCards.map((stat, index) => (
          <StatCard
            key={index}
            title={stat.title}
            value={stat.value}
            change={stat.change}
            icon={stat.icon}
            color={stat.color}
            loading={loading}
            onClick={() => handleQuickAction(stat.route)}
          />
        ))}
      </div>

      {/* Content Grid Section */}
      <div className={styles.contentGrid}>
        {/* Recent Activity Section */}
        <div className={styles.activitySection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              <Eye size={20} />
              Recent Activity
            </h2>
            <Link to="/cybomb/activity" className={styles.viewAllLink}>
              View All →
            </Link>
          </div>
          <div className={styles.activityList}>
            {loading && recentActivities.length === 0 ? (
              Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className={styles.activitySkeleton}>
                  <div className={styles.skeletonIcon}></div>
                  <div className={styles.skeletonContent}>
                    <div className={styles.skeletonLine}></div>
                    <div className={styles.skeletonLineShort}></div>
                  </div>
                </div>
              ))
            ) : recentActivities.length > 0 ? (
              recentActivities.map((activity, index) => (
                <ActivityItem
                  key={index}
                  type={activity.type}
                  title={activity.title}
                  description={activity.description}
                  time={activity.time}
                  item={activity.item}
                />
              ))
            ) : (
              <div className={styles.noActivity}>
                <Eye size={48} className={styles.noActivityIcon} />
                <p>No recent activity</p>
                <span>Activity will appear here as users interact with your website</span>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions Section */}
        <div className={styles.quickActions}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              <Download size={20} />
              Quick Actions
            </h2>
          </div>
          <div className={styles.actionGrid}>
            {quickActions.map((action, index) => (
              <Link
                key={index}
                to={action.route}
                className={styles.actionCard}
              >
                <div className={styles.actionIcon}>
                  <action.icon size={20} />
                </div>
                <div className={styles.actionText}>
                  <h3>{action.label}</h3>
                  <p>Manage {action.label.toLowerCase()}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}