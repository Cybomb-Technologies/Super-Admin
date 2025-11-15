import React, { useState, useEffect } from 'react'
import { Row, Col, Card, Table, Badge, Button } from 'react-bootstrap'
import axios from 'axios'
import styles from './dashboard.module.css'

const API_URL = import.meta.env.VITE_DJITTRADING_API_URL;

const AdminDashboard = () => {
  const [stats, setStats] = useState(null)
  const [recentEnrollments, setRecentEnrollments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/admin/dashboard`)
      setStats(response.data.stats)
      setRecentEnrollments(response.data.stats.recentEnrollments || [])
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const refreshData = () => {
    setLoading(true)
    fetchDashboardData()
  }

  if (loading) {
    return (
      <div className={styles.dashboardLoading}>
        <div className={styles.spinner}></div>
        <p>Loading dashboard data...</p>
      </div>
    )
  }

  const getStatusVariant = (status) => {
    switch (status) {
      case 'completed': return 'success'
      case 'pending': return 'warning'
      case 'failed': return 'danger'
      default: return 'secondary'
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const getCourseIcon = (courseTitle) => {
    const title = courseTitle?.toLowerCase() || ''
    if (title.includes('web') || title.includes('development')) return '💻'
    if (title.includes('design') || title.includes('ui/ux')) return '🎨'
    if (title.includes('data') || title.includes('analytics')) return '📊'
    if (title.includes('mobile') || title.includes('app')) return '📱'
    if (title.includes('business') || title.includes('marketing')) return '💼'
    if (title.includes('language') || title.includes('english')) return '🔤'
    return '📚'
  }

  return (
    <div className={styles.adminDashboard}>
      {/* Header Section */}
      <div className={styles.dashboardHeader}>
        <div className={styles.headerContent}>
          <div className={styles.headerText}>
            <h2 className={styles.dashboardTitle}>
              <span className={styles.headerIcon}>📊</span>
              DjitTrading Dashboard Overview
            </h2>
            {/* <p className={styles.dashboardSubtitle}>
              Welcome back! Here's what's happening with your platform today.
            </p> */}
          </div>
          <Button 
            variant="primary" 
            size="sm" 
            onClick={refreshData}
            className={styles.refreshBtn}
          >
            <span className={styles.btnIcon}>🔄</span>
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <Row className={styles.statsGrid}>
        <Col xl={3} lg={3} md={6} sm={12} className="mb-4">
          <Card className={`${styles.statCard} ${styles.usersCard}`}>
            <Card.Body className={styles.statBody}>
              <div className={styles.statIconWrapper}>
                <span className={`${styles.statIcon} ${styles.usersIcon}`}>👥</span>
              </div>
              <div className={styles.statContent}>
                <div className={styles.statNumber}>{stats?.totalUsers || 0}</div>
                <div className={styles.statLabel}>Total Users</div>
                {/* <div className={styles.statTrend}>
                  <span className={styles.trendIcon}>📈</span>
                  Active platform users
                </div> */}
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col xl={3} lg={3} md={6} sm={12} className="mb-4">
          <Card className={`${styles.statCard} ${styles.coursesCard}`}>
            <Card.Body className={styles.statBody}>
              <div className={styles.statIconWrapper}>
                <span className={`${styles.statIcon} ${styles.coursesIcon}`}>📚</span>
              </div>
              <div className={styles.statContent}>
                <div className={styles.statNumber}>{stats?.totalCourses || 0}</div>
                <div className={styles.statLabel}>Total Courses</div>
                {/* <div className={styles.statTrend}>
                  <span className={styles.trendIcon}>🎓</span>
                  Available courses
                </div> */}
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col xl={3} lg={3} md={6} sm={12} className="mb-4">
          <Card className={`${styles.statCard} ${styles.enrollmentsCard}`}>
            <Card.Body className={styles.statBody}>
              <div className={styles.statIconWrapper}>
                <span className={`${styles.statIcon} ${styles.enrollmentsIcon}`}>🎯</span>
              </div>
              <div className={styles.statContent}>
                <div className={styles.statNumber}>{stats?.totalEnrollments || 0}</div>
                <div className={styles.statLabel}>Enrollments</div>
                {/* <div className={styles.statTrend}>
                  <span className={styles.trendIcon}>👨‍🎓</span>
                  Student enrollments
                </div> */}
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col xl={3} lg={3} md={6} sm={12} className="mb-4">
          <Card className={`${styles.statCard} ${styles.revenueCard}`}>
            <Card.Body className={styles.statBody}>
              <div className={styles.statIconWrapper}>
                <span className={`${styles.statIcon} ${styles.revenueIcon}`}>💰</span>
              </div>
              <div className={styles.statContent}>
                <div className={styles.statNumber}>{formatCurrency(stats?.totalRevenue || 0)}</div>
                <div className={styles.statLabel}>Total Revenue</div>
                {/* <div className={styles.statTrend}>
                  <span className={styles.trendIcon}>💼</span>
                  Total earnings
                </div> */}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Data Tables Section */}
      <Row className={styles.dataSection}>
        <Col lg={8} className="mb-4">
          <Card className={styles.adminCard}>
            <Card.Header className={styles.cardHeader}>
              <div className={styles.cardHeaderContent}>
                <h5 className={styles.cardTitle}>
                  <span className={styles.headerIcon}>📋</span>
                  Recent Enrollments
                </h5>
                <Badge bg="primary" className={styles.enrollmentCount}>
                  {recentEnrollments.length} Total
                </Badge>
              </div>
            </Card.Header>
            <Card.Body className={styles.cardBody}>
              {recentEnrollments.length > 0 ? (
                <div className={styles.tableContainer}>
                  <Table hover className={styles.dataTable}>
                    <thead className={styles.tableHeader}>
                      <tr>
                        <th className={styles.tableColumn}>
                          <span className={styles.tableHeaderIcon}>👤</span>
                          User
                        </th>
                        <th className={styles.tableColumn}>
                          <span className={styles.tableHeaderIcon}>📖</span>
                          Course
                        </th>
                        <th className={styles.tableColumn}>
                          <span className={styles.tableHeaderIcon}>📅</span>
                          Date
                        </th>
                        <th className={styles.tableColumn}>
                          <span className={styles.tableHeaderIcon}>💵</span>
                          Amount
                        </th>
                        <th className={styles.tableColumn}>
                          <span className={styles.tableHeaderIcon}>ℹ️</span>
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentEnrollments.map((enrollment) => (
                        <tr key={enrollment._id} className={styles.tableRow}>
                          <td className={styles.userColumn}>
                            <div className={styles.userInfo}>
                              <div className={styles.userAvatar}>
                                {enrollment.user?.username?.charAt(0).toUpperCase() || 'U'}
                              </div>
                              <div className={styles.userDetails}>
                                <div className={styles.userName}>
                                  {enrollment.user?.username || 'Unknown User'}
                                </div>
                                <div className={styles.userEmail}>
                                  {enrollment.user?.email || 'No email'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className={styles.courseColumn}>
                            <div className={styles.courseInfo}>
                              <span className={styles.courseIcon}>
                                {getCourseIcon(enrollment.course?.title)}
                              </span>
                              <span className={styles.courseTitle}>
                                {enrollment.course?.title || 'Unknown Course'}
                              </span>
                            </div>
                          </td>
                          <td className={styles.dateColumn}>
                            <div className={styles.dateInfo}>
                              <div className={styles.date}>
                                {new Date(enrollment.enrollmentDate).toLocaleDateString()}
                              </div>
                              <div className={styles.time}>
                                {new Date(enrollment.enrollmentDate).toLocaleTimeString()}
                              </div>
                            </div>
                          </td>
                          <td className={styles.amountColumn}>
                            <span className={styles.amount}>
                              {enrollment.amount ? formatCurrency(enrollment.amount) : 'Free'}
                            </span>
                          </td>
                          <td className={styles.statusColumn}>
                            <Badge 
                              bg={getStatusVariant(enrollment.paymentStatus)}
                              className={styles.statusBadge}
                            >
                              <span className={styles.statusIcon}>
                                {enrollment.paymentStatus === 'completed' ? '✅' :
                                 enrollment.paymentStatus === 'pending' ? '⏳' : '⚠️'}
                              </span>
                              {enrollment.paymentStatus}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <span className={styles.emptyIcon}>🎓</span>
                  <h6>No Recent Enrollments</h6>
                  <p>There are no enrollment records to display at the moment.</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className={styles.adminCard}>
            <Card.Header className={styles.cardHeader}>
              <div className={styles.cardHeaderContent}>
                <h5 className={styles.cardTitle}>
                  <span className={styles.headerIcon}>🔥</span>
                  Popular Courses
                </h5>
                <Badge bg="warning" className={styles.enrollmentCount}>
                  Top {stats?.popularCourses?.length || 0}
                </Badge>
              </div>
            </Card.Header>
            <Card.Body className={styles.popularCoursesBody}>
              {stats?.popularCourses?.length > 0 ? (
                <div className={styles.popularCourses}>
                  {stats.popularCourses.map((course, index) => (
                    <div key={course._id || index} className={styles.courseItem}>
                      <div className={styles.courseRank}>
                        <div className={`${styles.rankBadge} ${styles[`rank${index + 1}`]}`}>
                          {index + 1}
                        </div>
                      </div>
                      <div className={styles.courseContent}>
                        <div className={styles.courseHeader}>
                          <span className={styles.courseTypeIcon}>
                            {getCourseIcon(course.course?.title)}
                          </span>
                          <div className={styles.courseDetails}>
                            <h6 className={styles.courseName}>
                              {course.course?.title || 'Unknown Course'}
                            </h6>
                            <div className={styles.courseStats}>
                              <div className={styles.enrollmentCount}>
                                <span className={styles.statIconSmall}>👥</span>
                                {course.enrollments || 0} enrollments
                              </div>
                              {course.revenue && (
                                <div className={styles.courseRevenue}>
                                  <span className={styles.statIconSmall}>💰</span>
                                  {formatCurrency(course.revenue)}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <span className={styles.emptyIcon}>📚</span>
                  <h6>No Course Data</h6>
                  <p>Popular course information will appear here.</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default AdminDashboard