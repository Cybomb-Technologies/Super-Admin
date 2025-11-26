import React, { useState, useMemo } from "react";

export default function UserTable({ users = [], totalUsers = 0, onViewUser }) {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [selectedUsers, setSelectedUsers] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  console.log("📋 UserTable received users:", users);

  const sortedUsers = useMemo(() => {
    if (!Array.isArray(users)) return [];

    if (!sortConfig.key) return [...users];

    const sorted = [...users].sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      // Custom sort for "user" (name/email)
      if (sortConfig.key === "user") {
        aValue = a?.name || a?.email || "";
        bValue = b?.name || b?.email || "";
      }

      if (aValue == null) aValue = "";
      if (bValue == null) bValue = "";

      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [users, sortConfig]);

  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedUsers.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedUsers, currentPage]);

  const totalPages = Math.ceil((sortedUsers.length || 0) / itemsPerPage) || 1;

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const toggleSelectUser = (userId) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedUsers.size === paginatedUsers.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(paginatedUsers.map((user) => user._id)));
    }
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return "bi-arrow-down-up";
    return sortConfig.direction === "asc" ? "bi-arrow-up" : "bi-arrow-down";
  };

  const getStatusVariant = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "success";
      case "cancelled":
        return "danger";
      case "expired":
        return "warning";
      case "pending":
        return "info";
      default:
        return "secondary";
    }
  };

  const getLoginMethodVariant = (method) => {
    switch (method?.toLowerCase()) {
      case "github":
        return "dark";
      case "google":
        return "danger";
      case "facebook":
        return "primary";
      default:
        return "info";
    }
  };

  const getPlanBadge = (user) => {
    const isPremium = user.planName && user.planName !== "Free";
    return (
      <span className={`badge ${isPremium ? "bg-warning" : "bg-secondary"}`}>
        {user.planName || "Free"}
        {isPremium && <i className="bi bi-star-fill ms-1"></i>}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      return "Invalid Date";
    }
  };

  // ✅ Safe empty state (avoids map/slice on undefined)
  if (!Array.isArray(users) || users.length === 0) {
    return (
      <div className="card bg-dark border-secondary">
        <div className="card-body text-center py-5">
          <div>
            <i className="bi bi-people display-1 text-muted mb-3"></i>
            <h5 className="text-white mb-2">No users found</h5>
            <p className="text-muted mb-4">
              Users will appear here once they start using RankSEO.
            </p>
            <button className="btn btn-primary">
              <i className="bi bi-plus-circle me-2"></i>
              Add New User
            </button>
          </div>
        </div>
      </div>
    );
  }


}