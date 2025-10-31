// dashboard.jsx
import { Link } from "react-router-dom";
import React, { useEffect, useState } from "react";
import styles from "./dashboard.module.css";

const API_URL = import.meta.env.VITE_CYBOMB_API_BASE;

export default function Cybombdashboard() {
  const [stats, setStats] = useState({
    totalSubmissions: 0,
    jobApplications: 0,
    blogPosts: 0,
    newsletterSubscriptions: 0,
  });
  const [recentSubmissions, setRecentSubmissions] = useState([]);
  const [recentJobApplications, setRecentJobApplications] = useState([]);
  const [recentBlogs, setRecentBlogs] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🧩 Fetch Dashboard Data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch all required data parallelly
        const [
          bannerRes,
          popupRes,
          contactRes,
          careerRes,
          blogsRes,
          newsletterRes,
        ] = await Promise.all([
          fetch(`${API_URL}/api/banner-mail`),
          fetch(`${API_URL}/api/popup-mail`),
          fetch(`${API_URL}/api/send-mail`),
          fetch(`${API_URL}/api/career`),
          fetch(`${API_URL}/api/blogs`),
          fetch(`${API_URL}/api/footer-mail`),
        ]);

        const [
          bannerData,
          popupData,
          contactData,
          careerData,
          blogData,
          newsletterData,
        ] = await Promise.all([
          bannerRes.json(),
          popupRes.json(),
          contactRes.json(),
          careerRes.json(),
          blogsRes.json(),
          newsletterRes.json(),
        ]);

        // 🧮 Calculate stats
        const totalSubmissions =
          (bannerData?.length || 0) +
          (popupData?.length || 0) +
          (contactData?.length || 0);

        const jobApplications = careerData?.length || 0;
        const blogPosts = blogData?.length || 0;
        const newsletterSubscriptions = newsletterData?.length || 0;

        // 🕒 Recent data (latest 5 items)
        const getRecent = (arr) => arr?.slice(-5).reverse() || [];

        setStats({
          totalSubmissions,
          jobApplications,
          blogPosts,
          newsletterSubscriptions,
        });

        setRecentSubmissions(
          getRecent([...bannerData, ...popupData, ...contactData])
        );
        setRecentJobApplications(getRecent(careerData));
        setRecentBlogs(getRecent(blogData));
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // 🗑️ Delete blog
  const handleBlogDelete = async (blogId) => {
    if (window.confirm("Delete this blog post?")) {
      try {
        const res = await fetch(`${API_URL}/api/blogs/${blogId}`, {
          method: "DELETE",
        });
        if (res.ok) {
          setRecentBlogs((prev) => prev.filter((b) => b._id !== blogId));
          setStats((s) => ({ ...s, blogPosts: s.blogPosts - 1 }));
        } else {
          alert("Failed to delete blog");
        }
      } catch (err) {
        console.error("Error deleting blog:", err);
      }
    }
  };

  // 🕒 Time format helper
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24)
      return `${diffHours} hr${diffHours > 1 ? "s" : ""} ago`;
    return date.toLocaleDateString();
  };

  // ✅ Status badge color
  const getStatusBadge = (status) => {
    switch (status) {
      case "Hired":
        return styles.statusHired;
      case "Rejected":
        return styles.statusRejected;
      default:
        return styles.statusReview;
    }
  };

  return (
    <div className={styles.dashboard}>
      {/* Welcome Section */}
      <div className={styles.welcomeSection}>
        <div className={styles.welcomeContent}>
          <h1 className={styles.welcomeTitle}>Cybomb Dashboard</h1>
          <p className={styles.welcomeSubtitle}>
            Here's what's happening with your applications today.
          </p>
        </div>
      </div>

      {/* Stats Section */}
      <div className={styles.statsGrid}>
        {[
          {
            label: "Total Submissions",
            icon: "fa-file-alt",
            value: stats.totalSubmissions,
            trend: "+12%",
            color: styles.cardPrimary,
          },
          {
            label: "Job Applications",
            icon: "fa-briefcase",
            value: stats.jobApplications,
            trend: "+8%",
            color: styles.cardSuccess,
          },
          {
            label: "Blog Posts",
            icon: "fa-blog",
            value: stats.blogPosts,
            trend: "+5%",
            color: styles.cardWarning,
          },
          {
            label: "Subscriptions",
            icon: "fa-newspaper",
            value: stats.newsletterSubscriptions,
            trend: "+15%",
            color: styles.cardInfo,
          },
        ].map((card, i) => (
          <div key={i} className={`${styles.statCard} ${card.color}`}>
            <div className={styles.statContent}>
              <div>
                <div className={styles.statLabel}>{card.label}</div>
                <div className={styles.statValue}>{card.value}</div>
                <div className={styles.statTrend}>{card.trend}</div>
              </div>
              <div className={styles.statIcon}>
                <i className={`fas ${card.icon}`}></i>
              </div>
            </div>
            <div className={styles.statProgress}></div>
          </div>
        ))}
      </div>

      {/* Recent Submissions & Jobs */}
      <div className={styles.contentGrid}>
        {/* Recent Submissions */}
        <div className={styles.contentCard}>
          <div className={styles.cardHeader}>
            <h6 className={styles.cardTitle}>
              <i className="fas fa-inbox"></i>
              Recent Form Submissions
            </h6>
            <Link to="/cybomb/form-submission" className={styles.viewAllBtn}>
              View All
              <i className="fas fa-arrow-right"></i>
            </Link>
          </div>
          <div className={styles.cardBody}>
            {recentSubmissions.length === 0 ? (
              <div className={styles.emptyState}>
                <i className="fas fa-inbox"></i>
                <p>No recent submissions</p>
              </div>
            ) : (
              <div className={styles.submissionList}>
                {recentSubmissions.map((s, i) => (
                  <div key={i} className={styles.submissionItem}>
                    <div className={styles.submissionHeader}>
                      <div className={styles.submissionInfo}>
                        <div className={styles.submissionAvatar}>
                          {s.displayName?.charAt(0).toUpperCase() || "U"}
                        </div>
                        <div>
                          <h6 className={styles.submissionName}>
                            {s.displayName || s.name || "Unknown User"}
                          </h6>
                          <span className={styles.submissionType}>
                            {s.type || "Form"}
                          </span>
                        </div>
                      </div>
                      <small className={styles.submissionTime}>
                        {formatDate(s.createdAt)}
                      </small>
                    </div>
                    <p className={styles.submissionMessage}>
                      {s.message || "No message provided"}
                    </p>
                    <div className={styles.submissionContact}>
                      <span className={styles.contactItem}>
                        <i className="fas fa-envelope"></i>
                        {s.email || "No email"}
                      </span>
                      <span className={styles.contactItem}>
                        <i className="fas fa-phone"></i>
                        {s.phone || "No phone"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Job Applications */}
        <div className={styles.contentCard}>
          <div className={styles.cardHeader}>
            <h6 className={styles.cardTitle}>
              <i className="fas fa-briefcase"></i>
              Recent Job Applications
            </h6>
            <Link to="/cybomb/career-application" className={styles.viewAllBtn}>
              View All
              <i className="fas fa-arrow-right"></i>
            </Link>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.tableContainer}>
              <table className={styles.dataTable}>
                <thead>
                  <tr>
                    <th>Applicant</th>
                    <th>Position</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentJobApplications.length ? (
                    recentJobApplications.map((app, i) => (
                      <tr key={i}>
                        <td className={styles.applicantCell}>
                          <div className={styles.applicantAvatar}>
                            {app.name?.charAt(0).toUpperCase() || "A"}
                          </div>
                          {app.name || "Unknown"}
                        </td>
                        <td>{app.jobTitle || "N/A"}</td>
                        <td>{formatDate(app.createdAt)}</td>
                        <td>
                          <span
                            className={`${styles.statusBadge} ${getStatusBadge(
                              app.status
                            )}`}
                          >
                            {app.status || "Pending"}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className={styles.emptyTable}>
                        <div className={styles.emptyState}>
                          <i className="fas fa-briefcase"></i>
                          <p>No job applications</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Blog Management */}
      <div className={styles.contentCard} style={{ margin: "0px 30px" }}>
        <div className={styles.cardHeader}>
          <h6 className={styles.cardTitle}>
            <i className="fas fa-blog"></i>
            Blog Management
          </h6>
          <Link to="/cybomb/blog-management" className={styles.manageBlogsBtn}>
            <i className="fas fa-plus"></i>
            Manage Blogs
          </Link>
        </div>
        <div className={styles.cardBody}>
          {loading ? (
            <div className={styles.loadingState}>
              <div className={styles.spinner}></div>
              Loading blogs...
            </div>
          ) : recentBlogs.length ? (
            <div className={styles.tableContainer}>
              <table className={styles.dataTable}>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBlogs.map((b) => (
                    <tr key={b._id}>
                      <td className={styles.blogTitle}>{b.title}</td>
                      <td>{new Date(b.date).toLocaleDateString()}</td>
                      <td className={styles.blogDescription}>
                        {b.description?.slice(0, 50)}...
                      </td>
                      <td>
                        <div className={styles.actionButtons}>
                          <Link
                            to="/cybomb/admin-blog"
                            className={styles.editBtn}
                            title="Edit Blog"
                          >
                            <i className="fas fa-edit"></i>
                          </Link>
                          <button
                            className={styles.deleteBtn}
                            onClick={() => handleBlogDelete(b._id)}
                            title="Delete Blog"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className={styles.emptyState}>
              <i className="fas fa-blog"></i>
              <p>No blogs found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
