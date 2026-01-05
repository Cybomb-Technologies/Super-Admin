import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, FolderTree } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { getAuthHeaders } from '@/utils/startupBuilderAuth';

const API_BASE_URL = import.meta.env.VITE_PAPLIXO_API_URL;

import styles from './Categories.module.css';

const SubCategories = () => {
    const { toast } = useToast();
    const [categories, setCategories] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [editValue, setEditValue] = useState('');
    const [newSubCategory, setNewSubCategory] = useState({
        name: '',
        categoryId: ''
    });

    const getAuthHeadersLocal = () => {
        const headers = getAuthHeaders();
        if (Object.keys(headers).length === 0) return {};
        return headers;
    };

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const headers = getAuthHeadersLocal();
            if (Object.keys(headers).length === 0) return;

            const [catRes, subRes] = await Promise.all([
                fetch(`${API_BASE_URL}/api/admin/categories`, { headers }),
                fetch(`${API_BASE_URL}/api/admin/subcategories`, { headers })
            ]);

            if (catRes.ok) {
                const catData = await catRes.json();
                setCategories(catData.categories || []);
            }
            if (subRes.ok) {
                const subData = await subRes.json();
                setSubCategories(subData.subCategories || []);
            }
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to load taxonomy', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSubCategory = async () => {
        if (!newSubCategory.name.trim() || !newSubCategory.categoryId) return;
        try {
            const headers = getAuthHeadersLocal();
            const response = await fetch(`${API_BASE_URL}/api/admin/subcategories`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    name: newSubCategory.name.trim(),
                    category: newSubCategory.categoryId
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setSubCategories(prev => [...prev, data.subCategory]);
                setNewSubCategory({ name: '', categoryId: '' });
                toast({ title: 'Success', description: 'Subcategory created' });
            }
        } catch (error) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        }
    };

    const getCategoryName = (categoryId) => {
        const category = categories.find(cat => cat._id === categoryId);
        return category ? category.name : 'Unassigned';
    };

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center h-[50vh] gap-4">
                <div className="w-10 h-10 border-4 border-emerald-600/20 border-t-emerald-600 rounded-full animate-spin" />
                <p className="text-slate-500 font-medium">Mapping sub-sectors...</p>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={styles.container}
        >
            <div className={styles.header}>
                <div className={styles.headerTitle}>
                    <div className={styles.iconWrapper} style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
                        <FolderTree className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className={styles.titleText}>Sub-Categories</h2>
                        <p className={styles.subtitle}>Managing {subCategories.length} detailed industry niches</p>
                    </div>
                </div>
            </div>

            <div className={styles.formCard}>
                <h3 className={styles.formTitle}>Add New Sub-Category</h3>
                <div className={styles.formGrid}>
                    <div className={styles.inputGroup}>
                        <label className={styles.inputLabel}>Parent Category</label>
                        <select
                            value={newSubCategory.categoryId}
                            onChange={(e) => setNewSubCategory(prev => ({ ...prev, categoryId: e.target.value }))}
                            className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
                        >
                            <option value="">Select Category</option>
                            {categories.map(category => (
                                <option key={category._id} value={category._id}>{category.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className={styles.inputGroup}>
                        <label className={styles.inputLabel}>Sub-Category Name</label>
                        <Input
                            value={newSubCategory.name}
                            onChange={(e) => setNewSubCategory(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="e.g. Computer Vision, SEO Services"
                            className="h-12 rounded-2xl bg-slate-50 border-slate-100"
                        />
                    </div>
                    <Button
                        onClick={handleCreateSubCategory}
                        disabled={!newSubCategory.name.trim() || !newSubCategory.categoryId}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl h-12 px-10 font-bold shadow-lg shadow-emerald-200"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Node
                    </Button>
                </div>
            </div>

            <div className={styles.listContainer}>
                {subCategories.length === 0 ? (
                    <div className="md:col-span-2 text-center py-12 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
                        <FolderTree className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                        <p className="text-slate-500 font-bold">No sub-categories defined</p>
                    </div>
                ) : (
                    subCategories.map((sub) => (
                        <motion.div
                            key={sub._id}
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className={styles.listItem}
                        >
                            <div className={styles.itemInfo}>
                                <div className={styles.itemIcon}>
                                    <FolderTree className="w-5 h-5" />
                                </div>
                                <div className={styles.itemText}>
                                    <span className={styles.itemName}>{sub.name}</span>
                                    <span className={styles.itemMeta}>under {getCategoryName(sub.category)}</span>
                                </div>
                            </div>
                            <div className={styles.itemActions}>
                                <Button
                                    variant="ghost"
                                    className={styles.actionBtn + " hover:bg-emerald-50 hover:text-emerald-600"}
                                    onClick={() => {
                                        setEditingId(sub._id);
                                        setEditValue(sub.name);
                                    }}
                                >
                                    <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    className={styles.actionBtn + " hover:bg-red-50 hover:text-red-600"}
                                    onClick={() => {
                                        if (!confirm('Are you sure?')) return;
                                    }}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </motion.div>
    );
};

export default SubCategories;
