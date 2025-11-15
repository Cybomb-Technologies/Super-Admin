import React, { useState, useEffect } from "react";
import { Modal, Form, Button, Row, Col, Badge, Card, Alert, Spinner, Table, Pagination } from "react-bootstrap";
import axios from "axios";
import styles from './courses.module.css'

const API_URL = import.meta.env.VITE_DJITTRADING_API_URL;

const CourseContentModal = ({ show, onHide, selectedCourse, showAlert, onContentAdded }) => {
  const [uploadLoading, setUploadLoading] = useState(false);
  const [contentFormData, setContentFormData] = useState(initialFormData());
  const [videoFile, setVideoFile] = useState(null);
  const [documentFile, setDocumentFile] = useState(null);
  const [localAlert, setLocalAlert] = useState({ show: false, message: "", type: "" });
  
  // Admin data states
  const [allContentData, setAllContentData] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statistics, setStatistics] = useState(null);
  const [activeTab, setActiveTab] = useState("upload");
  const [deleteLoading, setDeleteLoading] = useState(null);

  function initialFormData() {
    return { title: "", description: "", type: "video", videoUrl: "", documentUrl: "", duration: "", order: 1, isFree: false };
  }

  const api = axios.create();

  useEffect(() => {
    if (selectedCourse && show) {
      setContentFormData(initialFormData());
      setVideoFile(null);
      setDocumentFile(null);
    }
  }, [selectedCourse, show]);

  // Fetch all content data for admin
  const fetchAllContentData = async (page = 1) => {
    try {
      setLoadingData(true);
      let url = `${API_URL}/api/course-content/admin/all-content?page=${page}&limit=10`;
      
      if (selectedCourse && selectedCourse._id) {
        url += `&courseId=${selectedCourse._id}`;
      }
      
      const res = await api.get(url);
      if (res.data.success) {
        setAllContentData(res.data.contents);
        setCurrentPage(res.data.pagination.currentPage);
        setTotalPages(res.data.pagination.totalPages);
        setStatistics(res.data.statistics);
      }
    } catch (error) {
      console.error("Error fetching content data:", error);
      showLocalAlert("Error fetching content data", "danger");
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (show && activeTab === "viewAll") {
      fetchAllContentData();
    }
  }, [show, activeTab, selectedCourse]);

  const showLocalAlert = (message, type) => {
    setLocalAlert({ show: true, message, type });
    setTimeout(() => setLocalAlert({ show: false, message: "", type: "" }), 4000);
  };

  const handleContentSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCourse) return showLocalAlert("No course selected", "danger");
    if (!contentFormData.title.trim()) return showLocalAlert("Please enter a content title", "danger");
    if (contentFormData.type === "video" && !videoFile && !contentFormData.videoUrl.trim())
      return showLocalAlert("Please upload a video file or enter a video URL", "danger");
    if ((contentFormData.type === "document" || contentFormData.type === "pdf" || contentFormData.type === "excel") && !documentFile && !contentFormData.documentUrl.trim())
      return showLocalAlert("Please upload a document or provide a document URL", "danger");

    try {
      setUploadLoading(true);
      const formData = new FormData();
      Object.entries(contentFormData).forEach(([key, value]) => formData.append(key, value));
      formData.append("courseId", selectedCourse._id);
      if (videoFile) formData.append("videoFile", videoFile);
      if (documentFile) formData.append("documentFile", documentFile);

      const res = await api.post(`${API_URL}/api/course-content/upload`, formData, { 
        headers: { "Content-Type": "multipart/form-data" }, timeout: 0 });

      showAlert("Content added successfully", "success");
      showLocalAlert("Content added successfully", "success");

      setContentFormData((prev) => ({ ...initialFormData(), order: prev.order + 1 }));
      setVideoFile(null);
      setDocumentFile(null);

      // Clear file inputs
      const videoInput = document.getElementById("videoFileInput");
      if (videoInput) videoInput.value = "";
      const documentInput = document.getElementById("documentFileInput");
      if (documentInput) documentInput.value = "";

      if (onContentAdded) onContentAdded(res.data.content);
      
      // Refresh data if on view all tab
      if (activeTab === "viewAll") {
        fetchAllContentData();
      }
    } catch (error) {
      console.error("Upload error:", error);
      let msg = "Error adding content";
      if (error.response) {
        msg = error.response.data?.message || `Server error: ${error.response.status}`;
        if (error.response.status === 413) msg = "File too large.";
        if (error.response.status === 415) msg = "Unsupported file type.";
      } else if (error.request) msg = "Network error. Backend not reachable.";
      else msg = error.message;
      showAlert(msg, "danger");
      showLocalAlert(msg, "danger");
    } finally {
      setUploadLoading(false);
    }
  };

  const handleVideoFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("video/")) return showLocalAlert("Please select a valid video file", "danger");
    if (file.size > 10 * 1024 * 1024 * 1024) return showLocalAlert("Max video size is 10GB", "danger");
    setVideoFile(file);
    setContentFormData((p) => ({ ...p, videoUrl: "" }));
    showLocalAlert(`Video selected: ${file.name} (${(file.size / 1048576).toFixed(2)} MB)`, "info");
  };

  const handleDocumentFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const allowed = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/plain"
    ];
    if (!allowed.includes(file.type)) return showLocalAlert("Invalid file. Allowed: PDF, Word, PPT, Excel, Text", "danger");
    if (file.size > 50 * 1024 * 1024) return showLocalAlert("Max document size is 50MB", "danger");
    setDocumentFile(file);
    setContentFormData((p) => ({ ...p, documentUrl: "" }));
    showLocalAlert(`Document selected: ${file.name} (${(file.size / 1048576).toFixed(2)} MB)`, "info");
  };

  const clearFile = (type) => {
    if (type === "video") {
      setVideoFile(null);
      const videoInput = document.getElementById("videoFileInput");
      if (videoInput) videoInput.value = "";
    } else {
      setDocumentFile(null);
      const documentInput = document.getElementById("documentFileInput");
      if (documentInput) documentInput.value = "";
    }
  };

  // Delete content function
  const handleDeleteContent = async (contentId, contentTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${contentTitle}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setDeleteLoading(contentId);
      const res = await api.delete(`${API_URL}/api/course-content/${contentId}`);
      
      if (res.data.success) {
        showLocalAlert(`Content "${contentTitle}" deleted successfully`, "success");
        showAlert(`Content "${contentTitle}" deleted successfully`, "success");
        
        fetchAllContentData(currentPage);
      }
    } catch (error) {
      console.error("Error deleting content:", error);
      const errorMsg = error.response?.data?.message || "Error deleting content";
      showLocalAlert(errorMsg, "danger");
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleModalClose = () => {
    setContentFormData(initialFormData());
    setVideoFile(null);
    setDocumentFile(null);
    setLocalAlert({ show: false, message: "", type: "" });
    setActiveTab("upload");
    onHide();
  };

  const renderStatistics = () => (
    <Card className={styles.statisticsCard}>
      <Card.Header className={styles.cardHeader}>
        <h6 className={styles.cardTitle}>
          <span className={styles.cardIcon}>📊</span>
          Storage Statistics {selectedCourse && `- ${selectedCourse.title}`}
        </h6>
      </Card.Header>
      <Card.Body className={styles.cardBody}>
        {statistics ? (
          <Row>
            <Col md={6}>
              <div className={styles.statItem}>
                <strong>Total Content:</strong> {statistics.totalContent}
              </div>
              <div className={styles.statItem}>
                <strong>Total Videos:</strong> {statistics.totalVideos}
              </div>
              <div className={styles.statItem}>
                <strong>Total Documents:</strong> {statistics.totalDocuments}
              </div>
            </Col>
            <Col md={6}>
              <div className={styles.statItem}>
                <strong>Video Storage:</strong> {statistics.formatted.totalVideoSize}
              </div>
              <div className={styles.statItem}>
                <strong>Document Storage:</strong> {statistics.formatted.totalDocumentSize}
              </div>
              <div className={styles.statItem}>
                <strong>Total Storage Used:</strong> {statistics.formatted.totalStorageUsed}
              </div>
            </Col>
          </Row>
        ) : (
          <Spinner animation="border" size="sm" />
        )}
      </Card.Body>
    </Card>
  );

  const renderContentTable = () => (
    <Card className={styles.contentCard}>
      <Card.Header className={styles.cardHeader}>
        <div className={styles.cardHeaderContent}>
          <h6 className={styles.cardTitle}>
            <span className={styles.cardIcon}>📹</span>
            Course Content {selectedCourse && `- ${selectedCourse.title}`}
            {!selectedCourse && " - All Courses"}
          </h6>
          <Button variant="outline-primary" size="sm" onClick={() => fetchAllContentData()} className={styles.refreshButton}>
            <span className={styles.buttonIcon}>🔄</span>
            Refresh
          </Button>
        </div>
      </Card.Header>
      <Card.Body className={styles.cardBody}>
        {loadingData ? (
          <div className={styles.loading}>
            <Spinner animation="border" />
            <p className={styles.loadingText}>Loading content data...</p>
          </div>
        ) : (
          <>
            {allContentData.length === 0 ? (
              <div className={styles.emptyState}>
                <span className={styles.emptyIcon}>📹</span>
                <p className={styles.emptyText}>
                  {selectedCourse 
                    ? `No content found for "${selectedCourse.title}". Upload some content to get started.`
                    : "No content found. Upload some content or select a specific course."}
                </p>
              </div>
            ) : (
              <>
                <div className={styles.tableContainer}>
                  <Table striped bordered hover size="sm" className={styles.table}>
                    <thead className={styles.tableHeader}>
                      <tr>
                        <th><span className={styles.tableIcon}>📝</span>Title</th>
                        <th><span className={styles.tableIcon}>📂</span>Type</th>
                        <th><span className={styles.tableIcon}>📚</span>Course</th>
                        <th><span className={styles.tableIcon}>💾</span>File Size</th>
                        <th><span className={styles.tableIcon}>🎯</span>Free</th>
                        <th><span className={styles.tableIcon}>🔢</span>Order</th>
                        <th><span className={styles.tableIcon}>📅</span>Uploaded</th>
                        <th><span className={styles.tableIcon}>⚡</span>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allContentData.map((content) => (
                        <tr key={content._id} className={styles.tableRow}>
                          <td className={styles.contentTitle} title={content.title}>
                            {content.title}
                          </td>
                          <td>
                            <Badge bg={
                              content.type === "video" ? "primary" : 
                              content.type === "excel" ? "info" : "secondary"
                            } className={styles.typeBadge}>
                              {content.type}
                            </Badge>
                          </td>
                          <td className={styles.courseName} title={content.course?.title}>
                            {content.course?.title || "N/A"}
                          </td>
                          <td className={styles.fileSize}>
                            {content.videoFile?.size 
                              ? `${(content.videoFile.size / 1048576).toFixed(2)} MB`
                              : content.documentFile?.size
                              ? `${(content.documentFile.size / 1048576).toFixed(2)} MB`
                              : "N/A"}
                          </td>
                          <td>
                            <Badge bg={content.isFree ? "success" : "warning"} className={styles.freeBadge}>
                              {content.isFree ? "Yes" : "No"}
                            </Badge>
                          </td>
                          <td>
                            <Badge bg="outline-secondary" className={styles.orderBadge}>{content.order}</Badge>
                          </td>
                          <td className={styles.uploadDate}>
                            {new Date(content.createdAt).toLocaleDateString()}
                          </td>
                          <td>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleDeleteContent(content._id, content.title)}
                              disabled={deleteLoading === content._id}
                              className={styles.deleteButton}
                            >
                              {deleteLoading === content._id ? (
                                <Spinner animation="border" size="sm" />
                              ) : (
                                <>
                                  <span className={styles.buttonIcon}>🗑️</span>
                                  Delete
                                </>
                              )}
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
                
                {totalPages > 1 && (
                  <div className={styles.paginationContainer}>
                    <Pagination className={styles.pagination}>
                      <Pagination.Prev 
                        disabled={currentPage === 1} 
                        onClick={() => fetchAllContentData(currentPage - 1)} 
                      />
                      {[...Array(totalPages)].map((_, idx) => (
                        <Pagination.Item
                          key={idx + 1}
                          active={idx + 1 === currentPage}
                          onClick={() => fetchAllContentData(idx + 1)}
                        >
                          {idx + 1}
                        </Pagination.Item>
                      ))}
                      <Pagination.Next 
                        disabled={currentPage === totalPages} 
                        onClick={() => fetchAllContentData(currentPage + 1)} 
                      />
                    </Pagination>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </Card.Body>
    </Card>
  );

  return (
    <Modal show={show} onHide={handleModalClose}  centered className={styles.modal}>
      <Modal.Header closeButton className={styles.modalHeader}>
        <Modal.Title className={styles.modalTitle}>
          <span className={styles.modalIcon}>📹</span>
          Course Content Management {selectedCourse ? ` - ${selectedCourse.title}` : ""}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className={styles.modalBody}>
        {localAlert.show && (
          <Alert variant={localAlert.type} dismissible onClose={() => setLocalAlert({ show: false, message: "", type: "" })} className={styles.alert}>
            {localAlert.message}
          </Alert>
        )}
        
        {/* Tab Navigation */}
        <div className={styles.tabNavigation}>
          <Button
            variant={activeTab === "upload" ? "primary" : "outline-primary"}
            className={styles.tabButton}
            onClick={() => setActiveTab("upload")}
          >
            <span className={styles.tabIcon}>📤</span>
            Upload Content
          </Button>
          <Button
            variant={activeTab === "viewAll" ? "primary" : "outline-primary"}
            className={styles.tabButton}
            onClick={() => setActiveTab("viewAll")}
          >
            <span className={styles.tabIcon}>📊</span>
            {selectedCourse ? "View Course Content" : "View All Content"}
          </Button>
        </div>

        {activeTab === "upload" ? (
          <Card className={styles.uploadCard}>
            <Card.Header className={styles.cardHeader}>
              <h6 className={styles.cardTitle}>
                <span className={styles.cardIcon}>➕</span>
                Add New Content {selectedCourse && `to ${selectedCourse.title}`}
              </h6>
            </Card.Header>
            <Card.Body className={styles.cardBody}>
              {!selectedCourse ? (
                <Alert variant="warning" className={styles.alert}>
                  Please select a course first to add content.
                </Alert>
              ) : (
                <Form onSubmit={handleContentSubmit} className={styles.form}>
                  {/* Title & Description */}
                  <Form.Group className={styles.formGroup}>
                    <Form.Label className={styles.formLabel}>
                      <span className={styles.labelIcon}>📝</span>
                      Content Title *
                    </Form.Label>
                    <Form.Control 
                      type="text" 
                      value={contentFormData.title} 
                      onChange={(e) => setContentFormData({ ...contentFormData, title: e.target.value })} 
                      placeholder="Enter content title" 
                      required 
                      className={styles.formControl}
                    />
                  </Form.Group>
                  <Form.Group className={styles.formGroup}>
                    <Form.Label className={styles.formLabel}>
                      <span className={styles.labelIcon}>📄</span>
                      Description
                    </Form.Label>
                    <Form.Control 
                      as="textarea" 
                      rows={2} 
                      value={contentFormData.description} 
                      onChange={(e) => setContentFormData({ ...contentFormData, description: e.target.value })} 
                      placeholder="Optional description" 
                      className={styles.formControl}
                    />
                  </Form.Group>

                  {/* Type & Order */}
                  <Row>
                    <Col md={6}>
                      <Form.Group className={styles.formGroup}>
                        <Form.Label className={styles.formLabel}>
                          <span className={styles.labelIcon}>📂</span>
                          Content Type *
                        </Form.Label>
                        <Form.Select 
                          value={contentFormData.type} 
                          onChange={(e) => setContentFormData({ ...contentFormData, type: e.target.value })}
                          className={styles.formControl}
                        >
                          <option value="video">Video</option>
                          <option value="document">Document</option>
                          <option value="pdf">PDF</option>
                          <option value="excel">Excel</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className={styles.formGroup}>
                        <Form.Label className={styles.formLabel}>
                          <span className={styles.labelIcon}>🔢</span>
                          Order *
                        </Form.Label>
                        <Form.Control 
                          type="number" 
                          min="1" 
                          value={contentFormData.order} 
                          onChange={(e) => setContentFormData({ ...contentFormData, order: parseInt(e.target.value) || 1 })} 
                          required 
                          className={styles.formControl}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* Video */}
                  {contentFormData.type === "video" && <React.Fragment>
                    <Form.Group className={styles.formGroup}>
                      <Form.Label className={styles.formLabel}>
                        <span className={styles.labelIcon}>🎬</span>
                        Upload Video
                      </Form.Label>
                      <Form.Control 
                        id="videoFileInput" 
                        type="file" 
                        accept="video/*" 
                        onChange={handleVideoFileChange} 
                        className={styles.fileInput}
                      />
                      <Form.Text className={styles.helpText}>Max 10GB. MP4/AVI/MOV</Form.Text>
                      {videoFile && (
                        <div className={styles.filePreview}>
                          <Badge bg="info" className={styles.fileBadge}>
                            {videoFile.name} ({(videoFile.size / 1048576).toFixed(2)} MB)
                          </Badge>
                          <Button size="sm" variant="outline-danger" onClick={() => clearFile("video")} className={styles.clearButton}>×</Button>
                        </div>
                      )}
                    </Form.Group>
                    <Form.Group className={styles.formGroup}>
                      <Form.Label className={styles.formLabel}>
                        <span className={styles.labelIcon}>🔗</span>
                        Or Video URL
                      </Form.Label>
                      <Form.Control 
                        type="url" 
                        placeholder="https://youtube.com/embed/..." 
                        value={contentFormData.videoUrl} 
                        onChange={(e) => setContentFormData({ ...contentFormData, videoUrl: e.target.value })} 
                        disabled={!!videoFile} 
                        className={styles.formControl}
                      />
                    </Form.Group>
                  </React.Fragment>}

                  {/* Document, PDF, Excel */}
                  {(contentFormData.type === "document" || contentFormData.type === "pdf" || contentFormData.type === "excel") && <React.Fragment>
                    <Form.Group className={styles.formGroup}>
                      <Form.Label className={styles.formLabel}>
                        <span className={styles.labelIcon}>📎</span>
                        Upload Document
                      </Form.Label>
                      <Form.Control 
                        id="documentFileInput" 
                        type="file" 
                        accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt" 
                        onChange={handleDocumentFileChange} 
                        className={styles.fileInput}
                      />
                      <Form.Text className={styles.helpText}>Max 50MB. PDF/Word/PPT/Excel/Text</Form.Text>
                      {documentFile && (
                        <div className={styles.filePreview}>
                          <Badge bg="info" className={styles.fileBadge}>
                            {documentFile.name} ({(documentFile.size / 1048576).toFixed(2)} MB)
                          </Badge>
                          <Button size="sm" variant="outline-danger" onClick={() => clearFile("document")} className={styles.clearButton}>×</Button>
                        </div>
                      )}
                    </Form.Group>
                    <Form.Group className={styles.formGroup}>
                      <Form.Label className={styles.formLabel}>
                        <span className={styles.labelIcon}>🔗</span>
                        Or Document URL
                      </Form.Label>
                      <Form.Control 
                        type="url" 
                        placeholder="https://example.com/doc.pdf" 
                        value={contentFormData.documentUrl} 
                        onChange={(e) => setContentFormData({ ...contentFormData, documentUrl: e.target.value })} 
                        disabled={!!documentFile} 
                        className={styles.formControl}
                      />
                    </Form.Group>
                  </React.Fragment>}

                  {/* Duration & Free */}
                  <Form.Group className={styles.formGroup}>
                    <Form.Label className={styles.formLabel}>
                      <span className={styles.labelIcon}>⏱️</span>
                      Duration
                    </Form.Label>
                    <Form.Control 
                      type="text" 
                      placeholder="Optional" 
                      value={contentFormData.duration} 
                      onChange={(e) => setContentFormData({ ...contentFormData, duration: e.target.value })} 
                      className={styles.formControl}
                    />
                  </Form.Group>
                  <Form.Check 
                    type="checkbox" 
                    label={
                      <span>
                        <span className={styles.checkboxIcon}>🎯</span>
                        Free Preview
                      </span>
                    }
                    checked={contentFormData.isFree} 
                    onChange={(e) => setContentFormData({ ...contentFormData, isFree: e.target.checked })} 
                    className={styles.checkbox}
                  />

                  <Button type="submit" variant="primary" disabled={uploadLoading} className={styles.submitButton}>
                    {uploadLoading ? (
                      <>
                        <Spinner as="span" animation="border" size="sm" className={styles.spinner}/>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <span className={styles.buttonIcon}>📤</span>
                        Add Content
                      </>
                    )}
                  </Button>
                </Form>
              )}
            </Card.Body>
          </Card>
        ) : (
          <>
            {renderStatistics()}
            {renderContentTable()}
          </>
        )}
      </Modal.Body>
      <Modal.Footer className={styles.modalFooter}>
        <Button variant="secondary" onClick={handleModalClose} className={styles.cancelButton}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CourseContentModal;