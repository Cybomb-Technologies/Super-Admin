import React from "react";
import StatsGrid from "./StatsGrid";
import RecentUsers from "./RecentUsers";
import UserTable from "./UserTable";

// Data validation function - updated to match backend structure
const validateOverviewData = (data) => {
  console.log("🔍 OverviewTab received data:", data);
  
  // If data is null or undefined, return empty structure
  if (!data || typeof data !== "object") {
    console.log("❌ Invalid data received in OverviewTab, using fallback");
    return {
      users: [],
      activeUsers: 0,
      premiumUsers: 0,
      totalActivities: 0,
      uniqueUsers: 0,
      toolStats: {}
    };
  }

  console.log("✅ Valid OverviewTab data:", data);
  
  return {
    users: Array.isArray(data.users) ? data.users : [],
    activeUsers: Number(data.activeUsers) || 0,
    premiumUsers: Number(data.premiumUsers) || 0,
    totalActivities: Number(data.totalActivities) || 0,
    uniqueUsers: Number(data.uniqueUsers) || 0,
    toolStats: data.toolStats || {}
  };
};



export default function OverviewTab({ data }) {
  console.log("🎯 OverviewTab props:", { data });
  
  // Ensure data is always an object
  const safeData = data || {};
  const validatedData = validateOverviewData(safeData);
  const safeUsers = validatedData.users || [];

  console.log("📊 OverviewTab rendering with:", {
    users: safeUsers.length,
    activeUsers: validatedData.activeUsers,
    premiumUsers: validatedData.premiumUsers,
    totalActivities: validatedData.totalActivities,
    uniqueUsers: validatedData.uniqueUsers,
    toolStats: validatedData.toolStats
  });

  // Prepare summary data for StatsGrid
  const summaryData = {
    totalActivities: validatedData.totalActivities,
    uniqueUsers: validatedData.uniqueUsers,
    activeUsers: validatedData.activeUsers,
    premiumUsers: validatedData.premiumUsers
  };

  return (
    <div>
      {/* Top Stats Row */}
      <StatsGrid summary={summaryData} toolStats={validatedData.toolStats} />

      {/* Middle row: Recent Users + Quick Actions */}
      <div className="mt-4 mb-4">
        
          <RecentUsers users={safeUsers} />
     
       
        
      </div>

      {/* Bottom: User Table */}
      <div className="mt-4">
        <UserTable users={safeUsers} totalUsers={safeUsers.length} />
      </div>
    </div>
  );
}