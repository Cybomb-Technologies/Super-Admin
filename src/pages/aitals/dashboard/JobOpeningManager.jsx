import React, { useState, useEffect } from "react";
import {
  Briefcase,
  PlusCircle,
  Edit,
  Trash2,
  Clock,
  MapPin,
  DollarSign,
  Loader,
  CheckCircle,
  Building,
  Target,
  Award,
  Sparkles
} from "lucide-react";
import styles from "./JobOpeningManager.module.css";

const API_BASE_URL = import.meta.env.VITE_AITALS_API_URL;

// ---------- Form Component ----------
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
  const [message, setMessage] = useState("");

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
      setMessage("Please fill in all required fields.");
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      const url = isEditMode
        ? `${API_BASE_URL}/api/applications/${applicationToEdit._id}`
        : `${API_BASE_URL}/api/applications`;
      const method = isEditMode ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
        body: JSON.stringify({
          ...formData,
          requirements: formData.requirements
            ? formData.requirements.split(",").map((r) => r.trim())
            : [],
          responsibilities: formData.responsibilities
            ? formData.responsibilities.split(",").map((r) => r.trim())
            : [],
          benefits: formData.benefits
            ? formData.benefits.split(",").map((b) => b.trim())
            : [],
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(
          isEditMode
            ? "Job opening updated successfully! 🎉"
            : "Job opening created successfully! 🎉"
        );
        setTimeout(() => {
          onSubmit();
        }, 1500);
      } else {
        throw new Error(data.message || "Failed to save job opening");
      }
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.formContainer}>
      <h3 className={styles.formTitle}>
        <Sparkles className="w-6 h-6" />
        {isEditMode ? "Edit Job Opening" : "Create New Job Opening"}
      </h3>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className={styles.formGrid}>
          {/* Job Title */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              <Target className="w-4 h-4" />
              Job Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Full Stack Developer"
              className={styles.formInput}
              required
            />
          </div>

          {/* Department */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              <Building className="w-4 h-4" />
              Department *
            </label>
            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              className={styles.formSelect}
            >
              {[
                "Engineering",
                "Design",
                "Product",
                "Marketing",
                "Sales",
                "HR",
                "Finance",
              ].map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Location */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              <MapPin className="w-4 h-4" />
              Location *
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Chennai / Remote"
              className={styles.formInput}
              required
            />
          </div>

          {/* Type */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              <Clock className="w-4 h-4" />
              Type *
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className={styles.formSelect}
            >
              {["Full-time", "Part-time", "Contract", "Internship"].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Salary */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              <DollarSign className="w-4 h-4" />
              Salary *
            </label>
            <input
              type="text"
              name="salary"
              value={formData.salary}
              onChange={handleChange}
              placeholder="₹10–20 LPA"
              className={styles.formInput}
              required
            />
          </div>

          {/* Experience */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              <Award className="w-4 h-4" />
              Experience Level
            </label>
            <select
              name="experienceLevel"
              value={formData.experienceLevel}
              onChange={handleChange}
              className={styles.formSelect}
            >
              {["Entry", "Mid", "Senior", "Lead"].map((l) => (
                <option key={l}>{l}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Description */}
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Job Description *</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe the role and key details..."
            rows="4"
            className={styles.formTextarea}
            required
          ></textarea>
        </div>

        {/* Requirements */}
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Requirements</label>
          <textarea
            name="requirements"
            value={formData.requirements}
            onChange={handleChange}
            placeholder="Key skills (comma separated)"
            rows="3"
            className={styles.formTextarea}
          ></textarea>
        </div>

        <div className={styles.formActions}>
          <button
            type="button"
            onClick={onCancel}
            className={styles.cancelButton}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className={styles.submitButton}
          >
            {isLoading ? (
              <Loader className={`w-5 h-5 ${styles.loadingSpinner}`} />
            ) : (
              <PlusCircle className="w-5 h-5" />
            )}
            {isEditMode ? "Update Job" : "Create Job"}
          </button>
        </div>

        {message && (
          <div
            className={`${styles.message} ${
              message.includes("Error")
                ? styles.messageError
                : styles.messageSuccess
            }`}
          >
            {!message.includes("Error") && <CheckCircle className="w-5 h-5" />}
            {message}
          </div>
        )}
      </form>
    </div>
  );
};

// ---------- Main Manager Component ----------
const JobOpeningManager = () => {
  const [applications, setApplications] = useState([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [applicationToEdit, setApplicationToEdit] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  // ✅ Fetch job openings safely
  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/applications`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      });
      const data = await response.json();

      // ✅ Ensure array always
      const jobsArray = Array.isArray(data)
        ? data
        : data.applications || data.data || [];

      setApplications(jobsArray);
    } catch (error) {
      setMessage(`Error fetching jobs: ${error.message}`);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  // ✅ Delete Job
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this job opening?"))
      return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/applications/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      });
      if (res.ok) {
        setMessage("🎉 Job deleted successfully!");
        fetchApplications();
        setTimeout(() => setMessage(""), 3000);
      } else throw new Error("Failed to delete");
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  };

  // ✅ Toggle Status
  const toggleStatus = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/applications/${id}/status`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      });
      if (res.ok) {
        setMessage("✅ Status updated successfully!");
        fetchApplications();
        setTimeout(() => setMessage(""), 3000);
      } else throw new Error("Failed to toggle status");
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingState}>
          <Loader className={`w-8 h-8 ${styles.loadingSpinner}`} />
          <span>Loading job openings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>
          <Briefcase className={styles.titleIcon} />
          Job Openings Manager
          <span className={styles.jobCount}>({applications.length})</span>
        </h1>

        <button
          onClick={() => {
            setApplicationToEdit(null);
            setIsFormVisible(true);
          }}
          className={styles.createButton}
        >
          <PlusCircle className="w-5 h-5" />
          New Job Opening
        </button>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`${styles.message} ${
            message.includes("Error")
              ? styles.messageError
              : styles.messageSuccess
          }`}
        >
          {message}
        </div>
      )}

      {/* Form or Job List */}
      {isFormVisible ? (
        <ApplicationForm
          applicationToEdit={applicationToEdit}
          onSubmit={() => {
            setIsFormVisible(false);
            setApplicationToEdit(null);
            fetchApplications();
          }}
          onCancel={() => {
            setIsFormVisible(false);
            setApplicationToEdit(null);
          }}
        />
      ) : (
        <div className={styles.jobsGrid}>
          {(Array.isArray(applications) ? applications : []).length === 0 ? (
            <div className={styles.emptyState}>
              <Briefcase className={styles.emptyIcon} />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                No Job Openings Yet
              </h3>
              <p className="text-gray-500">
                Create your first job opening to start attracting talent!
              </p>
            </div>
          ) : (
            applications.map((job) => (
              <div key={job._id} className={styles.jobCard}>
                {/* Card Header */}
                <div className={styles.cardHeader}>
                  <span
                    className={`${styles.statusBadge} ${
                      job.isActive ? styles.statusActive : styles.statusInactive
                    }`}
                  >
                    {job.isActive ? "📢 Active" : "⏸️ Inactive"}
                  </span>
                  <span className={styles.date}>
                    {new Date(job.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>

                {/* Job Title & Location */}
                <h3 className={styles.jobTitle}>{job.title}</h3>
                <div className={styles.jobLocation}>
                  <MapPin className="w-4 h-4" />
                  {job.location}
                </div>

                {/* Job Description */}
                <p className={styles.jobDescription}>{job.description}</p>

                {/* Meta Information */}
                <div className={styles.jobMeta}>
                  <div className={styles.metaItem}>
                    <Building className={styles.metaIcon} />
                    {job.department}
                  </div>
                  <div className={styles.metaItem}>
                    <Clock className={styles.metaIcon} />
                    {job.type}
                  </div>
                  <div className={styles.metaItem}>
                    <DollarSign className={styles.metaIcon} />
                    {job.salary}
                  </div>
                  <div className={styles.metaItem}>
                    <Award className={styles.metaIcon} />
                    {job.experienceLevel}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className={styles.cardActions}>
                  <button
                    onClick={() => {
                      setApplicationToEdit(job);
                      setIsFormVisible(true);
                    }}
                    className={styles.editButton}
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => toggleStatus(job._id)}
                    className={`${styles.statusButton} ${
                      job.isActive
                        ? styles.statusButtonActive
                        : styles.statusButtonInactive
                    }`}
                  >
                    {job.isActive ? "Deactivate" : "Activate"}
                  </button>
                  <button
                    onClick={() => handleDelete(job._id)}
                    className={styles.deleteButton}
                    title="Delete Job"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default JobOpeningManager;
