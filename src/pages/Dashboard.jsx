import React from 'react'
import styles from './Dashboard.module.css'

export default function Dashboard() {
  // Project data with icons and status
  const projects = [
    {
      id: 1,
      name: "Cybomb Technologies",
      description: "Advanced cybersecurity solutions and threat intelligence platform providing enterprise-grade protection",
      type: "projectCybomb",
      icon: "🛡️",
      status: "Active"
    },
    {
      id: 2,
      name: "Aitals Technologies",
      description: "AI-powered talent acquisition and management system revolutionizing HR processes",
      type: "projectAitals",
      icon: "🤖",
      status: "Active"
    },
    {
      id: 3,
      name: "PDF Works",
      description: "Comprehensive PDF processing suite with advanced editing and conversion capabilities",
      type: "projectPDF",
      icon: "📄",
      status: "Development"
    },
    {
      id: 4,
      name: "Rank SEO",
      description: "Search engine optimization platform with real-time analytics and AI-driven insights",
      type: "projectRankSEO",
      icon: "📈",
      status: "Active"
    },
    {
      id: 5,
      name: "Social Media",
      description: "All-in-one social media management platform with scheduling and analytics",
      type: "projectSocialMedia",
      icon: "📱",
      status: "Active"
    },
    {
      id: 6,
      name: "Startup Builder",
      description: "Complete ecosystem for startup development, funding, and growth management",
      type: "projectStartup",
      icon: "🚀",
      status: "Development"
    },
    {
      id: 7,
      name: "DJIT Trading",
      description: "Advanced algorithmic trading platform with real-time market analysis",
      type: "projectDjit",
      icon: "💹",
      status: "Active"
    },
    {
      id: 8,
      name: "HRMS",
      description: "Enterprise Human Resource Management System with payroll and performance tracking",
      type: "projectHRMS",
      icon: "👥",
      status: "Active"
    }
  ]

  const handleProjectClick = (projectName) => {
    console.log(`Navigating to ${projectName}`);
    // Add your navigation logic here
  }

  const getStatusClass = (status) => {
    return status === "Active" ? styles.statusActive : styles.statusDevelopment;
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>Cybomb Project</h1>
        {/* <p className={styles.subtitle}>
          Explore our innovative digital solutions and technology platforms designed to transform businesses
        </p> */}
      </div>

      {/* Projects Section */}
      <div className={styles.projectsSection}>
        {/* <h2 className={styles.sectionTitle}>Featured Projects</h2> */}
        <div className={styles.projectsGrid}>
          {projects.map((project, index) => (
            <div 
              key={project.id}
              className={`${styles.projectCard} ${styles[project.type]}`}
              onClick={() => handleProjectClick(project.name)}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={styles.projectIcon}>
                {project.icon}
              </div>
              <h3 className={styles.projectName}>{project.name}</h3>
              <p className={styles.projectDescription}>{project.description}</p>
              <span className={`${styles.projectStatus} ${getStatusClass(project.status)}`}>
                {project.status}
              </span>
            </div>
          ))}
        </div>
      </div>
      {/* Footer */}
      <div className={styles.footer}>
        <p className={styles.footerText}>
          {projects.length} Active Projects • Last Updated: {new Date().toLocaleDateString()}
        </p>
      </div>
    </div>
  )
}