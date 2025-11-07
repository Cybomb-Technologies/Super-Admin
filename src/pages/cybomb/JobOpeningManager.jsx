import React, { useState, useEffect } from "react";
import {
  Briefcase,
  PlusCircle,
  Edit,
  Trash2,
  Clock,
  Users,
  MapPin,
  DollarSign,
  Loader,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Search,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import styles from './JobOpeningManager.module.css';

const API_BASE_URL = import.meta.env.VITE_CYBOMB_API_BASE || 'http://localhost:5002';

const JobOpeningManager = ({ onJobOpeningsUpdate }) => {
  const [jobOpenings, setJobOpenings] = useState([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [jobToEdit, setJobToEdit] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const departments = [
    "Engineering",
    "Design",
    "Product",
    "Quality Assurance",
    "Marketing",
    "Sales",
    "Operations",
    "Human Resources",
    "Finance",
    "Customer Support"
  ];

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchJobOpenings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem("adminToken");
      const response = await fetch(`${API_BASE_URL}/api/applications`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch job openings: ${response.status}`);
      }

      const result = await response.json();
      const jobOpeningsData = Array.isArray(result?.data) ? result.data : 
                            Array.isArray(result) ? result : [];

      setJobOpenings(jobOpeningsData);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.message);
      console.error('Error fetching job openings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobOpenings();
  }, []);

  const handleEdit = (job) => {
    setJobToEdit(job);
    setIsFormVisible(true);
  };

  const handleCreateNew = () => {
    setJobToEdit(null);
    setIsFormVisible(true);
    setMessage("");
  };

  const handleCancel = () => {
    setIsFormVisible(false);
    setJobToEdit(null);
    fetchJobOpenings();
    if (onJobOpeningsUpdate) {
      onJobOpeningsUpdate();
    }
  };

  const handleDelete = async (jobId) => {
    if (!window.confirm("Are you sure you want to delete this job opening?")) return;

    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(`${API_BASE_URL}/api/applications/${jobId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete job opening');
      }

      setMessage("Job opening deleted successfully!");
      fetchJobOpenings();
      if (onJobOpeningsUpdate) {
        onJobOpeningsUpdate();
      }
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Error deleting job opening:", error);
      setMessage(`Error deleting job opening: ${error.message}`);
    }
  };

  const toggleStatus = async (jobId, currentStatus) => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(`${API_BASE_URL}/api/applications/${jobId}/status`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to update job status');
      }

      setMessage(`Job opening ${!currentStatus ? "activated" : "deactivated"} successfully!`);
      fetchJobOpenings();
      if (onJobOpeningsUpdate) {
        onJobOpeningsUpdate();
      }
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Error toggling job status:", error);
      setMessage(`Error: ${error.message}`);
    }
  };

  const handleRetry = () => {
    fetchJobOpenings();
  };

  const toggleRowExpand = (id) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const filteredJobOpenings = jobOpenings.filter(job => {
    const matchesSearch = 
      job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDepartment = 
      filterDepartment === 'all' || 
      job.department?.toLowerCase() === filterDepartment.toLowerCase();

    const matchesStatus = 
      filterStatus === 'all' || 
      (filterStatus === 'active' && job.isActive) ||
      (filterStatus === 'inactive' && !job.isActive);

    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const ApplicationForm = ({ applicationToEdit, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
      title: applicationToEdit?.title || "",
      department: applicationToEdit?.department || "Engineering",
      location: applicationToEdit?.location || "",
      type: applicationToEdit?.type || "Full-time",
      salary: applicationToEdit?.salary || "",
      description: applicationToEdit?.description || "",
      requirements: applicationToEdit?.requirements?.join(", ") || "",
      responsibilities: applicationToEdit?.responsibilities?.join(", ") || "",
      benefits: applicationToEdit?.benefits?.join(", ") || "",
      experienceLevel: applicationToEdit?.experienceLevel || "Mid",
      isActive: applicationToEdit?.isActive ?? true,
    });

    const [isLoading, setIsLoading] = useState(false);
    const [formMessage, setFormMessage] = useState("");

    const jobTypes = [
      "Full-time",
      "Part-time",
      "Contract",
      "Internship",
      "Remote",
    ];

    const experienceLevels = ["Entry", "Mid", "Senior", "Lead", "Executive"];

    const isEditMode = !!applicationToEdit;

    const handleChange = (e) => {
      const { name, value, type, checked } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (
        !formData.title ||
        !formData.department ||
        !formData.location ||
        !formData.type ||
        !formData.salary ||
        !formData.description
      ) {
        setFormMessage("Please fill in all required fields.");
        return;
      }

      setIsLoading(true);
      setFormMessage("");

      try {
        const token = localStorage.getItem("adminToken");
        const url = isEditMode
          ? `${API_BASE_URL}/api/applications/${applicationToEdit._id}`
          : `${API_BASE_URL}/api/applications`;

        const method = isEditMode ? "PUT" : "POST";

        const response = await fetch(url, {
          method,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...formData,
            requirements: formData.requirements
              ? formData.requirements
                  .split(",")
                  .map((req) => req.trim())
                  .filter((req) => req)
              : [],
            responsibilities: formData.responsibilities
              ? formData.responsibilities
                  .split(",")
                  .map((resp) => resp.trim())
                  .filter((resp) => resp)
              : [],
            benefits: formData.benefits
              ? formData.benefits
                  .split(",")
                  .map((benefit) => benefit.trim())
                  .filter((benefit) => benefit)
              : [],
          }),
        });

        const data = await response.json();

        if (response.ok) {
          setFormMessage(
            isEditMode
              ? "Job opening updated successfully!"
              : "Job opening created successfully!"
          );
          setTimeout(() => {
            onSubmit();
          }, 1500);
        } else {
          throw new Error(data.message || "Failed to save job opening");
        }
      } catch (error) {
        console.error("Error submitting job opening:", error);
        setFormMessage(`Error: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    return (
      <div className={styles.card}>
        <div className={styles.cardBody}>
          <h3 className={styles.cardTitle}>
            {isEditMode ? "Edit Job Opening" : "Create New Job Opening"}
          </h3>
          <form onSubmit={handleSubmit}>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Job Title *</label>
                <input
                  type="text"
                  name="title"
                  placeholder="Senior Full Stack Developer"
                  value={formData.title}
                  onChange={handleChange}
                  className={styles.formControl}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Department *</label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className={styles.formSelect}
                  required
                >
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Location *</label>
                <input
                  type="text"
                  name="location"
                  placeholder="Bangalore / Remote"
                  value={formData.location}
                  onChange={handleChange}
                  className={styles.formControl}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Job Type *</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className={styles.formSelect}
                  required
                >
                  {jobTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Salary Range *</label>
                <input
                  type="text"
                  name="salary"
                  placeholder="₹15-25 LPA"
                  value={formData.salary}
                  onChange={handleChange}
                  className={styles.formControl}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Experience Level</label>
                <select
                  name="experienceLevel"
                  value={formData.experienceLevel}
                  onChange={handleChange}
                  className={styles.formSelect}
                >
                  {experienceLevels.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Job Description *</label>
              <textarea
                name="description"
                placeholder="Describe the role, responsibilities, and what you're looking for..."
                value={formData.description}
                onChange={handleChange}
                rows="4"
                className={styles.formControl}
                required
              ></textarea>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Requirements</label>
              <textarea
                name="requirements"
                placeholder="List requirements separated by commas..."
                value={formData.requirements}
                onChange={handleChange}
                rows="3"
                className={styles.formControl}
              ></textarea>
              <div className={styles.formText}>Separate requirements with commas</div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Responsibilities</label>
              <textarea
                name="responsibilities"
                placeholder="List key responsibilities separated by commas..."
                value={formData.responsibilities}
                onChange={handleChange}
                rows="3"
                className={styles.formControl}
              ></textarea>
              <div className={styles.formText}>Separate responsibilities with commas</div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Benefits</label>
              <textarea
                name="benefits"
                placeholder="List benefits separated by commas..."
                value={formData.benefits}
                onChange={handleChange}
                rows="3"
                className={styles.formControl}
              ></textarea>
              <div className={styles.formText}>Separate benefits with commas</div>
            </div>

            <div className={styles.formCheck}>
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className={styles.formCheckInput}
              />
              <label htmlFor="isActive" className={styles.formCheckLabel}>
                Active Job Opening
              </label>
            </div>

            <div className={styles.formActions}>
              <button
                type="button"
                onClick={onCancel}
                className={styles.secondaryButton}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className={styles.primaryButton}
              >
                {isLoading ? (
                  <Loader className={`${styles.buttonIcon} ${styles.spin}`} />
                ) : isEditMode ? (
                  <Edit className={styles.buttonIcon} />
                ) : (
                  <PlusCircle className={styles.buttonIcon} />
                )}
                {isEditMode ? "Update Opening" : "Create Opening"}
              </button>
            </div>
            {formMessage && (
              <div className={`${styles.alert} ${formMessage.includes("Error") ? styles.alertDanger : styles.alertSuccess}`}>
                {!formMessage.includes("Error") && <CheckCircle className={styles.alertIcon} />}
                {formMessage}
              </div>
            )}
          </form>
        </div>
      </div>
    );
  };

  const renderMobileCard = (job) => (
    <div key={job._id} className={styles.mobileCard}>
      <div className={styles.cardHeader}>
        <div className={styles.jobInfo}>
          <div className={styles.jobAvatar}>
            <Briefcase />
          </div>
          <div>
            <div className={styles.jobTitle}>{job.title || 'N/A'}</div>
            <div className={styles.jobDepartment}>{job.department || 'N/A'}</div>
          </div>
        </div>
        <div className={styles.cardActions}>
          <button
            onClick={() => handleEdit(job)}
            className={styles.viewButton}
            title="Edit job"
          >
            <Edit />
          </button>
          <button
            onClick={() => toggleRowExpand(job._id)}
            className={styles.expandButton}
          >
            {expandedRows.has(job._id) ? <ChevronUp /> : <ChevronDown />}
          </button>
        </div>
      </div>

      <div className={styles.cardContent}>
        <div className={styles.cardField}>
          <span className={styles.fieldLabel}>Location:</span>
          <span className={styles.fieldValue}>{job.location || 'N/A'}</span>
        </div>
        
        <div className={styles.cardField}>
          <span className={styles.fieldLabel}>Salary:</span>
          <span className={styles.fieldValue}>{job.salary || 'N/A'}</span>
        </div>

        <div className={styles.cardField}>
          <span className={styles.fieldLabel}>Status:</span>
          <span className={`${styles.statusBadge} ${job.isActive ? styles.statusActive : styles.statusInactive}`}>
            {job.isActive ? "Active" : "Inactive"}
          </span>
        </div>

        {expandedRows.has(job._id) && (
          <div className={styles.expandedContent}>
            <div className={styles.cardField}>
              <span className={styles.fieldLabel}>Type:</span>
              <span>{job.type || 'Not specified'}</span>
            </div>
            <div className={styles.cardField}>
              <span className={styles.fieldLabel}>Experience:</span>
              <span>{job.experienceLevel || 'Not specified'}</span>
            </div>
            <div className={styles.cardField}>
              <span className={styles.fieldLabel}>Description:</span>
              <div className={styles.descriptionPreview}>
                {job.description?.substring(0, 100) || 'No description'}
                {job.description && job.description.length > 100 && '...'}
              </div>
            </div>
            <div className={styles.cardField}>
              <span className={styles.fieldLabel}>Created:</span>
              <span>{formatDate(job.createdAt)}</span>
            </div>
            <div className={styles.cardActions}>
              <button
                onClick={() => toggleStatus(job._id, job.isActive)}
                className={`${styles.statusButton} ${job.isActive ? styles.warningButton : styles.successButton}`}
              >
                {job.isActive ? "Deactivate" : "Activate"}
              </button>
              <button
                onClick={() => handleDelete(job._id)}
                className={styles.deleteButton}
              >
                <Trash2 className={styles.smallIcon} />
                Delete
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderTableRow = (job) => (
    <tr key={job._id} className={styles.tableRow}>
      <td className={styles.tableCell}>
        <div className={styles.jobCell}>
          <div className={styles.jobAvatar}>
            <Briefcase />
          </div>
          <div className={styles.jobInfo}>
            <div className={styles.jobTitle}>{job.title || 'N/A'}</div>
            <div className={styles.jobDate}>
              <Clock className={styles.smallIcon} />
              {formatDate(job.createdAt)}
            </div>
          </div>
        </div>
      </td>
      
      <td className={styles.tableCell}>
        <span className={styles.departmentBadge}>
          {job.department || 'N/A'}
        </span>
      </td>
      
      <td className={styles.tableCell}>
        <div className={styles.locationCell}>
          <MapPin className={styles.smallIcon} />
          {job.location || 'N/A'}
        </div>
      </td>
      
      <td className={styles.tableCell}>
        <span className={`${styles.statusBadge} ${job.isActive ? styles.statusActive : styles.statusInactive}`}>
          {job.isActive ? "Active" : "Inactive"}
        </span>
      </td>
      
      <td className={styles.tableCell}>
        <div className={styles.actionCell}>
          <button
            className={styles.viewButton}
            onClick={() => handleEdit(job)}
            title="Edit job"
          >
            <Edit />
          </button>
          <button
            className={`${styles.statusButton} ${job.isActive ? styles.warningButton : styles.successButton}`}
            onClick={() => toggleStatus(job._id, job.isActive)}
            title={job.isActive ? "Deactivate" : "Activate"}
          >
            {job.isActive ? "Deactivate" : "Activate"}
          </button>
          <button
            className={styles.deleteButton}
            onClick={() => handleDelete(job._id)}
            title="Delete job"
          >
            <Trash2 />
          </button>
        </div>
      </td>
    </tr>
  );

  if (isFormVisible) {
    return (
      <ApplicationForm
        applicationToEdit={jobToEdit}
        onSubmit={handleCancel}
        onCancel={handleCancel}
      />
    );
  }

  if (loading && jobOpenings.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <h3>Loading Job Openings...</h3>
          <p>Please wait while we fetch your data</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>
            <Briefcase className={styles.headerIcon} />
            Job Openings Management
          </h1>
          <p className={styles.subtitle}>
            Create and manage all job openings
          </p>
          {lastUpdated && (
            <p className={styles.lastUpdated}>
              Last updated: {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
        </div>
        <div className={styles.headerStats}>
          <div className={styles.statBadge}>
            <span className={styles.statNumber}>{jobOpenings.length}</span>
            <span className={styles.statLabel}>Total Openings</span>
          </div>
          <button
            onClick={handleRetry}
            disabled={loading}
            className={styles.refreshButton}
          >
            <RefreshCw className={loading ? styles.spin : ''} />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className={styles.alert}>
          <AlertCircle className={styles.alertIcon} />
          <div>
            <p className={styles.alertTitle}>Error loading data</p>
            <p className={styles.alertMessage}>{error}</p>
          </div>
        </div>
      )}

      {message && (
        <div className={`${styles.alert} ${message.includes("Error") ? styles.alertDanger : styles.alertSuccess}`}>
          {!message.includes("Error") ? (
            <CheckCircle className={styles.alertIcon} />
          ) : (
            <AlertCircle className={styles.alertIcon} />
          )}
          {message}
        </div>
      )}

      {/* Controls */}
      <div className={styles.controls}>
        <div className={styles.searchBox}>
          <Search className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search job openings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        
        <div className={styles.filterGroup}>
          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All Departments</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          
          <button
            onClick={handleCreateNew}
            className={styles.primaryButton}
          >
            <PlusCircle className={styles.buttonIcon} />
            New Opening
          </button>
        </div>
      </div>

      {/* Content */}
      <div className={styles.content}>
        {filteredJobOpenings.length === 0 ? (
          <div className={styles.emptyState}>
            <Briefcase className={styles.emptyIcon} />
            <h3>
              {jobOpenings.length === 0 ? 'No job openings yet' : 'No job openings found'}
            </h3>
            <p>
              {jobOpenings.length === 0 
                ? 'Get started by creating your first job opening!' 
                : 'Try adjusting your search or filter criteria.'
              }
            </p>
            {(searchTerm || filterDepartment !== 'all' || filterStatus !== 'all') && (
              <button
                className={styles.clearButton}
                onClick={() => {
                  setSearchTerm('');
                  setFilterDepartment('all');
                  setFilterStatus('all');
                }}
              >
                Clear filters
              </button>
            )}
            {jobOpenings.length === 0 && (
              <button
                onClick={handleCreateNew}
                className={styles.primaryButton}
              >
                Create First Opening
              </button>
            )}
          </div>
        ) : isMobile ? (
          // Mobile Card View
          <div className={styles.mobileView}>
            {filteredJobOpenings.map(renderMobileCard)}
          </div>
        ) : (
          // Desktop Table View
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead className={styles.tableHeader}>
                <tr>
                  <th>Job Title</th>
                  <th>Department</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody className={styles.tableBody}>
                {filteredJobOpenings.map(renderTableRow)}
              </tbody>
            </table>
            
            <div className={styles.tableFooter}>
              <span className={styles.footerText}>
                Showing {filteredJobOpenings.length} of {jobOpenings.length} job openings
              </span>
              <span className={styles.footerText}>
                Last updated: {new Date().toLocaleTimeString()}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobOpeningManager;