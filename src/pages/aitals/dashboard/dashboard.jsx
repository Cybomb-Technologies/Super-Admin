// Dashboard.jsx
import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  Users,
  Mail,
  MessageSquare,
  Briefcase,
  FileText,
  Eye,
  Calendar,
  ArrowUp,
  ArrowDown,
  Sparkles
} from "lucide-react";
import styles from './Dashboard.module.css';

const API_BASE_URL = import.meta.env.VITE_AITALS_API_URL;

const AitalsDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    applications: { total: 0, recent: 0, trend: 0 },
    contacts: { total: 0, unread: 0, trend: 0 },
    enquiries: { total: 0, unread: 0, trend: 0 },
    subscribers: { total: 0, active: 0, trend: 0 },
    jobs: { total: 0, active: 0, trend: 0 },
    blogs: { total: 0, published: 0, trend: 0 }
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('week');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // const token = localStorage.getItem("adminToken");
      
      // Fetch all data in parallel
      const [
        applicationsRes,
        contactsRes,
        enquiriesRes,
        subscribersRes,
        jobsRes,
        blogsRes
      ] = await Promise.all([
        fetch(`${API_BASE_URL}/api/application`, {
          // headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${API_BASE_URL}/api/contact`, {
          // headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${API_BASE_URL}/api/enquiry`, {
          // headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${API_BASE_URL}/api/newsletter/subscribers?limit=1000`, {
          // headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${API_BASE_URL}/api/applications`, {
          // headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${API_BASE_URL}/api/blog`, {
          // headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      // Process applications data
      const applicationsData = applicationsRes.ok ? await applicationsRes.json() : [];
      const applicationsArray = applicationsData.data || applicationsData || [];
      
      // Process contacts data
      const contactsData = contactsRes.ok ? await contactsRes.json() : [];
      const contactsArray = contactsData.data || contactsData || [];
      
      // Process enquiries data
      const enquiriesData = enquiriesRes.ok ? await enquiriesRes.json() : [];
      const enquiriesArray = enquiriesData.data || enquiriesData || [];
      
      // Process subscribers data
      const subscribersData = subscribersRes.ok ? await subscribersRes.json() : [];
      const subscribersArray = subscribersData.data || subscribersData || [];
      
      // Process jobs data
      const jobsData = jobsRes.ok ? await jobsRes.json() : [];
      const jobsArray = Array.isArray(jobsData) ? jobsData : jobsData.applications || jobsData.data || [];
      
      // Process blogs data
      const blogsData = blogsRes.ok ? await blogsRes.json() : [];
      const blogsArray = Array.isArray(blogsData) ? blogsData : blogsData.blogs || blogsData.data || [];

      // Calculate recent items (last 7 days)
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      // Prepare dashboard data
      const dashboardStats = {
        applications: {
          total: applicationsArray.length,
          recent: applicationsArray.filter(app => 
            new Date(app.createdAt || app.date) > oneWeekAgo
          ).length,
          trend: applicationsArray.length > 0 ? 12 : 0 // Sample trend data
        },
        contacts: {
          total: contactsArray.length,
          unread: contactsArray.filter(contact => !contact.read).length,
          trend: contactsArray.length > 0 ? 8 : 0
        },
        enquiries: {
          total: enquiriesArray.length,
          unread: enquiriesArray.filter(enquiry => !enquiry.read).length,
          trend: enquiriesArray.length > 0 ? 15 : 0
        },
        subscribers: {
          total: subscribersArray.length,
          active: subscribersArray.filter(sub => sub.isActive !== false).length,
          trend: subscribersArray.length > 0 ? 25 : 0
        },
        jobs: {
          total: jobsArray.length,
          active: jobsArray.filter(job => job.isActive !== false).length,
          trend: jobsArray.length > 0 ? 5 : 0
        },
        blogs: {
          total: blogsArray.length,
          published: blogsArray.filter(blog => blog.published !== false).length,
          trend: blogsArray.length > 0 ? 3 : 0
        }
      };

      // Prepare recent activity
      const allActivities = [
        ...applicationsArray.map(app => ({
          type: 'application',
          title: `New application from ${app.name}`,
          description: `Applied for ${app.role || 'a position'}`,
          date: app.createdAt || app.date,
          icon: FileText
        })),
        ...contactsArray.map(contact => ({
          type: 'contact',
          title: `New message from ${contact.name}`,
          description: contact.subject || 'No subject',
          date: contact.createdAt,
          icon: Mail,
          unread: !contact.read
        })),
        ...enquiriesArray.map(enquiry => ({
          type: 'enquiry',
          title: `New enquiry from ${enquiry.email}`,
          description: enquiry.subject || 'General enquiry',
          date: enquiry.createdAt,
          icon: MessageSquare,
          unread: !enquiry.read
        })),
        ...subscribersArray.slice(0, 5).map(sub => ({
          type: 'subscriber',
          title: `New newsletter subscriber`,
          description: sub.email,
          date: sub.subscribedAt || sub.createdAt,
          icon: Users
        }))
      ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);

      setDashboardData(dashboardStats);
      setRecentActivity(allActivities);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  const StatCard = ({ title, value, subtitle, icon: Icon, trend, trendValue, color }) => (
    <div className={`${styles.statCard} ${styles[color]}`}>
      <div className={styles.statContent}>
        <div className={styles.statInfo}>
          <h3 className={styles.statTitle}>{title}</h3>
          <div className={styles.statValue}>{value}</div>
          <p className={styles.statSubtitle}>{subtitle}</p>
        </div>
        <div className={styles.statIcon}>
          <Icon className={styles.statIconSvg} />
        </div>
      </div>
      {trend !== 0 && (
        <div className={`${styles.trend} ${trend > 0 ? styles.trendUp : styles.trendDown}`}>
          {trend > 0 ? <ArrowUp className={styles.trendIcon} /> : <ArrowDown className={styles.trendIcon} />}
          <span>{Math.abs(trendValue)}% this week</span>
        </div>
      )}
    </div>
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className={styles.loadingState}>
        <div className={styles.loadingSpinner}></div>
        <span>Loading dashboard...</span>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.welcomeSection}>
            <h1 className={styles.title}>
              <Sparkles className={styles.titleIcon} />
              Dashboard Overview
            </h1>
            <p className={styles.subtitle}>
              Welcome back! Here's what's happening with your Aitals platform.
            </p>
          </div>
          <div className={styles.timeFilter}>
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className={styles.timeSelect}
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        <StatCard
          title="Job Applications"
          value={dashboardData.applications.total}
          subtitle={`${dashboardData.applications.recent} new this week`}
          icon={FileText}
          trend={dashboardData.applications.trend}
          trendValue={dashboardData.applications.trend}
          color="primary"
        />
        
        <StatCard
          title="Contact Messages"
          value={dashboardData.contacts.total}
          subtitle={`${dashboardData.contacts.unread} unread messages`}
          icon={Mail}
          trend={dashboardData.contacts.trend}
          trendValue={dashboardData.contacts.trend}
          color="secondary"
        />
        
        <StatCard
          title="Enquiries"
          value={dashboardData.enquiries.total}
          subtitle={`${dashboardData.enquiries.unread} unread enquiries`}
          icon={MessageSquare}
          trend={dashboardData.enquiries.trend}
          trendValue={dashboardData.enquiries.trend}
          color="success"
        />
        
        <StatCard
          title="Newsletter Subscribers"
          value={dashboardData.subscribers.total}
          subtitle={`${dashboardData.subscribers.active} active subscribers`}
          icon={Users}
          trend={dashboardData.subscribers.trend}
          trendValue={dashboardData.subscribers.trend}
          color="warning"
        />
        
        <StatCard
          title="Job Openings"
          value={dashboardData.jobs.total}
          subtitle={`${dashboardData.jobs.active} active positions`}
          icon={Briefcase}
          trend={dashboardData.jobs.trend}
          trendValue={dashboardData.jobs.trend}
          color="info"
        />
        
        <StatCard
          title="Blog Posts"
          value={dashboardData.blogs.total}
          subtitle={`${dashboardData.blogs.published} published`}
          icon={FileText}
          trend={dashboardData.blogs.trend}
          trendValue={dashboardData.blogs.trend}
          color="danger"
        />
      </div>

      {/* Recent Activity */}
      <div className={styles.activitySection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            <Calendar className={styles.sectionIcon} />
            Recent Activity
          </h2>
          <span className={styles.sectionBadge}>{recentActivity.length} activities</span>
        </div>
        
        <div className={styles.activityList}>
          {recentActivity.length === 0 ? (
            <div className={styles.emptyActivity}>
              <Eye className={styles.emptyActivityIcon} />
              <p>No recent activity</p>
            </div>
          ) : (
            recentActivity.map((activity, index) => (
              <div key={index} className={`${styles.activityItem} ${activity.unread ? styles.unread : ''}`}>
                <div className={styles.activityIcon}>
                  <activity.icon className={styles.activityIconSvg} />
                </div>
                <div className={styles.activityContent}>
                  <h4 className={styles.activityTitle}>{activity.title}</h4>
                  <p className={styles.activityDescription}>{activity.description}</p>
                  <span className={styles.activityTime}>
                    {formatDate(activity.date)}
                  </span>
                </div>
                {activity.unread && (
                  <div className={styles.unreadBadge}></div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className={styles.quickStats}>
        <div className={styles.quickStat}>
          <TrendingUp className={styles.quickStatIcon} />
          <div className={styles.quickStatContent}>
            <span className={styles.quickStatValue}>
              {dashboardData.applications.recent + dashboardData.contacts.unread + dashboardData.enquiries.unread}
            </span>
            <span className={styles.quickStatLabel}>Pending Actions</span>
          </div>
        </div>
        
        <div className={styles.quickStat}>
          <Users className={styles.quickStatIcon} />
          <div className={styles.quickStatContent}>
            <span className={styles.quickStatValue}>
              {dashboardData.subscribers.total}
            </span>
            <span className={styles.quickStatLabel}>Total Subscribers</span>
          </div>
        </div>
        
        <div className={styles.quickStat}>
          <Briefcase className={styles.quickStatIcon} />
          <div className={styles.quickStatContent}>
            <span className={styles.quickStatValue}>
              {dashboardData.jobs.active}
            </span>
            <span className={styles.quickStatLabel}>Active Jobs</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AitalsDashboard;