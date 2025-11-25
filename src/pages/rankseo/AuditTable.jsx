"use client";
import React from "react";
import styles from "./styles.module.css";

export default function AuditTable({ 
  auditLogs, 
  totalLogs, 
  users = [], 
  showToolColumn = true 
}) {
  const safeAuditLogs = auditLogs || [];
  const safeTotalLogs = totalLogs || 0;
  const safeUsers = users || [];

  const findUserForLog = (log) => {
    if ('userId' in log && log.userId) {
      const user = safeUsers.find(user => user._id === log.userId);
      if (user) return user;
    }
    
    if ('userEmail' in log && log.userEmail) {
      const user = safeUsers.find(user => user.email === log.userEmail);
      if (user) return user;
    }
    
    if ('email' in log && log.email) {
      const user = safeUsers.find(user => user.email === log.email);
      if (user) return user;
    }
    
    return null;
  };

  const getActionColor = (action, tool = '') => {
    const actionLower = action ? action.toLowerCase() : '';
    const toolLower = tool ? tool.toLowerCase() : '';
    
    if (actionLower.includes('login') || actionLower.includes('signin')) {
      return styles.badgeGreen;
    } else if (actionLower.includes('logout') || actionLower.includes('signout')) {
      return styles.badgeRed;
    } else if (actionLower.includes('register') || actionLower.includes('signup')) {
      return styles.badgeBlue;
    } else if (actionLower.includes('error') || actionLower.includes('fail')) {
      return styles.badgeRed;
    } else if (actionLower.includes('create') || actionLower.includes('add') || actionLower.includes('generate')) {
      return styles.badgePurple;
    } else if (actionLower.includes('update') || actionLower.includes('edit')) {
      return styles.badgeYellow;
    } else if (actionLower.includes('delete') || actionLower.includes('remove')) {
      return styles.badgeRed;
    } else if (actionLower.includes('seo_audit') || actionLower.includes('audit') || toolLower.includes('seo_audit')) {
      return styles.badgeIndigo;
    } else if (actionLower.includes('name_generation') || toolLower.includes('business_name')) {
      return styles.badgePink;
    } else if (actionLower.includes('keyword_analysis') || toolLower.includes('keyword_checker')) {
      return styles.badgeOrange;
    } else if (actionLower.includes('keyword_scraping') || toolLower.includes('keyword_scraper')) {
      return styles.badgeCyan;
    } else if (actionLower.includes('keyword_generation') || toolLower.includes('keyword_generator')) {
      return styles.badgeTeal;
    } else if (actionLower.includes('page_view') || actionLower.includes('view')) {
      return styles.badgeGray;
    } else {
      return styles.badgeGray;
    }
  };

  const formatAction = (action, tool = '') => {
    const actionMap = {
      'page_view': 'Page View',
      'login': 'Login',
      'logout': 'Logout',
      'register': 'Register',
      'create': 'Create',
      'update': 'Update',
      'delete': 'Delete',
      'seo_audit': 'SEO Audit',
      'name_generation': 'Name Generation',
      'keyword_analysis': 'Keyword Analysis',
      'keyword_scraping': 'Keyword Scraping',
      'keyword_generation': 'Keyword Generation'
    };
    
    return actionMap[action] || action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatToolName = (tool) => {
    const toolMap = {
      'seo_audit': 'SEO Audit',
      'business_name_generator': 'Business Name Generator',
      'keyword_checker': 'Keyword Checker',
      'keyword_scraper': 'Keyword Scraper',
      'keyword_generator': 'Keyword Generator'
    };
    
    return toolMap[tool] || tool.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getDisplayUrl = (log) => {
    if ('url' in log && log.url) return log.url;
    if ('mainUrl' in log && log.mainUrl) return log.mainUrl;
    if ('path' in log && log.path) return log.path;
    if ('endpoint' in log && log.endpoint) return log.endpoint;
    if ('uri' in log && log.uri) return log.uri;
    
    if ('tool' in log) {
      switch (log.tool) {
        case 'business_name_generator':
          return `Industry: ${('industry' in log && log.industry) || 'N/A'}, Style: ${('stylePreference' in log && log.stylePreference) || 'N/A'}`;
        case 'keyword_generator':
          return `Topic: ${('topic' in log && log.topic) || 'N/A'}, Industry: ${('industry' in log && log.industry) || 'N/A'}`;
        case 'keyword_checker':
        case 'keyword_scraper':
          return `URL: ${('mainUrl' in log && log.mainUrl) || 'N/A'}`;
        default:
          return 'No URL available';
      }
    }
    
    return 'No URL available';
  };

  const getTimestamp = (log) => {
    if ('timestamp' in log && log.timestamp) return log.timestamp;
    if ('createdAt' in log && log.createdAt) return log.createdAt;
    if ('time' in log && log.time) return log.time;
    if ('date' in log && log.date) return log.date;
    if ('generatedAt' in log && log.generatedAt) return log.generatedAt;
    return null;
  };

  return (
    <div className={styles.card}>
      <div className={`px-6 py-4 border-b ${styles.borderPrimary} flex justify-between items-center`}>
        <h3 className={`text-lg font-medium ${styles.textPrimary}`}>
          Activity Logs ({safeAuditLogs.length})
        </h3>
        <span className={`text-sm ${styles.textTertiary}`}>
          Total: {safeTotalLogs} activities
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className={styles.table}>
          <thead className={styles.tableHeader}>
            <tr>
              <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${styles.textTertiary} uppercase tracking-wider`}>
                User
              </th>
              <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${styles.textTertiary} uppercase tracking-wider`}>
                Action
              </th>
              {showToolColumn && (
                <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${styles.textTertiary} uppercase tracking-wider`}>
                  Tool
                </th>
              )}
              <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${styles.textTertiary} uppercase tracking-wider`}>
                Details
              </th>
              <th scope="col" className={`px-6 py-3 text-left text-xs font-medium ${styles.textTertiary} uppercase tracking-wider`}>
                Timestamp
              </th>
            </tr>
          </thead>
          <tbody className={styles.bgCard}>
            {safeAuditLogs.length === 0 ? (
              <tr>
                <td colSpan={showToolColumn ? 5 : 4} className={`px-6 py-8 text-center ${styles.textTertiary}`}>
                  No activity logs found matching your criteria.
                </td>
              </tr>
            ) : (
              safeAuditLogs.map((item, idx) => {
                const action = ('action' in item && item.action) || ('type' in item && item.type) || ('event' in item && item.event) || 'activity';
                const tool = ('tool' in item && item.tool) || 'seo_audit';
                const url = getDisplayUrl(item);
                const user = findUserForLog(item);
                const displayName = ('userName' in item && item.userName) || user?.name || 'Anonymous User';
                const displayEmail = ('userEmail' in item && item.userEmail) || user?.email || ('email' in item && item.email) || 'Unknown';
                const timestamp = getTimestamp(item);

                return (
                  <tr key={item._id || idx} className={styles.tableRow}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {user ? (
                          <>
                            {user.profilePicture ? (
                              <img
                                src={user.profilePicture}
                                alt={user.name}
                                className={`h-8 w-8 ${styles.avatar}`}
                              />
                            ) : (
                              <div className={`h-8 w-8 ${styles.avatarPlaceholder} flex items-center justify-center text-sm font-medium`}>
                                {user.name?.charAt(0) || 'U'}
                              </div>
                            )}
                            <div className="ml-3">
                              <div className={`text-sm font-medium ${styles.textPrimary}`}>
                                {displayName}
                              </div>
                              <div className={`text-xs ${styles.textTertiary}`}>
                                {displayEmail}
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className="flex items-center">
                            <div className={`h-8 w-8 ${styles.avatarPlaceholder} flex items-center justify-center text-sm font-medium`}>
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                              </svg>
                            </div>
                            <div className="ml-3">
                              <div className={`text-sm font-medium ${styles.textPrimary}`}>
                                {displayName}
                              </div>
                              <div className={`text-xs ${styles.textMuted}`}>
                                {displayEmail}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getActionColor(action, tool)}`}
                        title={`Action: ${action}`}
                      >
                        {formatAction(action)}
                      </span>
                    </td>
                    {showToolColumn && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 ${styles.badgeGray} rounded text-xs`}>
                          {formatToolName(tool)}
                        </span>
                      </td>
                    )}
                    <td className="px-6 py-4 text-sm break-words max-w-md">
                      <div className={`truncate ${styles.textPrimary}`} title={url}>
                        {url}
                      </div>
                      {url.length > 50 && (
                        <div className={`text-xs ${styles.textMuted} mt-1`}>
                          {url.substring(0, 50)}...
                        </div>
                      )}
                      {tool === 'business_name_generator' && 'nameCount' in item && (
                        <div className={`text-xs ${styles.textTertiary} mt-1`}>
                          {item.nameCount} names generated
                        </div>
                      )}
                      {tool === 'keyword_generator' && 'keywordCount' in item && (
                        <div className={`text-xs ${styles.textTertiary} mt-1`}>
                          {item.keywordCount} keywords generated
                        </div>
                      )}
                      {(tool === 'keyword_checker' || tool === 'keyword_scraper') && 'keywordCount' in item && (
                        <div className={`text-xs ${styles.textTertiary} mt-1`}>
                          {item.keywordCount} keywords found
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {timestamp ? (
                        <>
                          <div className={styles.textPrimary}>{new Date(timestamp).toLocaleDateString()}</div>
                          <div className={`text-xs ${styles.textMuted}`}>
                            {new Date(timestamp).toLocaleTimeString()}
                          </div>
                        </>
                      ) : (
                        <span className={styles.textMuted}>No timestamp</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}