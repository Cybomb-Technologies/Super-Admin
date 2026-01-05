// src/pages/admin/AdminPricingManager.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Save,
  X,
  Zap,
  FileText,
  Crown,
  Building2,
  ArrowUp,
  ArrowDown,
  IndianRupee,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { getAuthHeaders } from '@/utils/startupBuilderAuth';

const API_BASE_URL = import.meta.env.VITE_PAPLIXO_API_URL;

const AdminPricingManager = () => {
  const { toast } = useToast();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    planId: '',
    description: '',
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: [{ name: '', included: true }],
    popular: false,
    active: true,
    downloadLimit: '',
    storage: '',
    supportType: '',
    icon: 'Zap',
    color: 'blue',
    ctaText: 'Get Started',
    annualDiscount: 15,
    position: 0
  });

  const colorOptions = [
    { value: 'blue', label: 'Blue', gradient: 'from-blue-500 to-cyan-600' },
    { value: 'purple', label: 'Purple', gradient: 'from-purple-500 to-pink-600' },
    { value: 'green', label: 'Green', gradient: 'from-green-500 to-emerald-600' },
    { value: 'orange', label: 'Orange', gradient: 'from-orange-500 to-red-600' },
    { value: 'indigo', label: 'Indigo', gradient: 'from-indigo-500 to-blue-600' },
  ];

  const icons = {
    Zap: Zap,
    FileText: FileText,
    Crown: Crown,
    Building2: Building2
  };

  const getAuthHeadersLocal = () => {
    const headers = getAuthHeaders();
    if (Object.keys(headers).length === 0) return {};
    return headers;
  };

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const headers = getAuthHeadersLocal();
      if (Object.keys(headers).length === 0) return;

      const response = await fetch(`${API_BASE_URL}/api/pricing/admin/all`, { headers });
      if (response.ok) {
        const data = await response.json();
        const sortedPlans = data.plans.sort((a, b) => a.position - b.position);
        setPlans(sortedPlans);
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to load pricing plans', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFeatureChange = (index, field, value) => {
    const updatedFeatures = [...formData.features];
    updatedFeatures[index][field] = value;
    setFormData(prev => ({ ...prev, features: updatedFeatures }));
  };

  const addFeature = () => {
    setFormData(prev => ({ ...prev, features: [...prev.features, { name: '', included: true }] }));
  };

  const removeFeature = (index) => {
    if (formData.features.length <= 1) return;
    const updatedFeatures = formData.features.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, features: updatedFeatures }));
  };

  const handleEdit = (plan) => {
    setEditingPlan(plan.planId);
    setFormData({
      ...plan,
      color: colorOptions.find(c => c.gradient === plan.color)?.value || 'blue',
      features: plan.features.map(f => ({ ...f }))
    });
    setIsCreating(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCreate = () => {
    setIsCreating(true);
    setEditingPlan(null);
    setFormData({
      name: '', planId: '', description: '', monthlyPrice: 0, yearlyPrice: 0,
      features: [{ name: '', included: true }], popular: false, active: true,
      downloadLimit: '', storage: '', supportType: '', icon: 'Zap', color: 'blue',
      ctaText: 'Get Started', annualDiscount: 15, position: plans.length
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const headers = getAuthHeadersLocal();
      const colorGradient = colorOptions.find(c => c.value === formData.color)?.gradient || 'from-blue-500 to-cyan-600';
      const payload = { ...formData, color: colorGradient };

      const url = isCreating
        ? `${API_BASE_URL}/api/pricing/admin/create`
        : `${API_BASE_URL}/api/pricing/admin/update/${formData.planId}`;

      const response = await fetch(url, {
        method: isCreating ? 'POST' : 'PUT',
        headers,
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        toast({ title: 'Success', description: `Plan ${isCreating ? 'created' : 'updated'} successfully` });
        fetchPlans();
        setIsCreating(false);
        setEditingPlan(null);
      }
    } catch (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleDelete = async (planId) => {
    if (!confirm('Are you sure?')) return;
    try {
      const headers = getAuthHeadersLocal();
      const response = await fetch(`${API_BASE_URL}/api/pricing/admin/delete/${planId}`, {
        method: 'DELETE', headers
      });
      if (response.ok) {
        toast({ title: 'Deleted', description: 'Plan removed successfully' });
        fetchPlans();
      }
    } catch (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleToggleStatus = async (planId) => {
    try {
      const headers = getAuthHeadersLocal();
      const response = await fetch(`${API_BASE_URL}/api/pricing/admin/toggle/${planId}`, {
        method: 'PATCH', headers
      });
      if (response.ok) {
        fetchPlans();
      }
    } catch (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  if (loading && plans.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
        <p className="text-slate-500 font-medium">Syncing subscription models...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerTitle}>
          <div className={styles.iconWrapper}>
            <Crown className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className={styles.titleText}>Subscription Manager</h2>
            <p className={styles.subtitle}>Configuring {plans.length} active platform tiers</p>
          </div>
        </div>
        {!isCreating && !editingPlan && (
          <Button onClick={handleCreate} className="bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold h-12 px-6 shadow-lg transition-all active:scale-95">
            <Plus className="w-4 h-4 mr-2" />
            Create New Plan
          </Button>
        )}
      </div>

      <AnimatePresence>
        {(isCreating || editingPlan) && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={styles.formCard}
          >
            <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-100">
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                {isCreating ? 'Configure New Tier' : 'Edit Plan Details'}
              </h3>
              <Button variant="ghost" onClick={() => { setIsCreating(false); setEditingPlan(null); }} className="rounded-full w-10 h-10 p-0 text-slate-400 hover:text-slate-900">
                <X className="w-5 h-5" />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className={styles.formGrid}>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Plan Name</label>
                  <Input
                    value={formData.name}
                    onChange={e => handleInputChange('name', e.target.value)}
                    placeholder="e.g. Enterprise Elite"
                    className="h-12 rounded-2xl bg-slate-50/50"
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Internal Identifier</label>
                  <Input
                    value={formData.planId}
                    onChange={e => handleInputChange('planId', e.target.value)}
                    placeholder="e.g. enterprise_v2"
                    disabled={!!editingPlan}
                    className="h-12 rounded-2xl bg-slate-50/50"
                  />
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Value Proposition</label>
                <Textarea
                  value={formData.description}
                  onChange={e => handleInputChange('description', e.target.value)}
                  placeholder="What makes this plan special?"
                  className="rounded-2xl bg-slate-50/50"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Monthly (₹)</label>
                  <Input type="number" value={formData.monthlyPrice} onChange={e => handleInputChange('monthlyPrice', e.target.value)} className="h-12 rounded-2xl bg-slate-50/50" />
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Yearly (₹)</label>
                  <Input type="number" value={formData.yearlyPrice} onChange={e => handleInputChange('yearlyPrice', e.target.value)} className="h-12 rounded-2xl bg-slate-50/50" />
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Annual Discount (%)</label>
                  <Input type="number" value={formData.annualDiscount} onChange={e => handleInputChange('annualDiscount', e.target.value)} className="h-12 rounded-2xl bg-slate-50/50" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Visual Theme</label>
                  <Select value={formData.color} onValueChange={v => handleInputChange('color', v)}>
                    <SelectTrigger className="h-12 rounded-2xl bg-slate-50/50">
                      <SelectValue placeholder="Pick a theme" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl">
                      {colorOptions.map(c => (
                        <SelectItem key={c.value} value={c.value}>
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full bg-gradient-to-br ${c.gradient}`} />
                            {c.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Design Icon</label>
                  <Select value={formData.icon} onValueChange={v => handleInputChange('icon', v)}>
                    <SelectTrigger className="h-12 rounded-2xl bg-slate-50/50">
                      <SelectValue placeholder="Identity" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl">
                      {Object.keys(icons).map(i => (
                        <SelectItem key={i} value={i}>{i}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className={styles.inputLabel}>Inclusions & Features</label>
                  <Button type="button" variant="outline" size="sm" onClick={addFeature} className="rounded-xl font-bold border-indigo-100 text-indigo-600 hover:bg-indigo-50">
                    <Plus className="w-4 h-4 mr-1" /> Add Inclusion
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {formData.features.map((f, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-[1.5rem] border border-slate-100">
                      <Input
                        value={f.name}
                        onChange={e => handleFeatureChange(i, 'name', e.target.value)}
                        className="border-none bg-transparent h-8 focus-visible:ring-0 font-medium"
                        placeholder="Feature name..."
                      />
                      <Button variant="ghost" size="sm" onClick={() => removeFeature(i)} className="text-slate-400 hover:text-red-500 rounded-full h-8 w-8 p-0">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-6 pt-4">
                <div className="flex items-center gap-3 bg-slate-50 px-5 py-3 rounded-2xl border border-slate-100">
                  <Switch checked={formData.active} onCheckedChange={v => handleInputChange('active', v)} />
                  <span className="text-sm font-bold text-slate-700">Marketplace Visible</span>
                </div>
                <div className="flex items-center gap-3 bg-blue-50 px-5 py-3 rounded-2xl border border-blue-100">
                  <Switch checked={formData.popular} onCheckedChange={v => handleInputChange('popular', v)} />
                  <span className="text-sm font-bold text-blue-700 uppercase tracking-wider">Most Popular</span>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                <Button variant="outline" type="button" onClick={() => { setIsCreating(false); setEditingPlan(null); }} className="rounded-2xl font-bold h-12 px-8">
                  Cancel
                </Button>
                <Button type="submit" className="bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold h-12 px-12 shadow-xl">
                  {isCreating ? 'Deploy Plan' : 'Commit Changes'}
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={styles.plansGrid}>
        {plans.map((plan, idx) => {
          const Icon = icons[plan.icon] || Zap;
          return (
            <motion.div
              key={plan._id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className={`${styles.planCard} ${!plan.active ? 'opacity-60 saturate-50' : ''}`}
            >
              {plan.popular && <div className={styles.popularBadge}>Most Popular</div>}

              <div className={styles.planHeader}>
                <div className={`${styles.planIcon} bg-gradient-to-br ${plan.color}`}>
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className={styles.planTitle}>{plan.name}</h3>
              </div>

              <p className="text-slate-500 font-medium text-sm line-clamp-2 min-h-[2.5rem] mb-6">
                {plan.description}
              </p>

              <div className={styles.planPrice}>
                <span className={styles.currency}>₹</span>
                <span className={styles.amount}>{plan.monthlyPrice}</span>
                <span className={styles.period}>/mo</span>
              </div>

              <div className="bg-slate-50 -mx-10 px-10 py-6 mb-8">
                <div className={styles.featuresList}>
                  {plan.features.slice(0, 5).map((f, i) => (
                    <div key={i} className={styles.featureItem}>
                      <div className={styles.featureIcon}>
                        <Zap className="w-2.5 h-2.5 text-blue-600 shadow-sm" />
                      </div>
                      {f.name}
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.actionsSection}>
                <Button onClick={() => handleEdit(plan)} className="flex-1 bg-white hover:bg-slate-50 text-slate-900 border-slate-200 rounded-2xl font-bold h-12 shadow-sm transition-all active:scale-95">
                  <Edit className="w-4 h-4 mr-2" /> Edit
                </Button>
                <Button
                  onClick={() => handleToggleStatus(plan.planId)}
                  variant="outline"
                  className={`flex-1 rounded-2xl font-bold h-12 transition-all active:scale-95 ${plan.active ? 'hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200' : 'hover:bg-green-50 hover:text-green-600 hover:border-green-200'}`}
                >
                  {plan.active ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                  {plan.active ? 'Hide' : 'Show'}
                </Button>
                <Button onClick={() => handleDelete(plan.planId)} variant="destructive" className="w-12 h-12 rounded-2xl p-0 transition-all active:scale-95">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminPricingManager;
