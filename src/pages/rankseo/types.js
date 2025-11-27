// types.js - Type definitions and validation functions for the admin dashboard

// User type definition and validation
export const User = {
  _id: String,
  email: String,
  name: String,
  plan: String,
  lastLogin: String,
  usage: Number,
  mobile: String,
  profilePicture: String,
  createdAt: String,
  isVerified: Boolean,
  loginMethod: String,
  planName: String,
  subscriptionStatus: String,
  billingCycle: String,
  planExpiry: String,
  phone: String
};

// User data validation function
export const validateUserData = (userData) => {
  if (!userData) return null;
  
  return {
    _id: userData._id || userData.id || '',
    email: userData.email || '',
    name: userData.name || userData.username || '',
    plan: userData.plan || '',
    lastLogin: userData.lastLogin || userData.last_login || '',
    usage: Number(userData.usage) || 0,
    mobile: userData.mobile || userData.phone || '',
    profilePicture: userData.profilePicture || userData.profile_picture || userData.avatar || '',
    createdAt: userData.createdAt || userData.created_at || userData.registrationDate || '',
    isVerified: Boolean(userData.isVerified || userData.verified || false),
    loginMethod: userData.loginMethod || userData.login_method || userData.auth_method || 'email',
    planName: userData.planName || userData.plan_name || userData.subscription_plan || 'Free',
    subscriptionStatus: userData.subscriptionStatus || userData.subscription_status || userData.status || 'inactive',
    billingCycle: userData.billingCycle || userData.billing_cycle || '',
    planExpiry: userData.planExpiry || userData.plan_expiry || userData.subscription_end || '',
    phone: userData.phone || userData.mobile || userData.contact_number || ''
  };
};

// Audit Log type definition and validation
export const AuditLog = {
  _id: String,
  userEmail: String,
  email: String,
  userId: String,
  user: {
    email: String,
    name: String
  },
  url: String,
  path: String,
  endpoint: String,
  uri: String,
  action: String,
  type: String,
  event: String,
  timestamp: String,
  time: String,
  createdAt: String,
  date: String,
  tool: String,
  userName: String
};

// Audit log validation function
export const validateAuditLog = (logData) => {
  if (!logData) return null;
  
  return {
    _id: logData._id || logData.id || '',
    userEmail: logData.userEmail || logData.user_email || logData.email || '',
    email: logData.email || logData.userEmail || logData.user_email || '',
    userId: logData.userId || logData.user_id || '',
    user: logData.user || {
      email: logData.userEmail || logData.user_email || logData.email || '',
      name: logData.userName || logData.user_name || ''
    },
    url: logData.url || logData.uri || logData.path || logData.endpoint || '',
    path: logData.path || logData.url || logData.endpoint || '',
    endpoint: logData.endpoint || logData.path || logData.url || '',
    uri: logData.uri || logData.url || '',
    action: logData.action || logData.type || logData.event || '',
    type: logData.type || logData.action || logData.event || '',
    event: logData.event || logData.action || logData.type || '',
    timestamp: logData.timestamp || logData.time || logData.createdAt || logData.date || '',
    time: logData.time || logData.timestamp || logData.createdAt || '',
    createdAt: logData.createdAt || logData.created_at || logData.timestamp || logData.date || '',
    date: logData.date || logData.createdAt || logData.timestamp || '',
    tool: logData.tool || logData.tool_name || 'seo_audit',
    userName: logData.userName || logData.user_name || logData.user?.name || ''
  };
};

// Tool Data type definition and validation
export const ToolData = {
  _id: String,
  tool: String,
  action: String,
  timestamp: [String, Date],
  industry: String,
  topic: String,
  domain: String,
  nameCount: Number,
  keywordCount: Number,
  userEmail: String,
  userName: String,
  mainUrl: String,
  stylePreference: String,
  sessionId: String,
  reportId: String,
  totalScraped: Number,
  analysisType: String,
  totalPagesScraped: Number,
  totalKeywordsFound: Number,
  primaryKeywords: Number,
  totalSearchVolume: Number,
  averageCPC: Number,
  audience: String,
  generatedAt: String
};

// Tool data validation function
export const validateToolData = (toolData) => {
  if (!toolData) return null;
  
  return {
    _id: toolData._id || toolData.id || '',
    tool: toolData.tool || toolData.tool_name || '',
    action: toolData.action || toolData.event || toolData.type || '',
    timestamp: toolData.timestamp || toolData.createdAt || toolData.date || '',
    industry: toolData.industry || toolData.category || '',
    topic: toolData.topic || toolData.subject || '',
    domain: toolData.domain || toolData.website || toolData.url || '',
    nameCount: Number(toolData.nameCount) || Number(toolData.name_count) || 0,
    keywordCount: Number(toolData.keywordCount) || Number(toolData.keyword_count) || 0,
    userEmail: toolData.userEmail || toolData.user_email || toolData.email || '',
    userName: toolData.userName || toolData.user_name || toolData.user?.name || '',
    mainUrl: toolData.mainUrl || toolData.main_url || toolData.url || toolData.domain || '',
    stylePreference: toolData.stylePreference || toolData.style_preference || toolData.preference || '',
    sessionId: toolData.sessionId || toolData.session_id || '',
    reportId: toolData.reportId || toolData.report_id || '',
    totalScraped: Number(toolData.totalScraped) || Number(toolData.total_scraped) || 0,
    analysisType: toolData.analysisType || toolData.analysis_type || toolData.type || '',
    totalPagesScraped: Number(toolData.totalPagesScraped) || Number(toolData.total_pages_scraped) || 0,
    totalKeywordsFound: Number(toolData.totalKeywordsFound) || Number(toolData.total_keywords_found) || 0,
    primaryKeywords: Number(toolData.primaryKeywords) || Number(toolData.primary_keywords) || 0,
    totalSearchVolume: Number(toolData.totalSearchVolume) || Number(toolData.total_search_volume) || 0,
    averageCPC: Number(toolData.averageCPC) || Number(toolData.average_cpc) || 0,
    audience: toolData.audience || toolData.target_audience || '',
    generatedAt: toolData.generatedAt || toolData.generated_at || toolData.createdAt || ''
  };
};

export const BusinessNameData = {
  ...ToolData
};

export const KeycheckData = {
  ...ToolData
};

export const KeyScrapeData = {
  ...ToolData
};

export const KeywordData = {
  ...ToolData
};

// Dashboard Data type definition
export const DashboardData = {
  totalActivities: Number,
  uniqueUsers: Number,
  activeUsers: Number,
  premiumUsers: Number,
  toolStats: {
    seo_audit: Number,
    business_name_generator: Number,
    keyword_checker: Number,
    keyword_scraper: Number,
    keyword_generator: Number
  },
  auditData: Array,
  businessNameData: Array,
  keycheckData: Array,
  keyScrapeData: Array,
  keywordData: Array,
  allToolData: Array,
  users: Array,
  totalLogins: Number
};

// Dashboard data validation function
export const validateDashboardData = (dashboardData) => {
  if (!dashboardData) return null;
  
  // Process users array
  const users = Array.isArray(dashboardData.users) 
    ? dashboardData.users.map(user => validateUserData(user)).filter(Boolean)
    : [];
  
  // Process audit data array
  const auditData = Array.isArray(dashboardData.auditData) 
    ? dashboardData.auditData.map(log => validateAuditLog(log)).filter(Boolean)
    : [];
  
  // Process tool data arrays
  const processToolData = (dataArray) => {
    return Array.isArray(dataArray) 
      ? dataArray.map(item => validateToolData(item)).filter(Boolean)
      : [];
  };

  return {
    totalLogins: Number(dashboardData.totalLogins) || Number(dashboardData.total_logins) || 0,
    uniqueUsers: Number(dashboardData.uniqueUsers) || Number(dashboardData.unique_users) || users.length,
    activeUsers: Number(dashboardData.activeUsers) || Number(dashboardData.active_users) || 0,
    premiumUsers: Number(dashboardData.premiumUsers) || Number(dashboardData.premium_users) || 0,
    totalActivities: Number(dashboardData.totalActivities) || Number(dashboardData.total_activities) || 0,
    auditData: auditData,
    businessNameData: processToolData(dashboardData.businessNameData || dashboardData.business_name_data),
    keycheckData: processToolData(dashboardData.keycheckData || dashboardData.keycheck_data),
    keyScrapeData: processToolData(dashboardData.keyScrapeData || dashboardData.key_scrape_data),
    keywordData: processToolData(dashboardData.keywordData || dashboardData.keyword_data),
    allToolData: processToolData(dashboardData.allToolData || dashboardData.all_tool_data),
    users: users,
    toolStats: {
      seo_audit: Number(dashboardData.toolStats?.seo_audit) || Number(dashboardData.tool_stats?.seo_audit) || 0,
      business_name_generator: Number(dashboardData.toolStats?.business_name_generator) || Number(dashboardData.tool_stats?.business_name_generator) || 0,
      keyword_checker: Number(dashboardData.toolStats?.keyword_checker) || Number(dashboardData.tool_stats?.keyword_checker) || 0,
      keyword_scraper: Number(dashboardData.toolStats?.keyword_scraper) || Number(dashboardData.tool_stats?.keyword_scraper) || 0,
      keyword_generator: Number(dashboardData.toolStats?.keyword_generator) || Number(dashboardData.tool_stats?.keyword_generator) || 0
    }
  };
};

export const ToolFilter = {
  value: String,
  label: String
};

export const PaginationInfo = {
  page: Number,
  limit: Number,
  total: Number,
  pages: Number
};

export const ToolDataResponse = {
  data: Array,
  pagination: PaginationInfo
};

export const ActivitySummary = {
  date: String,
  seo_audit: Number,
  business_name_generator: Number,
  keyword_checker: Number,
  keyword_scraper: Number,
  keyword_generator: Number,
  total: Number
};

export const UserActivity = {
  userId: String,
  email: String,
  name: String,
  totalActivities: Number,
  lastActivity: String,
  toolsUsed: Array,
  activityBreakdown: {
    seo_audit: Number,
    business_name_generator: Number,
    keyword_checker: Number,
    keyword_scraper: Number,
    keyword_generator: Number
  }
};