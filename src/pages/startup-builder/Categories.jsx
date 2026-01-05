import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { getAuthHeaders } from '@/utils/startupBuilderAuth';

const API_BASE_URL = import.meta.env.VITE_PAPLIXO_API_URL;

import styles from './Categories.module.css';

const Categories = () => {
    const { toast } = useToast();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [editValue, setEditValue] = useState('');
    const [newCategory, setNewCategory] = useState('');

    const getAuthHeadersLocal = () => {
        const headers = getAuthHeaders();
        if (Object.keys(headers).length === 0) return {};
        return headers;
    };

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            setLoading(true);
            const headers = getAuthHeadersLocal();
            if (Object.keys(headers).length === 0) return;

            const response = await fetch(`${API_BASE_URL}/api/admin/categories`, { headers });
            if (response.ok) {
                const data = await response.json();
                setCategories(data.categories || []);
            }
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to load categories', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCategory = async () => {
        if (!newCategory.trim()) return;
        try {
            const headers = getAuthHeadersLocal();
            const response = await fetch(`${API_BASE_URL}/api/admin/categories`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ name: newCategory.trim(), description: '' }),
            });

            if (response.ok) {
                const data = await response.json();
                setCategories(prev => [...prev, data.category]);
                setNewCategory('');
                toast({ title: 'Success', description: 'Category created' });
            }
        } catch (error) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center h-[50vh] gap-4">
                <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                <p className="text-slate-400 font-medium">Loading platform taxonomy...</p>
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
                    <div className={styles.iconWrapper}>
                        <FolderOpen className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className={styles.titleText}>Master Categories</h2>
                        <p className={styles.subtitle}>Curating {categories.length} primary service sectors</p>
                    </div>
                </div>
            </div>

            <div className={styles.formCard}>
                <h3 className={styles.formTitle}>Define New Category</h3>
                <div className={styles.formGrid}>
                    <div className={styles.inputGroup + " md:col-span-2"}>
                        <label className={styles.inputLabel}>Sector Name</label>
                        <Input
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                            placeholder="e.g. Artificial Intelligence, Digital Marketing"
                            className="h-12 rounded-2xl bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-blue-500/50"
                            onKeyPress={e => e.key === 'Enter' && handleCreateCategory()}
                        />
                    </div>
                    <Button
                        onClick={handleCreateCategory}
                        disabled={!newCategory.trim()}
                        className={styles.addButton}
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Category
                    </Button>
                </div>
            </div>

            <div className={styles.listContainer}>
                {categories.length === 0 ? (
                    <div className="md:col-span-2 text-center py-12 bg-white/5 rounded-[2rem] border-2 border-dashed border-white/10">
                        <FolderOpen className="w-12 h-12 mx-auto mb-3 text-slate-500" />
                        <p className="text-slate-400 font-bold">No categories mapped yet</p>
                    </div>
                ) : (
                    categories.map((category) => (
                        <motion.div
                            key={category._id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={styles.listItem}
                        >
                            <div className={styles.itemInfo}>
                                <div className={styles.itemIcon}>
                                    <FolderOpen className="w-5 h-5" />
                                </div>
                                <div className={styles.itemText}>
                                    <span className={styles.itemName}>{category.name}</span>
                                    <span className={styles.itemMeta}>Created recently</span>
                                </div>
                            </div>
                            <div className={styles.itemActions}>
                                <Button
                                    variant="ghost"
                                    className={styles.actionBtn + " hover:bg-blue-500/10 hover:text-blue-400 text-slate-400"}
                                    onClick={() => {
                                        setEditingId(category._id);
                                        setEditValue(category.name);
                                    }}
                                >
                                    <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    className={styles.actionBtn + " hover:bg-red-500/10 hover:text-red-400 text-slate-400"}
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

export default Categories;
