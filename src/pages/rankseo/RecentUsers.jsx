import { useState } from "react";
import styles from "./RecentUsers.module.css";

export default function RecentUsers({ users = [] }) {
  const [expandedUser, setExpandedUser] = useState(null);
  const recentUsers = Array.isArray(users) ? users.slice(0, 5) : [];

  return (
    <div className={styles.wrapper}>
<div className={`card bg-dark border-secondary h-100 ${styles.recentCard}`}>
      {/* Added px-4 to align header text with list items */}
      <div className="card-header border-secondary bg-transparent py-3 px-4 d-flex justify-content-between align-items-center">
        <div>
          <h5 className="card-title mb-0 text-white fw-bold">Recent Users</h5>
        </div>
        <span className="badge bg-primary bg-opacity-20 text-white border border-primary border-opacity-20 px-3 py-2 rounded-pill">
          {recentUsers.length} New
        </span>
      </div>

      <div className="card-body p-0 d-flex flex-column">
        {recentUsers.length === 0 ? (
          <div className="text-center py-5 m-auto">
            <i className="bi bi-people display-6 text-white mb-3 d-block"></i>
            <span className="text-white">No recent registrations</span>
          </div>
        ) : (
          <div className="d-flex flex-column gap-1 p-2">
            {recentUsers.map((user) => (
              <div
                key={user._id}
                className={`${styles.userItem} ${expandedUser === user._id ? styles.activeItem : ''}`}
                onClick={() => setExpandedUser(expandedUser === user._id ? null : user._id)}
              >
                <div className="d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center">
                    <div className="position-relative me-3">
                      {user.profilePicture ? (
                        <img src={user.profilePicture} alt="" className={styles.avatar} />
                      ) : (
                        <div className={styles.avatarPlaceholder}>
                          {user.name?.charAt(0) || user.email?.charAt(0)}
                        </div>
                      )}
                      {user.isVerified && <span className={styles.verifiedDot}></span>}
                    </div>
                    <div>
                      <h6 className="text-white mb-0 font-sm fw-semibold">{user.name || "User"}</h6>
                      <div className="text-white extra-small">{user.email}</div>
                    </div>
                  </div>
                  <i className={`bi bi-chevron-right text-white small transition-transform ${expandedUser === user._id ? 'rotate-90' : ''}`}></i>
                </div>

                {/* Expanded Details */}
                {expandedUser === user._id && (
                  <div className={styles.expandedDetails}>
                    <div className="d-flex justify-content-between mb-1">
                      <span className="text-white">Plan:</span>
                      <span className="text-white">{user.planName || "Free"}</span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span className="text-white">Joined:</span>
                      <span className="text-white">{new Date(user.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>

    </div>
    
  );
}