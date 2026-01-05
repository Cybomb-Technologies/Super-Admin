import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Users, Crown, User, Star, ShieldCheck } from 'lucide-react';
import styles from './UserAccess.module.css';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { getAuthHeaders } from '@/utils/startupBuilderAuth';

const API_BASE_URL = import.meta.env.VITE_PAPLIXO_API_URL;

const UserAccess = () => {
    const { toast } = useToast();
    const [accessLevels, setAccessLevels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [editValue, setEditValue] = useState('');
    const [newAccessLevel, setNewAccessLevel] = useState('');

    // Get auth headers with validation
    const getAuthHeadersLocal = () => {
        const headers = getAuthHeaders();
        if (Object.keys(headers).length === 0) {
            toast({
                title: 'Authentication Required',
                description: 'Please login to continue',
                variant: 'destructive',
            });
            return {};
        }
        return headers;
    };

    // Load access levels
    useEffect(() => {
        loadAccessLevels();
    }, []);

    const loadAccessLevels = async () => {
        try {
            setLoading(true);
            const headers = getAuthHeadersLocal();
            if (Object.keys(headers).length === 0) {
                setLoading(false);
                return;
            }

            const response = await fetch(`${API_BASE_URL}/api/admin/access-levels`, {
                headers
            });

            if (response.ok) {
                const data = await response.json();
                setAccessLevels(data.accessLevels || []);
            } else if (response.status === 401) {
                throw new Error('Authentication failed');
            } else {
                throw new Error('Failed to load access levels');
            }
        } catch (error) {
            console.error('Error loading access levels:', error);
            toast({
                title: 'Error',
                description: error.message,
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCreateAccessLevel = async () => {
        if (!newAccessLevel.trim()) return;

        try {
            const headers = getAuthHeadersLocal();
            if (Object.keys(headers).length === 0) return;

            const response = await fetch(`${API_BASE_URL}/api/admin/access-levels`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ name: newAccessLevel.trim() }),
            });

            if (response.ok) {
                const data = await response.json();
                setAccessLevels(prev => [...prev, data.accessLevel]);
                setNewAccessLevel('');
                toast({
                    title: 'Success',
                    description: 'Access level created successfully',
                });
            } else if (response.status === 401) {
                throw new Error('Authentication failed');
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create access level');
            }
        } catch (error) {
            console.error('Error creating access level:', error);
            toast({
                title: 'Error',
                description: error.message,
                variant: 'destructive',
            });
        }
    };

    const handleUpdateAccessLevel = async (id) => {
        if (!editValue.trim()) return;

        try {
            const headers = getAuthHeadersLocal();
            if (Object.keys(headers).length === 0) return;

            const response = await fetch(`${API_BASE_URL}/api/admin/access-levels/${id}`, {
                method: 'PUT',
                headers,
                body: JSON.stringify({ name: editValue.trim() }),
            });

            if (response.ok) {
                const data = await response.json();
                setAccessLevels(prev => prev.map(level =>
                    level._id === id ? data.accessLevel : level
                ));
                setEditingId(null);
                setEditValue('');
                toast({
                    title: 'Success',
                    description: 'Access level updated successfully',
                });
            } else if (response.status === 401) {
                throw new Error('Authentication failed');
            } else {
                throw new Error('Failed to update access level');
            }
        } catch (error) {
            console.error('Error updating access level:', error);
            toast({
                title: 'Error',
                description: error.message,
                variant: 'destructive',
            });
        }
    };

    const handleDeleteAccessLevel = async (id) => {
        if (!confirm('Are you sure you want to delete this access level?')) return;

        try {
            const headers = getAuthHeadersLocal();
            if (Object.keys(headers).length === 0) return;

            const response = await fetch(`${API_BASE_URL}/api/admin/access-levels/${id}`, {
                method: 'DELETE',
                headers,
            });

            if (response.ok) {
                setAccessLevels(prev => prev.filter(level => level._id !== id));
                toast({
                    title: 'Success',
                    description: 'Access level deleted successfully',
                });
            } else if (response.status === 401) {
                throw new Error('Authentication failed');
            } else {
                throw new Error('Failed to delete access level');
            }
        } catch (error) {
            console.error('Error deleting access level:', error);
            toast({
                title: 'Error',
                description: error.message,
                variant: 'destructive',
            });
        }
    };

    const startEditing = (accessLevel) => {
        setEditingId(accessLevel._id);
        setEditValue(accessLevel.name);
    };

    const cancelEditing = () => {
        setEditingId(null);
        setEditValue('');
    };

    const getAccessLevelIcon = (levelName) => {
        const name = levelName.toLowerCase();
        if (name.includes('free')) return <User className="w-4 h-4" />;
        if (name.includes('pro')) return <Star className="w-4 h-4" />;
        if (name.includes('premium') || name.includes('enterprise')) return <Crown className="w-4 h-4" />;
        return <Users className="w-4 h-4" />;
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                <div className="font-black text-slate-400 uppercase tracking-[0.2em] text-xs">Loading Access Levels...</div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.headerTitle}>
                    <div className={styles.iconWrapper}>
                        <ShieldCheck className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className={styles.titleMain}>Fortress Protocol</h1>
                        <p className={styles.titleSub}>Defining user access hierarchies and feature permissions</p>
                    </div>
                </div>
            </div>

            <div className={styles.addSection}>
                <h3 className={styles.sectionTitle}>Provision New Access Level</h3>
                <div className={styles.inputGroup}>
                    <input
                        type="text"
                        value={newAccessLevel}
                        onChange={(e) => setNewAccessLevel(e.target.value)}
                        placeholder="e.g. Free Tier, Diamond Member, Admin Core"
                        className={styles.input}
                    />
                    <Button
                        onClick={handleCreateAccessLevel}
                        disabled={!newAccessLevel.trim()}
                        className="h-16 px-10 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-lg shadow-xl shadow-indigo-900/20 transition-all"
                    >
                        <Plus className="w-6 h-6 mr-2" />
                        Provision
                    </Button>
                </div>
            </div>

            <div className={styles.list}>
                {accessLevels.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-20 bg-white rounded-[2.5rem] border border-dashed border-slate-200">
                        <Users className="w-20 h-20 text-slate-200 mb-6" />
                        <h4 className="text-xl font-black text-slate-900 uppercase tracking-tighter">No Protocols Defined</h4>
                        <p className="text-slate-500 font-bold mt-2">Start by provisioning your first access hierarchy.</p>
                    </div>
                ) : (
                    accessLevels.map((accessLevel) => (
                        <div key={accessLevel._id} className={styles.levelItem}>
                            {editingId === accessLevel._id ? (
                                <div className={styles.editForm}>
                                    <input
                                        value={editValue}
                                        onChange={(e) => setEditValue(e.target.value)}
                                        className={styles.input}
                                        autoFocus
                                    />
                                    <Button
                                        className="h-16 px-8 bg-indigo-600 text-white rounded-2xl font-black"
                                        onClick={() => handleUpdateAccessLevel(accessLevel._id)}
                                    >
                                        Apply
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="h-16 px-8 rounded-2xl border-slate-200 font-black"
                                        onClick={cancelEditing}
                                    >
                                        Abort
                                    </Button>
                                </div>
                            ) : (
                                <>
                                    <div className={styles.levelInfo}>
                                        <div className={styles.levelIcon}>
                                            {getAccessLevelIcon(accessLevel.name)}
                                        </div>
                                        <div>
                                            <div className={styles.levelName}>{accessLevel.name}</div>
                                            <div className={styles.levelDesc}>Hierarchy ID: {accessLevel._id.slice(-8).toUpperCase()}</div>
                                        </div>
                                    </div>
                                    <div className={styles.levelActions}>
                                        <Button
                                            variant="outline"
                                            className="w-14 h-14 p-0 rounded-2xl border-slate-200 text-slate-600 hover:bg-slate-50"
                                            onClick={() => startEditing(accessLevel)}
                                        >
                                            <Edit className="w-6 h-6" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="w-14 h-14 p-0 rounded-2xl border-slate-200 text-red-500 hover:bg-red-50 hover:text-red-600"
                                            onClick={() => handleDeleteAccessLevel(accessLevel._id)}
                                        >
                                            <Trash2 className="w-6 h-6" />
                                        </Button>
                                    </div>
                                </>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default UserAccess;
