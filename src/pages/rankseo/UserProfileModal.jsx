"use client";
import React from "react";
import styles from "./styles.module.css";

export default function UserProfileModal({ user, isOpen, onClose }) {
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
}