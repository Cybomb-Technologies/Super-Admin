import React, { useEffect, useState } from "react";
import {
  Trash2,
  Pencil,
  Plus,
  FileText,
  User,
  Image as ImageIcon,
  Tag,
  Clock,
  Calendar,
  Loader,
  Sparkles,
  BookOpen,
} from "lucide-react";
import styles from "./BlogManager.module.css";

const API_URL = import.meta.env.VITE_AITALS_API_URL;

export default function BlogManager() {
  const [blogs, setBlogs] = useState([]);
  const [form, setForm] = useState({
    title: "",
    author: "",
    image: "",
    tags: "",
    readTime: "",
    content: "",
  });
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");

  // ✅ Safe fetch with array detection
  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/blog`);
      const data = await res.json();

      // Handle multiple possible API formats
      let blogsData = [];
      if (Array.isArray(data)) blogsData = data;
      else if (Array.isArray(data.blogs)) blogsData = data.blogs;
      else if (Array.isArray(data.data)) blogsData = data.data;
      else blogsData = [];

      setBlogs(blogsData);
    } catch (err) {
      console.error("Error fetching blogs:", err);
      setMessage("❌ Error fetching blogs");
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  // Input change handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Create or update blog
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const payload = {
      title: form.title,
      author: form.author,
      image: form.image,
      tags: form.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag),
      readTime: form.readTime,
      content: form.content,
    };

    try {
      const res = await fetch(
        editingId
          ? `${API_URL}/api/blog/${editingId}`
          : `${API_URL}/api/blog`,
        {
          method: editingId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (res.ok) {
        const savedBlog = await res.json();
        if (editingId) {
          setBlogs((prev) =>
            prev.map((b) => (b._id === editingId ? savedBlog : b))
          );
          setMessage("🎉 Blog updated successfully!");
        } else {
          setBlogs((prev) => [savedBlog, ...prev]);
          setMessage("🎉 Blog created successfully!");
        }

        setForm({
          title: "",
          author: "",
          image: "",
          tags: "",
          readTime: "",
          content: "",
        });
        setEditingId(null);

        setTimeout(() => setMessage(""), 3000);
      } else {
        throw new Error("Failed to save blog");
      }
    } catch (err) {
      console.error("Error saving blog:", err);
      setMessage("❌ Error saving blog");
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Edit blog
  const handleEdit = (blog) => {
    setForm({
      title: blog.title,
      author: blog.author,
      image: blog.image,
      tags: blog.tags?.join(", ") || "",
      readTime: blog.readTime || "",
      content: blog.content,
    });
    setEditingId(blog._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Delete blog
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this blog post?"))
      return;

    try {
      const res = await fetch(`${API_URL}/api/blog/${id}`, { method: "DELETE" });
      if (res.ok) {
        setBlogs((prev) => prev.filter((b) => b._id !== id));
        setMessage("🗑️ Blog deleted successfully!");
        setTimeout(() => setMessage(""), 3000);
      } else {
        throw new Error("Failed to delete blog");
      }
    } catch (err) {
      console.error("Error deleting blog:", err);
      setMessage("❌ Error deleting blog");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>Blog Manager</h1>
        <p className={styles.subtitle}>
          Create and manage your blog content with ease
        </p>
      </div>

      {/* Success Message */}
      {message && (
        <div className={styles.successMessage}>
          <Sparkles className="w-5 h-5" />
          {message}
        </div>
      )}

      {/* Blog Form */}
      <div className={styles.formContainer}>
        <h2 className={styles.formHeader}>
          {editingId ? (
            <>
              <Pencil className="w-6 h-6" />
              Edit Blog Post
            </>
          ) : (
            <>
              <Plus className="w-6 h-6" />
              Create New Blog Post
            </>
          )}
        </h2>

        <form onSubmit={handleSubmit}>
          <div className={styles.formGrid}>
            {/* Title */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                <FileText className="w-4 h-4" />
                Blog Title *
              </label>
              <input
                type="text"
                name="title"
                placeholder="Enter an engaging blog title..."
                value={form.title}
                onChange={handleChange}
                className={styles.formInput}
                required
              />
            </div>

            {/* Author */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                <User className="w-4 h-4" />
                Author *
              </label>
              <input
                type="text"
                name="author"
                placeholder="Author name"
                value={form.author}
                onChange={handleChange}
                className={styles.formInput}
                required
              />
            </div>

            {/* Image URL */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                <ImageIcon className="w-4 h-4" />
                Featured Image URL
              </label>
              <input
                type="text"
                name="image"
                placeholder="https://example.com/image.jpg"
                value={form.image}
                onChange={handleChange}
                className={styles.formInput}
              />
              {form.image && (
                <div className={styles.imagePreview}>
                  <img
                    src={form.image}
                    alt="Preview"
                    className={styles.previewImage}
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                </div>
              )}
            </div>

            {/* Tags */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                <Tag className="w-4 h-4" />
                Tags
              </label>
              <input
                type="text"
                name="tags"
                placeholder="react, javascript, webdev"
                value={form.tags}
                onChange={handleChange}
                className={styles.formInput}
              />
              <p className={styles.formHint}>Separate tags with commas</p>
            </div>

            {/* Read Time */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                <Clock className="w-4 h-4" />
                Read Time
              </label>
              <input
                type="text"
                name="readTime"
                placeholder="5 min read"
                value={form.readTime}
                onChange={handleChange}
                className={styles.formInput}
              />
            </div>

            {/* Content */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                <BookOpen className="w-4 h-4" />
                Blog Content *
              </label>
              <textarea
                name="content"
                placeholder="Write your engaging blog content here..."
                value={form.content}
                onChange={handleChange}
                className={styles.formTextarea}
                rows={6}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={styles.submitButton}
          >
            {loading ? (
              <Loader className={`w-5 h-5 ${styles.loadingSpinner}`} />
            ) : editingId ? (
              <Pencil className="w-5 h-5" />
            ) : (
              <Plus className="w-5 h-5" />
            )}
            {loading
              ? "Saving..."
              : editingId
              ? "Update Blog Post"
              : "Publish Blog Post"}
          </button>
        </form>
      </div>

      {/* Blog List */}
      <div className={styles.blogListHeader}>
        <h2 className={styles.blogListTitle}>
          <FileText className="w-6 h-6" />
          Your Blog Posts
          <span className={styles.blogCount}>{blogs?.length || 0}</span>
        </h2>
      </div>

      {loading ? (
        <div className={styles.loadingState}>
          <Loader className={`w-6 h-6 ${styles.loadingSpinner}`} />
          <span>Loading blogs...</span>
        </div>
      ) : !Array.isArray(blogs) || blogs.length === 0 ? (
        <div className={styles.emptyState}>
          <FileText className={styles.emptyIcon} />
          <h3 className={styles.emptyTitle}>No Blog Posts Yet</h3>
          <p className={styles.emptyText}>
            Create your first blog post to start sharing your knowledge!
          </p>
        </div>
      ) : (
        <div className={styles.blogGrid}>
          {blogs.map((blog) => (
            <div key={blog._id} className={styles.blogCard}>
              {blog.image && (
                <img
                  src={blog.image}
                  alt={blog.title}
                  className={styles.blogImage}
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              )}

              <div className={styles.blogContent}>
                <h3 className={styles.blogTitle}>{blog.title}</h3>

                <div className={styles.blogMeta}>
                  <div className={styles.metaItem}>
                    <User className={styles.metaIcon} />
                    {blog.author}
                  </div>
                  <div className={styles.metaItem}>
                    <Calendar className={styles.metaIcon} />
                    {new Date(
                      blog.date || blog.createdAt || Date.now()
                    ).toLocaleDateString()}
                  </div>
                  {blog.readTime && (
                    <div className={styles.metaItem}>
                      <Clock className={styles.metaIcon} />
                      {blog.readTime}
                    </div>
                  )}
                </div>

                {blog.tags && blog.tags.length > 0 && (
                  <div className={styles.blogTags}>
                    {blog.tags.map((tag, i) => (
                      <span key={i} className={styles.tag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <p className={styles.blogExcerpt}>
                  {blog.content.slice(0, 150)}...
                </p>

                <div className={styles.blogActions}>
                  <button
                    onClick={() => handleEdit(blog)}
                    className={styles.editButton}
                  >
                    <Pencil className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(blog._id)}
                    className={styles.deleteButton}
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
