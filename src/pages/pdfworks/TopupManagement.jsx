import React, { useState, useEffect } from 'react';
import { motion } from "framer-motion";
import { 
  Save, Plus, Trash2, Edit, Zap, BatteryCharging, 
  Bolt, Sparkles, Crown, Package, Check, X 
} from "lucide-react";

const API_URL = import.meta.env.VITE_PDF_API_URL;

const TopupManagement = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingPkg, setEditingPkg] = useState(null);
  const [fetchLoading, setFetchLoading] = useState(true);

  const defaultPackage = {
    name: "",
    description: "",
    price: 4.99,
    currency: "USD",
    conversionCredits: 0,
    editToolsCredits: 0,
    organizeToolsCredits: 0,
    securityToolsCredits: 0,
    optimizeToolsCredits: 0,
    advancedToolsCredits: 0,
    convertToolsCredits: 0,
    icon: "Zap",
    color: "from-blue-500 to-cyan-600",
    popular: false,
    badgeText: "",
    featured: false,
    isActive: true,
    order: 0
  };

  const [newPackage, setNewPackage] = useState(defaultPackage);

  const iconOptions = [
    { value: "Zap", label: "⚡ Zap", component: Zap },
    { value: "BatteryCharging", label: "🔋 Charging", component: BatteryCharging },
    { value: "Bolt", label: "⚡ Bolt", component: Bolt },
    { value: "Sparkles", label: "✨ Sparkles", component: Sparkles },
    { value: "Crown", label: "👑 Crown", component: Crown },
    { value: "Package", label: "📦 Package", component: Package },
  ];

  const colorOptions = [
    { value: "from-yellow-500 to-orange-500", label: "Yellow/Orange", preview: "bg-gradient-to-r from-yellow-500 to-orange-500" },
    { value: "from-green-500 to-emerald-600", label: "Green", preview: "bg-gradient-to-r from-green-500 to-emerald-600" },
    { value: "from-blue-500 to-cyan-600", label: "Blue", preview: "bg-gradient-to-r from-blue-500 to-cyan-600" },
    { value: "from-purple-500 to-pink-500", label: "Purple", preview: "bg-gradient-to-r from-purple-500 to-pink-500" },
    { value: "from-indigo-600 to-purple-600", label: "Indigo", preview: "bg-gradient-to-r from-indigo-600 to-purple-600" },
    { value: "from-red-500 to-pink-500", label: "Red/Pink", preview: "bg-gradient-to-r from-red-500 to-pink-500" },
  ];

  // Custom toast notification function
  const showToast = (title, description, type = "default") => {
    console.log(`Toast (${type}): ${title} - ${description}`);
    if (type === "destructive") {
      alert(`❌ ${title}: ${description}`);
    } else {
      alert(`✅ ${title}: ${description}`);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      setFetchLoading(true);
      // const token = localStorage.getItem("pdfpro_admin_token") || localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/topup/admin/packages`//, {
        // headers: { "Authorization": `Bearer ${token}` },
      // }
      );

      if (res.ok) {
        const data = await res.json();
        setPackages(data.packages || []);
      } else {
        throw new Error("Failed to fetch packages");
      }
    } catch (error) {
      console.error("Error:", error);
      showToast("Error", "Failed to fetch topup packages", "destructive");
    } finally {
      setFetchLoading(false);
    }
  };

  const handleSavePackage = async (pkg) => {
    setLoading(true);
    try {
      // const token = localStorage.getItem("pdfpro_admin_token") || localStorage.getItem("token");
      const url = pkg._id 
        ? `${API_URL}/api/topup/admin/${pkg._id}`
        : `${API_URL}/api/topup/admin`;
      const method = pkg._id ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          // "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(pkg),
      });

      if (res.ok) {
        showToast("Success", `Package ${pkg._id ? "updated" : "created"} successfully`);
        fetchPackages();
        setEditingPkg(null);
        setNewPackage(defaultPackage);
      } else {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to save package");
      }
    } catch (error) {
      console.error("Error saving package:", error);
      showToast("Error", error.message || "Failed to save package", "destructive");
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePackage = async (packageId) => {
    if (!confirm("Delete this topup package?")) return;

    try {
      // const token = localStorage.getItem("pdfpro_admin_token") || localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/topup/admin/${packageId}`, {
        method: "DELETE",
        // headers: { "Authorization": `Bearer ${token}` },
      });

      if (res.ok) {
        showToast("Success", "Package deleted");
        fetchPackages();
      } else {
        throw new Error("Failed to delete package");
      }
    } catch (error) {
      console.error("Error:", error);
      showToast("Error", "Failed to delete package", "destructive");
    }
  };

  const initializeDefaults = async () => {
    if (!confirm("Reset all topup packages to default?")) return;
    
    try {
      // const token = localStorage.getItem("pdfpro_admin_token") || localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/topup/admin/initialize/defaults`, {
        method: "POST",
        // headers: { "Authorization": `Bearer ${token}` },
      });

      if (res.ok) {
        showToast("Success", "Default packages initialized");
        fetchPackages();
      } else {
        throw new Error("Failed to initialize");
      }
    } catch (error) {
      console.error("Error:", error);
      showToast("Error", "Failed to initialize", "destructive");
    }
  };

  const calculateTotal = (pkg) => {
    return pkg.conversionCredits + pkg.editToolsCredits + pkg.organizeToolsCredits + 
           pkg.securityToolsCredits + pkg.optimizeToolsCredits + 
           pkg.advancedToolsCredits + pkg.convertToolsCredits;
  };

  if (fetchLoading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Top-up Credit Packages ⚡</h1>
          <p className="text-gray-600">Manage extra credit packages users can purchase</p>
        </div>
        <button
          onClick={initializeDefaults}
          className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
        >
          Reset to Default
        </button>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border">
        <h2 className="text-xl font-bold mb-4">
          {editingPkg ? "Edit Package" : "Add New Package"}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
              <input
                type="text"
                value={editingPkg ? editingPkg.name : newPackage.name}
                onChange={(e) => editingPkg 
                  ? setEditingPkg({ ...editingPkg, name: e.target.value })
                  : setNewPackage({ ...newPackage, name: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="e.g., Power Pack"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
              <textarea
                value={editingPkg ? editingPkg.description : newPackage.description}
                onChange={(e) => editingPkg 
                  ? setEditingPkg({ ...editingPkg, description: e.target.value })
                  : setNewPackage({ ...newPackage, description: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                rows="2"
                placeholder="Describe this package..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Price (USD) *</label>
              <input
                type="number"
                step="0.01"
                min="0.99"
                value={editingPkg ? editingPkg.price : newPackage.price}
                onChange={(e) => editingPkg 
                  ? setEditingPkg({ ...editingPkg, price: parseFloat(e.target.value) })
                  : setNewPackage({ ...newPackage, price: parseFloat(e.target.value) })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="4.99"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Icon</label>
                <select
                  value={editingPkg ? editingPkg.icon : newPackage.icon}
                  onChange={(e) => editingPkg 
                    ? setEditingPkg({ ...editingPkg, icon: e.target.value })
                    : setNewPackage({ ...newPackage, icon: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  {iconOptions.map(icon => (
                    <option key={icon.value} value={icon.value}>{icon.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                <select
                  value={editingPkg ? editingPkg.color : newPackage.color}
                  onChange={(e) => editingPkg 
                    ? setEditingPkg({ ...editingPkg, color: e.target.value })
                    : setNewPackage({ ...newPackage, color: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  {colorOptions.map(color => (
                    <option key={color.value} value={color.value}>{color.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Badge Text</label>
              <input
                type="text"
                value={editingPkg ? editingPkg.badgeText : newPackage.badgeText}
                onChange={(e) => editingPkg 
                  ? setEditingPkg({ ...editingPkg, badgeText: e.target.value })
                  : setNewPackage({ ...newPackage, badgeText: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="e.g., Most Popular"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Order</label>
                <input
                  type="number"
                  value={editingPkg ? editingPkg.order : newPackage.order}
                  onChange={(e) => editingPkg 
                    ? setEditingPkg({ ...editingPkg, order: parseInt(e.target.value) })
                    : setNewPackage({ ...newPackage, order: parseInt(e.target.value) })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="0"
                />
              </div>

              <div className="space-y-3 pt-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editingPkg ? editingPkg.popular : newPackage.popular}
                    onChange={(e) => editingPkg 
                      ? setEditingPkg({ ...editingPkg, popular: e.target.checked })
                      : setNewPackage({ ...newPackage, popular: e.target.checked })
                    }
                    className="h-4 w-4 text-green-600"
                  />
                  <span className="ml-2 text-sm">Popular</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editingPkg ? editingPkg.featured : newPackage.featured}
                    onChange={(e) => editingPkg 
                      ? setEditingPkg({ ...editingPkg, featured: e.target.checked })
                      : setNewPackage({ ...newPackage, featured: e.target.checked })
                    }
                    className="h-4 w-4 text-green-600"
                  />
                  <span className="ml-2 text-sm">Featured</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editingPkg ? editingPkg.isActive : newPackage.isActive}
                    onChange={(e) => editingPkg 
                      ? setEditingPkg({ ...editingPkg, isActive: e.target.checked })
                      : setNewPackage({ ...newPackage, isActive: e.target.checked })
                    }
                    className="h-4 w-4 text-green-600"
                  />
                  <span className="ml-2 text-sm">Active</span>
                </label>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">Credit Allocation</h3>
              {[
                { key: 'conversionCredits', label: 'PDF Conversions', icon: '🔄' },
                { key: 'editToolsCredits', label: 'Edit Tools', icon: '✏️' },
                { key: 'organizeToolsCredits', label: 'Organize Tools', icon: '🗂️' },
                { key: 'securityToolsCredits', label: 'Security Tools', icon: '🔒' },
                { key: 'optimizeToolsCredits', label: 'Optimize Tools', icon: '⚡' },
                { key: 'advancedToolsCredits', label: 'Advanced Tools', icon: '🚀' },
                { key: 'convertToolsCredits', label: 'Convert Tools', icon: '📄' },
              ].map((tool) => (
                <div key={tool.key} className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span>{tool.icon}</span>
                    <span className="text-sm">{tool.label}</span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    value={editingPkg ? editingPkg[tool.key] : newPackage[tool.key]}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 0;
                      if (editingPkg) {
                        setEditingPkg({ ...editingPkg, [tool.key]: value });
                      } else {
                        setNewPackage({ ...newPackage, [tool.key]: value });
                      }
                    }}
                    className="w-20 px-2 py-1 border border-gray-300 rounded-lg text-right"
                  />
                </div>
              ))}

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between">
                  <span className="font-semibold">Total Credits:</span>
                  <span className="font-bold text-green-600">
                    {calculateTotal(editingPkg || newPackage)}
                  </span>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="font-semibold">Value Score:</span>
                  <span className="font-bold text-blue-600">
                    {((calculateTotal(editingPkg || newPackage) / Math.max((editingPkg?.price || newPackage.price), 1)) || 0).toFixed(1)}/$
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <button
            onClick={() => editingPkg ? handleSavePackage(editingPkg) : handleSavePackage(newPackage)}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Save className="h-4 w-4" />
            {loading ? "Saving..." : (editingPkg ? "Update" : "Create")}
          </button>
          {(editingPkg || newPackage.name) && (
            <button
              onClick={() => { setEditingPkg(null); setNewPackage(defaultPackage); }}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border">
        <h2 className="text-xl font-bold mb-4">Current Packages ({packages.length})</h2>
        
        {packages.length === 0 ? (
          <div className="text-center py-8">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No topup packages yet. Create your first one!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packages.map((pkg) => {
              const IconComponent = iconOptions.find(i => i.value === pkg.icon)?.component || Package;
              const totalCredits = calculateTotal(pkg);
              
              return (
                <div key={pkg._id} className="border rounded-2xl p-6">
                  <div className="flex items-center mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${pkg.color} flex items-center justify-center mr-3`}>
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold">{pkg.name}</h3>
                      <p className="text-sm text-gray-500">${pkg.price}</p>
                    </div>
                    {!pkg.isActive && (
                      <span className="ml-auto px-2 py-1 bg-red-100 text-red-800 text-xs rounded">
                        Inactive
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-gray-600 mb-4">{pkg.description}</p>

                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Total Credits:</span>
                      <span className="font-bold">{totalCredits}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-xs text-gray-500">
                      {pkg.conversionCredits > 0 && <div>🔄 {pkg.conversionCredits}</div>}
                      {pkg.editToolsCredits > 0 && <div>✏️ {pkg.editToolsCredits}</div>}
                      {pkg.organizeToolsCredits > 0 && <div>🗂️ {pkg.organizeToolsCredits}</div>}
                      {pkg.securityToolsCredits > 0 && <div>🔒 {pkg.securityToolsCredits}</div>}
                      {pkg.optimizeToolsCredits > 0 && <div>⚡ {pkg.optimizeToolsCredits}</div>}
                      {pkg.advancedToolsCredits > 0 && <div>🚀 {pkg.advancedToolsCredits}</div>}
                      {pkg.convertToolsCredits > 0 && <div>📄 {pkg.convertToolsCredits}</div>}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingPkg(pkg)}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <Edit className="h-4 w-4 inline mr-2" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeletePackage(pkg._id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TopupManagement;