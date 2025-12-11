import React, { useState, useEffect } from 'react';
import { motion } from "framer-motion";
import { Save, Plus, Trash2, Edit, Zap, FileText, Crown, Building2, ChevronUp, ChevronDown, Star, X } from "lucide-react";

const API_URL = import.meta.env.VITE_PDF_API_URL;

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

const PricingManagement = () => {
  const [pricingPlans, setPricingPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [toasts, setToasts] = useState([]);
  const [newFeature, setNewFeature] = useState("");
  const [expandedPlanId, setExpandedPlanId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Default plan structure
  const defaultPlan = {
    name: "",
    planId: "",
    price: 0,
    period: "monthly",
    features: [],
    popular: false,
    description: "",
    limit: 0,
    ctaText: "Get Started",
    icon: "FileText",
    color: "from-blue-500 to-cyan-600",
    billingCycles: {
      monthly: 0,
      annual: 0
    },
    currency: "USD",
    conversionLimit: 0,
    editToolsLimit: 0,
    organizeToolsLimit: 0,
    securityToolsLimit: 0,
    optimizeToolsLimit: 0,
    advancedToolsLimit: 0,
    convertToolsLimit: 0,
    maxFileSize: 0,
    storage: 0,
    supportType: "Community",
    hasWatermarks: false,
    hasBatchProcessing: false,
    hasOCR: false,
    hasDigitalSignatures: false,
    hasAPIAccess: false,
    hasTeamCollaboration: false,
    order: 0
  };

  const [newPlan, setNewPlan] = useState(defaultPlan);

  // Icon mapping
  const iconMap = {
    Zap: Zap,
    FileText: FileText,
    Crown: Crown,
    Building2: Building2
  };

  // Color options
  const colorOptions = [
    { value: "from-green-500 to-emerald-600", label: "Green", preview: "bg-gradient-to-r from-green-500 to-emerald-600" },
    { value: "from-blue-500 to-cyan-600", label: "Blue", preview: "bg-gradient-to-r from-blue-500 to-cyan-600" },
    { value: "from-purple-500 to-pink-500", label: "Purple", preview: "bg-gradient-to-r from-purple-500 to-pink-500" },
    { value: "from-indigo-600 to-purple-600", label: "Indigo", preview: "bg-gradient-to-r from-indigo-600 to-purple-600" },
    { value: "from-orange-500 to-red-500", label: "Orange", preview: "bg-gradient-to-r from-orange-500 to-red-500" },
    { value: "from-yellow-500 to-orange-500", label: "Yellow", preview: "bg-gradient-to-r from-yellow-500 to-orange-500" }
  ];

  // Support types
  const supportTypes = [
    { value: "Community", label: "Community Support" },
    { value: "Email", label: "Email Support" },
    { value: "Priority", label: "Priority Support" },
    { value: "24/7 Dedicated", label: "24/7 Dedicated Support" }
  ];

  // Toast function
  const showToast = ({ title, description, variant = "default" }) => {
    const id = Date.now() + Math.random();
    const newToast = { id, title, description, variant };
    
    setToasts(prev => [...prev, newToast]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 5000);
  };

  // Fetch pricing plans
  useEffect(() => {
    fetchPricingPlans();
  }, []);

  const fetchPricingPlans = async () => {
    try {
      setFetchLoading(true);
      const token = localStorage.getItem("pdfpro_admin_token");
      const res = await fetch(`${API_URL}/api/pricing/admin/all`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setPricingPlans(data.plans || []);
      } else {
        throw new Error('Failed to fetch pricing plans');
      }
    } catch (error) {
      console.error("Error fetching pricing plans:", error);
      showToast({
        title: "Error",
        description: "Failed to fetch pricing plans",
        variant: "destructive",
      });
    } finally {
      setFetchLoading(false);
    }
  };

  // Filtered plans based on search term
  const filteredPlans = pricingPlans.filter(plan =>
    plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plan.planId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plan.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle save plan
  const handleSavePlan = async (plan) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("pdfpro_admin_token");
      const url = plan._id ? `${API_URL}/api/pricing/${plan._id}` : `${API_URL}/api/pricing`;
      const method = plan._id ? "PUT" : "POST";

      const planData = {
        name: plan.name,
        planId: plan.planId || plan.name.toLowerCase().replace(/\s+/g, '-'),
        price: parseFloat(plan.price),
        period: plan.period,
        features: plan.features,
        popular: plan.popular,
        description: plan.description,
        limit: parseInt(plan.limit) || 0,
        ctaText: plan.ctaText,
        icon: plan.icon,
        color: plan.color,
        billingCycles: {
          monthly: parseFloat(plan.billingCycles?.monthly || plan.price),
          annual: parseFloat(plan.billingCycles?.annual || (plan.price * 12 * 0.75))
        },
        currency: plan.currency || "USD",
        conversionLimit: parseInt(plan.conversionLimit) || 0,
        editToolsLimit: parseInt(plan.editToolsLimit) || 0,
        organizeToolsLimit: parseInt(plan.organizeToolsLimit) || 0,
        securityToolsLimit: parseInt(plan.securityToolsLimit) || 0,
        optimizeToolsLimit: parseInt(plan.optimizeToolsLimit) || 0,
        advancedToolsLimit: parseInt(plan.advancedToolsLimit) || 0,
        convertToolsLimit: parseInt(plan.convertToolsLimit) || 0,
        maxFileSize: parseInt(plan.maxFileSize) || 0,
        storage: parseInt(plan.storage) || 0,
        supportType: plan.supportType || "Community",
        hasWatermarks: plan.hasWatermarks || false,
        hasBatchProcessing: plan.hasBatchProcessing || false,
        hasOCR: plan.hasOCR || false,
        hasDigitalSignatures: plan.hasDigitalSignatures || false,
        hasAPIAccess: plan.hasAPIAccess || false,
        hasTeamCollaboration: plan.hasTeamCollaboration || false,
        order: parseInt(plan.order) || 0
      };

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(planData),
      });

      if (res.ok) {
        showToast({
          title: "Success",
          description: `Plan ${plan._id ? "updated" : "created"} successfully`,
        });
        fetchPricingPlans();
        setEditingPlan(null);
        setNewPlan(defaultPlan);
      } else {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to save plan");
      }
    } catch (error) {
      console.error("Error saving plan:", error);
      showToast({
        title: "Error",
        description: error.message || "Failed to save pricing plan",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle delete plan
  const handleDeletePlan = async (planId) => {
    if (!confirm("Are you sure you want to delete this plan? This will affect users on this plan.")) return;

    try {
      const token = localStorage.getItem("pdfpro_admin_token");
      const res = await fetch(`${API_URL}/api/pricing/${planId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (res.ok) {
        showToast({
          title: "Success",
          description: "Plan deleted successfully",
        });
        fetchPricingPlans();
      } else {
        throw new Error("Failed to delete plan");
      }
    } catch (error) {
      console.error("Error deleting plan:", error);
      showToast({
        title: "Error",
        description: "Failed to delete pricing plan",
        variant: "destructive",
      });
    }
  };

  // Handle feature management
  const addFeature = () => {
    if (newFeature.trim()) {
      const planToUpdate = editingPlan ? { ...editingPlan } : { ...newPlan };
      planToUpdate.features = [...planToUpdate.features, newFeature.trim()];
      
      if (editingPlan) {
        setEditingPlan(planToUpdate);
      } else {
        setNewPlan(planToUpdate);
      }
      setNewFeature("");
    }
  };

  const removeFeature = (index) => {
    const planToUpdate = editingPlan ? { ...editingPlan } : { ...newPlan };
    planToUpdate.features = planToUpdate.features.filter((_, i) => i !== index);
    
    if (editingPlan) {
      setEditingPlan(planToUpdate);
    } else {
      setNewPlan(planToUpdate);
    }
  };

  // Initialize default plans
  const initializeDefaultPlans = async () => {
    if (!confirm("This will reset all pricing plans to default. Continue?")) return;
    
    try {
      const token = localStorage.getItem("pdfpro_admin_token");
      const res = await fetch(`${API_URL}/api/pricing/initialize/defaults`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (res.ok) {
        showToast({
          title: "Success",
          description: "Default plans initialized successfully",
        });
        fetchPricingPlans();
      } else {
        throw new Error("Failed to initialize default plans");
      }
    } catch (error) {
      console.error("Error initializing default plans:", error);
      showToast({
        title: "Error",
        description: "Failed to initialize default plans",
        variant: "destructive",
      });
    }
  };

  // Start editing a plan
  const startEdit = (plan) => {
    setEditingPlan({ ...plan });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingPlan(null);
    setNewPlan(defaultPlan);
  };

  // Toggle plan expansion
  const toggleExpand = (planId) => {
    setExpandedPlanId(expandedPlanId === planId ? null : planId);
  };

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
    planCard: {
      background: "white",
      borderRadius: "15px",
      padding: "20px",
      boxShadow: "0 5px 20px rgba(0, 0, 0, 0.1)",
      border: "2px solid transparent",
      transition: "all 0.3s ease",
    },
    popularPlan: {
      border: "2px solid #667eea",
      boxShadow: "0 5px 25px rgba(102, 126, 234, 0.2)",
    },
    formInput: {
      width: "100%",
      padding: "12px 16px",
      border: "2px solid #e2e8f0",
      borderRadius: "12px",
      fontSize: "16px",
      outline: "none",
      transition: "all 0.3s ease",
    },
    formInputFocus: {
      borderColor: "#667eea",
      boxShadow: "0 0 0 3px rgba(102, 126, 234, 0.1)",
    },
  };

  if (fetchLoading) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={{ textAlign: "center", padding: "60px" }}>
            <div style={{
              display: "inline-block",
              width: "40px",
              height: "40px",
              border: "4px solid #f3f3f3",
              borderTop: "4px solid #667eea",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              marginBottom: "20px"
            }}></div>
            <p>Loading pricing plans...</p>
          </div>
        </div>
      </div>
    );
  }

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
        <div style={styles.header}>
          <h1 style={styles.title}>Pricing Management</h1>
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
                placeholder="Search plans..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={styles.searchInput}
              />
            </div>
            <div style={styles.actionButtons}>
              <button
                onClick={initializeDefaultPlans}
                style={{
                  ...styles.button,
                  ...styles.warningButton,
                }}
              >
                Reset to Default
              </button>
            </div>
          </div>
        </div>

        {/* Add/Edit Plan Form */}
        <div style={{ marginBottom: "40px" }}>
          <h2 style={{
            fontSize: "24px",
            fontWeight: "600",
            marginBottom: "20px",
            color: "#374151",
          }}>
            {editingPlan ? "Edit Plan" : "Add New Plan"}
          </h2>
          
          <div style={{
            background: "#f9fafb",
            borderRadius: "15px",
            padding: "25px",
            border: "2px solid #e5e7eb",
          }}>
            {/* Basic Information */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px", marginBottom: "25px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "500", color: "#374151" }}>
                  Plan Name *
                </label>
                <input
                  type="text"
                  value={editingPlan ? editingPlan.name : newPlan.name}
                  onChange={(e) => editingPlan 
                    ? setEditingPlan({ ...editingPlan, name: e.target.value })
                    : setNewPlan({ ...newPlan, name: e.target.value })
                  }
                  style={styles.formInput}
                  placeholder="e.g., Professional"
                  required
                />
              </div>
              
              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "500", color: "#374151" }}>
                  Monthly Price ($) *
                </label>
                <input
                  type="number"
                  value={editingPlan ? editingPlan.price : newPlan.price}
                  onChange={(e) => {
                    const price = parseFloat(e.target.value) || 0;
                    if (editingPlan) {
                      setEditingPlan({ 
                        ...editingPlan, 
                        price,
                        billingCycles: {
                          monthly: price,
                          annual: price * 12 * 0.75
                        }
                      });
                    } else {
                      setNewPlan({ 
                        ...newPlan, 
                        price,
                        billingCycles: {
                          monthly: price,
                          annual: price * 12 * 0.75
                        }
                      });
                    }
                  }}
                  style={styles.formInput}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                />
                <small style={{ color: "#6b7280", fontSize: "12px" }}>
                  Annual: ${((editingPlan ? editingPlan.price : newPlan.price) * 12 * 0.75).toFixed(2)} (25% off)
                </small>
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "500", color: "#374151" }}>
                  Conversion Limit *
                </label>
                <input
                  type="number"
                  value={editingPlan ? editingPlan.conversionLimit : newPlan.conversionLimit}
                  onChange={(e) => editingPlan 
                    ? setEditingPlan({ ...editingPlan, conversionLimit: parseInt(e.target.value) || 0 })
                    : setNewPlan({ ...newPlan, conversionLimit: parseInt(e.target.value) || 0 })
                  }
                  style={styles.formInput}
                  placeholder="e.g., 500"
                  min="0"
                  required
                />
              </div>
            </div>

            {/* Tool Limits Grid */}
            <div style={{ marginBottom: "25px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "15px", color: "#374151" }}>
                Tool Usage Limits
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "15px" }}>
                {[
                  { label: "Edit Tools", key: "editToolsLimit" },
                  { label: "Organize Tools", key: "organizeToolsLimit" },
                  { label: "Security Tools", key: "securityToolsLimit" },
                  { label: "Optimize Tools", key: "optimizeToolsLimit" },
                  { label: "Advanced Tools", key: "advancedToolsLimit" },
                  { label: "Convert Tools", key: "convertToolsLimit" },
                ].map((tool) => (
                  <div key={tool.key}>
                    <label style={{ display: "block", marginBottom: "8px", fontWeight: "500", color: "#374151" }}>
                      {tool.label} *
                    </label>
                    <input
                      type="number"
                      value={editingPlan ? editingPlan[tool.key] : newPlan[tool.key]}
                      onChange={(e) => editingPlan 
                        ? setEditingPlan({ ...editingPlan, [tool.key]: parseInt(e.target.value) || 0 })
                        : setNewPlan({ ...newPlan, [tool.key]: parseInt(e.target.value) || 0 })
                      }
                      style={styles.formInput}
                      placeholder="0"
                      min="0"
                      required
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Advanced Features */}
            <div style={{ marginBottom: "25px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "15px", color: "#374151" }}>
                Advanced Features
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "15px" }}>
                {[
                  { label: "Watermarks", key: "hasWatermarks" },
                  { label: "Batch Processing", key: "hasBatchProcessing" },
                  { label: "OCR Text Recognition", key: "hasOCR" },
                  { label: "Digital Signatures", key: "hasDigitalSignatures" },
                  { label: "API Access", key: "hasAPIAccess" },
                  { label: "Team Collaboration", key: "hasTeamCollaboration" },
                ].map((feature) => (
                  <div key={feature.key} style={{ display: "flex", alignItems: "center" }}>
                    <input
                      type="checkbox"
                      checked={editingPlan ? editingPlan[feature.key] : newPlan[feature.key]}
                      onChange={(e) => editingPlan 
                        ? setEditingPlan({ ...editingPlan, [feature.key]: e.target.checked })
                        : setNewPlan({ ...newPlan, [feature.key]: e.target.checked })
                      }
                      style={{ marginRight: "8px", width: "18px", height: "18px" }}
                    />
                    <label style={{ color: "#374151" }}>{feature.label}</label>
                  </div>
                ))}
              </div>
            </div>

            {/* Features List */}
            <div style={{ marginBottom: "25px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "500", color: "#374151" }}>
                Features List *
              </label>
              <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
                <input
                  type="text"
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addFeature()}
                  style={styles.formInput}
                  placeholder="Add a feature (e.g., 100 PDF conversions per month)"
                />
                <button
                  onClick={addFeature}
                  style={{
                    ...styles.button,
                    ...styles.primaryButton,
                    padding: "12px 20px",
                  }}
                >
                  <Plus size={20} />
                </button>
              </div>
              
              <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                {(editingPlan ? editingPlan.features : newPlan.features).map((feature, index) => (
                  <div key={index} style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background: "#f3f4f6",
                    padding: "10px 15px",
                    borderRadius: "8px",
                    marginBottom: "5px",
                  }}>
                    <span style={{ fontSize: "14px", color: "#374151" }}>{feature}</span>
                    <button
                      onClick={() => removeFeature(index)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#ef4444",
                        cursor: "pointer",
                        padding: "4px",
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={() => editingPlan ? handleSavePlan(editingPlan) : handleSavePlan(newPlan)}
                disabled={loading || !(editingPlan ? editingPlan.name : newPlan.name) || !(editingPlan ? editingPlan.features.length : newPlan.features.length)}
                style={{
                  ...styles.button,
                  ...styles.primaryButton,
                  ...((loading || !(editingPlan ? editingPlan.name : newPlan.name) || !(editingPlan ? editingPlan.features.length : newPlan.features.length)) && styles.disabledButton),
                }}
              >
                <Save size={20} />
                {loading ? "Saving..." : (editingPlan ? "Update Plan" : "Create Plan")}
              </button>
              
              {(editingPlan || newPlan.name) && (
                <button
                  onClick={cancelEdit}
                  style={{
                    ...styles.button,
                    background: "#6b7280",
                    color: "white",
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Existing Plans */}
        <div>
          <h2 style={{
            fontSize: "24px",
            fontWeight: "600",
            marginBottom: "20px",
            color: "#374151",
          }}>
            Current Pricing Plans ({filteredPlans.length})
          </h2>
          
          {filteredPlans.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", background: "#f9fafb", borderRadius: "15px" }}>
              <FileText size={64} color="#9ca3af" style={{ marginBottom: "20px" }} />
              <h3 style={{ fontSize: "20px", fontWeight: "600", color: "#6b7280", marginBottom: "10px" }}>
                No Pricing Plans Found
              </h3>
              <p style={{ color: "#9ca3af", marginBottom: "20px" }}>
                Get started by creating your first pricing plan or reset to defaults.
              </p>
              <button
                onClick={initializeDefaultPlans}
                style={{
                  ...styles.button,
                  ...styles.secondaryButton,
                }}
              >
                Initialize Default Plans
              </button>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "20px" }}>
              {filteredPlans.map((plan, index) => {
                const IconComponent = iconMap[plan.icon] || FileText;
                const isExpanded = expandedPlanId === plan._id;
                
                return (
                  <motion.div
                    key={plan._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    style={{
                      ...styles.planCard,
                      ...(plan.popular && styles.popularPlan),
                      position: "relative",
                    }}
                  >
                    {plan.popular && (
                      <div style={{
                        position: "absolute",
                        top: "-12px",
                        left: "50%",
                        transform: "translateX(-50%)",
                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        color: "white",
                        padding: "4px 16px",
                        borderRadius: "20px",
                        fontSize: "12px",
                        fontWeight: "600",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}>
                        <Star size={12} />
                        Most Popular
                      </div>
                    )}
                    
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "15px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{
                          width: "48px",
                          height: "48px",
                          borderRadius: "12px",
                          background: `linear-gradient(135deg, ${plan.color.includes('from-') ? plan.color : '#667eea'})`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}>
                          <IconComponent size={24} color="white" />
                        </div>
                        <div>
                          <h3 style={{ fontSize: "20px", fontWeight: "600", color: "#1f2937", margin: 0 }}>
                            {plan.name}
                          </h3>
                          <p style={{ fontSize: "12px", color: "#6b7280", margin: 0 }}>ID: {plan.planId}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleExpand(plan._id)}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: "#6b7280",
                        }}
                      >
                        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </button>
                    </div>
                    
                    <div style={{ marginBottom: "15px" }}>
                      <span style={{ fontSize: "28px", fontWeight: "700", color: "#1f2937" }}>
                        ${plan.price}
                      </span>
                      <span style={{ fontSize: "16px", color: "#6b7280" }}>/month</span>
                    </div>
                    
                    <p style={{ fontSize: "14px", color: "#6b7280", marginBottom: "15px" }}>
                      {plan.description}
                    </p>

                    {/* Collapsible Details */}
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        style={{ overflow: "hidden" }}
                      >
                        <div style={{ 
                          display: "grid", 
                          gridTemplateColumns: "repeat(2, 1fr)", 
                          gap: "10px",
                          marginBottom: "15px",
                          fontSize: "12px",
                          color: "#374151",
                        }}>
                          <div><strong>{plan.conversionLimit}</strong> conversions</div>
                          <div><strong>{plan.maxFileSize}MB</strong> max size</div>
                          <div><strong>{plan.storage}GB</strong> storage</div>
                          <div><strong>{plan.supportType}</strong> support</div>
                          <div><strong>{plan.editToolsLimit}</strong> edits</div>
                          <div><strong>{plan.organizeToolsLimit}</strong> organize</div>
                          <div><strong>{plan.securityToolsLimit}</strong> security</div>
                          <div><strong>{plan.optimizeToolsLimit}</strong> optimize</div>
                          <div><strong>{plan.advancedToolsLimit}</strong> advanced</div>
                          <div><strong>{plan.convertToolsLimit}</strong> convert</div>
                        </div>

                        {/* Feature Tags */}
                        <div style={{ marginBottom: "15px" }}>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                            {plan.hasOCR && <span style={{ background: "#d1fae5", color: "#065f46", padding: "4px 8px", borderRadius: "12px", fontSize: "11px" }}>OCR</span>}
                            {plan.hasDigitalSignatures && <span style={{ background: "#dbeafe", color: "#1e40af", padding: "4px 8px", borderRadius: "12px", fontSize: "11px" }}>Signatures</span>}
                            {plan.hasBatchProcessing && <span style={{ background: "#f3e8ff", color: "#5b21b6", padding: "4px 8px", borderRadius: "12px", fontSize: "11px" }}>Batch</span>}
                            {plan.hasAPIAccess && <span style={{ background: "#ffedd5", color: "#9a3412", padding: "4px 8px", borderRadius: "12px", fontSize: "11px" }}>API</span>}
                            {plan.hasTeamCollaboration && <span style={{ background: "#e0e7ff", color: "#3730a3", padding: "4px 8px", borderRadius: "12px", fontSize: "11px" }}>Team</span>}
                            {plan.hasWatermarks && <span style={{ background: "#ccfbf1", color: "#0d9488", padding: "4px 8px", borderRadius: "12px", fontSize: "11px" }}>Watermarks</span>}
                          </div>
                        </div>

                        {/* Features List Preview */}
                        <div style={{ marginBottom: "15px" }}>
                          <h4 style={{ fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "8px" }}>Features:</h4>
                          <ul style={{ paddingLeft: "20px", margin: 0 }}>
                            {plan.features.slice(0, 3).map((feature, idx) => (
                              <li key={idx} style={{ fontSize: "13px", color: "#6b7280", marginBottom: "4px" }}>
                                {feature}
                              </li>
                            ))}
                            {plan.features.length > 3 && (
                              <li style={{ fontSize: "12px", color: "#9ca3af" }}>
                                +{plan.features.length - 3} more features
                              </li>
                            )}
                          </ul>
                        </div>
                      </motion.div>
                    )}

                    {/* Action Buttons */}
                    <div style={{ display: "flex", gap: "10px" }}>
                      <button
                        onClick={() => startEdit(plan)}
                        style={{
                          ...styles.button,
                          ...styles.secondaryButton,
                          flex: 1,
                          padding: "10px 16px",
                          fontSize: "14px",
                        }}
                      >
                        <Edit size={16} />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeletePlan(plan._id)}
                        disabled={plan.planId === 'free'}
                        style={{
                          ...styles.button,
                          ...styles.dangerButton,
                          padding: "10px 16px",
                          fontSize: "14px",
                          ...(plan.planId === 'free' && styles.disabledButton),
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default PricingManagement;