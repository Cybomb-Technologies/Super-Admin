import styles from "./StatsGrid.module.css";

export default function StatsGrid({ summary = {}, toolStats = {} }) {
  const {
    totalActivities = 0,
    uniqueUsers = 0,
    activeUsers = 0,
    premiumUsers = 0,
  } = summary;

  const {
    seo_audit = 0,
    keyword_checker = 0,
    keyword_scraper = 0,
    business_name_generator = 0,
    keyword_generator = 0
  } = toolStats;

  const topCards = [
    {
      label: "Total Activities",
      value: totalActivities,
      subtitle: "All tool runs combined",
      icon: "bi-activity",
      trend: "+12%",
      // Applying dynamic inline styles for gradients based on CSS module logic usually, 
      // but here we use the specific classes if defined or mapped styles
      style: { background: 'radial-gradient(circle at top left, #1e3a8a, #0f172a)', borderColor: '#1d4ed8' },
      iconColor: '#60a5fa'
    },
    {
      label: "Unique Users",
      value: uniqueUsers,
      subtitle: "Distinct user accounts",
      icon: "bi-people",
      trend: "+5%",
      style: { background: 'radial-gradient(circle at top left, #064e3b, #022c22)', borderColor: '#059669' },
      iconColor: '#34d399'
    },
    {
      label: "Active Users",
      value: activeUsers,
      subtitle: "Recently active",
      icon: "bi-person-check",
      trend: "+8%",
      style: { background: 'radial-gradient(circle at top left, #0891b2, #164e63)', borderColor: '#0891b2' },
      iconColor: '#22d3ee'
    },
    {
      label: "Premium Users",
      value: premiumUsers,
      subtitle: "On paid plans",
      icon: "bi-star",
      trend: "+15%",
      style: { background: 'radial-gradient(circle at top left, #a16207, #422006)', borderColor: '#d97706' },
      iconColor: '#fbbf24'
    },
  ];

  const toolCards = [
    { label: "SEO Audits", value: seo_audit, icon: "bi-search", color: "info", desc: "Website analysis" },
    { label: "Keyword Checks", value: keyword_checker, icon: "bi-check-circle", color: "success", desc: "Competition analysis" },
    { label: "Keyword Scrapes", value: keyword_scraper, icon: "bi-collection", color: "primary", desc: "Data extraction" },
    { label: "Business Names", value: business_name_generator, icon: "bi-building", color: "warning", desc: "Name generation" },
    { label: "Keyword Gen", value: keyword_generator, icon: "bi-lightbulb", color: "purple", desc: "Idea generation" },
  ];

  return (
    <div className={styles.wrapper}>
      {/* Main Statistics - Using CSS Grid from Module */}
      <section>
        <h6 className="text-uppercase text-white fw-bold mb-3 small tracking-wide">Overview</h6>
        <div className={styles.grid}>
          {topCards.map((card) => (
            <div key={card.label} className={styles.card} style={card.style}>
              <div className="d-flex justify-content-between align-items-start w-100">
                <span className={styles.cardLabel} style={{ color: 'rgba(255,255,255,0.7)' }}>{card.label}</span>
                <span className="badge bg-white bg-opacity-10 text-white backdrop-blur-sm rounded-pill px-2 py-1 small">
                  {card.trend}
                </span>
              </div>
              
              <div className="d-flex align-items-end justify-content-between mt-2">
                <div>
                  <div className={styles.cardValue}>{card.value.toLocaleString()}</div>
                  <div className={styles.cardSubtitle} style={{ color: 'rgba(255,255,255,0.5)' }}>{card.subtitle}</div>
                </div>
                <i className={`bi ${card.icon}`} style={{ fontSize: '2.5rem', color: card.iconColor, opacity: 0.2 }}></i>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Tool Usage Statistics */}
      <section>
        <div className="d-flex justify-content-between align-items-end mb-3">
          <h6 className="text-uppercase text-white fw-bold mb-0 small tracking-wide">
            <i className="bi bi-tools me-2"></i>Tool Usage Statistics
          </h6>
          <span className="badge bg-dark border border-secondary text-white">Last 30 days</span>
        </div>

        <div className={styles.gridTools}>
          {toolCards.map((card) => (
            <div key={card.label} className={styles.toolCard}>
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div className={`text-${card.color} bg-${card.color} bg-opacity-10 rounded p-2`}>
                  <i className={`bi ${card.icon} fs-5`}></i>
                </div>
                <span className={styles.toolValue}>{card.value.toLocaleString()}</span>
              </div>
              
              <div className="mt-1">
                <div className={styles.toolLabel} style={{ color: '#fff' }}>{card.label}</div>
                <div className="small opacity-50 text-white" style={{ fontSize: '0.75rem' }}>{card.desc}</div>
              </div>

              {/* Progress Bar */}
              <div className="progress mt-3" style={{ height: '4px', backgroundColor: 'rgba(255,255,255,0.05)' }}>
                <div 
                  className={`progress-bar bg-${card.color}`} 
                  role="progressbar" 
                  style={{ width: `${Math.min((card.value / (totalActivities || 1)) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}