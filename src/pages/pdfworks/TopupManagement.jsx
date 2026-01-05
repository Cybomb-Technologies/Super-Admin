import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import {
  Save, Plus, Trash2, Edit, Zap, BatteryCharging,
  Bolt, Sparkles, Crown, Package, Check, X,
  AlertCircle, ChevronRight, HelpCircle,
  RefreshCw, Layers, LayoutGrid, List
} from "lucide-react";

const API_URL = import.meta.env.VITE_PDF_API_URL;

// Modern Styles Object for isolated rendering
const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    padding: '2rem',
    fontFamily: 'Inter, system-ui, sans-serif',
    color: '#1e293b',
  },
  wrapper: {
    maxWidth: '1400px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
  },
  header: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '1.5rem',
    flexWrap: 'wrap',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: '800',
    color: '#1a173a',
    margin: 0,
    letterSpacing: '-0.025em',
  },
  subtitle: {
    color: '#64748b',
    marginTop: '0.5rem',
    fontSize: '1.125rem',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  buttonGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  btnSecondary: {
    padding: '0.75rem 1.5rem',
    backgroundColor: 'white',
    border: '1px solid #fed7aa',
    color: '#ea580c',
    borderRadius: '1rem',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    transition: 'all 0.2s ease',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
  },
  btnPrimary: {
    padding: '0.75rem 1.5rem',
    background: 'linear-gradient(135deg, #10b981 0%, #14b8a6 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '1rem',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    transition: 'all 0.2s ease',
  },
  btnDark: {
    padding: '1rem 2rem',
    backgroundColor: '#1a173a',
    color: 'white',
    border: 'none',
    borderRadius: '1.25rem',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    transition: 'all 0.2s ease',
  },
  editorCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(20px)',
    borderRadius: '2.5rem',
    padding: '2.5rem',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.5)',
    display: 'flex',
    flexDirection: 'column',
    gap: '2.5rem',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(12, 1fr)',
    gap: '2.5rem',
  },
  formSide: {
    gridColumn: 'span 7',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  creditsSide: {
    gridColumn: 'span 5',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  label: {
    fontSize: '0.75rem',
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginLeft: '0.25rem',
  },
  input: {
    padding: '1rem 1.25rem',
    backgroundColor: '#f1f5f9',
    border: 'none',
    borderRadius: '1.25rem',
    fontSize: '1rem',
    fontWeight: '600',
    color: '#1e293b',
    outline: 'none',
    transition: 'all 0.2s ease',
    width: '100%',
  },
  textarea: {
    padding: '1rem 1.25rem',
    backgroundColor: '#f1f5f9',
    border: 'none',
    borderRadius: '1.25rem',
    fontSize: '1rem',
    fontWeight: '600',
    color: '#1e293b',
    outline: 'none',
    minHeight: '120px',
    resize: 'none',
    width: '100%',
  },
  creditBox: {
    backgroundColor: '#1a173a',
    borderRadius: '2rem',
    padding: '2rem',
    color: 'white',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
  },
  creditItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.75rem 0',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
  },
  creditInput: {
    width: '80px',
    padding: '0.5rem 0.75rem',
    backgroundColor: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '0.75rem',
    color: '#34d399',
    textAlign: 'right',
    outline: 'none',
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  footerActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: '1.5rem',
    marginTop: '1rem',
    padding: '1.5rem 2.5rem',
    backgroundColor: '#f8fafc',
    borderRadius: '2rem',
  },
  marketplace: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '2rem',
  },
  pkgCard: {
    backgroundColor: 'white',
    borderRadius: '2.5rem',
    padding: '2.5rem',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    position: 'relative',
    transition: 'all 0.3s ease',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  toast: {
    position: 'fixed',
    top: '1.5rem',
    right: '1.5rem',
    zIndex: 1000,
    backgroundColor: 'white',
    padding: '1rem 1.5rem',
    borderRadius: '1rem',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  }
};

const Toast = ({ title, description, variant = "default", onClose }) => {
  const isDestructive = variant === "destructive";
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      style={{
        ...styles.toast,
        borderLeft: `4px solid ${isDestructive ? '#ef4444' : '#10b981'}`
      }}
    >
      <div style={{ color: isDestructive ? '#ef4444' : '#10b981' }}>
        {isDestructive ? <AlertCircle size={24} /> : <Check size={24} />}
      </div>
      <div>
        <div style={{ fontWeight: '700', color: '#1e293b' }}>{title}</div>
        <div style={{ fontSize: '0.875rem', color: '#64748b' }}>{description}</div>
      </div>
      <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '4px' }}>
        <X size={18} />
      </button>
    </motion.div>
  );
};

const TopupManagement = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingPkg, setEditingPkg] = useState(null);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [toasts, setToasts] = useState([]);
  const [viewMode, setViewMode] = useState('grid');

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
    { value: "Zap", component: Zap, label: "Zap" },
    { value: "BatteryCharging", component: BatteryCharging, label: "Charging" },
    { value: "Bolt", component: Bolt, label: "Bolt" },
    { value: "Sparkles", component: Sparkles, label: "Sparkles" },
    { value: "Crown", component: Crown, label: "Crown" },
    { value: "Package", component: Package, label: "Package" },
  ];

  const colorOptions = [
    { value: "from-blue-500 to-cyan-600", label: "Ocean Blue", hex: "#3b82f6" },
    { value: "from-purple-500 to-pink-500", label: "Royal Purple", hex: "#a855f7" },
    { value: "from-indigo-600 to-purple-600", label: "Deep Indigo", hex: "#4f46e5" },
    { value: "from-emerald-500 to-teal-600", label: "Emerald", hex: "#10b981" },
    { value: "from-orange-500 to-red-500", label: "Sunset", hex: "#f97316" },
    { value: "from-yellow-400 to-orange-500", label: "Amber", hex: "#fbbf24" },
  ];

  const showToast = (title, description, variant = "default") => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, title, description, variant }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000);
  };

  useEffect(() => { fetchPackages(); }, []);

  const fetchPackages = async () => {
    try {
      setFetchLoading(true);
      const res = await fetch(`${API_URL}/api/topup/admin/packages`);
      if (res.ok) {
        const data = await res.json();
        setPackages(data.packages || []);
      }
    } catch (e) {
      showToast("Error", "Failed to load packages", "destructive");
    } finally {
      setFetchLoading(false);
    }
  };

  const handleSavePackage = async (pkg) => {
    setLoading(true);
    try {
      const url = pkg._id ? `${API_URL}/api/topup/admin/${pkg._id}` : `${API_URL}/api/topup/admin`;
      const res = await fetch(url, {
        method: pkg._id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pkg),
      });
      if (res.ok) {
        showToast("Success", "Package saved successfully");
        fetchPackages();
        setEditingPkg(null);
        setNewPackage(defaultPackage);
      }
    } catch (e) {
      showToast("Error", "Failed to save package", "destructive");
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePackage = async (id) => {
    if (!confirm("Delete this package?")) return;
    try {
      const res = await fetch(`${API_URL}/api/topup/admin/${id}`, { method: "DELETE" });
      if (res.ok) { showToast("Success", "Package removed"); fetchPackages(); }
    } catch (e) { showToast("Error", "Failed to delete package", "destructive"); }
  };

  const calculateTotal = (pkg) => {
    return (pkg.conversionCredits || 0) + (pkg.editToolsCredits || 0) + (pkg.organizeToolsCredits || 0) +
      (pkg.securityToolsCredits || 0) + (pkg.optimizeToolsCredits || 0) +
      (pkg.advancedToolsCredits || 0) + (pkg.convertToolsCredits || 0);
  };

  if (fetchLoading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '100px', color: '#94a3b8', fontWeight: 'bold' }}>Fetching credit packages...</div>;

  const currentPkg = editingPkg || newPackage;

  return (
    <div style={styles.container}>
      <AnimatePresence>
        {toasts.map(t => <Toast key={t.id} {...t} onClose={() => setToasts(prev => prev.filter(x => x.id !== t.id))} />)}
      </AnimatePresence>

      <div style={styles.wrapper}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Top-up Packages ⚡</h1>
            <div style={styles.subtitle}><Layers size={20} color="#10b981" /> Empower users with extra credits</div>
          </div>
          <div style={styles.buttonGroup}>
            <button onClick={() => fetchPackages()} style={styles.btnSecondary}><RefreshCw size={16} /> Restore Defaults</button>
            <button onClick={() => { setEditingPkg(null); setNewPackage(defaultPackage); }} style={styles.btnPrimary}><Plus size={20} /> New Package</button>
          </div>
        </div>

        <div style={styles.editorCard}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ padding: '0.75rem', borderRadius: '1rem', backgroundColor: editingPkg ? '#dbeafe' : '#dcfce7', color: editingPkg ? '#2563eb' : '#059669' }}>
              {editingPkg ? <Edit size={24} /> : <Plus size={24} />}
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>{editingPkg ? "Edit Package Details" : "Create New Credit Pack"}</h2>
          </div>

          <div style={styles.formGrid}>
            <div style={styles.formSide}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Display Name</label>
                  <input
                    style={styles.input}
                    value={currentPkg.name}
                    onChange={e => editingPkg ? setEditingPkg({ ...editingPkg, name: e.target.value }) : setNewPackage({ ...newPackage, name: e.target.value })}
                    placeholder="e.g., Ultimate Booster"
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Price (USD)</label>
                  <input
                    type="number"
                    style={styles.input}
                    value={currentPkg.price}
                    onChange={e => editingPkg ? setEditingPkg({ ...editingPkg, price: parseFloat(e.target.value) }) : setNewPackage({ ...newPackage, price: parseFloat(e.target.value) })}
                  />
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Catchy Description</label>
                <textarea
                  style={styles.textarea}
                  value={currentPkg.description}
                  onChange={e => editingPkg ? setEditingPkg({ ...editingPkg, description: e.target.value }) : setNewPackage({ ...newPackage, description: e.target.value })}
                  placeholder="Tell users why they need this pack..."
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Visual Identity</label>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <select
                      style={{ ...styles.input, flex: 1 }}
                      value={currentPkg.icon}
                      onChange={e => editingPkg ? setEditingPkg({ ...editingPkg, icon: e.target.value }) : setNewPackage({ ...newPackage, icon: e.target.value })}
                    >
                      {iconOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    <select
                      style={{ ...styles.input, flex: 1 }}
                      value={currentPkg.color}
                      onChange={e => editingPkg ? setEditingPkg({ ...editingPkg, color: e.target.value }) : setNewPackage({ ...newPackage, color: e.target.value })}
                    >
                      {colorOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Badge & Order</label>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <input
                      style={{ ...styles.input, flex: 2 }}
                      value={currentPkg.badgeText || ''}
                      placeholder="Badge (e.g., Hot)"
                      onChange={e => editingPkg ? setEditingPkg({ ...editingPkg, badgeText: e.target.value }) : setNewPackage({ ...newPackage, badgeText: e.target.value })}
                    />
                    <input
                      type="number"
                      style={{ ...styles.input, flex: 1 }}
                      value={currentPkg.order}
                      placeholder="0"
                      onChange={e => editingPkg ? setEditingPkg({ ...editingPkg, order: parseInt(e.target.value) }) : setNewPackage({ ...newPackage, order: parseInt(e.target.value) })}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', padding: '1.25rem', backgroundColor: '#f1f5f9', borderRadius: '1.5rem' }}>
                {[
                  { k: 'popular', l: 'Popular', c: '#f97316' },
                  { k: 'featured', l: 'Featured', c: '#6366f1' },
                  { k: 'isActive', l: 'Visible to Users', c: '#10b981' }
                ].map(item => (
                  <label key={item.k} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '0.875rem', fontWeight: '700', color: '#475569' }}>
                    <input
                      type="checkbox"
                      style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: item.c }}
                      checked={currentPkg[item.k]}
                      onChange={e => editingPkg ? setEditingPkg({ ...editingPkg, [item.k]: e.target.checked }) : setNewPackage({ ...newPackage, [item.k]: e.target.checked })}
                    />
                    {item.l}
                  </label>
                ))}
              </div>
            </div>

            <div style={styles.creditsSide}>
              <div style={styles.creditBox}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Zap size={20} color="#34d399" /> Credit Allocation
                  </h3>
                  <div style={{ fontSize: '0.625rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.5 }}>Tool usage</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1, overflowY: 'auto' }}>
                  {[
                    { k: 'conversionCredits', l: 'PDF Conversions' },
                    { k: 'editToolsCredits', l: 'Editor Suite' },
                    { k: 'organizeToolsCredits', l: 'Organize Hub' },
                    { k: 'securityToolsCredits', l: 'Shield & Protect' },
                    { k: 'optimizeToolsCredits', l: 'Optimizer Lite' },
                    { k: 'advancedToolsCredits', l: 'Master Suite' },
                    { k: 'convertToolsCredits', l: 'Asset Converter' },
                  ].map(item => (
                    <div key={item.k} style={styles.creditItem}>
                      <span style={{ fontSize: '0.875rem', fontWeight: '500', opacity: 0.8 }}>{item.l}</span>
                      <input
                        type="number"
                        min="0"
                        style={styles.creditInput}
                        value={currentPkg[item.k]}
                        onChange={e => {
                          const val = parseInt(e.target.value) || 0;
                          editingPkg ? setEditingPkg({ ...editingPkg, [item.k]: val }) : setNewPackage({ ...newPackage, [item.k]: val });
                        }}
                      />
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.875rem', opacity: 0.6, fontWeight: '600' }}>Total Credits</span>
                    <span style={{ fontSize: '2.5rem', fontWeight: '900', color: '#34d399', textShadow: '0 0 20px rgba(52,211,153,0.3)' }}>{calculateTotal(currentPkg)}</span>
                  </div>
                  <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.625rem', fontWeight: '800', textTransform: 'uppercase', opacity: 0.4 }}>Efficiency</span>
                    <span style={{ fontSize: '0.875rem', fontWeight: '700', fontFamily: 'monospace' }}>
                      {((calculateTotal(currentPkg) / Math.max(currentPkg.price, 1)) || 0).toFixed(1)} <span style={{ opacity: 0.5, fontSize: '0.75rem' }}>credits/$</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div style={styles.footerActions}>
            <button
              onClick={() => { setEditingPkg(null); setNewPackage(defaultPackage); }}
              style={{ background: 'none', border: 'none', fontWeight: '700', color: '#94a3b8', cursor: 'pointer', fontSize: '1rem' }}
            >
              Reset Form
            </button>
            <button
              onClick={() => handleSavePackage(currentPkg)}
              style={styles.btnDark}
              disabled={loading || !currentPkg.name}
            >
              {loading ? <RefreshCw size={20} className="animate-spin" /> : <Save size={20} />}
              {editingPkg ? "Update Package" : "Launch Package"}
            </button>
          </div>
        </div>

        <div style={{ marginTop: '3rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
            <div>
              <h2 style={{ fontSize: '2rem', fontWeight: '900', color: '#1a173a', margin: 0 }}>Active Marketplace</h2>
              <p style={{ color: '#64748b', fontWeight: '500', margin: '0.5rem 0 0' }}>Currently visible packages ({packages.length})</p>
            </div>
            <div style={{ display: 'flex', backgroundColor: '#e2e8f0', padding: '0.375rem', borderRadius: '1rem', gap: '0.25rem' }}>
              <button onClick={() => setViewMode('grid')} style={{ padding: '0.5rem', borderRadius: '0.75rem', border: 'none', backgroundColor: viewMode === 'grid' ? 'white' : 'transparent', color: viewMode === 'grid' ? '#10b981' : '#94a3b8', cursor: 'pointer', display: 'flex' }}><LayoutGrid size={20} /></button>
              <button onClick={() => setViewMode('list')} style={{ padding: '0.5rem', borderRadius: '0.75rem', border: 'none', backgroundColor: viewMode === 'list' ? 'white' : 'transparent', color: viewMode === 'list' ? '#10b981' : '#94a3b8', cursor: 'pointer', display: 'flex' }}><List size={20} /></button>
            </div>
          </div>

          {packages.length === 0 ? (
            <div style={{ padding: '5rem', textAlign: 'center', backgroundColor: 'rgba(255,255,255,0.5)', border: '2px dashed #e2e8f0', borderRadius: '3rem' }}>
              <Package size={64} color="#cbd5e1" style={{ marginBottom: '1.5rem' }} />
              <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#94a3b8' }}>No packages found</h3>
            </div>
          ) : viewMode === 'grid' ? (
            <div style={styles.marketplace}>
              {packages.map(pkg => (
                <div key={pkg._id} style={styles.pkgCard}>
                  {!pkg.isActive && (
                    <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem' }}>
                      <span style={{ fontSize: '0.625rem', fontWeight: '900', color: '#ef4444', backgroundColor: '#fee2e2', padding: '0.25rem 0.75rem', borderRadius: '1rem', textTransform: 'uppercase' }}>Inactive</span>
                    </div>
                  )}
                  {pkg.badgeText && (
                    <div style={{ position: 'absolute', top: '1.5rem', left: '1.5rem' }}>
                      <span style={{ fontSize: '0.625rem', fontWeight: '900', color: '#f59e0b', backgroundColor: '#fef3c7', padding: '0.25rem 0.75rem', borderRadius: '1rem', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Crown size={12} /> {pkg.badgeText}
                      </span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: '1rem' }}>
                    <div style={{
                      width: '72px',
                      height: '72px',
                      borderRadius: '1.5rem',
                      background: `linear-gradient(135deg, ${colorOptions.find(c => c.value === pkg.color)?.hex || '#3b82f6'}, #1e40af)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'
                    }}>
                      {React.createElement(iconOptions.find(i => i.value === pkg.icon)?.component || Package, { size: 36 })}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '2rem', fontWeight: '900', color: '#1a173a' }}>${pkg.price}</div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase' }}>Credits: {calculateTotal(pkg)}</div>
                    </div>
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1e293b', margin: '0.5rem 0' }}>{pkg.name}</h3>
                    <p style={{ fontSize: '0.925rem', color: '#64748b', margin: 0, minHeight: '3rem', lineClamp: 2 }}>{pkg.description}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: 'auto' }}>
                    <button
                      onClick={() => setEditingPkg(pkg)}
                      style={{ flex: 1, padding: '1rem', backgroundColor: '#1e293b', color: 'white', border: 'none', borderRadius: '1.25rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                    >
                      <Edit size={18} /> Edit
                    </button>
                    <button
                      onClick={() => handleDeletePackage(pkg._id)}
                      style={{ padding: '1rem', backgroundColor: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '1.25rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ backgroundColor: 'white', borderRadius: '2.5rem', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <tr>
                    <th style={{ padding: '1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' }}>Package</th>
                    <th style={{ padding: '1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' }}>Credits</th>
                    <th style={{ padding: '1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' }}>Price</th>
                    <th style={{ padding: '1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' }}>Status</th>
                    <th style={{ padding: '1.5rem', textAlign: 'right', fontSize: '0.75rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {packages.map(pkg => (
                    <tr key={pkg._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '0.75rem', background: `linear-gradient(135deg, ${colorOptions.find(c => c.value === pkg.color)?.hex || '#3b82f6'}, #1e40af)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                            {React.createElement(iconOptions.find(i => i.value === pkg.icon)?.component || Package, { size: 20 })}
                          </div>
                          <div style={{ fontWeight: '700', color: '#1e293b' }}>{pkg.name}</div>
                        </div>
                      </td>
                      <td style={{ padding: '1.5rem', fontWeight: '700', color: '#10b981' }}>{calculateTotal(pkg)}</td>
                      <td style={{ padding: '1.5rem', fontWeight: '700', color: '#1e293b' }}>${pkg.price}</td>
                      <td style={{ padding: '1.5rem' }}>
                        <span style={{ fontSize: '0.625rem', fontWeight: '900', color: pkg.isActive ? '#10b981' : '#94a3b8', backgroundColor: pkg.isActive ? '#dcfce7' : '#f1f5f9', padding: '0.25rem 0.75rem', borderRadius: '1rem', textTransform: 'uppercase' }}>
                          {pkg.isActive ? 'Active' : 'Hidden'}
                        </span>
                      </td>
                      <td style={{ padding: '1.5rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                          <button onClick={() => setEditingPkg(pkg)} style={{ padding: '0.5rem', backgroundColor: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}><Edit size={16} /></button>
                          <button onClick={() => handleDeletePackage(pkg._id)} style={{ padding: '0.5rem', backgroundColor: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}><Trash2 size={16} /></button>
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
    </div>
  );
};

export default TopupManagement;
