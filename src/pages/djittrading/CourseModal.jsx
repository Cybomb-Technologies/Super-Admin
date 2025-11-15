import React, { useState, useEffect } from 'react'
import { Modal, Form, Button, Row, Col } from 'react-bootstrap'
import axios from 'axios'
import styles from './courses.module.css'

const API_URL = import.meta.env.VITE_DJITTRADING_API_URL;

const CourseModal = ({ show, onHide, editingCourse, onCourseSaved, showAlert }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    instructor: '',
    price: '',
    discountedPrice: '',
    category: '',
    level: 'Beginner',
    duration: '',
    lessons: '',
    thumbnail: '',
    featured: false
  })

  const api = axios.create()

  useEffect(() => {
    if (editingCourse) {
      setFormData({
        title: editingCourse.title || '',
        description: editingCourse.description || '',
        instructor: editingCourse.instructor || '',
        price: editingCourse.price || '',
        discountedPrice: editingCourse.discountedPrice || '',
        category: editingCourse.category || '',
        level: editingCourse.level || 'Beginner',
        duration: editingCourse.duration || '',
        lessons: editingCourse.lessons || '',
        thumbnail: editingCourse.thumbnail || '',
        featured: editingCourse.featured || false
      })
    } else {
      setFormData({
        title: '',
        description: '',
        instructor: '',
        price: '',
        discountedPrice: '',
        category: '',
        level: 'Beginner',
        duration: '',
        lessons: '',
        thumbnail: '',
        featured: false
      })
    }
  }, [editingCourse])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const submitData = {
        ...formData,
        price: parseFloat(formData.price),
        discountedPrice: formData.discountedPrice ? parseFloat(formData.discountedPrice) : null,
        lessons: formData.lessons ? parseInt(formData.lessons) : 0,
        status: 'active'
      }

      if (editingCourse) {
        await api.put(`${API_URL}/api/admin/courses/${editingCourse._id}`, submitData)
        showAlert('Course updated successfully', 'success')
      } else {
        await api.post(`${API_URL}/api/admin/courses`, submitData)
        showAlert('Course created successfully', 'success')
      }

      onCourseSaved()
    } catch (error) {
      console.error('Error saving course:', error)
      if (error.response?.status === 403) {
        showAlert('You do not have permission to manage courses', 'danger')
      } else if (error.response?.status === 401) {
        showAlert('Please login again', 'danger')
      } else {
        showAlert(error.response?.data?.message || 'Error saving course', 'danger')
      }
    }
  }

  return (
    <Modal show={show} onHide={onHide} centered className={styles.modal}>
      <Modal.Header closeButton className={styles.modalHeader}>
        <Modal.Title className={styles.modalTitle}>
          <span className={styles.modalIcon}>
            {editingCourse ? '✏️' : '➕'}
          </span>
          {editingCourse ? 'Edit Course' : 'Add New Course'}
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body className={styles.modalBody}>
          <Row>
            <Col md={6}>
              <Form.Group className={styles.formGroup}>
                <Form.Label className={styles.formLabel}>
                  <span className={styles.labelIcon}>📝</span>
                  Course Title *
                </Form.Label>
                <Form.Control
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className={styles.formControl}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className={styles.formGroup}>
                <Form.Label className={styles.formLabel}>
                  <span className={styles.labelIcon}>👨‍🏫</span>
                  Instructor *
                </Form.Label>
                <Form.Control
                  type="text"
                  value={formData.instructor}
                  onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                  required
                  className={styles.formControl}
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className={styles.formGroup}>
            <Form.Label className={styles.formLabel}>
              <span className={styles.labelIcon}>📄</span>
              Description *
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              className={styles.formControl}
            />
          </Form.Group>

          <Row>
            <Col md={4}>
              <Form.Group className={styles.formGroup}>
                <Form.Label className={styles.formLabel}>
                  <span className={styles.labelIcon}>📂</span>
                  Category *
                </Form.Label>
                <Form.Control
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                  className={styles.formControl}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className={styles.formGroup}>
                <Form.Label className={styles.formLabel}>
                  <span className={styles.labelIcon}>📊</span>
                  Level *
                </Form.Label>
                <Form.Select
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                  className={styles.formControl}
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className={styles.formGroup}>
                <Form.Label className={styles.formLabel}>
                  <span className={styles.labelIcon}>⏱️</span>
                  Duration
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="e.g., 8 weeks"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  className={styles.formControl}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={4}>
              <Form.Group className={styles.formGroup}>
                <Form.Label className={styles.formLabel}>
                  <span className={styles.labelIcon}>💰</span>
                  Price (₹) *
                </Form.Label>
                <Form.Control
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                  min="0"
                  step="0.01"
                  className={styles.formControl}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className={styles.formGroup}>
                <Form.Label className={styles.formLabel}>
                  <span className={styles.labelIcon}>🎯</span>
                  Discounted Price (₹)
                </Form.Label>
                <Form.Control
                  type="number"
                  value={formData.discountedPrice}
                  onChange={(e) => setFormData({ ...formData, discountedPrice: e.target.value })}
                  min="0"
                  step="0.01"
                  className={styles.formControl}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className={styles.formGroup}>
                <Form.Label className={styles.formLabel}>
                  <span className={styles.labelIcon}>📚</span>
                  Number of Lessons
                </Form.Label>
                <Form.Control
                  type="number"
                  value={formData.lessons}
                  onChange={(e) => setFormData({ ...formData, lessons: e.target.value })}
                  min="0"
                  className={styles.formControl}
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className={styles.formGroup}>
            <Form.Label className={styles.formLabel}>
              <span className={styles.labelIcon}>🖼️</span>
              Thumbnail URL
            </Form.Label>
            <Form.Control
              type="url"
              value={formData.thumbnail}
              onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
              placeholder="https://example.com/image.jpg"
              className={styles.formControl}
            />
          </Form.Group>

          <Form.Check
            type="checkbox"
            label={
              <span>
                <span className={styles.checkboxIcon}>⭐</span>
                Featured Course
              </span>
            }
            checked={formData.featured}
            onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
            className={styles.checkbox}
          />
        </Modal.Body>
        <Modal.Footer className={styles.modalFooter}>
          <Button variant="outline-secondary" onClick={onHide} className={styles.cancelButton}>
            Cancel
          </Button>
          <Button type="submit" className={styles.saveButton}>
            <span className={styles.buttonIcon}>
              {editingCourse ? '💾' : '🚀'}
            </span>
            {editingCourse ? 'Update Course' : 'Create Course'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}

export default CourseModal