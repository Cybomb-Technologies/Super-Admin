import React, { useState, useEffect } from 'react'
import { Card, Table, Button, Badge, Form, Modal, Alert } from 'react-bootstrap'
import axios from 'axios'

const API_URL = import.meta.env.VITE_DJITTRADING_API_URL;

const NewsletterManagement = () => {
  const [subscribers, setSubscribers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showSendModal, setShowSendModal] = useState(false)
  const [sending, setSending] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [alert, setAlert] = useState({ show: false, message: '', type: '' })

  const [newsletterData, setNewsletterData] = useState({
    subject: '',
    content: ''
  })

  // Axios instance with base URL
  const api = axios.create({
    baseURL: API_URL,
    timeout: 30000,
  })

  useEffect(() => {
    fetchSubscribers()
  }, [currentPage])

  const fetchSubscribers = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/api/admin/newsletter?page=${currentPage}`)
      setSubscribers(response.data.subscribers)
      setTotalPages(response.data.totalPages)
    } catch (error) {
      console.error('Error fetching subscribers:', error)
      if (error.response?.status === 404) {
        showAlert('Backend server not found. Make sure your backend is running.', 'danger')
      } else {
        showAlert('Error fetching subscribers', 'danger')
      }
    } finally {
      setLoading(false)
    }
  }

  const showAlert = (message, type) => {
    setAlert({ show: true, message, type })
    setTimeout(() => setAlert({ show: false, message: '', type: '' }), 5000)
  }

  const handleSendNewsletter = async () => {
    if (!newsletterData.subject || !newsletterData.content) {
      showAlert('Please fill in all fields', 'warning')
      return
    }

    setSending(true)
    try {
      const response = await api.post('/api/admin/newsletter/send', newsletterData)
      showAlert(response.data.message || 'Newsletter sent successfully!', 'success')
      setShowSendModal(false)
      setNewsletterData({ subject: '', content: '' })
    } catch (error) {
      console.error('Error sending newsletter:', error)
      showAlert('Error sending newsletter', 'danger')
    } finally {
      setSending(false)
    }
  }

  const exportSubscribers = () => {
    try {
      const csvContent = [
        ['Email', 'Subscription Date', 'Status', 'Last Updated'],
        ...subscribers.map(sub => [
          sub.email,
          new Date(sub.createdAt).toLocaleDateString(),
          sub.isActive ? 'Active' : 'Inactive',
          new Date(sub.updatedAt).toLocaleDateString()
        ])
      ].map(row => row.join(',')).join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `newsletter-subscribers-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      
      showAlert('Subscribers exported successfully', 'success')
    } catch (error) {
      console.error('Error exporting subscribers:', error)
      showAlert('Error exporting subscribers', 'danger')
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getActiveCount = () => {
    return subscribers.filter(sub => sub.isActive).length
  }

  const getTotalCount = () => {
    return subscribers.length
  }

  const getInactiveCount = () => {
    return subscribers.length - getActiveCount()
  }

  // Handle pagination
  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = []
    const maxVisiblePages = 5
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }
    
    return pages
  }

  const clearNewsletterForm = () => {
    setNewsletterData({ subject: '', content: '' })
    setShowSendModal(false)
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Newsletter Management</h2>
        <div className="d-flex gap-2">
          <Button 
            variant="outline-primary" 
            onClick={exportSubscribers}
            disabled={subscribers.length === 0}
            title={subscribers.length === 0 ? 'No subscribers to export' : 'Export subscribers as CSV'}
          >
            📥 Export CSV
          </Button>
          <Button 
            className="btn-admin-primary"
            onClick={() => setShowSendModal(true)}
            disabled={getActiveCount() === 0}
            title={getActiveCount() === 0 ? 'No active subscribers to send to' : 'Send newsletter to active subscribers'}
          >
            📧 Send Newsletter
          </Button>
        </div>
      </div>

      {alert.show && (
        <Alert variant={alert.type} dismissible onClose={() => setAlert({ show: false, message: '', type: '' })}>
          {alert.message}
        </Alert>
      )}

      {/* Stats */}
      <div className="row mb-4">
        <div className="col-md-4">
          <Card className="stat-card">
            <Card.Body className="text-center">
              <div className="stat-number text-primary">{getTotalCount()}</div>
              <div className="stat-label">Total Subscribers</div>
            </Card.Body>
          </Card>
        </div>
        <div className="col-md-4">
          <Card className="stat-card">
            <Card.Body className="text-center">
              <div className="stat-number text-success">{getActiveCount()}</div>
              <div className="stat-label">Active Subscribers</div>
            </Card.Body>
          </Card>
        </div>
        <div className="col-md-4">
          <Card className="stat-card">
            <Card.Body className="text-center">
              <div className="stat-number text-secondary">{getInactiveCount()}</div>
              <div className="stat-label">Inactive Subscribers</div>
            </Card.Body>
          </Card>
        </div>
      </div>

      <Card className="admin-card">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Newsletter Subscribers</h5>
          <Badge bg="primary">
            {getActiveCount()}/{getTotalCount()} Active
          </Badge>
        </Card.Header>
        <Card.Body>
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2 text-muted">Loading subscribers...</p>
            </div>
          ) : subscribers.length > 0 ? (
            <>
              <div className="table-responsive">
                <Table hover striped>
                  <thead className="table-dark">
                    <tr>
                      <th>Email</th>
                      <th>Subscription Date</th>
                      <th>Status</th>
                      <th>Last Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscribers.map((subscriber) => (
                      <tr key={subscriber._id}>
                        <td>
                          <strong>{subscriber.email}</strong>
                        </td>
                        <td>{formatDate(subscriber.createdAt)}</td>
                        <td>
                          <Badge bg={subscriber.isActive ? 'success' : 'secondary'}>
                            {subscriber.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td>{formatDate(subscriber.updatedAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="d-flex justify-content-between align-items-center mt-4">
                  <div className="text-muted">
                    Page {currentPage} of {totalPages} • Showing {subscribers.length} subscribers
                  </div>
                  <nav>
                    <ul className="pagination mb-0">
                      <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="page-link"
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                        >
                          &laquo; Previous
                        </Button>
                      </li>
                      
                      {getPageNumbers().map((page) => (
                        <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                          <Button
                            variant={currentPage === page ? 'primary' : 'outline-primary'}
                            size="sm"
                            className="page-link"
                            onClick={() => handlePageChange(page)}
                          >
                            {page}
                          </Button>
                        </li>
                      ))}
                      
                      <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="page-link"
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                        >
                          Next &raquo;
                        </Button>
                      </li>
                    </ul>
                  </nav>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-5">
              <p className="text-muted mb-3">No newsletter subscribers found</p>
              <Button 
                variant="outline-primary" 
                onClick={fetchSubscribers}
              >
                Refresh
              </Button>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Send Newsletter Modal */}
      <Modal show={showSendModal} onHide={clearNewsletterForm} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Send Newsletter</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Subject *</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter newsletter subject"
              value={newsletterData.subject}
              onChange={(e) => setNewsletterData({ ...newsletterData, subject: e.target.value })}
              maxLength={200}
            />
            <Form.Text className="text-muted">
              {newsletterData.subject.length}/200 characters
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Content *</Form.Label>
            <Form.Control
              as="textarea"
              rows={12}
              placeholder="Enter newsletter content (HTML supported)"
              value={newsletterData.content}
              onChange={(e) => setNewsletterData({ ...newsletterData, content: e.target.value })}
            />
            <Form.Text className="text-muted">
              You can use HTML tags for formatting. This will be sent to <strong>{getActiveCount()}</strong> active subscribers.
            </Form.Text>
          </Form.Group>

          {getActiveCount() > 0 ? (
            <Alert variant="info">
              <strong>Note:</strong> Sending newsletters may take some time depending on the number of subscribers.
              Please do not close this window until the process is complete.
            </Alert>
          ) : (
            <Alert variant="warning">
              <strong>Warning:</strong> There are no active subscribers to send the newsletter to.
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={clearNewsletterForm}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSendNewsletter}
            disabled={sending || !newsletterData.subject || !newsletterData.content || getActiveCount() === 0}
          >
            {sending ? (
              <>
                <div className="spinner-border spinner-border-sm me-2" role="status">
                  <span className="visually-hidden">Sending...</span>
                </div>
                Sending to {getActiveCount()} subscribers...
              </>
            ) : (
              `Send to ${getActiveCount()} Subscribers`
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default NewsletterManagement