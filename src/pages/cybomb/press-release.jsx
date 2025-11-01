import React, { useEffect, useState } from "react";
import styles from "./press-release.module.css";

const API_URL = import.meta.env.VITE_CYBOMB_API_BASE;

function Pressrelease() {
  const [press, setPress] = useState([]);
  const [filteredPress, setFilteredPress] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    description: "",
    content: "",
    image: null,
  });
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch press releases safely
  const fetchPress = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/press`);
      const data = await res.json();
      console.log("Fetched press releases:", data);

      // ✅ Ensure it's always an array
      const pressArray = Array.isArray(data)
        ? data
        : data.press || data.data || [];

      setPress(pressArray);
      setFilteredPress(pressArray);
    } catch (error) {
      console.error("Error fetching press releases:", error);
      setPress([]);
      setFilteredPress([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPress();
  }, []);

  // ✅ Handle search
  useEffect(() => {
    const results = (Array.isArray(press) ? press : []).filter(
      (item) =>
        item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPress(results);
  }, [searchTerm, press]);

  // ✅ Handle input change
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({ ...formData, [name]: files ? files[0] : value });
  };

  // ✅ Submit form (Add/Edit)
  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = new FormData();
    Object.keys(formData).forEach((key) => {
      form.append(key, formData[key]);
    });

    const url = editId
      ? `${API_URL}/api/press/${editId}`
      : `${API_URL}/api/press`;
    const method = editId ? "PUT" : "POST";

    try {
      await fetch(url, { method, body: form });
      setFormData({
        title: "",
        date: "",
        description: "",
        content: "",
        image: null,
      });
      setEditId(null);
      setShowModal(false);
      fetchPress();
    } catch (error) {
      console.error("Error saving press release:", error);
    }
  };

  // ✅ Delete press release
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this press release?")) {
      try {
        await fetch(`${API_URL}/api/press/${id}`, { method: "DELETE" });
        fetchPress();
      } catch (error) {
        console.error("Error deleting press release:", error);
      }
    }
  };

  // ✅ Edit press release
  const handleEdit = (item) => {
    setFormData({
      title: item.title,
      date: item.date ? item.date.split("T")[0] : "",
      description: item.description,
      content: item.content,
      image: null,
    });
    setEditId(item._id);
    setShowModal(true);
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.titleSection}>
            <h1 className={styles.title}>Press Release Management</h1>
          </div>

          <div className={styles.controls}>
            <div className={styles.searchContainer}>
              <span className={styles.searchIcon}>🔍</span>
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Search by title or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <button
              className={styles.addButton}
              onClick={() => {
                setEditId(null);
                setFormData({
                  title: "",
                  date: "",
                  description: "",
                  content: "",
                  image: null,
                });
                setShowModal(true);
              }}
            >
              <span className={styles.addIcon}>+</span>
              Add New Press Release
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>📰</div>
          <div className={styles.statContent}>
            <div className={styles.statNumber}>{press.length}</div>
            <div className={styles.statLabel}>Total Press Releases</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>🔍</div>
          <div className={styles.statContent}>
            <div className={styles.statNumber}>{filteredPress.length}</div>
            <div className={styles.statLabel}>Filtered Results</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>📅</div>
          <div className={styles.statContent}>
            <div className={styles.statNumber}>
              {press.filter(
                (item) =>
                  new Date(item.date) >
                  new Date(Date.now() - 7 * 86400000)
              ).length}
            </div>
            <div className={styles.statLabel}>This Week</div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className={styles.tableContainer}>
        {loading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <p>Loading press releases...</p>
          </div>
        ) : (
          <>
            <table className={styles.pressTable}>
              <thead>
                <tr>
                  <th className={styles.titleColumn}>Title</th>
                  <th className={styles.dateColumn}>Date</th>
                  <th className={styles.descriptionColumn}>Description</th>
                  <th className={styles.imageColumn}>Image</th>
                  <th className={styles.actionsColumn}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPress.map((item) => (
                  <tr key={item._id} className={styles.tableRow}>
                    <td className={styles.titleCell}>{item.title}</td>
                    <td className={styles.dateCell}>
                      {new Date(item.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className={styles.descriptionCell}>
                      {item.description?.slice(0, 60)}...
                    </td>
                    <td className={styles.imageCell}>
                      {item.image && (
                        <img
                          src={`${API_URL}${item.image}`}
                          alt={item.title}
                          className={styles.pressImage}
                        />
                      )}
                    </td>
                    <td className={styles.actionsCell}>
                      <div className={styles.actionButtons}>
                        <button
                          className={styles.editButton}
                          onClick={() => handleEdit(item)}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          className={styles.deleteButton}
                          onClick={() => handleDelete(item._id)}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredPress.length === 0 && !loading && (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>📰</div>
                <h3>No press releases found</h3>
                <p>
                  {searchTerm
                    ? `No results found for "${searchTerm}"`
                    : "Create your first press release to get started!"}
                </p>
                {!searchTerm && (
                  <button
                    className={styles.addButton}
                    onClick={() => setShowModal(true)}
                  >
                    <span className={styles.addIcon}>+</span>
                    Create Press Release
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div
          className={styles.modalBackdrop}
          onClick={() => setShowModal(false)}
        >
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h2>{editId ? "Edit Press Release" : "Add New Press Release"}</h2>
              <button
                className={styles.modalClose}
                onClick={() => setShowModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.modalForm}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className={styles.formInput}
                  placeholder="Enter title"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Date</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className={styles.formInput}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Short Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className={styles.formTextarea}
                  rows="3"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Full Content</label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  className={styles.formTextarea}
                  rows="6"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Image</label>
                <input
                  type="file"
                  name="image"
                  onChange={handleChange}
                  className={styles.fileInput}
                  accept="image/*"
                />
              </div>

              <div className={styles.modalFooter}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className={styles.submitButton}>
                  {editId ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Pressrelease;
