import React from "react";
import styles from "./styles.module.css";

export default function StatsGrid({ data }) {
  if (!data) {
    return (
      <div className={styles.statsGrid}>
        {[...Array(4)].map((_, index) => (
          // Adjusted placeholder to use generic loading style
          <div key={index} className={`${styles.statsCard} ${styles.loading}`}>
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

  // We are using the styles.statsCard which has a default left border-l-4, 
  // so we just need the color class for that border.
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
}