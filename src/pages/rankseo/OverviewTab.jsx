"use client";
import React, { useState } from "react";
import styles from "./styles.module.css";

// StatsGrid Component
const StatsGrid = ({ data }) => {
  if (!data) {
    return (
      <div className={styles.statsGrid}>
        {[...Array(4)].map((_, index) => (
          <div key={index} className={`${styles.statsCard} border-l-4 ${styles.borderSecondary} ${styles.loading}`}>
            <div className="flex items-center">
              <div className={`p-3 rounded-full ${styles.bgTertiary} w-12 h-12`}></div>
              <div className="ml-4 flex-1">
                <div className={`h-4 ${styles.bgTertiary} rounded w-20 mb-2`}></div>
                <div className={`h-6 ${styles.bgTertiary} rounded w-12`}></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const totalUsers = data?.users?.length || 0;
  
  const stats = [
    {
      title: "Total Users",
      value: totalUsers,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      color: "blue"
    },
    {
      title: "Active Users",
      value: data?.activeUsers || 0,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      color: "green"
    },
    {
      title: "Premium Users",
      value: data?.premiumUsers || 0,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: "purple"
    },
    {
      title: "Total Activities",
      value: data?.totalActivities || 0,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      color: "yellow"
    }
  ];

  const colorClasses = {
    blue: { border: styles.badgeBlue.split(' ')[0].replace('badge', 'border'), bg: styles.badgeBlue, text: styles.textPrimary },
    green: { border: styles.badgeGreen.split(' ')[0].replace('badge', 'border'), bg: styles.badgeGreen, text: styles.textPrimary },
    purple: { border: styles.badgePurple.split(' ')[0].replace('badge', 'border'), bg: styles.badgePurple, text: styles.textPrimary },
    yellow: { border: styles.badgeYellow.split(' ')[0].replace('badge', 'border'), bg: styles.badgeYellow, text: styles.textPrimary }
  };

  return (
    <div className={styles.statsGrid}>
      {stats.map((stat, index) => (
        <div key={index} className={`${styles.statsCard} border-l-4 ${colorClasses[stat.color].border}`}>
          <div className="flex items-center">
            <div className={`p-3 rounded-full ${colorClasses[stat.color].bg} ${colorClasses[stat.color].text}`}>
              {stat.icon}
            </div>
            <div className="ml-4">
              <p className={`text-sm font-medium ${styles.textSecondary}`}>{stat.title}</p>
              <p className={`text-2xl font-semibold ${styles.textPrimary}`}>{stat.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// RecentUsers Component
const RecentUsers = ({ users = [] }) => {
  const recentUsers = users.slice(0, 5);

  return (
    <div className={styles.card}>
      <div className={`px-6 py-4 border-b ${styles.borderPrimary} flex justify-between items-center`}>
        <h3 className={`text-lg font-medium ${styles.textPrimary}`}>Recent Users</h3>
        <span className={`text-sm ${styles.textTertiary}`}>
          Last {recentUsers.length} registered users
        </span>
      </div>
      <div className={`divide-y ${styles.dividePrimary}`}>
        {recentUsers.map((user) => (
          <div key={user._id} className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {user.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt={user.name}
                    className={`h-10 w-10 ${styles.avatar}`}
                  />
                ) : (
                  <div className={`h-10 w-10 ${styles.avatarPlaceholder} flex items-center justify-center`}>
                    <span className={`${styles.textPrimary} font-medium`}>
                      {user.name?.charAt(0)?.toUpperCase() ||
                        user.email?.charAt(0)?.toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="ml-4">
                  <p className={`text-sm font-medium ${styles.textPrimary}`}>
                    {user.name}
                  </p>
                  <p className={`text-sm ${styles.textSecondary}`}>{user.email}</p>
                  {user.loginMethod && (
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${styles.badgeGray}`}>
                      {user.loginMethod}
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    user.planName && user.planName !== "Free"
                      ? styles.badgePurple
                      : styles.badgeGray
                  }`}
                >
                  {user.planName || "Free"}
                </span>
                <p className={`text-sm ${styles.textSecondary}`}>
                  Joined: {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                </p>
                <p className={`text-xs ${styles.textMuted}`}>
                  {user.isVerified ? "Verified" : "Not Verified"}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// UserTable Component
const UserTable = ({ users, totalUsers, onViewUser }) => {
  if (users.length === 0) {
    return (
      <div className={`${styles.card} p-8 text-center`}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-12 w-12 mx-auto text-gray-400 mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
          />
        </svg>
        <h3 className={`text-lg font-medium ${styles.textPrimary} mb-2`}>No users found</h3>
        <p className={styles.textSecondary}>Try adjusting your search criteria</p>
      </div>
    );
  }

  const getPlanColor = (plan) => {
    return plan === "Free" ? styles.badgeGray : styles.badgePurple;
  };

  const getLoginMethodColor = (method) => {
    switch (method) {
      case "GitHub": return styles.badgeGray;
      case "Google": return styles.badgeRed;
      default: return styles.badgeBlue;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "active": return styles.badgeGreen;
      case "inactive": return styles.badgeGray;
      case "cancelled": return styles.badgeRed;
      case "expired": return styles.badgeOrange;
      default: return styles.badgeGray;
    }
  };

  return (
    <div className={styles.card}>
      <div className={`px-6 py-4 border-b ${styles.borderPrimary}`}>
        <h2 className={`text-lg font-semibold ${styles.textPrimary}`}>
          Users ({users.length} of {totalUsers})
        </h2>
      </div>
      
      <div className="overflow-x-auto">
        <table className={styles.table}>
          <thead className={styles.tableHeader}>
            <tr>
              <th className={`px-6 py-3 text-left text-xs font-medium ${styles.textTertiary} uppercase tracking-wider`}>
                User
              </th>
              <th className={`px-6 py-3 text-left text-xs font-medium ${styles.textTertiary} uppercase tracking-wider`}>
                Plan & Status
              </th>
              <th className={`px-6 py-3 text-left text-xs font-medium ${styles.textTertiary} uppercase tracking-wider`}>
                Login Method
              </th>
              <th className={`px-6 py-3 text-left text-xs font-medium ${styles.textTertiary} uppercase tracking-wider`}>
                Last Login
              </th>
              <th className={`px-6 py-3 text-left text-xs font-medium ${styles.textTertiary} uppercase tracking-wider`}>
                Joined
              </th>
              <th className={`px-6 py-3 text-left text-xs font-medium ${styles.textTertiary} uppercase tracking-wider`}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className={styles.bgCard}>
            {users.map((user) => (
              <tr key={user._id} className={styles.tableRow}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      {user.profilePicture ? (
                        <img
                          className={`h-10 w-10 ${styles.avatar}`}
                          src={user.profilePicture}
                          alt={user.name}
                        />
                      ) : (
                        <div className={`h-10 w-10 ${styles.avatarPlaceholder} flex items-center justify-center`}>
                          <span className={`${styles.textTertiary} font-medium text-sm`}>
                            {user.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className={`text-sm font-medium ${styles.textPrimary}`}>
                        {user.name || "No Name"}
                      </div>
                      <div className={`text-sm ${styles.textSecondary}`}>{user.email}</div>
                      {user.phone && (
                        <div className={`text-xs ${styles.textMuted}`}>{user.phone}</div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col gap-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPlanColor(user.displayPlan)}`}>
                      {user.displayPlan || "Free"}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(user.subscriptionStatus)}`}>
                      {(user.subscriptionStatus || "inactive").charAt(0).toUpperCase() + 
                       (user.subscriptionStatus || "inactive").slice(1)}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getLoginMethodColor(user.loginMethod)}`}>
                      {user.loginMethod || "Email"}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className={styles.textSecondary}>
                    {user.formattedLastLogin}
                    {!user.lastLogin && (
                      <div className={`text-xs ${styles.textMuted}`}>Never logged in</div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className={styles.textSecondary}>
                    {user.formattedCreatedAt}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => onViewUser(user)}
                    className={`${styles.button} text-sm`}
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// UserProfileModal Component
const UserProfileModal = ({ user, isOpen, onClose }) => {
  if (!isOpen || !user) return null;

  const formatDate = (dateString) => {
    if (!dateString) return "Never";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDisplayPlan = () => {
    if (user.planName && user.planName !== "Free") {
      return user.planName;
    }
    if (user.plan && typeof user.plan === 'object' && user.plan.name) {
      return user.plan.name;
    }
    if (typeof user.plan === 'string' && user.plan.length > 0) {
      return user.subscriptionStatus === "active" ? "Premium" : "Free";
    }
    return user.planName || "Free";
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "active": return styles.badgeGreen;
      case "inactive": return styles.badgeGray;
      case "cancelled": return styles.badgeRed;
      case "expired": return styles.badgeOrange;
      default: return styles.badgeGray;
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={`px-6 py-4 border-b ${styles.borderPrimary} flex justify-between items-center`}>
          <h3 className={`text-lg font-semibold ${styles.textPrimary}`}>User Details</h3>
          <button
            onClick={onClose}
            className={`${styles.textTertiary} hover:${styles.textPrimary} transition-colors`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          <div className="text-center mb-6">
            <div className="flex justify-center mb-4">
              {user.profilePicture ? (
                <img
                  className={`h-20 w-20 ${styles.avatar}`}
                  src={user.profilePicture}
                  alt={user.name}
                />
              ) : (
                <div className={`h-20 w-20 ${styles.avatarPlaceholder} flex items-center justify-center`}>
                  <span className={`${styles.textTertiary} font-medium text-2xl`}>
                    {user.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <h2 className={`text-xl font-bold ${styles.textPrimary}`}>{user.name || "No Name"}</h2>
            <p className={styles.textSecondary}>{user.email}</p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium ${styles.textTertiary}`}>Plan</label>
                <p className={`mt-1 text-sm font-semibold ${styles.textPrimary}`}>{getDisplayPlan()}</p>
              </div>
              <div>
                <label className={`block text-sm font-medium ${styles.textTertiary}`}>Status</label>
                <span className={`mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(user.subscriptionStatus)}`}>
                  {(user.subscriptionStatus || "inactive").charAt(0).toUpperCase() + 
                   (user.subscriptionStatus || "inactive").slice(1)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium ${styles.textTertiary}`}>Login Method</label>
                <p className={`mt-1 text-sm ${styles.textPrimary}`}>{user.loginMethod || "Email"}</p>
              </div>
              <div>
                <label className={`block text-sm font-medium ${styles.textTertiary}`}>Verified</label>
                <p className={`mt-1 text-sm ${styles.textPrimary}`}>
                  {user.isVerified ? "Yes" : "No"}
                </p>
              </div>
            </div>

            {user.phone && (
              <div>
                <label className={`block text-sm font-medium ${styles.textTertiary}`}>Mobile</label>
                <p className={`mt-1 text-sm ${styles.textPrimary}`}>{user.phone}</p>
              </div>
            )}

            <div>
              <label className={`block text-sm font-medium ${styles.textTertiary}`}>Last Login</label>
              <p className={`mt-1 text-sm ${styles.textPrimary}`}>
                {user.lastLogin ? formatDate(user.lastLogin) : "Never"}
              </p>
            </div>

            <div>
              <label className={`block text-sm font-medium ${styles.textTertiary}`}>Member Since</label>
              <p className={`mt-1 text-sm ${styles.textPrimary}`}>
                {user.createdAt ? formatDate(user.createdAt) : "Unknown"}
              </p>
            </div>

            {(user.billingCycle || user.planExpiry) && (
              <div className={`pt-4 border-t ${styles.borderPrimary}`}>
                <h4 className={`text-sm font-medium ${styles.textTertiary} mb-2`}>Subscription Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  {user.billingCycle && (
                    <div>
                      <label className={`block text-xs font-medium ${styles.textMuted}`}>Billing Cycle</label>
                      <p className={`mt-1 text-sm ${styles.textPrimary} capitalize`}>{user.billingCycle}</p>
                    </div>
                  )}
                  {user.planExpiry && (
                    <div>
                      <label className={`block text-xs font-medium ${styles.textMuted}`}>Plan Expiry</label>
                      <p className={`mt-1 text-sm ${styles.textPrimary}`}>{formatDate(user.planExpiry)}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className={`px-6 py-4 border-t ${styles.borderPrimary} ${styles.bgSecondary} flex justify-end`}>
          <button
            onClick={onClose}
            className={styles.buttonSecondary}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// UsersTab Component
const UsersTab = ({ data }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const safeUsers = data?.users || [];

  const getDisplayPlan = (user) => {
    if (user.planName && user.planName !== "Free") {
      return user.planName;
    }
    
    if (user.plan && typeof user.plan === 'object' && user.plan.name) {
      return user.plan.name;
    }
    
    if (typeof user.plan === 'string' && user.plan.length > 0) {
      return user.subscriptionStatus === "active" ? "Premium" : "Free";
    }
    
    return user.planName || "Free";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Never";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "active": return styles.badgeGreen;
      case "inactive": return styles.badgeGray;
      case "cancelled": return styles.badgeRed;
      case "expired": return styles.badgeOrange;
      default: return styles.badgeGray;
    }
  };

  const processedUsers = safeUsers.map(user => ({
    ...user,
    displayPlan: getDisplayPlan(user),
    formattedLastLogin: formatDate(user.lastLogin),
    formattedCreatedAt: formatDate(user.createdAt),
    statusColor: getStatusColor(user.subscriptionStatus)
  }));

  const filteredUsers = processedUsers.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.displayPlan?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlan = selectedPlan === "all" || 
                       user.displayPlan?.toLowerCase() === selectedPlan.toLowerCase();
    return matchesSearch && matchesPlan;
  });

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  const uniquePlans = Array.from(new Set(processedUsers.map(user => user.displayPlan)))
    .filter(plan => plan && plan !== "Free")
    .sort();

  const quickStats = [
    { 
      label: "Total Users", 
      value: safeUsers.length, 
      colorClass: styles.blueBorder
    },
    { 
      label: "Active Subs", 
      value: processedUsers.filter(u => u.subscriptionStatus === "active").length,
      colorClass: styles.greenBorder
    },
    { 
      label: "Premium Users", 
      value: processedUsers.filter(u => u.displayPlan !== "Free").length,
      colorClass: styles.purpleBorder
    },
    { 
      label: "Verified", 
      value: processedUsers.filter(u => u.isVerified).length,
      colorClass: styles.orangeBorder
    }
  ];

  return (
    <>
      <div className={styles.bgPrimary}>
        {/* Filter and Search Bar */}
        <div className={`${styles.card} p-4 mb-6`}>
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
            <div className="sm:w-48">
              <select
                value={selectedPlan}
                onChange={(e) => setSelectedPlan(e.target.value)}
                className={styles.select}
              >
                <option value="all">All Plans</option>
                <option value="free">Free</option>
                {uniquePlans.map(plan => (
                  <option key={plan} value={plan.toLowerCase()}>
                    {plan}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1 w-full sm:w-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search users by name, email, or plan..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={styles.input}
                  style={{ paddingLeft: '2.5rem' }}
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 absolute left-3 top-2.5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid (New section matching the screenshot's solid cards) */}
        <div className={styles.quickStatsGrid}>
          {quickStats.map((stat, index) => (
            <div 
              key={index} 
              className={`${styles.quickStatsCard} ${stat.colorClass}`}
            >
              <div className={`text-3xl font-bold ${styles.textPrimary} mb-1`}>{stat.value}</div>
              <div className={styles.textTertiary}>{stat.label}</div>
            </div>
          ))}
        </div>
        
        {/* Horizontal separator matching the screenshot */}
        <hr className={`mb-6 ${styles.borderPrimary}`} />

        <UserTable 
          users={filteredUsers} 
          totalUsers={safeUsers.length} 
          onViewUser={handleViewUser}
        />
      </div>

      <UserProfileModal 
        user={selectedUser}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </>
  );
};

// Main OverviewTab Component
export default function OverviewTab({ data }) {
  return (
    <div className={styles.container}>
      {/* Stats Grid */}
      <StatsGrid data={data} />
      
      {/* Recent Users */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <RecentUsers users={data?.users || []} />
        {/* You can add another component here for the second column */}
        <div className={styles.card}>
          <div className={`px-6 py-4 border-b ${styles.borderPrimary}`}>
            <h3 className={`text-lg font-medium ${styles.textPrimary}`}>Quick Actions</h3>
          </div>
          <div className="p-6">
            <p className={styles.textSecondary}>Additional overview content can go here.</p>
          </div>
        </div>
      </div>

      {/* Users Management Section */}
      <UsersTab data={data} />
    </div>
  );
}