// lib/dashboardApi.js
export function normalizeDashboardData(raw) {
  if (!raw || typeof raw !== "object") {
    return {
      totalActivities: 0,
      uniqueUsers: 0,
      activeUsers: 0,
      premiumUsers: 0,
      toolStats: {},
      users: [],
      auditData: [],
      businessNameData: [],
      keycheckData: [],
      keyScrapeData: [],
      keywordData: [],
      allToolData: [],
      raw,
    };
  }

  return {
    totalActivities: Number(raw.totalActivities ?? 0),
    uniqueUsers: Number(
      raw.uniqueUsers ??
        (Array.isArray(raw.users) ? raw.users.length : 0)
    ),
    activeUsers: Number(raw.activeUsers ?? 0),
    premiumUsers: Number(raw.premiumUsers ?? 0),
    toolStats: raw.toolStats || {},
    users: Array.isArray(raw.users) ? raw.users : [],
    auditData: Array.isArray(raw.auditData) ? raw.auditData : [],
    businessNameData: Array.isArray(raw.businessNameData)
      ? raw.businessNameData
      : [],
    keycheckData: Array.isArray(raw.keycheckData) ? raw.keycheckData : [],
    keyScrapeData: Array.isArray(raw.keyScrapeData) ? raw.keyScrapeData : [],
    keywordData: Array.isArray(raw.keywordData) ? raw.keywordData : [],
    allToolData: Array.isArray(raw.allToolData) ? raw.allToolData : [],
    raw,
  };
}

export async function fetchDashboardDataFromAPI() {
  try {
    // No auth, direct hit to your backend
    const res = await fetch("/api/admin/dashboard", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      // If this is Next.js client component, leave cache alone / default
    });

    if (!res.ok) {
      console.error("[Dashboard API] Failed:", res.status, res.statusText);
      return null;
    }

    const raw = await res.json();
    return normalizeDashboardData(raw);
  } catch (err) {
    console.error("[Dashboard API] Error:", err);
    return null;
  }
}
