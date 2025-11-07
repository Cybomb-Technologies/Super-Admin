import React, { useState, useEffect } from "react";
import {
  BookOpen,
  PlusCircle,
  Edit,
  Trash2,
  Clock,
  Star,
  Image,
  Tag,
  Loader,
  CheckCircle,
  Eye,
  Calendar,
  AlertCircle,
  Search,
  RefreshCw,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import styles from './BlogManager.module.css';

const API_BASE_URL = import.meta.env.VITE_CYBOMB_API_BASE || 'http://localhost:5002';

const BlogManager = ({ onBlogsUpdate }) => {
  const [blogs, setBlogs] = useState([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [blogToEdit, setBlogToEdit] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterFeatured, setFilterFeatured] = useState("all");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/api/blog`);

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        throw new Error(`Server returned ${response.status}: ${text.slice(0, 100)}`);
      }

      const data = await response.json();

      if (response.ok && data.success) {
        setBlogs(data.data || []);
        setLastUpdated(new Date());
      } else {
        throw new Error(data.message || "Failed to fetch blogs");
      }
    } catch (error) {
      console.error("Error fetching blogs:", error);
      setError(error.message);
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleEdit = (blog) => {
    setBlogToEdit(blog);
    setIsFormVisible(true);
  };

  const handleCreateNew = () => {
    setBlogToEdit(null);
    setIsFormVisible(true);
    setMessage("");
  };

  const handleCancel = () => {
    setIsFormVisible(false);
    setBlogToEdit(null);
    fetchBlogs();
    if (onBlogsUpdate) {
      onBlogsUpdate();
    }
  };

  const handleDelete = async (blogId) => {
    if (!window.confirm("Are you sure you want to delete this blog post? This action cannot be undone."))
      return;

    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(`${API_BASE_URL}/api/blog/${blogId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        throw new Error(`Server returned ${response.status}: ${text.slice(0, 100)}`);
      }

      const data = await response.json();

      if (response.ok && data.success) {
        setMessage("Blog post deleted successfully!");
        fetchBlogs();
        if (onBlogsUpdate) {
          onBlogsUpdate();
        }
        setTimeout(() => setMessage(""), 3000);
      } else {
        throw new Error(data.message || "Failed to delete blog");
      }
    } catch (error) {
      console.error("Error deleting blog:", error);
      setMessage(`Error deleting blog: ${error.message}`);
    }
  };

  const toggleFeatured = async (blogId, currentFeatured) => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(`${API_BASE_URL}/api/blog/${blogId}/featured`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        throw new Error(`Server returned ${response.status}: ${text.slice(0, 100)}`);
      }

      const data = await response.json();

      if (response.ok && data.success) {
        setMessage(`Blog ${!currentFeatured ? "marked as featured" : "removed from featured"}!`);
        fetchBlogs();
        if (onBlogsUpdate) {
          onBlogsUpdate();
        }
        setTimeout(() => setMessage(""), 3000);
      } else {
        throw new Error(data.message || "Failed to update featured status");
      }
    } catch (error) {
      console.error("Error toggling featured:", error);
      setMessage(`Error: ${error.message}`);
    }
  };

  const handleRetry = () => {
    fetchBlogs();
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

  const calculateStats = () => {
    const totalBlogs = blogs.length;
    const featuredBlogs = blogs.filter((blog) => blog.featured).length;
    const allTags = blogs.flatMap((blog) => blog.tags || []);
    const uniqueTags = [...new Set(allTags)].length;

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const recentBlogs = blogs.filter(
      (blog) => new Date(blog.createdAt) >= sixMonthsAgo
    );

    return {
      totalBlogs,
      featuredBlogs,
      totalTags: uniqueTags,
      recentBlogs: recentBlogs.length,
    };
  };

  const filteredBlogs = blogs.filter(blog => {
    const matchesSearch = 
      blog.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesFeatured = 
      filterFeatured === 'all' || 
      (filterFeatured === 'featured' && blog.featured) ||
      (filterFeatured === 'standard' && !blog.featured);

    return matchesSearch && matchesFeatured;
  });

  const BlogForm = ({ blogToEdit, onSubmit, onCancel }) => {
    const [title, setTitle] = useState(blogToEdit?.title || "");
    const [content, setContent] = useState(blogToEdit?.content || "");
    const [author, setAuthor] = useState(blogToEdit?.author || "");
    const [image, setImage] = useState(blogToEdit?.image || "");
    const [tags, setTags] = useState(blogToEdit?.tags?.join(", ") || "");
    const [readTime, setReadTime] = useState(blogToEdit?.readTime || "");
    const [featured, setFeatured] = useState(blogToEdit?.featured || false);
    const [isLoading, setIsLoading] = useState(false);
    const [formMessage, setFormMessage] = useState("");

    const isEditMode = !!blogToEdit;

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!title || !content || !author) {
        setFormMessage("Please fill in all required fields.");
        return;
      }

      setIsLoading(true);
      setFormMessage("");

      const blogData = {
        title: title.trim(),
        content: content.trim(),
        author: author.trim(),
        image: image || "",
        tags: tags
          ? tags
              .split(",")
              .map((tag) => tag.trim())
              .filter((tag) => tag)
          : [],
        readTime: readTime || "",
        featured,
      };

      try {
        const token = localStorage.getItem("adminToken");
        const url = isEditMode
          ? `${API_BASE_URL}/api/blog/${blogToEdit._id}`
          : `${API_BASE_URL}/api/blog`;
        const method = isEditMode ? "PUT" : "POST";

        const response = await fetch(url, {
          method,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(blogData),
        });

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          const text = await response.text();
          throw new Error(`Server returned ${response.status}: ${text.slice(0, 100)}`);
        }

        const data = await response.json();

        if (response.ok && data.success) {
          setFormMessage(
            isEditMode
              ? "Blog post updated successfully!"
              : "Blog post created successfully!"
          );
          if (!isEditMode) {
            setTitle("");
            setContent("");
            setAuthor("");
            setImage("");
            setTags("");
            setReadTime("");
            setFeatured(false);
          }
          setTimeout(() => {
            onSubmit();
          }, 1500);
        } else {
          throw new Error(data.message || data.errors?.[0] || "Failed to save blog");
        }
      } catch (error) {
        console.error("Error submitting blog:", error);
        setFormMessage(`Error: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    return (
      <div className={styles.card}>
        <div className={styles.cardBody}>
          <h3 className={styles.cardTitle}>
            {isEditMode ? "Edit Blog Post" : "Create New Blog Post"}
          </h3>
          <form onSubmit={handleSubmit}>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Title *</label>
                <input
                  type="text"
                  placeholder="Enter blog title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={styles.formControl}
                  required
                  maxLength={200}
                />
                <div className={styles.formText}>{title.length}/200 characters</div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Author *</label>
                <input
                  type="text"
                  placeholder="Author name"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className={styles.formControl}
                  required
                  maxLength={100}
                />
                <div className={styles.formText}>{author.length}/100 characters</div>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Image URL</label>
              <div className={styles.inputGroup}>
                <span className={styles.inputGroupText}>
                  <Image className={styles.inputIcon} />
                </span>
                <input
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  className={styles.formControl}
                />
              </div>
              {image && (
                <div className={styles.imagePreview}>
                  <small className={styles.formText}>Image Preview:</small>
                  <img
                    src={image}
                    alt="Preview"
                    className={styles.previewImage}
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                </div>
              )}
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Tags</label>
                <div className={styles.inputGroup}>
                  <span className={styles.inputGroupText}>
                    <Tag className={styles.inputIcon} />
                  </span>
                  <input
                    type="text"
                    placeholder="react, javascript, webdev"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    className={styles.formControl}
                  />
                </div>
                <div className={styles.formText}>Separate tags with commas (max 30 characters each)</div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Read Time</label>
                <div className={styles.inputGroup}>
                  <span className={styles.inputGroupText}>
                    <Clock className={styles.inputIcon} />
                  </span>
                  <input
                    type="text"
                    placeholder="5 min read"
                    value={readTime}
                    onChange={(e) => setReadTime(e.target.value)}
                    className={styles.formControl}
                    maxLength={20}
                  />
                </div>
                <div className={styles.formText}>Leave empty to auto-calculate</div>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Content *</label>
              <textarea
                placeholder="Write your blog content here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows="12"
                className={styles.formControl}
                required
                minLength={100}
              ></textarea>
              <div className={styles.formText}>
                {content.length} characters (minimum 100 required)
                {content.length < 100 && (
                  <span className={styles.textDanger}> - {100 - content.length} more characters needed</span>
                )}
              </div>
            </div>

            <div className={styles.formCheck}>
              <input
                type="checkbox"
                id="featured"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className={styles.formCheckInput}
              />
              <label htmlFor="featured" className={styles.formCheckLabel}>
                <Star className={styles.checkIcon} />
                Mark as featured post
              </label>
            </div>

            <div className={styles.formActions}>
              <button
                type="button"
                onClick={onCancel}
                className={styles.secondaryButton}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || content.length < 100}
                className={styles.primaryButton}
              >
                {isLoading ? (
                  <Loader className={`${styles.buttonIcon} ${styles.spin}`} />
                ) : isEditMode ? (
                  <Edit className={styles.buttonIcon} />
                ) : (
                  <PlusCircle className={styles.buttonIcon} />
                )}
                {isEditMode ? "Update Blog" : "Publish Blog"}
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

  const renderMobileCard = (blog) => (
    <div key={blog._id} className={styles.mobileCard}>
      <div className={styles.cardHeader}>
        <div className={styles.blogInfo}>
          <div className={styles.blogAvatar}>
            <BookOpen />
          </div>
          <div>
            <div className={styles.blogTitle}>{blog.title || 'N/A'}</div>
            <div className={styles.blogAuthor}>by {blog.author || 'N/A'}</div>
          </div>
        </div>
        <div className={styles.cardActions}>
          <button
            onClick={() => handleEdit(blog)}
            className={styles.viewButton}
            title="Edit blog"
          >
            <Edit />
          </button>
          <button
            onClick={() => toggleRowExpand(blog._id)}
            className={styles.expandButton}
          >
            {expandedRows.has(blog._id) ? <ChevronUp /> : <ChevronDown />}
          </button>
        </div>
      </div>

      <div className={styles.cardContent}>
        <div className={styles.cardField}>
          <span className={styles.fieldLabel}>Status:</span>
          <span className={`${styles.statusBadge} ${blog.featured ? styles.statusFeatured : styles.statusStandard}`}>
            {blog.featured ? "Featured" : "Standard"}
          </span>
        </div>
        
        <div className={styles.cardField}>
          <span className={styles.fieldLabel}>Read Time:</span>
          <span className={styles.fieldValue}>{blog.readTime || 'Not specified'}</span>
        </div>

        {expandedRows.has(blog._id) && (
          <div className={styles.expandedContent}>
            <div className={styles.cardField}>
              <span className={styles.fieldLabel}>Tags:</span>
              <div className={styles.tagsContainer}>
                {blog.tags && blog.tags.length > 0 ? (
                  blog.tags.slice(0, 3).map((tag, index) => (
                    <span key={index} className={styles.tagBadge}>
                      #{tag}
                    </span>
                  ))
                ) : (
                  <span className={styles.noData}>No tags</span>
                )}
              </div>
            </div>
            {/* <div className={styles.cardField}>
              <span className={styles.fieldLabel}>Views:</span>
              <span>{blog.views || 0}</span>
            </div> */}
            <div className={styles.cardField}>
              <span className={styles.fieldLabel}>Created:</span>
              <span>{formatDate(blog.createdAt)}</span>
            </div>
            <div className={styles.cardField}>
              <span className={styles.fieldLabel}>Content:</span>
              <div className={styles.contentPreview}>
                {blog.content?.replace(/<[^>]*>/g, "").slice(0, 100) || 'No content'}
                {blog.content && blog.content.replace(/<[^>]*>/g, "").length > 100 && '...'}
              </div>
            </div>
            <div className={styles.cardActions}>
              <button
                onClick={() => toggleFeatured(blog._id, blog.featured)}
                className={`${styles.statusButton} ${blog.featured ? styles.warningButton : styles.outlineWarningButton}`}
              >
                <Star className={styles.smallIcon} />
                {blog.featured ? "Unfeature" : "Feature"}
              </button>
              <button
                onClick={() => handleDelete(blog._id)}
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

  const renderTableRow = (blog) => (
    <tr key={blog._id} className={styles.tableRow}>
      <td className={styles.tableCell}>
        <div className={styles.blogCell}>
          <div className={styles.blogAvatar}>
            <BookOpen />
          </div>
          <div className={styles.blogInfo}>
            <div className={styles.blogTitle}>{blog.title || 'N/A'}</div>
            <div className={styles.blogDate}>
              <Calendar className={styles.smallIcon} />
              {formatDate(blog.createdAt)}
            </div>
          </div>
        </div>
      </td>
      
      <td className={styles.tableCell}>
        <span className={styles.authorText}>{blog.author || 'N/A'}</span>
      </td>
      
      <td className={styles.tableCell}>
        <span className={`${styles.statusBadge} ${blog.featured ? styles.statusFeatured : styles.statusStandard}`}>
          {blog.featured ? "Featured" : "Standard"}
        </span>
      </td>
      
      {/* <td className={styles.tableCell}>
        <div className={styles.viewsCell}>
          <Eye className={styles.smallIcon} />
          {blog.views || 0}
        </div>
      </td> */}
      
      <td className={styles.tableCell}>
        <div className={styles.actionCell}>
          <button
            className={styles.viewButton}
            onClick={() => handleEdit(blog)}
            title="Edit blog"
          >
            <Edit />
          </button>
          <button
            className={`${styles.statusButton} ${blog.featured ? styles.warningButton : styles.outlineWarningButton}`}
            onClick={() => toggleFeatured(blog._id, blog.featured)}
            title={blog.featured ? "Remove from featured" : "Mark as featured"}
          >
            <Star />
          </button>
          <button
            className={styles.deleteButton}
            onClick={() => handleDelete(blog._id)}
            title="Delete blog"
          >
            <Trash2 />
          </button>
        </div>
      </td>
    </tr>
  );

  if (isFormVisible) {
    return (
      <BlogForm
        blogToEdit={blogToEdit}
        onSubmit={handleCancel}
        onCancel={handleCancel}
      />
    );
  }

  if (loading && blogs.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <h3>Loading Blog Posts...</h3>
          <p>Please wait while we fetch your data</p>
        </div>
      </div>
    );
  }

  const stats = calculateStats();

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>
            <BookOpen className={styles.headerIcon} />
            Blog Management
          </h1>
          <p className={styles.subtitle}>
            Manage your blog posts and content
          </p>
          {lastUpdated && (
            <p className={styles.lastUpdated}>
              Last updated: {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
        </div>
        <div className={styles.headerStats}>
          <div className={styles.statBadge}>
            <span className={styles.statNumber}>{blogs.length}</span>
            <span className={styles.statLabel}>Total Blogs</span>
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

      {/* Statistics Cards */}
      <div className={styles.statsGrid}>
        <div className={`${styles.statCard} ${styles.statPrimary}`}>
          <div className={styles.statContent}>
            <div>
              <h4 className={styles.statNumber}>{stats.totalBlogs}</h4>
              <p className={styles.statLabel}>Total Blogs</p>
            </div>
            <BookOpen className={styles.statIcon} />
          </div>
        </div>
        <div className={`${styles.statCard} ${styles.statWarning}`}>
          <div className={styles.statContent}>
            <div>
              <h4 className={styles.statNumber}>{stats.featuredBlogs}</h4>
              <p className={styles.statLabel}>Featured</p>
            </div>
            <Star className={styles.statIcon} />
          </div>
        </div>
        <div className={`${styles.statCard} ${styles.statSuccess}`}>
          <div className={styles.statContent}>
            <div>
              <h4 className={styles.statNumber}>{stats.totalTags}</h4>
              <p className={styles.statLabel}>Unique Tags</p>
            </div>
            <Tag className={styles.statIcon} />
          </div>
        </div>
        <div className={`${styles.statCard} ${styles.statInfo}`}>
          <div className={styles.statContent}>
            <div>
              <h4 className={styles.statNumber}>{stats.recentBlogs}</h4>
              <p className={styles.statLabel}>Last 6 Months</p>
            </div>
            <Calendar className={styles.statIcon} />
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className={styles.controls}>
        <div className={styles.searchBox}>
          <Search className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search blog posts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        
        <div className={styles.filterGroup}>
          <select
            value={filterFeatured}
            onChange={(e) => setFilterFeatured(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All Posts</option>
            <option value="featured">Featured</option>
            <option value="standard">Standard</option>
          </select>
          
          <button
            onClick={handleCreateNew}
            className={styles.primaryButton}
          >
            <PlusCircle className={styles.buttonIcon} />
            New Post
          </button>
        </div>
      </div>

      {/* Content */}
      <div className={styles.content}>
        {filteredBlogs.length === 0 ? (
          <div className={styles.emptyState}>
            <BookOpen className={styles.emptyIcon} />
            <h3>
              {blogs.length === 0 ? 'No blog posts yet' : 'No blog posts found'}
            </h3>
            <p>
              {blogs.length === 0 
                ? 'Get started by creating your first blog post!' 
                : 'Try adjusting your search or filter criteria.'
              }
            </p>
            {(searchTerm || filterFeatured !== 'all') && (
              <button
                className={styles.clearButton}
                onClick={() => {
                  setSearchTerm('');
                  setFilterFeatured('all');
                }}
              >
                Clear filters
              </button>
            )}
            {blogs.length === 0 && (
              <button
                onClick={handleCreateNew}
                className={styles.primaryButton}
              >
                Create First Post
              </button>
            )}
          </div>
        ) : isMobile ? (
          // Mobile Card View
          <div className={styles.mobileView}>
            {filteredBlogs.map(renderMobileCard)}
          </div>
        ) : (
          // Desktop Table View
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead className={styles.tableHeader}>
                <tr>
                  <th>Blog Post</th>
                  <th>Author</th>
                  <th>Status</th>
                  {/* <th>Views</th> */}
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody className={styles.tableBody}>
                {filteredBlogs.map(renderTableRow)}
              </tbody>
            </table>
            
            <div className={styles.tableFooter}>
              <span className={styles.footerText}>
                Showing {filteredBlogs.length} of {blogs.length} blog posts
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

export default BlogManager;