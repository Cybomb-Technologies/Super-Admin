import React, { useEffect, useState } from "react";
import styles from "./blog-management.module.css";

const API_URL = import.meta.env.VITE_CYBOMB_API_BASE;

function Blogmanagement() {
  const [blogs, setBlogs] = useState([]);
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    description: "",
    fullContent: "",
    image: null,
  });
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch blogs safely
  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/blogs`);
      const data = await res.json();
      console.log("Fetched blogs:", data);

      // ✅ Ensure blogs is always an array
      const blogsArray = Array.isArray(data)
        ? data
        : data.blogs || data.data || [];

      setBlogs(blogsArray);
      setFilteredBlogs(blogsArray);
    } catch (error) {
      console.error("Error fetching blogs:", error);
      setBlogs([]);
      setFilteredBlogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  // ✅ Handle search
  useEffect(() => {
    const results = (Array.isArray(blogs) ? blogs : []).filter(
      (blog) =>
        blog.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blog.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredBlogs(results);
  }, [searchTerm, blogs]);

  // ✅ Handle input changes
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
      ? `${API_URL}/api/blogs/${editId}`
      : `${API_URL}/api/blogs`;
    const method = editId ? "PUT" : "POST";

    try {
      await fetch(url, { method, body: form });
      setFormData({
        title: "",
        date: "",
        description: "",
        fullContent: "",
        image: null,
      });
      setEditId(null);
      setShowModal(false);
      fetchBlogs();
    } catch (error) {
      console.error("Error saving blog:", error);
    }
  };

  // ✅ Delete blog
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this blog?")) {
      try {
        await fetch(`${API_URL}/api/blogs/${id}`, { method: "DELETE" });
        fetchBlogs();
      } catch (error) {
        console.error("Error deleting blog:", error);
      }
    }
  };

  // ✅ Edit blog
  const handleEdit = (blog) => {
    setFormData({
      title: blog.title,
      date: blog.date ? blog.date.split("T")[0] : "",
      description: blog.description,
      fullContent: blog.fullContent,
      image: null,
    });
    setEditId(blog._id);
    setShowModal(true);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.titleSection}>
            <h1 className={styles.title}>Blog Management</h1>
          </div>

          <div className={styles.controls}>
            <div className={styles.searchContainer}>
              <span className={styles.searchIcon}>🔍</span>
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Search blogs by title or description..."
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
                  fullContent: "",
                  image: null,
                });
                setShowModal(true);
              }}
            >
              <span className={styles.addIcon}>+</span>
              Add New Blog
            </button>
          </div>
        </div>
      </div>

      {/* ✅ Stats */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>📝</div>
          <div className={styles.statContent}>
            <div className={styles.statNumber}>{blogs.length}</div>
            <div className={styles.statLabel}>Total Blogs</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>🔍</div>
          <div className={styles.statContent}>
            <div className={styles.statNumber}>{filteredBlogs.length}</div>
            <div className={styles.statLabel}>Filtered Results</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>📅</div>
          <div className={styles.statContent}>
            <div className={styles.statNumber}>
              {blogs.filter(
                (blog) =>
                  new Date(blog.date) >
                  new Date(Date.now() - 7 * 86400000)
              ).length}
            </div>
            <div className={styles.statLabel}>This Week</div>
          </div>
        </div>
      </div>

      {/* ✅ Blog Table */}
      <div className={styles.tableContainer}>
        {loading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <p>Loading blogs...</p>
          </div>
        ) : (
          <>
            <table className={styles.blogTable}>
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
                {filteredBlogs.map((blog) => (
                  <tr key={blog._id} className={styles.tableRow}>
                    <td className={styles.titleCell}>
                      <div className={styles.blogTitle}>{blog.title}</div>
                    </td>
                    <td className={styles.dateCell}>
                      {new Date(blog.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className={styles.descriptionCell}>
                      {blog.description?.slice(0, 60)}...
                    </td>
                    <td className={styles.imageCell}>
                      {blog.image && (
                        <img
                          src={`${API_URL}${blog.image}`}
                          alt={blog.title}
                          className={styles.blogImage}
                        />
                      )}
                    </td>
                    <td className={styles.actionsCell}>
                      <div className={styles.actionButtons}>
                        <button
                          className={styles.editButton}
                          onClick={() => handleEdit(blog)}
                        >
                          <span className={styles.editIcon}>✏️</span>Edit
                        </button>
                        <button
                          className={styles.deleteButton}
                          onClick={() => handleDelete(blog._id)}
                        >
                          <span className={styles.deleteIcon}>🗑️</span>Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredBlogs.length === 0 && !loading && (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>📝</div>
                <h3>No blogs found</h3>
                <p>
                  {searchTerm
                    ? `No results found for "${searchTerm}"`
                    : "Get started by creating your first blog post!"}
                </p>
                {!searchTerm && (
                  <button
                    className={styles.addButton}
                    onClick={() => setShowModal(true)}
                  >
                    <span className={styles.addIcon}>+</span>
                    Create Your First Blog
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* ✅ Add/Edit Blog Modal */}
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
              <h2>{editId ? "Edit Blog" : "Add New Blog"}</h2>
              <button
                className={styles.modalClose}
                onClick={() => setShowModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.modalForm}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Blog Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className={styles.formInput}
                  placeholder="Enter blog title"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Publish Date</label>
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
                  placeholder="Enter a brief description"
                  rows="3"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Full Content</label>
                <textarea
                  name="fullContent"
                  value={formData.fullContent}
                  onChange={handleChange}
                  className={styles.formTextarea}
                  placeholder="Write your blog content here..."
                  rows="6"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Blog Image</label>
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
                  {editId ? "Update Blog" : "Create Blog"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Blogmanagement;
