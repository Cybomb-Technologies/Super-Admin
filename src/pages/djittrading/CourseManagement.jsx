import React, { useState, useEffect } from 'react'
import { Row, Col, Card, Button, Table, Badge, Alert, Modal, Form } from 'react-bootstrap'
import axios from 'axios'
import CourseModal from './CourseModal'
import CourseContentModal from './CourseContentModal'
import styles from './courses.module.css'

const API_URL = import.meta.env.VITE_DJITTRADING_API_URL;

const CourseManagement = () => {
  const [courses, setCourses] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [showContentModal, setShowContentModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [editingCourse, setEditingCourse] = useState(null)
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [alert, setAlert] = useState({ show: false, message: '', type: '' })

  const api = axios.create()

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      const response = await api.get(`${API_URL}/api/admin/courses`)
      setCourses(response.data.courses || [])
    } catch (error) {
      console.error('Error fetching courses:', error)
      if (error.response?.status === 403) {
        showAlert('Access denied. Admin privileges required.', 'danger')
      } else if (error.response?.status === 401) {
        showAlert('Please login again.', 'danger')
      } else {
        showAlert('Error fetching courses', 'danger')
      }
    } finally {
      setLoading(false)
    }
  }

  const showAlert = (message, type) => {
    setAlert({ show: true, message, type })
    setTimeout(() => setAlert({ show: false, message: '', type: '' }), 5000)
  }

  const handleShowModal = (course = null) => {
    setEditingCourse(course)
    setShowModal(true)
  }

  const handleShowContentModal = (course) => {
    setSelectedCourse(course)
    setShowContentModal(true)
  }

  const handleShowDetailsModal = (course) => {
    setSelectedCourse(course)
    setShowDetailsModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingCourse(null)
  }

  const handleCloseContentModal = () => {
    setShowContentModal(false)
    setSelectedCourse(null)
  }

  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false)
    setSelectedCourse(null)
  }

  const handleDelete = async (courseId) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        await api.delete(`${API_URL}/api/admin/courses/${courseId}`)
        showAlert('Course deleted successfully', 'success')
        fetchCourses()
      } catch (error) {
        console.error('Error deleting course:', error)
        if (error.response?.status === 403) {
          showAlert('You do not have permission to delete courses', 'danger')
        } else {
          showAlert('Error deleting course', 'danger')
        }
      }
    }
  }

  const getLevelVariant = (level) => {
    switch (level) {
      case 'Beginner': return 'success'
      case 'Intermediate': return 'warning'
      case 'Advanced': return 'danger'
      default: return 'secondary'
    }
  }

  // Course Details Modal
  const CourseDetailsModal = ({ show, onHide, course }) => {
    const [localCourse, setLocalCourse] = useState(course || {})

    useEffect(() => {
      setLocalCourse(course || {})
    }, [course])

    const handleInputChange = (field, value) => {
      setLocalCourse(prev => ({ ...prev, [field]: value }))
    }

    const handleArrayChange = (field, index, value) => {
      setLocalCourse(prev => ({
        ...prev,
        [field]: prev[field]?.map((item, i) => i === index ? value : item) || []
      }))
    }

    const addArrayItem = (field) => {
      setLocalCourse(prev => ({
        ...prev,
        [field]: [...(prev[field] || []), '']
      }))
    }

    const removeArrayItem = (field, index) => {
      setLocalCourse(prev => ({
        ...prev,
        [field]: prev[field]?.filter((_, i) => i !== index) || []
      }))
    }

    const handleIndicatorChange = (index, field, value) => {
      setLocalCourse(prev => ({
        ...prev,
        indicators: prev.indicators?.map((indicator, i) =>
          i === index ? { ...indicator, [field]: value } : indicator
        ) || []
      }))
    }

    const addIndicator = () => {
      setLocalCourse(prev => ({
        ...prev,
        indicators: [...(prev.indicators || []), { name: '', description: '' }]
      }))
    }

    const removeIndicator = (index) => {
      setLocalCourse(prev => ({
        ...prev,
        indicators: prev.indicators?.filter((_, i) => i !== index) || []
      }))
    }

    const handleSave = async () => {
      try {
        await api.put(`${API_URL}/api/admin/courses/${course._id}`, localCourse)
        showAlert('Course details updated successfully', 'success')
        fetchCourses()
        onHide()
      } catch (error) {
        console.error('Error updating course details:', error)
        showAlert('Error updating course details', 'danger')
      }
    }

    if (!course) return null

    return (
      <Modal show={show} onHide={onHide} centered className={styles.modal}>
        <Modal.Header closeButton className={styles.modalHeader}>
          <Modal.Title className={styles.modalTitle}>
            <span className={styles.modalIcon}>📋</span>
            Course Details - {course.title}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className={styles.modalBody}>
          <Form>
            {/* Steps */}
            <Form.Group className={styles.formGroup}>
              <Form.Label className={styles.formLabel}>
                <strong>Steps ({localCourse.steps?.length || 0})</strong>
              </Form.Label>
              {localCourse.steps?.map((step, index) => (
                <div key={index} className={styles.arrayItem}>
                  <Form.Control
                    type="text"
                    value={step}
                    onChange={(e) => handleArrayChange('steps', index, e.target.value)}
                    placeholder={`Step ${index + 1}`}
                    className={styles.formControl}
                  />
                  <Button variant="outline-danger" size="sm" className={styles.removeButton} onClick={() => removeArrayItem('steps', index)}>Remove</Button>
                </div>
              ))}
              <Button variant="outline-primary" size="sm" className={styles.addButton} onClick={() => addArrayItem('steps')}>+ Add Step</Button>
            </Form.Group>

            {/* Course Modules */}
            <Form.Group className={styles.formGroup}>
              <Form.Label className={styles.formLabel}>
                <strong>Course Modules</strong>
              </Form.Label>
              {localCourse.courseContains?.map((item, index) => (
                <div key={index} className={styles.arrayItem}>
                  <Form.Control
                    type="text"
                    value={item}
                    onChange={(e) => handleArrayChange('courseContains', index, e.target.value)}
                    placeholder={`Course content ${index + 1}`}
                    className={styles.formControl}
                  />
                  <Button variant="outline-danger" size="sm" className={styles.removeButton} onClick={() => removeArrayItem('courseContains', index)}>Remove</Button>
                </div>
              ))}
              <Button variant="outline-primary" size="sm" className={styles.addButton} onClick={() => addArrayItem('courseContains')}>+ Add Course Content</Button>
            </Form.Group>

            {/* Indicators */}
            <Form.Group className={styles.formGroup}>
              <Form.Label className={styles.formLabel}>
                <strong>Indicators</strong>
              </Form.Label>
              {localCourse.indicators?.map((indicator, index) => (
                <div key={index} className={styles.indicatorItem}>
                  <div className={styles.arrayItem}>
                    <Form.Control
                      type="text"
                      value={indicator.name}
                      onChange={(e) => handleIndicatorChange(index, 'name', e.target.value)}
                      placeholder="Indicator name"
                      className={styles.formControl}
                    />
                    <Button variant="outline-danger" size="sm" className={styles.removeButton} onClick={() => removeIndicator(index)}>Remove</Button>
                  </div>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    value={indicator.description}
                    onChange={(e) => handleIndicatorChange(index, 'description', e.target.value)}
                    placeholder="Indicator description"
                    className={styles.formControl}
                  />
                </div>
              ))}
              <Button variant="outline-primary" size="sm" className={styles.addButton} onClick={addIndicator}>+ Add Indicator</Button>
            </Form.Group>

            {/* Notes */}
            <Form.Group className={styles.formGroup}>
              <Form.Label className={styles.formLabel}>
                <strong>Notes</strong>
              </Form.Label>
              {localCourse.notes?.map((note, index) => (
                <div key={index} className={styles.arrayItem}>
                  <Form.Control
                    type="text"
                    value={note}
                    onChange={(e) => handleArrayChange('notes', index, e.target.value)}
                    placeholder={`Note ${index + 1}`}
                    className={styles.formControl}
                  />
                  <Button variant="outline-danger" size="sm" className={styles.removeButton} onClick={() => removeArrayItem('notes', index)}>Remove</Button>
                </div>
              ))}
              <Button variant="outline-primary" size="sm" className={styles.addButton} onClick={() => addArrayItem('notes')}>+ Add Note</Button>
            </Form.Group>

            {/* Detailed Description */}
            <Form.Group className={styles.formGroup}>
              <Form.Label className={styles.formLabel}>
                <strong>Detailed Description</strong>
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={localCourse.detailedDescription || ''}
                onChange={(e) => handleInputChange('detailedDescription', e.target.value)}
                placeholder="Enter detailed course description..."
                className={styles.formControl}
              />
            </Form.Group>

            {/* Delivery Time */}
            <Form.Group className={styles.formGroup}>
              <Form.Label className={styles.formLabel}>
                <strong>Delivery Time</strong>
              </Form.Label>
              <Form.Control
                type="text"
                value={localCourse.deliveryTime || ''}
                onChange={(e) => handleInputChange('deliveryTime', e.target.value)}
                placeholder="e.g., 48 Working Hours"
                className={styles.formControl}
              />
            </Form.Group>

            {/* Language */}
            <Form.Group className={styles.formGroup}>
              <Form.Label className={styles.formLabel}>
                <strong>Language</strong>
              </Form.Label>
              <Form.Control
                type="text"
                value={localCourse.language || ''}
                onChange={(e) => handleInputChange('language', e.target.value)}
                placeholder="e.g., Tamil"
                className={styles.formControl}
              />
            </Form.Group>

            {/* Disclaimer */}
            <Form.Group className={styles.formGroup}>
              <Form.Label className={styles.formLabel}>
                <strong>Disclaimer</strong>
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={localCourse.disclaimer || ''}
                onChange={(e) => handleInputChange('disclaimer', e.target.value)}
                placeholder="Enter course disclaimer..."
                className={styles.formControl}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer className={styles.modalFooter}>
          <Button variant="outline-secondary" onClick={onHide} className={styles.cancelButton}>Cancel</Button>
          <Button variant="primary" onClick={handleSave} className={styles.saveButton}>Save Details</Button>
        </Modal.Footer>
      </Modal>
    )
  }

  return (
    <div className={styles.courseManagement}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          <span className={styles.headerIcon}>📚</span>
          Course Management
        </h2>
        <Button onClick={() => handleShowModal()} className={styles.addButton}>
          <span className={styles.buttonIcon}>+</span>
          Add New Course
        </Button>
      </div>

      {alert.show && (
        <Alert variant={alert.type} dismissible onClose={() => setAlert({ show: false, message: '', type: '' })} className={styles.alert}>
          {alert.message}
        </Alert>
      )}

      <Card className={styles.card}>
        <Card.Header className={styles.cardHeader}>
          <h5 className={styles.cardTitle}>
            <span className={styles.cardIcon}>🎓</span>
            All Courses ({courses.length})
          </h5>
        </Card.Header>
        <Card.Body className={styles.cardBody}>
          {loading ? (
            <div className={styles.loading}>
              <div className={styles.spinner}></div>
              <p>Loading courses...</p>
            </div>
          ) : courses.length > 0 ? (
            <div className={styles.tableContainer}>
              <Table hover className={styles.table}>
                <thead className={styles.tableHeader}>
                  <tr>
                    <th><span className={styles.tableIcon}>📖</span>Course</th>
                    <th><span className={styles.tableIcon}>👨‍🏫</span>Instructor</th>
                    <th><span className={styles.tableIcon}>💰</span>Price</th>
                    <th><span className={styles.tableIcon}>📊</span>Level</th>
                    <th><span className={styles.tableIcon}>👥</span>Students</th>
                    <th><span className={styles.tableIcon}>🟢</span>Status</th>
                    <th><span className={styles.tableIcon}>⚡</span>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map(course => (
                    <tr key={course._id} className={styles.tableRow}>
                      <td>
                        <div className={styles.courseInfo}>
                          <strong className={styles.courseTitle}>{course.title}</strong>
                          <div className={styles.courseMeta}>
                            <small className={styles.courseCategory}>{course.category}</small>
                            {course.featured && <Badge bg="primary" className={styles.featuredBadge}>Featured</Badge>}
                          </div>
                        </div>
                      </td>
                      <td className={styles.instructor}>{course.instructor}</td>
                      <td className={styles.price}>
                        <strong className={styles.currentPrice}>₹{course.discountedPrice || course.price}</strong>
                        {course.discountedPrice && (
                          <small className={styles.originalPrice}>₹{course.price}</small>
                        )}
                      </td>
                      <td>
                        <Badge bg={getLevelVariant(course.level)} className={styles.levelBadge}>
                          {course.level}
                        </Badge>
                      </td>
                      <td className={styles.students}>{course.studentsEnrolled || 0}</td>
                      <td>
                        <Badge bg={course.status === 'active' ? 'success' : 'secondary'} className={styles.statusBadge}>
                          {course.status || 'active'}
                        </Badge>
                      </td>
                      <td>
                        <div className={styles.actionButtons}>
                          <Button size="sm" variant="outline-primary" onClick={() => handleShowModal(course)} className={styles.actionButton}>
                            <span className={styles.actionIcon}>✏️</span>
                            Edit
                          </Button>
                          <Button size="sm" variant="outline-info" onClick={() => handleShowContentModal(course)} className={styles.actionButton}>
                            <span className={styles.actionIcon}>📹</span>
                            Content
                          </Button>
                          <Button size="sm" variant="outline-success" onClick={() => handleShowDetailsModal(course)} className={styles.actionButton}>
                            <span className={styles.actionIcon}>📋</span>
                            Details
                          </Button>
                          <Button size="sm" variant="outline-danger" onClick={() => handleDelete(course._id)} className={styles.actionButton}>
                            <span className={styles.actionIcon}>🗑️</span>
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          ) : (
            <div className={styles.emptyState}>
              <span className={styles.emptyIcon}>📚</span>
              <p className={styles.emptyText}>No courses found</p>
              <Button onClick={() => handleShowModal()} className={styles.addButton}>
                <span className={styles.buttonIcon}>+</span>
                Create Your First Course
              </Button>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Modals */}
      <CourseModal
        show={showModal}
        onHide={handleCloseModal}
        editingCourse={editingCourse}
        onCourseSaved={() => { handleCloseModal(); fetchCourses() }}
        showAlert={showAlert}
      />

      <CourseContentModal
        show={showContentModal}
        onHide={handleCloseContentModal}
        selectedCourse={selectedCourse}
        showAlert={showAlert}
      />

      <CourseDetailsModal
        show={showDetailsModal}
        onHide={handleCloseDetailsModal}
        course={selectedCourse}
      />
    </div>
  )
}

export default CourseManagement