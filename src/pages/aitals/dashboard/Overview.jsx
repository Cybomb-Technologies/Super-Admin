// Overview.jsx
import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import { useNavigate } from "react-router-dom";
const API_BASE_URL1 = import.meta.env.VITE_CYBOMB_API_BASE;

// Accept the new prop for internal navigation
const Overview = ({ onNavigateToTab }) => {
  const [stats, setStats] = useState({
    enquiries: 0,
    contacts: 0,
    applications: 0,
    blogs: 0,
    jobOpenings: 0,
    total: 0,
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const navigate = useNavigate(); // Still needed for fallback/external navigation
  const API_BASE_URL = `${API_BASE_URL1}`;

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("adminToken");
      const response = await fetch(`${API_BASE_URL}/api/dashboard/overview`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch dashboard data: ${response.status}`);
      }

      const data = await response.json();

      // FIX: Ensure correct data structure is used (data.data.key)
      setStats({
        enquiries: data.data.enquiriesCount || 0,
        contacts: data.data.contactsCount || 0,
        applications: data.data.applicationsCount || 0,
        blogs: data.data.blogsCount || 0,
        jobOpenings: data.data.jobOpeningsCount || 0,
        total: data.data.totalInteractions || 0,
      });

      setRecentActivities(data.data.recentActivities || []);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError(err.message);
      // Fallback to mock data for demo purposes
      setFallbackData();
    } finally {
      setLoading(false);
    }
  };

  // Fallback mock data for demo
  const setFallbackData = () => {
    setStats({
      enquiries: 45,
      contacts: 23,
      applications: 67,
      blogs: 12,
      jobOpenings: 8,
      total: 155,
    });

    setRecentActivities([
      {
        type: "application",
        title: "New Job Application",
        description: "John Doe applied for Senior Developer position",
        time: "5 minutes ago",
      },
      {
        type: "enquiry",
        title: "New Service Enquiry",
        description: "ABC Corp enquired about web development services",
        time: "15 minutes ago",
      },
      {
        type: "contact",
        title: "Contact Form Submission",
        description: "Sarah Wilson sent a message via contact form",
        time: "1 hour ago",
      },
      {
        type: "blog",
        title: "New Blog Comment",
        description: 'New comment on "React Best Practices" post',
        time: "2 hours ago",
      },
      {
        type: "application",
        title: "Job Application Received",
        description: "Jane Smith applied for UX Designer role",
        time: "3 hours ago",
      },
    ]);
  };

  // Calculate percentage change (mock function - replace with actual data from API)
  const calculateChange = (currentValue, previousValue = 0) => {
    if (previousValue === 0) return "+0%";
    const change = ((currentValue - previousValue) / previousValue) * 100;
    return `${change >= 0 ? "+" : ""}${Math.round(change)}%`;
  };

  const statCards = [
    {
      title: "Total Enquiries",
      value: stats.enquiries,
      icon: TrendingUp,
      color: "bg-blue-500",
      change: calculateChange(
        stats.enquiries,
        Math.round(stats.enquiries * 0.88)
      ),
      trend: "up",
      route: "Enquiries", // Tab ID
    },
    {
      title: "Contact Forms",
      value: stats.contacts,
      icon: Mail,
      color: "bg-green-500",
      change: calculateChange(
        stats.contacts,
        Math.round(stats.contacts * 0.92)
      ),
      trend: "up",
      route: "Contacts", // Tab ID
    },
    {
      title: "Job Applications",
      value: stats.applications,
      icon: Users,
      color: "bg-purple-500",
      change: calculateChange(
        stats.applications,
        Math.round(stats.applications * 0.77)
      ),
      trend: "up",
      route: "Application", // Tab ID
    },
    {
      title: "Blog Posts",
      value: stats.blogs,
      icon: BookOpen,
      color: "bg-orange-500",
      change: calculateChange(stats.blogs, Math.round(stats.blogs * 0.95)),
      trend: "up",
      route: "Blogs", // Tab ID
    },
    {
      title: "Active Job Openings",
      value: stats.jobOpenings,
      icon: Briefcase,
      color: "bg-indigo-500",
      change: calculateChange(
        stats.jobOpenings,
        Math.round(stats.jobOpenings * 0.85)
      ),
      trend: "up",
      route: "JobOpenings", // Tab ID
    },
  ];

  // Modified handleQuickAction to use the prop for internal navigation
  const handleQuickAction = (tabId) => {
    if (onNavigateToTab) {
      onNavigateToTab(tabId);
    } else {
      // Fallback: If prop is missing, navigate as a standard route (less ideal)
      navigate(tabId);
    }
  };

  // Refresh data
  const handleRefresh = () => {
    fetchDashboardData();
  };

  // Initial data fetch
  useEffect(() => {
    fetchDashboardData();

    // Set up periodic refresh every 5 minutes
    const interval = setInterval(fetchDashboardData, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  if (loading && recentActivities.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-[#6666CC] mr-3" />
        <span className="text-lg font-medium text-gray-900">
          Loading Dashboard...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section with Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="bg-gradient-to-r from-[#1A173A] to-[#6666CC] text-white p-6 rounded-2xl shadow-xl flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">
                Welcome back, Admin! 👋
              </h1>
              <p className="text-blue-100 opacity-90">
                Here's what's happening with your website today. You have{" "}
                {stats.total} total interactions this month.
              </p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="p-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-all duration-200 disabled:opacity-50"
              title="Refresh Data"
            >
              <RefreshCw
                className={`w-5 h-5 ${loading ? "animate-spin" : ""}`}
              />
            </button>
          </div>
          {lastUpdated && (
            <p className="text-blue-100 opacity-70 text-xs mt-2">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center">
          <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
          <div>
            <p className="text-red-800 font-medium">
              Error loading dashboard data
            </p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="bg-white p-4 sm:p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
            onClick={() => handleQuickAction(stat.route)} // Use handleQuickAction with Tab ID
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${stat.color} text-white`}>
                <stat.icon className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <span
                className={`text-xs sm:text-sm font-medium ${
                  stat.trend === "up" ? "text-green-600" : "text-red-600"
                }`}
              >
                {stat.change}
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
              {stat.value}
            </h3>
            <p className="text-gray-600 text-xs sm:text-sm">{stat.title}</p>
          </div>
        ))}
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center">
              <Eye className="w-5 h-5 mr-2 text-[#6666CC]" />
              Recent Activity
            </h3>
            {loading && (
              <RefreshCw className="w-4 h-4 animate-spin text-gray-400" />
            )}
          </div>
          <div className="space-y-3">
            {recentActivities.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Eye className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p>No recent activity</p>
              </div>
            ) : (
              recentActivities.slice(0, 5).map((activity, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                >
                  <div
                    className={`w-2 h-2 mt-2 rounded-full flex-shrink-0 ${
                      activity.type === "enquiry"
                        ? "bg-blue-500"
                        : activity.type === "application"
                        ? "bg-purple-500"
                        : activity.type === "contact"
                        ? "bg-green-500"
                        : "bg-orange-500"
                    }`}
                  ></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {activity.title}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {activity.description}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg border border-gray-100">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Download className="w-5 h-5 mr-2 text-[#6666CC]" />
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <button
              onClick={() => handleQuickAction("Enquiries")} // Use Tab ID
              className="p-3 sm:p-4 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-all duration-200 text-center transform hover:scale-105"
            >
              <Mail className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-2" />
              <span className="text-xs sm:text-sm font-medium block">
                View Enquiries
              </span>
            </button>

            <button
              onClick={() => handleQuickAction("JobOpenings")} // Use Tab ID
              className="p-3 sm:p-4 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-all duration-200 text-center transform hover:scale-105"
            >
              <Briefcase className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-2" />
              <span className="text-xs sm:text-sm font-medium block">
                Manage Jobs
              </span>
            </button>

            <button
              onClick={() => handleQuickAction("Blogs")} // Use Tab ID
              className="p-3 sm:p-4 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-all duration-200 text-center transform hover:scale-105"
            >
              <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-2" />
              <span className="text-xs sm:text-sm font-medium block">
                Write Blog
              </span>
            </button>

            <button
              onClick={() => handleQuickAction("Application")} // Use Tab ID
              className="p-3 sm:p-4 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-all duration-200 text-center transform hover:scale-105"
            >
              <Users className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-2" />
              <span className="text-xs sm:text-sm font-medium block">
                Applications
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
