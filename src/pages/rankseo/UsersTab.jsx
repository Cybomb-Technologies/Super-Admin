"use client";
import React, { useState } from "react";
import UserTable from "./UserTable";
import UserProfileModal from "./UserProfileModal";
import styles from "./styles.module.css";

export default function UsersTab({ data }) {
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
      colorClass: styles.blueBorder // Custom class for card border
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
}