"use client";
import React from "react";
import styles from "./styles.module.css";

export default function UserTable({ users, totalUsers, onViewUser }) {
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
}