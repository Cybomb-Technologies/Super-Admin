import { useEffect, useState } from "react";
import { Search, Plus, FileText, Edit, Trash2, X } from "lucide-react";
import styles from './PressRelease.module.css';

const API_URL = import.meta.env.VITE_CYBOMB_API_BASE; 

function AdminPressreleaseCybomb() {
  const [press, setPress] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    content: "",
    category: "",
    author: "",
    status: "published",
    createdAt: "",
    image: ""
  });
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

  // Handle form input change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const url = editingId
      ? `${API_URL}/api/pressrelease/${editingId}`
      : `${API_URL}/api/pressrelease`;

    const method = editingId ? "PUT" : "POST";

    try {
      await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });
      handleClosePopup();
      fetchData();
    } catch (error) {
      console.error("Error saving press release:", error);
    }
  };

  // Edit press release
  const handleEdit = (item) => {
    setForm({
      title: item.title,
      description: item.description,
      content: item.content,
      category: item.category,
      author: item.author,
      status: item.status,
      createdAt: item.createdAt ? item.createdAt.split("T")[0] : "",
      image: item.image || ""
    });
    setEditingId(item._id);
    setShowPopup(true);
  };

  // Delete press release
  const handleDelete = async (id) => {
    try {
      await fetch(`${API_URL}/api/pressrelease/${id}`, { method: "DELETE" });
      setDeleteConfirm({ show: false, id: null });
      fetchData();
    } catch (error) {
      console.error("Error deleting press release:", error);
    }
  };

  // New press release popup
  const handleNewPressRelease = () => {
    setForm({
      title: "",
      description: "",
      content: "",
      category: "",
      author: "",
      status: "published",
      createdAt: new Date().toISOString().split('T')[0],
      image: ""
    });
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
      image: ""
    });
  };

  // Filter based on search
  const filteredData = press.filter(
    (item) =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingContent}>
          <div className={styles.spinner} role="status">
            <span className={styles.visuallyHidden}>Loading...</span>
          </div>
          <p className={styles.loadingText}>Loading press releases...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>
            <FileText className={styles.icon} />
            Press Release Management
          </h1>
          <p className={styles.subtitle}>Create and manage your press releases</p>
        </div>
        <div className={styles.headerActions}>
          <button onClick={handleNewPressRelease} className={`${styles.button} ${styles.primary}`}>
            <Plus className={styles.icon} />
            New Press Release
          </button>
        </div>
      </div>

      {/* Search Controls */}
      <div className={styles.controls}>
        <div className={styles.searchInput}>
          <Search className={styles.icon} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Search by title or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '40px', width: '100%' }}
          />
        </div>
      </div>

      {/* Popup Form */}
      {showPopup && (
        <div className={styles.popupOverlay}>
          <div className={styles.popup}>
            <div className={styles.popupHeader}>
              <h2 className={styles.popupTitle}>
                {editingId ? "Edit Press Release" : "New Press Release"}
              </h2>
              <button onClick={handleClosePopup} className={styles.closeButton}>
                <X className={styles.icon} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className={styles.popupForm}>
              <input
                type="text"
                name="title"
                placeholder="Title"
                value={form.title}
                onChange={handleChange}
                required
                className={styles.input}
              />
              <textarea
                name="description"
                placeholder="Short Description"
                value={form.description}
                onChange={handleChange}
                className={styles.textarea}
              />
              <textarea
                name="content"
                placeholder="Full Content"
                value={form.content}
                onChange={handleChange}
                className={styles.textarea}
                style={{ height: "120px" }}
              />
              <input
                type="text"
                name="category"
                placeholder="Category"
                value={form.category}
                onChange={handleChange}
                className={styles.input}
              />
              <input
                type="text"
                name="author"
                placeholder="Author"
                value={form.author}
                onChange={handleChange}
                className={styles.input}
              />
              <input
                type="date"
                name="createdAt"
                value={form.createdAt}
                onChange={handleChange}
                className={styles.input}
              />
              <input
                type="url"
                name="image"
                placeholder="Image URL"
                value={form.image}
                onChange={handleChange}
                className={styles.input}
              />
              {form.image && (
                <div className={styles.imagePreview}>
                  <img
                    src={form.image}
                    alt="Preview"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      const parent = e.target.parentNode;
                      if (!parent.querySelector('.previewFallback')) {
                        const fallback = document.createElement('div');
                        fallback.className = 'previewFallback';
                        fallback.textContent = 'Invalid Image URL';
                        parent.appendChild(fallback);
                      }
                    }}
                  />
                  <div className={styles.previewFallback} style={{ display: 'none' }}>
                    Invalid Image URL
                  </div>
                </div>
              )}
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className={styles.select}
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
              <div className={styles.formButtons}>
                <button type="button" onClick={handleClosePopup} className={styles.cancelButton}>
                  Cancel
                </button>
                <button type="submit" className={styles.submitButton}>
                  {editingId ? "Update" : "Add"} Press Release
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm.show && (
        <div className={styles.popupOverlay}>
          <div className={styles.confirmationPopup}>
            <h3 className={styles.confirmTitle}>Confirm Delete</h3>
            <p className={styles.confirmText}>
              Are you sure you want to delete this press release? This action cannot be undone.
            </p>
            <div className={styles.confirmButtons}>
              <button
                onClick={() => setDeleteConfirm({ show: false, id: null })}
                className={styles.cancelButton}
              >
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteConfirm.id)} className={styles.deleteConfirmButton}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className={styles.card}>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>Image</th>
                <th className={styles.th}>Title</th>
                <th className={styles.th}>Category</th>
                <th className={styles.th}>Status</th>
                <th className={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item) => (
                <tr key={item._id} className={styles.tr}>
                  <td className={styles.td}>
                    {item.image ? (
                      <>
                        <img
                          src={item.image}
                          alt={item.title}
                          style={{ width: "80px", height: "50px", objectFit: "cover", borderRadius: "5px" }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            let fallback = e.target.nextSibling;
                            if (!fallback || !fallback.classList.contains('imageFallback')) {
                              fallback = document.createElement('span');
                              fallback.className = 'imageFallback';
                              fallback.textContent = 'No Image';
                              fallback.style.cssText = 'color: #64748b; font-size: 12px;';
                              e.target.parentNode.appendChild(fallback);
                            }
                          }}
                        />
                        <span className="imageFallback" style={{ display: 'none', color: '#64748b', fontSize: '12px' }}>
                          No Image
                        </span>
                      </>
                    ) : (
                      "No Image"
                    )}
                  </td>
                  <td className={styles.td}>{item.title}</td>
                  <td className={styles.td}>{item.category}</td>
                  <td className={styles.td}>
                    <span
                      className={`${styles.status} ${
                        item.status === "published" ? styles.statusPublished : styles.statusDraft
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className={styles.td}>
                    <button onClick={() => handleEdit(item)} className={styles.editButton}>
                      <Edit className={styles.icon} style={{ width: '14px', height: '14px', marginRight: '4px' }} />
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteConfirm({ show: true, id: item._id })}
                      className={styles.deleteButton}
                    >
                      <Trash2 className={styles.icon} style={{ width: '14px', height: '14px', marginRight: '4px' }} />
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredData.length === 0 && !loading && (
        <div className={styles.noResults}>
          <FileText className={styles.emptyIcon} style={{ width: '4rem', height: '4rem', color: '#64748b', opacity: '0.5', marginBottom: '1.5rem' }} />
          <h5 className={styles.emptyTitle}>No press releases found</h5>
          <p className={styles.emptyText}>
            {searchTerm 
              ? "Try adjusting your search to see more results" 
              : "Press releases will appear here once they are created"}
          </p>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className={`${styles.button} ${styles.primary}`}
            >
              Clear Search
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default AdminPressreleaseCybomb;