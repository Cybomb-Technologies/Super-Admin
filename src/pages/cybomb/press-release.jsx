import { useEffect, useState } from "react";
import styles from './press-release.module.css';

const API_URL = import.meta.env.VITE_CYBOMB_API_BASE;

function Pressrelease() {
  const [press, setPress] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    content: "",
    category: "",
    author: "",
    status: "published",
    createdAt: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null });
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch press releases
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/pressrelease`);
      const data = await res.json();
      setPress(data);
    } catch (error) {
      console.error("Error fetching press releases:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle image file
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.keys(form).forEach((key) => formData.append(key, form[key]));
    if (imageFile) formData.append("image", imageFile);

    const url = editingId
      ? `${API_URL}/api/pressrelease/${editingId}`
      : `${API_URL}/api/pressrelease`;
    const method = editingId ? "PUT" : "POST";

    try {
      await fetch(url, { method, body: formData });
      // Reset form
      setForm({
        title: "",
        description: "",
        content: "",
        category: "",
        author: "",
        status: "published",
        createdAt: "",
      });
      setImageFile(null);
      setImagePreview(null);
      setEditingId(null);
      setShowPopup(false);
      fetchData();
    } catch (error) {
      console.error("Error saving press release:", error);
    }
  };

  // Edit record
  const handleEdit = (item) => {
    setForm({
      title: item.title,
      description: item.description,
      content: item.content,
      category: item.category,
      author: item.author,
      status: item.status,
      createdAt: item.createdAt ? item.createdAt.split("T")[0] : "",
    });
    setImagePreview(item.image ? `${API_URL}${item.image}` : null);
    setEditingId(item._id);
    setShowPopup(true);
  };

  // Delete record
  const handleDelete = async (id) => {
    try {
      await fetch(`${API_URL}/api/pressrelease/${id}`, { method: "DELETE" });
      setDeleteConfirm({ show: false, id: null });
      fetchData();
    } catch (error) {
      console.error("Error deleting press release:", error);
    }
  };

  // Create new
  const handleNewPressRelease = () => {
    setForm({
      title: "",
      description: "",
      content: "",
      category: "",
      author: "",
      status: "published",
      createdAt: new Date().toISOString().split('T')[0],
    });
    setImageFile(null);
    setImagePreview(null);
    setEditingId(null);
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    setEditingId(null);
    setForm({
      title: "",
      description: "",
      content: "",
      category: "",
      author: "",
      status: "published",
      createdAt: "",
    });
    setImageFile(null);
    setImagePreview(null);
  };

  // Filtered search
  const filteredData = press.filter(
    (item) =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusCount = (status) => {
    return press.filter(item => item.status === status).length;
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.titleSection}>
            <h1 className={styles.title}>Press Release Management</h1>
            <p className={styles.subtitle}>Create and manage your press releases</p>
          </div>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>📰</div>
          <div className={styles.statContent}>
            <div className={styles.statNumber}>{press.length}</div>
            <div className={styles.statLabel}>Total Press Releases</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>✅</div>
          <div className={styles.statContent}>
            <div className={styles.statNumber}>{getStatusCount('published')}</div>
            <div className={styles.statLabel}>Published</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>📝</div>
          <div className={styles.statContent}>
            <div className={styles.statNumber}>{getStatusCount('draft')}</div>
            <div className={styles.statLabel}>Drafts</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>🔍</div>
          <div className={styles.statContent}>
            <div className={styles.statNumber}>{filteredData.length}</div>
            <div className={styles.statLabel}>Filtered Results</div>
          </div>
        </div>
      </div>

      <div className={styles.controls}>
        <div className={styles.searchContainer}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            type="text"
            placeholder="Search by title or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <button onClick={handleNewPressRelease} className={styles.newButton}>
          <span className={styles.plusIcon}>+</span>
          New Press Release
        </button>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Loading press releases...</p>
        </div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.imageColumn}>Image</th>
                <th className={styles.titleColumn}>Title</th>
                <th className={styles.categoryColumn}>Category</th>
                <th className={styles.statusColumn}>Status</th>
                <th className={styles.actionsColumn}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item) => (
                <tr key={item._id} className={styles.tableRow}>
                  <td className={styles.imageCell}>
                    {item.image ? (
                      <img
                        src={`${API_URL}${item.image}`}
                        alt={item.title}
                        className={styles.pressImage}
                      />
                    ) : (
                      <div className={styles.noImage}>No Image</div>
                    )}
                  </td>
                  <td className={styles.titleCell}>
                    <div className={styles.titleText}>{item.title}</div>
                    {item.description && (
                      <div className={styles.descriptionText}>
                        {item.description.slice(0, 60)}...
                      </div>
                    )}
                  </td>
                  <td className={styles.categoryCell}>
                    <span className={styles.categoryBadge}>{item.category}</span>
                  </td>
                  <td className={styles.statusCell}>
                    <span
                      className={`${styles.status} ${
                        item.status === "published" ? styles.statusPublished : styles.statusDraft
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className={styles.actionsCell}>
                    <div className={styles.actionButtons}>
                      <button
                        onClick={() => handleEdit(item)}
                        className={styles.editButton}
                      >
                        <span className={styles.editIcon}>✏️</span>
                        Edit
                      </button>
                      <button
                        onClick={() =>
                          setDeleteConfirm({ show: true, id: item._id })
                        }
                        className={styles.deleteButton}
                      >
                        <span className={styles.deleteIcon}>🗑️</span>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredData.length === 0 && !loading && (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>📰</div>
              <h3>No press releases found</h3>
              <p>
                {searchTerm 
                  ? `No results found for "${searchTerm}"`
                  : "Get started by creating your first press release!"
                }
              </p>
              {!searchTerm && (
                <button
                  className={styles.newButton}
                  onClick={handleNewPressRelease}
                >
                  <span className={styles.plusIcon}>+</span>
                  Create Your First Press Release
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Popup Form */}
      {showPopup && (
        <div className={styles.modalBackdrop} onClick={handleClosePopup}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {editingId ? "Edit Press Release" : "New Press Release"}
              </h2>
              <button onClick={handleClosePopup} className={styles.closeButton}>
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} className={styles.modalForm}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Title *</label>
                  <input
                    type="text"
                    name="title"
                    placeholder="Enter press release title"
                    value={form.title}
                    onChange={handleChange}
                    required
                    className={styles.formInput}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Category *</label>
                  <input
                    type="text"
                    name="category"
                    placeholder="Enter category"
                    value={form.category}
                    onChange={handleChange}
                    required
                    className={styles.formInput}
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Author *</label>
                  <input
                    type="text"
                    name="author"
                    placeholder="Enter author name"
                    value={form.author}
                    onChange={handleChange}
                    required
                    className={styles.formInput}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Publish Date *</label>
                  <input
                    type="date"
                    name="createdAt"
                    value={form.createdAt}
                    onChange={handleChange}
                    required
                    className={styles.formInput}
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Short Description</label>
                <textarea
                  name="description"
                  placeholder="Enter a brief description"
                  value={form.description}
                  onChange={handleChange}
                  className={styles.formTextarea}
                  rows="3"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Full Content *</label>
                <textarea
                  name="content"
                  placeholder="Write the full press release content..."
                  value={form.content}
                  onChange={handleChange}
                  required
                  className={styles.formTextarea}
                  rows="6"
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Status</label>
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className={styles.formSelect}
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Featured Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className={styles.fileInput}
                  />
                </div>
              </div>

              {imagePreview && (
                <div className={styles.imagePreview}>
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className={styles.previewImage}
                  />
                </div>
              )}

              <div className={styles.modalFooter}>
                <button
                  type="button"
                  onClick={handleClosePopup}
                  className={styles.cancelButton}
                >
                  Cancel
                </button>
                <button type="submit" className={styles.submitButton}>
                  {editingId ? "Update" : "Create"} Press Release
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm.show && (
        <div className={styles.modalBackdrop}>
          <div className={styles.confirmationModal}>
            <div className={styles.confirmationHeader}>
              <h3 className={styles.confirmTitle}>Confirm Delete</h3>
            </div>
            <div className={styles.confirmationBody}>
              <div className={styles.warningIcon}>⚠️</div>
              <p className={styles.confirmText}>
                Are you sure you want to delete this press release? This action cannot be undone.
              </p>
            </div>
            <div className={styles.confirmationFooter}>
              <button
                onClick={() => setDeleteConfirm({ show: false, id: null })}
                className={styles.cancelButton}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm.id)}
                className={styles.deleteConfirmButton}
              >
                Delete Press Release
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Pressrelease;