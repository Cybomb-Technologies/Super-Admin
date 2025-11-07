import { useEffect, useState } from "react";

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
    image: "" // Added image URL field
  });
  const [editingId, setEditingId] = useState(null);

  const [showPopup, setShowPopup] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null });
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch press releases
  const fetchData = async () => {
    const res = await fetch(`${API_URL}/api/pressrelease`);
    const data = await res.json();
    setPress(data);
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

    await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(form),
    });

    // Reset form and popup
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
    setEditingId(null);
    setShowPopup(false);
    fetchData();
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
    await fetch(`${API_URL}/api/pressrelease/${id}`, { method: "DELETE" });
    setDeleteConfirm({ show: false, id: null });
    fetchData();
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
      createdAt: "",
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

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Admin Press Release Management</h1>

      {/* Search & New Button */}
      <div style={styles.controls}>
        <input
          type="text"
          placeholder="Search by title or category..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={styles.searchInput}
        />
        <button onClick={handleNewPressRelease} style={styles.newButton}>
          New Press Release
        </button>
      </div>

      {/* Popup Form */}
      {showPopup && (
        <div style={styles.popupOverlay}>
          <div style={styles.popup}>
            <div style={styles.popupHeader}>
              <h2 style={styles.popupTitle}>
                {editingId ? "Edit Press Release" : "New Press Release"}
              </h2>
              <button onClick={handleClosePopup} style={styles.closeButton}>
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} style={styles.popupForm}>
              <input
                type="text"
                name="title"
                placeholder="Title"
                value={form.title}
                onChange={handleChange}
                required
                style={styles.input}
              />
              <textarea
                name="description"
                placeholder="Short Description"
                value={form.description}
                onChange={handleChange}
                style={styles.textarea}
              />
              <textarea
                name="content"
                placeholder="Full Content"
                value={form.content}
                onChange={handleChange}
                style={{ ...styles.textarea, height: "100px" }}
              />
              <input
                type="text"
                name="category"
                placeholder="Category"
                value={form.category}
                onChange={handleChange}
                style={styles.input}
              />
              <input
                type="text"
                name="author"
                placeholder="Author"
                value={form.author}
                onChange={handleChange}
                style={styles.input}
              />
              <input
                type="date"
                name="createdAt"
                value={form.createdAt}
                onChange={handleChange}
                style={styles.input}
              />
              <input
                type="url"
                name="image"
                placeholder="Image URL"
                value={form.image}
                onChange={handleChange}
                style={styles.input}
              />
              {form.image && (
  <div style={{ position: 'relative' }}>
    <img
      src={form.image}
      alt="Preview"
      style={{
        width: "100px",
        height: "60px",
        objectFit: "cover",
        marginTop: "10px",
        borderRadius: "5px",
      }}
      onError={(e) => {
        e.target.style.display = 'none';
        // Create fallback message
        const parent = e.target.parentNode;
        if (!parent.querySelector('.preview-fallback')) {
          const fallback = document.createElement('div');
          fallback.className = 'preview-fallback';
          fallback.textContent = 'Invalid Image URL';
          fallback.style.cssText = 'color: #e74c3c; font-size: 12px; margin-top: 10px;';
          parent.appendChild(fallback);
        }
      }}
    />
    <div className="preview-fallback" style={{ display: 'none', color: '#e74c3c', fontSize: '12px', marginTop: '10px' }}>
      Invalid Image URL
    </div>
  </div>
)}{form.image && (
                <img
                  src={form.image}
                  alt="Preview"
                  style={{
                    width: "100px",
                    height: "60px",
                    objectFit: "cover",
                    marginTop: "10px",
                    borderRadius: "5px",
                  }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              )}
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                style={styles.select}
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
              <div style={styles.formButtons}>
                <button type="button" onClick={handleClosePopup} style={styles.cancelButton}>
                  Cancel
                </button>
                <button type="submit" style={styles.submitButton}>
                  {editingId ? "Update" : "Add"} Press Release
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm.show && (
        <div style={styles.popupOverlay}>
          <div style={styles.confirmationPopup}>
            <h3 style={styles.confirmTitle}>Confirm Delete</h3>
            <p style={styles.confirmText}>
              Are you sure you want to delete this press release? This action cannot be undone.
            </p>
            <div style={styles.confirmButtons}>
              <button
                onClick={() => setDeleteConfirm({ show: false, id: null })}
                style={styles.cancelButton}
              >
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteConfirm.id)} style={styles.deleteConfirmButton}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Image</th>
            <th style={styles.th}>Title</th>
            <th style={styles.th}>Category</th>
            <th style={styles.th}>Status</th>
            <th style={styles.th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((item) => (
            <tr key={item._id} style={styles.tr} className="table-row">
              <td style={styles.td}>
                {item.image ? (
                  <>
                    <img
                      src={item.image}
                      alt={item.title}
                      style={{ width: "80px", height: "50px", objectFit: "cover", borderRadius: "5px" }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        // Create a fallback text if it doesn't exist
                        let fallback = e.target.nextSibling;
                        if (!fallback || !fallback.classList.contains('image-fallback')) {
                          fallback = document.createElement('span');
                          fallback.className = 'image-fallback';
                          fallback.textContent = 'Invalid Image';
                          fallback.style.cssText = 'color: #999; font-size: 12px;';
                          e.target.parentNode.appendChild(fallback);
                        }
                      }}
                    />
                    <span className="image-fallback" style={{ display: 'none', color: '#999', fontSize: '12px' }}>
                      Invalid Image
                    </span>
                  </>
                ) : (
                  "No Image"
                )}
              </td>
              <td style={styles.td}>{item.title}</td>
              <td style={styles.td}>{item.category}</td>
              <td style={styles.td}>
                <span
                  style={{
                    ...styles.status,
                    ...(item.status === "published" ? styles.statusPublished : styles.statusDraft),
                  }}
                >
                  {item.status}
                </span>
              </td>
              <td style={styles.td}>
                <button onClick={() => handleEdit(item)} style={styles.editButton}>
                  Edit
                </button>
                <button
                  onClick={() => setDeleteConfirm({ show: true, id: item._id })}
                  style={styles.deleteButton}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {filteredData.length === 0 && <div style={styles.noResults}>No press releases found</div>}
    </div>
  );
}

// Styles (same as your original, no changes needed)
const styles = {
  container: { padding: "40px", fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", backgroundColor: "#f5f7fa", minHeight: "100vh" },
  header: { textAlign: "center", marginBottom: "30px", color: "#2c3e50", fontSize: "2.5rem", fontWeight: "300" },
  controls: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px", gap: "20px" },
  searchInput: { padding: "12px 20px", borderRadius: "25px", border: "2px solid #e1e8ed", fontSize: "16px", flex: "1", maxWidth: "400px", outline: "none", transition: "all 0.3s ease" },
  newButton: { padding: "14px 30px", backgroundColor: "#3498db", color: "white", border: "none", borderRadius: "25px", cursor: "pointer", fontWeight: "600", fontSize: "16px", transition: "all 0.3s ease" },
  table: { width: "100%", borderCollapse: "collapse", textAlign: "left", backgroundColor: "white", borderRadius: "10px", overflow: "hidden", boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" },
  th: { borderBottom: "2px solid #3498db", padding: "16px 20px", backgroundColor: "#f8f9fa", color: "#2c3e50", fontWeight: "600", fontSize: "16px" },
  td: { padding: "16px 20px", borderBottom: "1px solid #e1e8ed" },
  tr: { transition: "background-color 0.2s ease" },
  editButton: { marginRight: "10px", backgroundColor: "#f39c12", color: "white", border: "none", borderRadius: "5px", padding: "8px 16px", cursor: "pointer", fontSize: "14px", transition: "all 0.2s ease" },
  deleteButton: { backgroundColor: "#e74c3c", color: "white", border: "none", borderRadius: "5px", padding: "8px 16px", cursor: "pointer", fontSize: "14px", transition: "all 0.2s ease" },
  status: { padding: "6px 12px", borderRadius: "20px", fontSize: "14px", fontWeight: "500" },
  statusPublished: { backgroundColor: "#d5f4e6", color: "#27ae60" },
  statusDraft: { backgroundColor: "#fdebd0", color: "#e67e22" },
  popupOverlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0, 0, 0, 0.6)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 },
  popup: { backgroundColor: "white", borderRadius: "10px", width: "90%", maxWidth: "600px", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)" },
  popupHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 30px", borderBottom: "1px solid #e1e8ed" },
  popupTitle: { margin: 0, color: "#2c3e50", fontSize: "1.5rem" },
  closeButton: { background: "none", border: "none", fontSize: "28px", cursor: "pointer", color: "#7f8c8d", transition: "color 0.2s ease" },
  popupForm: { padding: "30px", display: "flex", flexDirection: "column", gap: "20px" },
  input: { padding: "12px 15px", borderRadius: "8px", border: "2px solid #e1e8ed", fontSize: "16px", transition: "border-color 0.3s ease" },
  textarea: { padding: "12px 15px", borderRadius: "8px", border: "2px solid #e1e8ed", fontSize: "16px", height: "80px", resize: "vertical", fontFamily: "inherit" },
  select: { padding: "12px 15px", borderRadius: "8px", border: "2px solid #e1e8ed", fontSize: "16px", backgroundColor: "white" },
  formButtons: { display: "flex", justifyContent: "flex-end", gap: "15px", marginTop: "10px" },
  cancelButton: { padding: "12px 25px", backgroundColor: "#95a5a6", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "600", fontSize: "16px", transition: "all 0.2s ease" },
  submitButton: { padding: "12px 25px", backgroundColor: "#2ecc71", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "600", fontSize: "16px", transition: "all 0.2s ease" },
  confirmationPopup: { backgroundColor: "white", borderRadius: "10px", padding: "30px", width: "90%", maxWidth: "450px", textAlign: "center", boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)" },
  confirmTitle: { margin: "0 0 15px 0", color: "#2c3e50", fontSize: "1.5rem" },
  confirmText: { margin: "0 0 25px 0", color: "#7f8c8d", fontSize: "16px", lineHeight: "1.5" },
  confirmButtons: { display: "flex", justifyContent: "center", gap: "15px" },
  deleteConfirmButton: { padding: "12px 25px", backgroundColor: "#e74c3c", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "600", fontSize: "16px", transition: "all 0.2s ease" },
  noResults: { textAlign: "center", padding: "40px", color: "#7f8c8d", fontSize: "18px" },
};

export default AdminPressreleaseCybomb;