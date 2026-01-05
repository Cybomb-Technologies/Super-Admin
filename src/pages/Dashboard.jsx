import React from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import styles from './Dashboard.module.css'

export default function Dashboard() {
  const navigate = useNavigate()

  // Project data with icons, status, and target routes
  const projects = [
    {
      id: 1,
      name: "Cybomb Technologies",
      description: "Advanced cybersecurity solutions and threat intelligence platform providing enterprise-grade protection",
      type: "projectCybomb",
      icon: "🛡️",
      status: "Active",
      path: "/cybomb/dashboard-overview"
    },
    {
      id: 2,
      name: "Aitals Technologies",
      description: "AI-powered talent acquisition and management system revolutionizing HR processes",
      type: "projectAitals",
      icon: "🤖",
      status: "Active",
      path: "/aitals/dashboard"
    },
    {
      id: 3,
      name: "PDF Works",
      description: "Comprehensive PDF processing suite with advanced editing and conversion capabilities",
      type: "projectPDF",
      icon: "📄",
      status: "Development",
      path: "/pdf-works/dashboard"
    },
    {
      id: 4,
      name: "Rank SEO",
      description: "Search engine optimization platform with real-time analytics and AI-driven insights",
      type: "projectRankSEO",
      icon: "📈",
      status: "Active",
      path: "/rankseo/dashboard"
    },
    {
      id: 5,
      name: "Social Media",
      description: "All-in-one social media management platform with scheduling and analytics",
      type: "projectSocialMedia",
      icon: "📱",
      status: "Active",
      path: "/social-media/dashboard"
    },
    {
      id: 6,
      name: "Startup Builder",
      description: "Complete ecosystem for startup development, funding, and growth management",
      type: "projectStartup",
      icon: "🚀",
      status: "Development",
      path: null // Coming Soon
    },
    {
      id: 7,
      name: "DJIT Trading",
      description: "Advanced algorithmic trading platform with real-time market analysis",
      type: "projectDjit",
      icon: "💹",
      status: "Active",
      path: "/djittrading/dashboard"
    },
    {
      id: 8,
      name: "HRMS",
      description: "Enterprise Human Resource Management System with payroll and performance tracking",
      type: "projectHRMS",
      icon: "👥",
      status: "Active",
      path: null // Coming Soon
    }
  ]

  const handleProjectClick = (project) => {
    if (project.path) {
      navigate(project.path)
    } else {
      toast.info(`${project.name} is coming soon!`, {
        description: "We're currently building this module. Stay tuned!",
        duration: 3000,
      })
    }
  }

  const getStatusClass = (status) => {
    return status === "Active" ? styles.statusActive : styles.statusDevelopment;
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>Cybomb Project</h1>
      </div>

      {/* Projects Section */}
      <div className={styles.projectsSection}>
        <div className={styles.projectsGrid}>
          {projects.map((project, index) => (
            <div
              key={project.id}
              className={`${styles.projectCard} ${styles[project.type]}`}
              onClick={() => handleProjectClick(project)}
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
<<<<<<< HEAD
=======

      {/* Quick Actions */}
      {/* <div className={styles.quickActions}>
        <button className={styles.actionButton}>Launch New Project</button>
        <button className={styles.actionButton}>View Analytics</button>
        <button className={styles.actionButton}>Team Management</button>
        <button className={styles.actionButton}>Settings & Configuration</button>
      </div> */}

>>>>>>> e4ecc13d96c8d2ecdb048730ae37ea6e5355d32e
      {/* Footer */}
      <div className={styles.footer}>
        <p className={styles.footerText}>
          {projects.length} Active Projects • Last Updated: {new Date().toLocaleDateString()}
        </p>
      </div>
    </div>
  )
}