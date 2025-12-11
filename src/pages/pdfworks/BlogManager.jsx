import React, { useState, useEffect, useMemo } from "react";
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
  EyeOff,
  Search,
  Filter,
  Calendar,
  Users,
  TrendingUp,
  ChevronDown,
  FileText,
  Award,
  Hash,
  ExternalLink,
  MoreVertical,
  X,
  RefreshCw
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_PDF_API_URL;

// Toast Component
const Toast = ({ title, description, variant = "default", onClose }) => {
  const bgColor = variant === "destructive" ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200";
  const textColor = variant === "destructive" ? "text-red-800" : "text-green-800";
  const borderColor = variant === "destructive" ? "border-red-200" : "border-green-200";

  return (
    <div className={`fixed top-4 right-4 z-50 border rounded-lg shadow-lg p-4 min-w-[300px] max-w-md ${bgColor} ${borderColor}`}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className={`font-semibold ${textColor}`}>{title}</h3>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        </div>
        <button
          onClick={onClose}
          className="ml-4 text-gray-400 hover:text-gray-600"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

const BlogForm = ({ blogToEdit, onSubmit, onCancel }) => {
  const [title, setTitle] = useState(blogToEdit?.title || "");
  const [content, setContent] = useState(blogToEdit?.content || "");
  const [author, setAuthor] = useState(blogToEdit?.author || "");
  const [image, setImage] = useState(blogToEdit?.image || "");
  const [tags, setTags] = useState(blogToEdit?.tags?.join(", ") || "");
  const [readTime, setReadTime] = useState(blogToEdit?.readTime || "");
  const [featured, setFeatured] = useState(blogToEdit?.featured || false);
  const [status, setStatus] = useState(blogToEdit?.status || "published");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const isEditMode = !!blogToEdit;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !content || !author) {
      setMessage("Please fill in all required fields.");
      return;
    }

    setIsLoading(true);
    setMessage("");

    const blogData = {
      title,
      content,
      author,
      image: image || "",
      tags: tags
        ? tags
            .split(",")
            .map((tag) => tag.trim())
            .filter((tag) => tag)
        : [],
      readTime: readTime || "",
      featured,
      status
    };

    try {
      const url = isEditMode
        ? `${API_BASE_URL}/api/blogs/${blogToEdit._id}`
        : `${API_BASE_URL}/api/blogs`;
      const method = isEditMode ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("pdfpro_admin_token")}`,
        },
        body: JSON.stringify(blogData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(
          isEditMode
            ? "Blog post updated successfully!"
            : "Blog post created successfully!"
        );
        if (!isEditMode) {
          // Reset form
          setTitle("");
          setContent("");
          setAuthor("");
          setImage("");
          setTags("");
          setReadTime("");
          setFeatured(false);
          setStatus("published");
        }
        setTimeout(() => {
          onSubmit();
        }, 1500);
      } else {
        throw new Error(data.message || "Failed to save blog");
      }
    } catch (error) {
      console.error("Error submitting blog:", error);
      setMessage(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border border-gray-200">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {isEditMode ? "Edit Blog Post" : "Create New Blog Post"}
          </h3>
          <p className="text-gray-600 mt-1">
            {isEditMode ? "Update your existing blog post" : "Create a new blog post for your audience"}
          </p>
        </div>
        <div className="flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-full">
          <FileText className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">
            {isEditMode ? "Editing Post" : "New Post"}
          </span>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Enter blog title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 bg-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Author <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Author name"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 bg-white"
              required
            />
          </div>
        </div>

        {/* Image URL */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Featured Image URL
          </label>
          <div className="flex items-center space-x-4 p-4 bg-white rounded-xl border-2 border-gray-200">
            <Image className="w-5 h-5 text-gray-500" />
            <input
              type="url"
              placeholder="https://example.com/image.jpg"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className="flex-1 bg-transparent focus:outline-none placeholder-gray-400"
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Provide a high-quality image URL for better engagement
          </p>
        </div>

        {/* Tags and Read Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Tags
            </label>
            <div className="flex items-center space-x-4 p-4 bg-white rounded-xl border-2 border-gray-200">
              <Tag className="w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="react, javascript, webdev"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="flex-1 bg-transparent focus:outline-none placeholder-gray-400"
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Separate tags with commas
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Read Time
            </label>
            <div className="flex items-center space-x-4 p-4 bg-white rounded-xl border-2 border-gray-200">
              <Clock className="w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="5 min read"
                value={readTime}
                onChange={(e) => setReadTime(e.target.value)}
                className="flex-1 bg-transparent focus:outline-none placeholder-gray-400"
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Estimated reading time
            </p>
          </div>
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Content <span className="text-red-500">*</span>
          </label>
          <textarea
            placeholder="Write your blog content here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows="8"
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 bg-white"
            required
          ></textarea>
        </div>

        {/* Featured and Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center space-x-4 p-4 bg-white rounded-xl border-2 border-gray-200">
            <input
              type="checkbox"
              id="featured"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              className="w-5 h-5 text-blue-600 border-2 border-gray-300 rounded focus:ring-blue-500"
            />
            <label
              htmlFor="featured"
              className="flex items-center text-sm font-semibold text-gray-700 cursor-pointer"
            >
              <Star className="w-5 h-5 mr-3 text-yellow-500" />
              <div>
                <div className="font-medium">Mark as featured</div>
                <div className="text-xs text-gray-500 mt-1">Show on homepage</div>
              </div>
            </label>
          </div>

          <div className="p-4 bg-white rounded-xl border-2 border-gray-200">
            <label className="block text-sm font-semibold text-gray-700 mb-3">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-transparent"
            >
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-8 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition duration-200 border border-gray-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 transition duration-200 flex items-center justify-center"
          >
            {isLoading ? (
              <Loader className="animate-spin w-5 h-5 mr-2" />
            ) : isEditMode ? (
              <Edit className="w-5 h-5 mr-2" />
            ) : (
              <PlusCircle className="w-5 h-5 mr-2" />
            )}
            {isEditMode ? "Update Blog" : "Publish Blog"}
          </button>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`p-4 rounded-xl border-2 ${
              message.includes("Error")
                ? "bg-red-50 border-red-200 text-red-700"
                : "bg-green-50 border-green-200 text-green-700"
            }`}
          >
            <div className="flex items-center">
              {!message.includes("Error") && <CheckCircle className="w-5 h-5 mr-2" />}
              {message}
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

const BlogManagerPDF = () => {
  const [blogs, setBlogs] = useState([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [blogToEdit, setBlogToEdit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [featuredFilter, setFeaturedFilter] = useState("all");
  const [toasts, setToasts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const showToast = ({ title, description, variant = "default" }) => {
    const id = Date.now() + Math.random();
    const newToast = { id, title, description, variant };
    
    setToasts(prev => [...prev, newToast]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 5000);
  };

  // Calculate statistics
  const stats = useMemo(() => {
    if (!Array.isArray(blogs)) return { totalBlogs: 0, featuredBlogs: 0, uniqueTags: 0, publishedBlogs: 0 };

    const totalBlogs = blogs.length;
    const featuredBlogs = blogs.filter(blog => blog.featured).length;
    const publishedBlogs = blogs.filter(blog => blog.status === 'published').length;
    
    // Get unique tags count
    const allTags = blogs.flatMap(blog => blog.tags || []);
    const uniqueTags = [...new Set(allTags)].length;

    return {
      totalBlogs,
      featuredBlogs,
      uniqueTags,
      publishedBlogs
    };
  }, [blogs]);

  // Fetch blogs from API
  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/blogs`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('pdfpro_admin_token')}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch blogs: ${response.status}`);
      }

      const data = await response.json();
      
      // Handle different response structures
      let blogsArray = [];
      
      if (Array.isArray(data)) {
        blogsArray = data;
      } else if (data && Array.isArray(data.blogs)) {
        blogsArray = data.blogs;
      } else if (data && data.data && Array.isArray(data.data)) {
        blogsArray = data.data;
      } else {
        console.warn('Unexpected API response structure:', data);
        blogsArray = [];
      }
      
      setBlogs(blogsArray);
      
    } catch (error) {
      console.error("Error fetching blogs:", error);
      showToast({
        title: "Error",
        description: "Failed to fetch blogs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  // Filter blogs
  const filteredBlogs = useMemo(() => {
    let filtered = [...blogs];

    if (searchTerm) {
      filtered = filtered.filter(
        (blog) =>
          blog.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          blog.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          blog.author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (blog.tags &&
            blog.tags.some((tag) =>
              tag.toLowerCase().includes(searchTerm.toLowerCase())
            ))
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((blog) => blog.status === statusFilter);
    }

    if (featuredFilter !== "all") {
      filtered = filtered.filter((blog) => 
        featuredFilter === "featured" ? blog.featured : !blog.featured
      );
    }

    return filtered;
  }, [blogs, searchTerm, statusFilter, featuredFilter]);

  const handleEdit = (blog) => {
    setBlogToEdit(blog);
    setIsFormVisible(true);
  };

  const handleCreateNew = () => {
    setBlogToEdit(null);
    setIsFormVisible(true);
  };

  const handleCancel = () => {
    setIsFormVisible(false);
    setBlogToEdit(null);
    fetchBlogs();
  };

  const handleDelete = async (blogId) => {
    if (!window.confirm("Are you sure you want to delete this blog post?"))
      return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/blogs/${blogId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('pdfpro_admin_token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete blog');
      }

      showToast({
        title: "Success",
        description: "Blog post deleted successfully!"
      });
      
      setBlogs(blogs.filter(blog => blog._id !== blogId));
    } catch (error) {
      console.error("Error deleting blog:", error);
      showToast({
        title: "Error",
        description: "Failed to delete blog post",
        variant: "destructive",
      });
    }
  };

  const toggleFeatured = async (blogId, currentFeatured) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/blogs/${blogId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('pdfpro_admin_token')}`
        },
        body: JSON.stringify({
          featured: !currentFeatured
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update blog');
      }

      showToast({
        title: "Success",
        description: `Blog ${!currentFeatured ? "marked as featured" : "removed from featured"}!`
      });
      
      setBlogs(blogs.map(blog => 
        blog._id === blogId ? {...blog, featured: !currentFeatured} : blog
      ));
      
    } catch (error) {
      console.error("Error toggling featured:", error);
      showToast({
        title: "Error",
        description: "Failed to update blog",
        variant: "destructive",
      });
    }
  };

  const toggleStatus = async (blogId, currentStatus) => {
    const newStatus = currentStatus === "published" ? "draft" : "published";
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/blogs/${blogId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('pdfpro_admin_token')}`
        },
        body: JSON.stringify({
          status: newStatus
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update blog status');
      }

      showToast({
        title: "Success",
        description: `Blog ${newStatus === "published" ? "published" : "moved to draft"}!`
      });
      
      setBlogs(blogs.map(blog => 
        blog._id === blogId ? {...blog, status: newStatus} : blog
      ));
      
    } catch (error) {
      console.error("Error toggling status:", error);
      showToast({
        title: "Error",
        description: "Failed to update blog status",
        variant: "destructive",
      });
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchBlogs();
  };

  if (isFormVisible) {
    return (
      <div className="p-8" style={{
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        minHeight: "100vh",
      }}>
        <div style={{
          background: "white",
          borderRadius: "20px",
          padding: "30px",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
          maxWidth: "1200px",
          margin: "0 auto",
        }}>
          <BlogForm
            blogToEdit={blogToEdit}
            onSubmit={handleCancel}
            onCancel={handleCancel}
          />
        </div>
      </div>
    );
  }

  // Styles object similar to PDFuser.jsx
  const styles = {
    container: {
      padding: "30px",
      background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
      minHeight: "100vh",
    },
    card: {
      background: "white",
      borderRadius: "20px",
      padding: "30px",
      boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "30px",
      flexWrap: "wrap",
      gap: "20px",
    },
    title: {
      fontSize: "32px",
      fontWeight: "700",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      margin: 0,
    },
    searchBox: {
      position: "relative",
      display: "flex",
      alignItems: "center",
    },
    searchIcon: {
      position: "absolute",
      left: "15px",
      width: "20px",
      height: "20px",
      color: "#667eea",
    },
    searchInput: {
      padding: "12px 20px 12px 45px",
      border: "2px solid #e2e8f0",
      borderRadius: "15px",
      fontSize: "16px",
      width: "300px",
      outline: "none",
    },
    actionButtons: {
      display: "flex",
      gap: "10px",
      flexWrap: "wrap",
    },
    button: {
      border: "none",
      padding: "12px 25px",
      borderRadius: "15px",
      fontSize: "16px",
      fontWeight: "600",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      transition: "all 0.3s ease",
    },
    primaryButton: {
      background: "linear-gradient(135deg, #4CAF50 0%, #45a049 100%)",
      color: "white",
    },
    secondaryButton: {
      background: "linear-gradient(135deg, #2196F3 0%, #1976D2 100%)",
      color: "white",
    },
    warningButton: {
      background: "linear-gradient(135deg, #FF9800 0%, #F57C00 100%)",
      color: "white",
    },
    dangerButton: {
      background: "linear-gradient(135deg, #F44336 0%, #D32F2F 100%)",
      color: "white",
    },
    disabledButton: {
      opacity: 0.7,
      cursor: "not-allowed",
    },
    tableContainer: {
      overflow: "hidden",
      borderRadius: "15px",
      background: "white",
      boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
    },
    tableHeader: {
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      color: "white",
    },
    tableHeaderCell: {
      padding: "18px 20px",
      textAlign: "left",
      fontWeight: "600",
    },
    tableCell: {
      padding: "16px 20px",
      color: "#475569",
    },
  };

  return (
    <div style={styles.container}>
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            title={toast.title}
            description={toast.description}
            variant={toast.variant}
            onClose={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
          />
        ))}
      </div>

      <div style={styles.card}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Blog Management</h1>
            <p style={{ color: "#6b7280", marginTop: "8px" }}>
              Manage and publish blog posts for your audience
            </p>
          </div>
          
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
            <div style={styles.searchBox}>
              <svg
                style={styles.searchIcon}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Search blogs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={styles.searchInput}
              />
            </div>
            
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              style={{
                ...styles.button,
                background: "linear-gradient(135deg, #6b7280 0%, #4b5563 100%)",
                color: "white",
                padding: "12px 20px",
              }}
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
            
            <button
              onClick={handleCreateNew}
              style={{
                ...styles.button,
                ...styles.primaryButton,
              }}
            >
              <PlusCircle className="w-5 h-5" />
              New Post
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px", marginBottom: "30px" }}>
          <div style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            borderRadius: "15px",
            padding: "20px",
            color: "white",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: "28px", fontWeight: "700" }}>{stats.totalBlogs}</div>
                <div style={{ fontSize: "14px", opacity: 0.9, marginTop: "4px" }}>Total Blogs</div>
              </div>
              <BookOpen className="w-8 h-8 opacity-80" />
            </div>
          </div>
          
          <div style={{
            background: "linear-gradient(135deg, #4CAF50 0%, #45a049 100%)",
            borderRadius: "15px",
            padding: "20px",
            color: "white",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: "28px", fontWeight: "700" }}>{stats.publishedBlogs}</div>
                <div style={{ fontSize: "14px", opacity: 0.9, marginTop: "4px" }}>Published</div>
              </div>
              <Eye className="w-8 h-8 opacity-80" />
            </div>
          </div>
          
          <div style={{
            background: "linear-gradient(135deg, #FF9800 0%, #F57C00 100%)",
            borderRadius: "15px",
            padding: "20px",
            color: "white",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: "28px", fontWeight: "700" }}>{stats.featuredBlogs}</div>
                <div style={{ fontSize: "14px", opacity: 0.9, marginTop: "4px" }}>Featured</div>
              </div>
              <Star className="w-8 h-8 opacity-80" />
            </div>
          </div>
          
          <div style={{
            background: "linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)",
            borderRadius: "15px",
            padding: "20px",
            color: "white",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: "28px", fontWeight: "700" }}>{stats.uniqueTags}</div>
                <div style={{ fontSize: "14px", opacity: 0.9, marginTop: "4px" }}>Unique Tags</div>
              </div>
              <Hash className="w-8 h-8 opacity-80" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: "15px", marginBottom: "25px", flexWrap: "wrap" }}>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: "12px 20px",
              border: "2px solid #e2e8f0",
              borderRadius: "15px",
              fontSize: "16px",
              minWidth: "180px",
              outline: "none",
              background: "white",
            }}
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>

          <select
            value={featuredFilter}
            onChange={(e) => setFeaturedFilter(e.target.value)}
            style={{
              padding: "12px 20px",
              border: "2px solid #e2e8f0",
              borderRadius: "15px",
              fontSize: "16px",
              minWidth: "180px",
              outline: "none",
              background: "white",
            }}
          >
            <option value="all">All Posts</option>
            <option value="featured">Featured Only</option>
            <option value="regular">Regular Only</option>
          </select>

          <button style={{
            ...styles.button,
            background: "white",
            border: "2px solid #e2e8f0",
            color: "#374151",
          }}>
            <Filter className="w-5 h-5" />
            More Filters
            <ChevronDown className="w-5 h-5" />
          </button>
        </div>

        {/* Blogs Grid/Table */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px" }}>
            <Loader className="animate-spin w-8 h-8 mx-auto mb-4" style={{ color: "#667eea" }} />
            <p style={{ color: "#6b7280" }}>Loading blogs...</p>
          </div>
        ) : filteredBlogs.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px", background: "#f9fafb", borderRadius: "15px" }}>
            <BookOpen className="w-16 h-16 mx-auto mb-4" style={{ color: "#9ca3af" }} />
            <h3 style={{ fontSize: "20px", fontWeight: "600", color: "#374151", marginBottom: "8px" }}>
              No blog posts found
            </h3>
            <p style={{ color: "#6b7280", marginBottom: "20px" }}>
              {searchTerm || statusFilter !== "all" || featuredFilter !== "all"
                ? "Try adjusting your search or filters"
                : "Get started by creating your first blog post!"}
            </p>
            {!searchTerm && statusFilter === "all" && featuredFilter === "all" && (
              <button
                onClick={handleCreateNew}
                style={{
                  ...styles.button,
                  ...styles.primaryButton,
                }}
              >
                <PlusCircle className="w-5 h-5" />
                Create First Post
              </button>
            )}
          </div>
        ) : (
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead style={styles.tableHeader}>
                <tr>
                  <th style={styles.tableHeaderCell}>Title</th>
                  <th style={styles.tableHeaderCell}>Author</th>
                  <th style={styles.tableHeaderCell}>Status</th>
                  <th style={styles.tableHeaderCell}>Featured</th>
                  <th style={styles.tableHeaderCell}>Tags</th>
                  <th style={styles.tableHeaderCell}>Created</th>
                  <th style={styles.tableHeaderCell}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBlogs.map((blog) => (
                  <tr key={blog._id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                    <td style={{ ...styles.tableCell, maxWidth: "300px" }}>
                      <div style={{ fontWeight: "500", color: "#374151", marginBottom: "4px" }}>
                        {blog.title || 'Untitled'}
                      </div>
                      <div style={{ fontSize: "12px", color: "#6b7280", display: "flex", alignItems: "center", gap: "4px" }}>
                        <Clock className="w-3 h-3" />
                        {blog.readTime || 'No read time'}
                      </div>
                    </td>
                    
                    <td style={styles.tableCell}>
                      <div style={{ fontWeight: "500", color: "#374151" }}>
                        {blog.author || 'Unknown'}
                      </div>
                    </td>
                    
                    <td style={styles.tableCell}>
                      <span style={{
                        padding: "4px 12px",
                        borderRadius: "20px",
                        fontSize: "12px",
                        fontWeight: "600",
                        background: blog.status === 'published' ? "#d1fae5" : "#fef3c7",
                        color: blog.status === 'published' ? "#065f46" : "#92400e",
                      }}>
                        {blog.status || 'draft'}
                      </span>
                    </td>
                    
                    <td style={styles.tableCell}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        {blog.featured ? (
                          <Star className="w-5 h-5 text-yellow-500 fill-current" />
                        ) : (
                          <Star className="w-5 h-5 text-gray-300" />
                        )}
                        <span style={{ color: "#6b7280", fontSize: "14px" }}>
                          {blog.featured ? "Featured" : "Regular"}
                        </span>
                      </div>
                    </td>
                    
                    <td style={styles.tableCell}>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", maxWidth: "200px" }}>
                        {blog.tags?.slice(0, 2).map((tag, index) => (
                          <span
                            key={index}
                            style={{
                              padding: "2px 8px",
                              background: "#e0e7ff",
                              color: "#3730a3",
                              borderRadius: "12px",
                              fontSize: "11px",
                              border: "1px solid #c7d2fe",
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                        {blog.tags?.length > 2 && (
                          <span style={{ fontSize: "11px", color: "#6b7280" }}>
                            +{blog.tags.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    
                    <td style={styles.tableCell}>
                      <div style={{ fontSize: "14px", color: "#6b7280" }}>
                        {blog.createdAt ? new Date(blog.createdAt).toLocaleDateString() : 'No date'}
                      </div>
                    </td>
                    
                    <td style={styles.tableCell}>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          onClick={() => handleEdit(blog)}
                          style={{
                            padding: "6px 12px",
                            background: "#3b82f6",
                            color: "white",
                            borderRadius: "8px",
                            border: "none",
                            cursor: "pointer",
                            fontSize: "12px",
                            fontWeight: "500",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          <Edit className="w-3 h-3" />
                          Edit
                        </button>
                        
                        <button
                          onClick={() => toggleFeatured(blog._id, blog.featured)}
                          style={{
                            padding: "6px 12px",
                            background: blog.featured ? "#f59e0b" : "#9ca3af",
                            color: "white",
                            borderRadius: "8px",
                            border: "none",
                            cursor: "pointer",
                            fontSize: "12px",
                            fontWeight: "500",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          <Star className="w-3 h-3" />
                          {blog.featured ? "Unfeature" : "Feature"}
                        </button>
                        
                        <button
                          onClick={() => toggleStatus(blog._id, blog.status)}
                          style={{
                            padding: "6px 12px",
                            background: blog.status === 'published' ? "#f59e0b" : "#10b981",
                            color: "white",
                            borderRadius: "8px",
                            border: "none",
                            cursor: "pointer",
                            fontSize: "12px",
                            fontWeight: "500",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          {blog.status === 'published' ? (
                            <>
                              <EyeOff className="w-3 h-3" />
                              Draft
                            </>
                          ) : (
                            <>
                              <Eye className="w-3 h-3" />
                              Publish
                            </>
                          )}
                        </button>
                        
                        <button
                          onClick={() => handleDelete(blog._id)}
                          style={{
                            padding: "6px 12px",
                            background: "#ef4444",
                            color: "white",
                            borderRadius: "8px",
                            border: "none",
                            cursor: "pointer",
                            fontSize: "12px",
                            fontWeight: "500",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          <Trash2 className="w-3 h-3" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogManagerPDF;