// UserProfileModal.jsx
import React, { useEffect, useState } from "react";
import styles from "./UserProfileModal.module.css";

export default function UserProfileModal({ user, isOpen, onClose }) {
  const [copied, setCopied] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen || !user) return null;

  // --- Helpers ---
  const formatDate = (dateString) => {
    if (!dateString) return "Never";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const calculateDaysActive = (createdDate) => {
    if (!createdDate) return 0;
    const start = new Date(createdDate);
    const now = new Date();
    const diffTime = Math.abs(now - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
  };

  const getDisplayPlan = () => {
    if (user.planName && user.planName !== "Free") return user.planName;
    if (user.plan?.name) return user.plan.name;
    return user.subscriptionStatus === "active" ? "Premium" : "Free";
  };

  const handleCopyEmail = () => {
    if (user.email) {
      navigator.clipboard.writeText(user.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Status Badge Class
  const statusClass = styles[`status-${user.subscriptionStatus || "inactive"}`];

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        
        {/* 1. Header */}
        <div className={styles.modalHeader}>
          <h5 className={styles.title}>
            <i className="bi bi-person-lines-fill me-2 text-primary"></i>
            User Profile
          </h5>
          <button className={styles.closeBtn} onClick={onClose}>
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        {/* 2. Body */}
        <div className={styles.modalBody}>
          
          {/* Top Profile Section */}
          <div className={styles.profileHeader}>
            <div className={styles.avatarContainer}>
              {user.profilePicture ? (
                <img
                  className={`${styles.profileImage} rounded-circle`}
                  src={user.profilePicture}
                  alt={user.name}
                />
              ) : (
                <div className={`${styles.profilePlaceholder} rounded-circle d-flex align-items-center justify-content-center`}>
                  {user.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase()}
                </div>
              )}
            </div>
            
            <div className={styles.userHeadline}>
              <h3>{user.name || "No Name Provided"}</h3>
              <div className={styles.emailRow}>
                <i className="bi bi-envelope"></i>
                <span>{user.email}</span>
                <i 
                  className={`bi ${copied ? "bi-check-lg text-success" : "bi-copy"} ${styles.copyIcon} ms-2`} 
                  onClick={handleCopyEmail}
                  title="Copy Email"
                ></i>
              </div>
              <div className="d-flex gap-2 mt-2">
                 <span className={`${styles.badge} ${statusClass}`}>
                    {user.subscriptionStatus || "inactive"}
                 </span>
                 {user.isVerified && (
                    <span className={`${styles.badge}`} style={{background: 'rgba(13, 110, 253, 0.15)', color: '#0d6efd', border: '1px solid rgba(13, 110, 253, 0.2)'}}>
                        Verified
                    </span>
                 )}
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className={styles.infoGrid}>
            
            {/* Account Details */}
            <div className={styles.infoCard}>
              <div className={styles.cardTitle}>Account Overview</div>
              
              <div className={styles.dataRow}>
                <span className={styles.label}>Login Method</span>
                <span className={styles.value}>
                    <i className={`bi bi-${user.loginMethod === 'google' ? 'google' : user.loginMethod === 'github' ? 'github' : 'envelope'} me-2`}></i>
                    {user.loginMethod || "Email"}
                </span>
              </div>
              <div className={styles.dataRow}>
                <span className={styles.label}>User ID</span>
                <span className={styles.value} style={{fontSize: '0.8rem', opacity: 0.8}}>{user._id || "N/A"}</span>
              </div>
              <div className={styles.dataRow}>
                <span className={styles.label}>Mobile</span>
                <span className={styles.value}>{user.phone || "-"}</span>
              </div>
              <div className={styles.dataRow}>
                <span className={styles.label}>Member For</span>
                <span className={styles.value}>{calculateDaysActive(user.createdAt)} days</span>
              </div>
            </div>

            {/* Subscription & Activity */}
            <div className={styles.infoCard}>
              <div className={styles.cardTitle}>Plan & Activity</div>
              
              <div className={styles.dataRow}>
                <span className={styles.label}>Current Plan</span>
                <span className={styles.value} style={{color: '#ffc107'}}>{getDisplayPlan()}</span>
              </div>
              
              {(user.billingCycle || user.planExpiry) && (
                 <>
                    <div className={styles.dataRow}>
                        <span className={styles.label}>Billing Cycle</span>
                        <span className={styles.value}>{user.billingCycle || "N/A"}</span>
                    </div>
                    <div className={styles.dataRow}>
                        <span className={styles.label}>Expires</span>
                        <span className={styles.value}>{user.planExpiry ? formatDate(user.planExpiry).split(',')[0] : "N/A"}</span>
                    </div>
                 </>
              )}

              <hr style={{borderColor: 'rgba(255,255,255,0.1)', margin: '10px 0'}} />

              <div className={styles.dataRow}>
                <span className={styles.label}>Joined Date</span>
                <span className={styles.value}>{user.createdAt ? formatDate(user.createdAt).split(',')[0] : "Unknown"}</span>
              </div>
              <div className={styles.dataRow}>
                <span className={styles.label}>Last Login</span>
                <span className={styles.value}>{user.lastLogin ? formatDate(user.lastLogin) : "Never"}</span>
              </div>
            </div>

          </div>
        </div>

        {/* 3. Footer */}
        <div className={styles.modalFooter}>
          <button className={styles.actionBtn} onClick={onClose}>
            Done
          </button>
        </div>

      </div>
    </div>
  );
}