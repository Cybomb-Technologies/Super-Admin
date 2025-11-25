// app/admin/pricing/page.jsx
"use client";

import React, { useState, useEffect } from "react";
import styles from "./PricingTab.module.css";

export default function AdminPricingPage() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const [newPlan, setNewPlan] = useState({
    name: "",
    description: "",
    monthlyUSD: undefined,
    annualUSD: undefined,
    maxAuditsPerMonth: undefined,
    maxKeywordReportsPerMonth: undefined,
    maxBusinessNamesPerMonth: undefined,
    maxKeywordChecksPerMonth: undefined,
    maxKeywordScrapesPerMonth: undefined,
    highlight: false,
    custom: false,
    features: [{ name: "", included: true }],
    isActive: true,
    sortOrder: 0,
    includesTax: false,
    isFree: false,
  });

  // Fixed API base URL - use environment variable or fallback
  const API_BASE = import.meta.env.VITE_RANKSEO_API_URL || "http://localhost:5000";

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/admin/pricing`, {
        // No Authorization header needed due to domain bypass
      });

      if (response.ok) {
        const data = await response.json();
        setPlans(data.plans || []);
      } else {
        throw new Error("Failed to fetch plans");
      }
    } catch (error) {
      console.error("Error fetching plans:", error);
      setMessage({ type: 'error', text: 'Failed to load pricing plans' });
    } finally {
      setLoading(false);
    }
  };

  const savePlans = async () => {
    try {
      setSaving(true);
      
      const response = await fetch(`${API_BASE}/api/admin/pricing`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          // No Authorization header needed due to domain bypass
        },
        body: JSON.stringify({ plans }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Pricing plans updated successfully!' });
        setTimeout(() => setMessage(null), 3000);
      } else {
        throw new Error("Failed to save plans");
      }
    } catch (error) {
      console.error("Error saving plans:", error);
      setMessage({ type: 'error', text: 'Failed to save pricing plans' });
    } finally {
      setSaving(false);
    }
  };

  const addNewPlan = () => {
    if (!newPlan.name.trim()) return;
    
    const plan = {
      ...newPlan,
      monthlyUSD: newPlan.isFree ? 0 : newPlan.monthlyUSD,
      annualUSD: newPlan.isFree ? 0 : newPlan.annualUSD,
      features: newPlan.features.filter(f => f.name.trim() !== ""),
    };

    setPlans(prevPlans => [...prevPlans, plan]);
    setNewPlan({
      name: "",
      description: "",
      monthlyUSD: undefined,
      annualUSD: undefined,
      maxAuditsPerMonth: undefined,
      maxKeywordReportsPerMonth: undefined,
      maxBusinessNamesPerMonth: undefined,
      maxKeywordChecksPerMonth: undefined,
      maxKeywordScrapesPerMonth: undefined,
      highlight: false,
      custom: false,
      features: [{ name: "", included: true }],
      isActive: true,
      sortOrder: prevPlans.length,
      includesTax: false,
      isFree: false,
    });
  };

  const updatePlan = (index, field, value) => {
    setPlans(prevPlans => {
      const updatedPlans = [...prevPlans];
      
      // If setting isFree to true, automatically set prices to 0
      if (field === 'isFree' && value === true) {
        updatedPlans[index] = { 
          ...updatedPlans[index], 
          [field]: value,
          monthlyUSD: 0,
          annualUSD: 0,
          custom: false
        };
      } else {
        updatedPlans[index] = { ...updatedPlans[index], [field]: value };
      }
      
      return updatedPlans;
    });
  };

  const updatePlanFeature = (planIndex, featureIndex, field, value) => {
    setPlans(prevPlans => {
      const updatedPlans = [...prevPlans];
      const updatedFeatures = [...updatedPlans[planIndex].features];
      updatedFeatures[featureIndex] = { ...updatedFeatures[featureIndex], [field]: value };
      updatedPlans[planIndex] = { ...updatedPlans[planIndex], features: updatedFeatures };
      return updatedPlans;
    });
  };

  const addFeatureToPlan = (planIndex) => {
    setPlans(prevPlans => {
      const updatedPlans = [...prevPlans];
      updatedPlans[planIndex] = {
        ...updatedPlans[planIndex],
        features: [...updatedPlans[planIndex].features, { name: "", included: true }]
      };
      return updatedPlans;
    });
  };

  const removeFeatureFromPlan = (planIndex, featureIndex) => {
    setPlans(prevPlans => {
      const updatedPlans = [...prevPlans];
      const planFeatures = updatedPlans[planIndex].features;
      
      const featuresAfterRemoval = planFeatures.filter((_, index) => index !== featureIndex);
      
      if (featuresAfterRemoval.length === 0) {
        updatedPlans[planIndex] = {
          ...updatedPlans[planIndex],
          features: [{ name: "", included: true }]
        };
      } else {
        updatedPlans[planIndex] = {
          ...updatedPlans[planIndex],
          features: featuresAfterRemoval
        };
      }
      
      return updatedPlans;
    });
  };

  const removePlan = async (index, planId) => {
    if (planId) {
      // This is an existing plan from the database, call API to delete
      try {
        const response = await fetch(`${API_BASE}/api/admin/pricing/${planId}`, {
          method: "DELETE",
          // No Authorization header needed due to domain bypass
        });

        if (response.ok) {
          setPlans(prevPlans => prevPlans.filter((_, i) => i !== index));
          setMessage({ type: 'success', text: 'Plan deleted successfully!' });
          setTimeout(() => setMessage(null), 3000);
        } else {
          throw new Error("Failed to delete plan");
        }
      } catch (error) {
        console.error("Error deleting plan:", error);
        setMessage({ type: 'error', text: 'Failed to delete plan' });
      }
    } else {
      // This is a newly added plan that hasn't been saved to database yet
      setPlans(prevPlans => prevPlans.filter((_, i) => i !== index));
    }
  };

  const addNewFeatureToNewPlan = () => {
    setNewPlan(prev => ({
      ...prev,
      features: [...prev.features, { name: "", included: true }]
    }));
  };

  const updateNewPlanFeature = (featureIndex, field, value) => {
    setNewPlan(prev => {
      const updatedFeatures = [...prev.features];
      updatedFeatures[featureIndex] = { ...updatedFeatures[featureIndex], [field]: value };
      return { ...prev, features: updatedFeatures };
    });
  };

  const removeNewPlanFeature = (featureIndex) => {
    setNewPlan(prev => {
      const updatedFeatures = prev.features.filter((_, index) => index !== featureIndex);
      
      if (updatedFeatures.length === 0) {
        return { ...prev, features: [{ name: "", included: true }] };
      }
      return { ...prev, features: updatedFeatures };
    });
  };

  const togglePlanStatus = async (planId, currentStatus) => {
    try {
      const response = await fetch(`${API_BASE}/api/admin/pricing/${planId}/toggle-status`, {
        method: "PATCH",
        // No Authorization header needed due to domain bypass
      });

      if (response.ok) {
        setPlans(prevPlans => 
          prevPlans.map(plan => 
            plan._id === planId ? { ...plan, isActive: !currentStatus } : plan
          )
        );
        setMessage({ type: 'success', text: `Plan ${!currentStatus ? 'activated' : 'deactivated'} successfully!` });
        setTimeout(() => setMessage(null), 3000);
      } else {
        throw new Error("Failed to toggle plan status");
      }
    } catch (error) {
      console.error("Error toggling plan status:", error);
      setMessage({ type: 'error', text: 'Failed to update plan status' });
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingText}>Loading pricing plans...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.title}>Manage Pricing Plans</h1>
          <p className={styles.subtitle}>
            Configure and manage your subscription plans dynamically
          </p>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`${styles.message} ${
              message.type === 'success' ? styles.successMessage : styles.errorMessage
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Add New Plan */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Add New Plan</h2>
          <div className={styles.grid}>
            <div>
              <label className={styles.label}>Plan Name</label>
              <input
                type="text"
                placeholder="e.g., Starter, Professional"
                value={newPlan.name}
                onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
                className={styles.input}
              />
            </div>
            <div>
              <label className={styles.label}>Description</label>
              <input
                type="text"
                placeholder="Plan description"
                value={newPlan.description}
                onChange={(e) => setNewPlan({ ...newPlan, description: e.target.value })}
                className={styles.input}
              />
            </div>
            <div>
              <label className={styles.label}>Monthly Price ($)</label>
              <input
                type="number"
                placeholder="29"
                value={newPlan.monthlyUSD || ""}
                onChange={(e) => setNewPlan({ ...newPlan, monthlyUSD: e.target.value ? Number(e.target.value) : undefined })}
                className={`${styles.input} ${newPlan.isFree ? styles.disabled : ''}`}
                disabled={newPlan.isFree}
              />
            </div>
            <div>
              <label className={styles.label}>Annual Price ($)</label>
              <input
                type="number"
                placeholder="290"
                value={newPlan.annualUSD || ""}
                onChange={(e) => setNewPlan({ ...newPlan, annualUSD: e.target.value ? Number(e.target.value) : undefined })}
                className={`${styles.input} ${newPlan.isFree ? styles.disabled : ''}`}
                disabled={newPlan.isFree}
              />
            </div>
            <div>
              <label className={styles.label}>Max Audits/Month</label>
              <input
                type="number"
                placeholder="50"
                value={newPlan.maxAuditsPerMonth || ""}
                onChange={(e) => setNewPlan({ ...newPlan, maxAuditsPerMonth: e.target.value ? Number(e.target.value) : undefined })}
                className={styles.input}
              />
            </div>
            <div>
              <label className={styles.label}>Max Keyword Reports</label>
              <input
                type="number"
                placeholder="100"
                value={newPlan.maxKeywordReportsPerMonth || ""}
                onChange={(e) => setNewPlan({ ...newPlan, maxKeywordReportsPerMonth: e.target.value ? Number(e.target.value) : undefined })}
                className={styles.input}
              />
            </div>
            <div>
              <label className={styles.label}>Max Business Names</label>
              <input
                type="number"
                placeholder="50"
                value={newPlan.maxBusinessNamesPerMonth || ""}
                onChange={(e) => setNewPlan({ ...newPlan, maxBusinessNamesPerMonth: e.target.value ? Number(e.target.value) : undefined })}
                className={styles.input}
              />
            </div>
            <div>
              <label className={styles.label}>Max Keyword Checks</label>
              <input
                type="number"
                placeholder="200"
                value={newPlan.maxKeywordChecksPerMonth || ""}
                onChange={(e) => setNewPlan({ ...newPlan, maxKeywordChecksPerMonth: e.target.value ? Number(e.target.value) : undefined })}
                className={styles.input}
              />
            </div>
            <div>
              <label className={styles.label}>Max Keyword Scrapes</label>
              <input
                type="number"
                placeholder="50"
                value={newPlan.maxKeywordScrapesPerMonth || ""}
                onChange={(e) => setNewPlan({ ...newPlan, maxKeywordScrapesPerMonth: e.target.value ? Number(e.target.value) : undefined })}
                className={styles.input}
              />
            </div>
          </div>

          {/* New Plan Features */}
          <div className={styles.featuresSection}>
            <label className={styles.label}>Features</label>
            <div className={styles.featuresList}>
              {newPlan.features.map((feature, featureIndex) => (
                <div key={featureIndex} className={styles.featureItem}>
                  <div className={styles.featureInput}>
                    <input
                      type="text"
                      value={feature.name}
                      onChange={(e) => updateNewPlanFeature(featureIndex, 'name', e.target.value)}
                      className={styles.input}
                      placeholder="Feature description"
                    />
                  </div>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={feature.included}
                      onChange={(e) => updateNewPlanFeature(featureIndex, 'included', e.target.checked)}
                      className={styles.checkbox}
                    />
                    <span className={styles.checkboxText}>Included</span>
                  </label>
                  <button
                    onClick={() => removeNewPlanFeature(featureIndex)}
                    className={styles.removeButton}
                    disabled={newPlan.features.length === 1 && feature.name === ""}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={addNewFeatureToNewPlan}
              className={styles.addButton}
            >
              + Add Feature
            </button>
          </div>

          <div className={styles.checkboxGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={newPlan.highlight}
                onChange={(e) => setNewPlan({ ...newPlan, highlight: e.target.checked })}
                className={styles.checkbox}
              />
              <span className={styles.checkboxText}>Highlight Plan (Most Popular)</span>
            </label>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={newPlan.custom}
                onChange={(e) => setNewPlan({ ...newPlan, custom: e.target.checked, isFree: e.target.checked ? false : newPlan.isFree })}
                className={styles.checkbox}
              />
              <span className={styles.checkboxText}>Custom Pricing</span>
            </label>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={newPlan.isFree}
                onChange={(e) => setNewPlan({ 
                  ...newPlan, 
                  isFree: e.target.checked,
                  monthlyUSD: e.target.checked ? 0 : newPlan.monthlyUSD,
                  annualUSD: e.target.checked ? 0 : newPlan.annualUSD,
                  custom: e.target.checked ? false : newPlan.custom
                })}
                className={styles.checkbox}
              />
              <span className={styles.checkboxText}>Free Plan</span>
            </label>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={newPlan.includesTax}
                onChange={(e) => setNewPlan({ ...newPlan, includesTax: e.target.checked })}
                className={styles.checkbox}
              />
              <span className={styles.checkboxText}>Includes Tax</span>
            </label>
          </div>
          
          <div className={styles.addPlanActions}>
            <button
              onClick={addNewPlan}
              disabled={!newPlan.name.trim()}
              className={styles.primaryButton}
            >
              Add New Plan
            </button>
            <div className={styles.helperText}>
              Fill in the plan name and features to add a new pricing plan
            </div>
          </div>
        </div>

        {/* Existing Plans */}
        <div className={styles.plansList}>
          {plans.map((plan, planIndex) => (
            <div
              key={plan._id || planIndex}
              className={`${styles.planCard} ${plan.highlight ? styles.highlighted : ''}`}
            >
              <div className={styles.planHeader}>
                <div>
                  <h3 className={styles.planName}>{plan.name}</h3>
                  <div className={styles.badgeContainer}>
                    {plan.highlight && (
                      <span className={styles.badgeYellow}>
                        Most Popular
                      </span>
                    )}
                    {plan.custom && (
                      <span className={styles.badgePurple}>
                        Custom Pricing
                      </span>
                    )}
                    {plan.isFree && (
                      <span className={styles.badgeBlue}>
                        Free Plan
                      </span>
                    )}
                    {plan.includesTax && (
                      <span className={styles.badgeGreen}>
                        Includes Tax
                      </span>
                    )}
                  </div>
                </div>
                <div className={styles.planActions}>
                  {plan._id && (
                    <button
                      onClick={() => togglePlanStatus(plan._id, plan.isActive || false)}
                      className={`${styles.statusButton} ${
                        plan.isActive ? styles.activeStatus : styles.inactiveStatus
                      }`}
                    >
                      {plan.isActive ? 'Active' : 'Inactive'}
                    </button>
                  )}
                  <button
                    onClick={() => removePlan(planIndex, plan._id)}
                    className={styles.removePlanButton}
                  >
                    Remove
                  </button>
                </div>
              </div>

              <div className={styles.planGrid}>
                <div>
                  <label className={styles.label}>Name</label>
                  <input
                    type="text"
                    value={plan.name}
                    onChange={(e) => updatePlan(planIndex, 'name', e.target.value)}
                    className={styles.input}
                  />
                </div>
                <div>
                  <label className={styles.label}>Description</label>
                  <input
                    type="text"
                    value={plan.description}
                    onChange={(e) => updatePlan(planIndex, 'description', e.target.value)}
                    className={styles.input}
                  />
                </div>
                <div>
                  <label className={styles.label}>Monthly USD</label>
                  <input
                    type="number"
                    value={plan.monthlyUSD || ""}
                    onChange={(e) => updatePlan(planIndex, 'monthlyUSD', e.target.value ? Number(e.target.value) : undefined)}
                    className={`${styles.input} ${plan.custom || plan.isFree ? styles.disabled : ''}`}
                    disabled={plan.custom || plan.isFree}
                  />
                </div>
                <div>
                  <label className={styles.label}>Annual USD</label>
                  <input
                    type="number"
                    value={plan.annualUSD || ""}
                    onChange={(e) => updatePlan(planIndex, 'annualUSD', e.target.value ? Number(e.target.value) : undefined)}
                    className={`${styles.input} ${plan.custom || plan.isFree ? styles.disabled : ''}`}
                    disabled={plan.custom || plan.isFree}
                  />
                </div>
                <div>
                  <label className={styles.label}>Max Audits/Month</label>
                  <input
                    type="number"
                    value={plan.maxAuditsPerMonth || ""}
                    onChange={(e) => updatePlan(planIndex, 'maxAuditsPerMonth', e.target.value ? Number(e.target.value) : undefined)}
                    className={styles.input}
                  />
                </div>
                <div>
                  <label className={styles.label}>Max Keyword Reports</label>
                  <input
                    type="number"
                    value={plan.maxKeywordReportsPerMonth || ""}
                    onChange={(e) => updatePlan(planIndex, 'maxKeywordReportsPerMonth', e.target.value ? Number(e.target.value) : undefined)}
                    className={styles.input}
                  />
                </div>
                <div>
                  <label className={styles.label}>Max Business Names</label>
                  <input
                    type="number"
                    value={plan.maxBusinessNamesPerMonth || ""}
                    onChange={(e) => updatePlan(planIndex, 'maxBusinessNamesPerMonth', e.target.value ? Number(e.target.value) : undefined)}
                    className={styles.input}
                  />
                </div>
                <div>
                  <label className={styles.label}>Max Keyword Checks</label>
                  <input
                    type="number"
                    value={plan.maxKeywordChecksPerMonth || ""}
                    onChange={(e) => updatePlan(planIndex, 'maxKeywordChecksPerMonth', e.target.value ? Number(e.target.value) : undefined)}
                    className={styles.input}
                  />
                </div>
                <div>
                  <label className={styles.label}>Max Keyword Scrapes</label>
                  <input
                    type="number"
                    value={plan.maxKeywordScrapesPerMonth || ""}
                    onChange={(e) => updatePlan(planIndex, 'maxKeywordScrapesPerMonth', e.target.value ? Number(e.target.value) : undefined)}
                    className={styles.input}
                  />
                </div>
                
                <div className={styles.checkboxItem}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={plan.highlight || false}
                      onChange={(e) => updatePlan(planIndex, 'highlight', e.target.checked)}
                      className={styles.checkbox}
                    />
                    <span className={styles.checkboxText}>Highlight</span>
                  </label>
                </div>
                <div className={styles.checkboxItem}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={plan.custom || false}
                      onChange={(e) => updatePlan(planIndex, 'custom', e.target.checked)}
                      className={styles.checkbox}
                    />
                    <span className={styles.checkboxText}>Custom Pricing</span>
                  </label>
                </div>
                <div className={styles.checkboxItem}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={plan.isFree || false}
                      onChange={(e) => updatePlan(planIndex, 'isFree', e.target.checked)}
                      className={styles.checkbox}
                    />
                    <span className={styles.checkboxText}>Free Plan</span>
                  </label>
                </div>
                <div className={styles.checkboxItem}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={plan.includesTax || false}
                      onChange={(e) => updatePlan(planIndex, 'includesTax', e.target.checked)}
                      className={styles.checkbox}
                    />
                    <span className={styles.checkboxText}>Includes Tax</span>
                  </label>
                </div>
              </div>

              {/* Features */}
              <div className={styles.featuresSection}>
                <label className={styles.label}>Features</label>
                <div className={styles.featuresList}>
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className={styles.featureItem}>
                      <div className={styles.featureInput}>
                        <input
                          type="text"
                          value={feature.name}
                          onChange={(e) => updatePlanFeature(planIndex, featureIndex, 'name', e.target.value)}
                          className={styles.input}
                          placeholder="Feature description"
                        />
                      </div>
                      <label className={styles.checkboxLabel}>
                        <input
                          type="checkbox"
                          checked={feature.included}
                          onChange={(e) => updatePlanFeature(planIndex, featureIndex, 'included', e.target.checked)}
                          className={styles.checkbox}
                        />
                        <span className={styles.checkboxText}>Included</span>
                      </label>
                      <button
                        onClick={() => removeFeatureFromPlan(planIndex, featureIndex)}
                        className={styles.removeButton}
                        disabled={plan.features.length === 1 && feature.name === ""}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => addFeatureToPlan(planIndex)}
                  className={styles.addButton}
                >
                  + Add Feature
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Save Button */}
        {plans.length > 0 && (
          <div className={styles.saveActions}>
            <button
              onClick={fetchPlans}
              className={styles.secondaryButton}
            >
              Discard Changes
            </button>
            <button
              onClick={savePlans}
              disabled={saving}
              className={styles.primaryButton}
            >
              {saving ? 'Saving Changes...' : 'Save All Changes'}
            </button>
          </div>
        )}

        {plans.length === 0 && (
          <div className={styles.emptyState}>
            <div className={styles.emptyText}>No pricing plans configured yet</div>
            <div className={styles.emptySubtext}>
              Add your first pricing plan using the form above
            </div>
          </div>
        )}
      </div>
    </div>
  );
}