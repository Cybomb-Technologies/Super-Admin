import React from "react";
import styles from "./styles.module.css";

export default function RecentUsers({ users = [] }) {
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
}