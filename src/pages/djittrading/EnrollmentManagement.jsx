import React, { useState, useEffect } from 'react'
import {
  Card,
  Table,
  Button,
  Badge,
  Form,
  Alert,
  Modal,
  Row,
  Col
} from 'react-bootstrap'
import axios from 'axios'

const API_URL = import.meta.env.VITE_DJITTRADING_API_URL;

const EnrollmentManagement = () => {
  const [enrollments, setEnrollments] = useState([])
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    status: '',
    course: '',
    page: 1
  })
  const [totalPages, setTotalPages] = useState(1)
  const [alert, setAlert] = useState({ show: false, message: '', type: '' })
  const [showEnrollmentDetails, setShowEnrollmentDetails] = useState(false)
  const [selectedEnrollment, setSelectedEnrollment] = useState(null)

  // Axios instance with base URL
  const api = axios.create({
    baseURL: API_URL,
    timeout: 30000,
  })

  // Fetch courses on mount
  useEffect(() => {
    fetchCourses()
  }, [])

  // Fetch enrollments when filters change
  useEffect(() => {
    fetchEnrollments()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.status, filters.course, filters.page])

  const fetchCourses = async () => {
    try {
      const response = await api.get('/api/courses')
      setCourses(response.data.courses || [])
    } catch (error) {
      console.error('Error fetching courses:', error)
      showAlert('Error fetching courses', 'danger')
    }
  }

  const fetchEnrollments = async () => {
    try {
      setLoading(true)
      const queryParams = new URLSearchParams()
      if (filters.status) queryParams.append('status', filters.status)
      if (filters.course) queryParams.append('course', filters.course)
      queryParams.append('page', Number(filters.page) || 1)

      const response = await api.get(`/api/admin/enrollments?${queryParams.toString()}`)
      setEnrollments(response.data.enrollments || [])
      const tp = Number(response.data.totalPages) || 1
      setTotalPages(tp)

      if (Number(filters.page) > tp) {
        setFilters(prev => ({ ...prev, page: tp }))
      }
    } catch (error) {
      console.error('Error fetching enrollments:', error)
      if (error.response?.status === 404) {
        showAlert('Backend server not found. Make sure your backend is running.', 'danger')
      } else {
        showAlert('Error fetching enrollments', 'danger')
      }
    } finally {
      setLoading(false)
    }
  }

  const showAlert = (message, type) => {
    setAlert({ show: true, message, type })
    setTimeout(() => setAlert({ show: false, message: '', type: '' }), 5000)
  }

  const handleFilterChange = (key, value) => {
    if (key === 'page') {
      let pageNum = Number(value) || 1
      if (pageNum < 1) pageNum = 1
      if (totalPages && pageNum > totalPages) pageNum = totalPages
      setFilters(prev => ({ ...prev, page: pageNum }))
    } else {
      setFilters(prev => ({ ...prev, [key]: value, page: 1 }))
    }
  }

  const goToPage = (pageNum) => handleFilterChange('page', pageNum)
  const prevPage = () => { if (filters.page > 1) handleFilterChange('page', Number(filters.page) - 1) }
  const nextPage = () => { if (filters.page < totalPages) handleFilterChange('page', Number(filters.page) + 1) }

  const updateEnrollmentStatus = async (enrollmentId, updates) => {
    try {
      await api.put(`/api/admin/enrollments/${enrollmentId}`, updates)
      showAlert('Enrollment updated successfully', 'success')
      fetchEnrollments()
    } catch (error) {
      console.error('Error updating enrollment:', error)
      showAlert('Error updating enrollment', 'danger')
    }
  }

  const handleViewDetails = (enrollment) => {
    setSelectedEnrollment(enrollment)
    setShowEnrollmentDetails(true)
  }

  const getStatusVariant = (status) => {
    switch (status) {
      case 'completed': return 'success'
      case 'pending': return 'warning'
      case 'failed': return 'danger'
      case 'refunded': return 'secondary'
      default: return 'primary'
    }
  }

  const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount || 0)
  const formatDate = (dateString) => !dateString ? 'N/A' : new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  const calculateProgressColor = (progress) => (progress >= 80 ? 'success' : progress >= 50 ? 'warning' : 'danger')

  const getCourseType = (courseId) => {
    const courseMap = {
      '68f8755ea389a784609d16f6': 'Djit Hunter - Master Entry Course (Advanced)',
      '68f8740ca389a784609d16ca': 'Basics of Trading (Basic)',
      '68f05ac2841d373e1f9caff7': 'Djit Trading'
    }
    return courseMap[courseId] || 'Unknown Course'
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Enrollment Management</h2>
        <div className="text-muted">Total Enrollments: {enrollments.length}</div>
      </div>

      {alert.show && (
        <Alert variant={alert.type} dismissible onClose={() => setAlert({ show: false, message: '', type: '' })}>
          {alert.message}
        </Alert>
      )}

      {/* Filters */}
      <Card className="admin-card mb-4">
        <Card.Body>
          <div className="row g-3">
            <div className="col-md-4">
              <Form.Group>
                <Form.Label>Payment Status</Form.Label>
                <Form.Select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                </Form.Select>
              </Form.Group>
            </div>
            <div className="col-md-4">
              <Form.Group>
                <Form.Label>Course</Form.Label>
                <Form.Select
                  value={filters.course}
                  onChange={(e) => handleFilterChange('course', e.target.value)}
                >
                  <option value="">All Courses</option>
                  {courses.map(course => (
                    <option key={course._id} value={course._id}>{course.title}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </div>
            <div className="col-md-4 d-flex align-items-end">
              <Button variant="outline-secondary" onClick={() => setFilters({ status: '', course: '', page: 1 })}>Clear Filters</Button>
            </div>
          </div>
        </Card.Body>
      </Card>

      <Card className="admin-card">
        <Card.Header><h5 className="mb-0">All Enrollments</h5></Card.Header>
        <Card.Body>
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : enrollments.length > 0 ? (
            <>
              <div className="table-responsive">
                <Table hover>
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Course</th>
                      <th>Enrollment Date</th>
                      <th>Amount Paid</th>
                      <th>Progress</th>
                      <th>Status</th>
                      <th>Source</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {enrollments.map((enrollment) => (
                      <tr key={enrollment._id}>
                        <td>
                          <div>
                            <strong>{enrollment.user?.username}</strong><br />
                            <small className="text-muted">{enrollment.user?.email}</small><br />
                            <small><Badge bg="secondary">{enrollment.user?.importSource === 'csv_import' ? 'Imported' : 'Manual'}</Badge></small>
                          </div>
                        </td>
                        <td>
                          <div>
                            <strong>{enrollment.course?.title}</strong><br />
                            <small className="text-muted">{getCourseType(enrollment.course?._id)}</small><br />
                            <small>Price: {formatCurrency(enrollment.course?.price)}
                              {enrollment.course?.discountedPrice && (<span className="text-success"> (Discounted: {formatCurrency(enrollment.course.discountedPrice)})</span>)}
                            </small>
                          </div>
                        </td>
                        <td>{formatDate(enrollment.enrollmentDate)}</td>
                        <td><strong>{formatCurrency(enrollment.amountPaid)}</strong></td>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="progress flex-grow-1 me-2" style={{ height: '8px' }}>
                              <div className={`progress-bar bg-${calculateProgressColor(enrollment.progress)}`} style={{ width: `${enrollment.progress}%` }}></div>
                            </div>
                            <small>{enrollment.progress}%</small>
                          </div>
                          <div><small className="text-muted">{enrollment.completed ? 'Completed' : 'In Progress'}</small></div>
                        </td>
                        <td><Badge bg={getStatusVariant(enrollment.paymentStatus)}>{enrollment.paymentStatus}</Badge></td>
                        <td><Badge bg={enrollment.user?.importSource === 'csv_import' ? 'info' : 'secondary'}>{enrollment.user?.importSource === 'csv_import' ? 'CSV Import' : 'Manual'}</Badge></td>
                        <td>
                          <div className="d-flex gap-2 flex-wrap">
                            <Button size="sm" variant="outline-info" onClick={() => handleViewDetails(enrollment)}>Details</Button>
                            <Button size="sm" variant="outline-success" onClick={() => updateEnrollmentStatus(enrollment._id, { progress: 100, completed: true, paymentStatus: 'completed' })} disabled={enrollment.completed}>Mark Complete</Button>
                            <Button size="sm" variant="outline-warning" onClick={() => updateEnrollmentStatus(enrollment._id, { paymentStatus: 'pending' })}>Set Pending</Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="d-flex justify-content-center mt-4">
                  <nav>
                    <ul className="pagination">
                      <li className={`page-item ${Number(filters.page) === 1 ? 'disabled' : ''}`}>
                        <Button variant="outline-primary" size="sm" onClick={prevPage} disabled={Number(filters.page) === 1}>Previous</Button>
                      </li>
                      {Array.from({ length: Number(totalPages) }, (_, i) => i + 1).map(pageNum => (
                        <li key={pageNum} className={`page-item ${Number(filters.page) === pageNum ? 'active' : ''}`}>
                          <Button variant={Number(filters.page) === pageNum ? 'primary' : 'outline-primary'} size="sm" onClick={() => goToPage(pageNum)}>{pageNum}</Button>
                        </li>
                      ))}
                      <li className={`page-item ${Number(filters.page) === Number(totalPages) ? 'disabled' : ''}`}>
                        <Button variant="outline-primary" size="sm" onClick={nextPage} disabled={Number(filters.page) === Number(totalPages)}>Next</Button>
                      </li>
                    </ul>
                  </nav>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-5">
              <p className="text-muted">No enrollments found</p>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Enrollment Details Modal */}
      <Modal show={showEnrollmentDetails} onHide={() => setShowEnrollmentDetails(false)}>
        <Modal.Header closeButton><Modal.Title>Enrollment Details</Modal.Title></Modal.Header>
        <Modal.Body>
          {selectedEnrollment && (
            <div>
              <Row>
                <Col md={6}>
                  <h6>Student Information</h6>
                  <p><strong>Username:</strong> {selectedEnrollment.user?.username}</p>
                  <p><strong>Email:</strong> {selectedEnrollment.user?.email}</p>
                  <p><strong>Name:</strong> {selectedEnrollment.user?.profile?.firstName} {selectedEnrollment.user?.profile?.lastName}</p>
                  <p><strong>Phone:</strong> {selectedEnrollment.user?.profile?.phone || 'N/A'}</p>
                  <p><strong>Import Source:</strong>
                    <Badge bg={selectedEnrollment.user?.importSource === 'csv_import' ? 'info' : 'secondary'} className="ms-2">{selectedEnrollment.user?.importSource === 'csv_import' ? 'CSV Import' : 'Manual'}</Badge>
                  </p>
                </Col>
                <Col md={6}>
                  <h6>Course Information</h6>
                  <p><strong>Course:</strong> {selectedEnrollment.course?.title}</p>
                  <p><strong>Category:</strong> {selectedEnrollment.course?.category}</p>
                  <p><strong>Level:</strong> {selectedEnrollment.course?.level}</p>
                  <p><strong>Instructor:</strong> {selectedEnrollment.course?.instructor}</p>
                  <p><strong>Original Price:</strong> {formatCurrency(selectedEnrollment.course?.price)}</p>
                  {selectedEnrollment.course?.discountedPrice && (<p><strong>Discounted Price:</strong> {formatCurrency(selectedEnrollment.course.discountedPrice)}</p>)}
                </Col>
              </Row>
              <Row className="mt-3">
                <Col md={6}>
                  <h6>Enrollment Details</h6>
                  <p><strong>Enrollment Date:</strong> {formatDate(selectedEnrollment.enrollmentDate)}</p>
                  <p><strong>Amount Paid:</strong> {formatCurrency(selectedEnrollment.amountPaid)}</p>
                  <p><strong>Payment Status:</strong> <Badge bg={getStatusVariant(selectedEnrollment.paymentStatus)} className="ms-2">{selectedEnrollment.paymentStatus}</Badge></p>
                </Col>
                <Col md={6}>
                  <h6>Progress Information</h6>
                  <p><strong>Progress:</strong> {selectedEnrollment.progress}%</p>
                  <p><strong>Completed:</strong> <Badge bg={selectedEnrollment.completed ? 'success' : 'warning'} className="ms-2">{selectedEnrollment.completed ? 'Yes' : 'No'}</Badge></p>
                  <p><strong>Last Updated:</strong> {formatDate(selectedEnrollment.updatedAt)}</p>
                </Col>
              </Row>
              {selectedEnrollment.user?.profile?.labels && selectedEnrollment.user.profile.labels.length > 0 && (
                <Row className="mt-3">
                  <Col md={12}>
                    <h6>User Labels</h6>
                    <div>
                      {selectedEnrollment.user.profile.labels.map((label, index) => (
                        <Badge key={index} bg="secondary" className="me-1 mb-1">{label}</Badge>
                      ))}
                    </div>
                  </Col>
                </Row>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEnrollmentDetails(false)}>Close</Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default EnrollmentManagement