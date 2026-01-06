import React, { useState, useEffect, useMemo } from "react";
import {
    Users as UsersIcon,
    Mail,
    Calendar,
    RefreshCw,
    Download,
    Eye,
    Package,
    Search,
    X,
    Clock,
    CreditCard,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Filter,
    Check,
    Activity,
    Shield,
    Globe,
    Zap,
    SlidersHorizontal,
    Trash2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
} from "@/components/ui/dialog";
import * as XLSX from 'xlsx';
import { getAuthHeaders } from "@/utils/startupBuilderAuth";
import styles from "./Users.module.css";

const API_BASE_URL = import.meta.env.VITE_PAPLIXO_API_URL;

const UsersPage = () => {
    const { toast } = useToast();
    const [registeredUsers, setRegisteredUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalLoading, setModalLoading] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const USERS_PER_PAGE = 30;

    const [filters, setFilters] = useState({
        search: '',
        plan: 'all',
        status: 'all',
    });
    const [availablePlans, setAvailablePlans] = useState([]);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const headers = getAuthHeaders();
            if (!headers || Object.keys(headers).length === 0) return;

            const url = `${API_BASE_URL}/api/admin/users`;
            const response = await fetch(url, { headers });
            
            if (response.ok) {
                const data = await response.json();
                const users = Array.isArray(data.users) ? data.users : [];
                setRegisteredUsers(users);
                
                // Extract plans from users if not provided by backend
                if (data.filters?.plans) {
                    setAvailablePlans(data.filters.plans);
                } else {
                    const plans = [...new Set(users.map(u => u.planId).filter(Boolean))];
                    setAvailablePlans(plans);
                }
                setCurrentPage(1);
            }
        } catch (error) {
            toast({ title: "Sync failed", description: "Identity database disconnected.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const loadUserDetails = async (userId) => {
        try {
            setModalLoading(true);
            const headers = getAuthHeaders();
            const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}`, { headers });

            if (!response.ok) throw new Error("Failed to fetch user details");

            const data = await response.json();
            // Try to find user in different possible response paths
            const user = data.user || data.data?.user || data.data || data;

            if (user && (user.email || user._id)) {
                setSelectedUser(user);
                setIsPreviewOpen(true);
            } else {
                throw new Error("User data is incomplete or empty.");
            }
        } catch (error) {
            toast({ title: "Recall Failed", description: "The soul's record is currently inaccessible.", variant: "destructive" });
        } finally {
            setModalLoading(false);
        }
    };

    const exportToExcel = () => {
        try {
            const dataForExport = registeredUsers.map(u => ({
                'ID': u._id,
                'Full Identity': u.username || 'N/A',
                'Communication': u.email || 'N/A',
                'Access Level': u.planId || 'Standard',
                'Status': u.isActive ? 'OPERATIONAL' : 'DORMANT',
                'Genesis': u.createdAt ? new Date(u.createdAt).toLocaleString() : 'N/A'
            }));
            const ws = XLSX.utils.json_to_sheet(dataForExport);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Database_Dump");
            XLSX.writeFile(wb, `Identity_Export_${Date.now()}.xlsx`);
            toast({ title: "Archive Success", description: "Census data exported to local storage." });
        } catch (e) { toast({ title: "Archive Failed", variant: "destructive" }); }
    };

    const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : "N/A";

    const getPlanConfig = (p) => {
        const t = String(p).toLowerCase();
        if (t.includes('premium')) return { bg: 'linear-gradient(135deg, #6366f1, #a855f7)', icon: Shield, dark: '#4338ca' };
        if (t.includes('pro')) return { bg: 'linear-gradient(135deg, #3b82f6, #06b6d4)', icon: Zap, dark: '#1d4ed8' };
        if (t.includes('business')) return { bg: 'linear-gradient(135deg, #f59e0b, #ef4444)', icon: Globe, dark: '#d97706' };
        return { bg: 'linear-gradient(135deg, #94a3b8, #475569)', icon: Package, dark: '#64748b' };
    };

    const filteredUsers = useMemo(() => {
        return registeredUsers.filter(u => {
            const matchesSearch = !filters.search || 
                (u.username && u.username.toLowerCase().includes(filters.search.toLowerCase())) ||
                (u.email && u.email.toLowerCase().includes(filters.search.toLowerCase())) ||
                (u._id && u._id.toLowerCase().includes(filters.search.toLowerCase()));
            
            const matchesPlan = filters.plan === 'all' || u.planId === filters.plan;
            
            const matchesStatus = filters.status === 'all' || 
                (filters.status === 'active' ? u.isActive : !u.isActive);

            return matchesSearch && matchesPlan && matchesStatus;
        });
    }, [registeredUsers, filters]);

    const paginatedUsers = useMemo(() => {
        return filteredUsers.slice((currentPage - 1) * USERS_PER_PAGE, currentPage * USERS_PER_PAGE);
    }, [filteredUsers, currentPage]);

    const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE);

    return (
        <div className={styles.container}>
            <div className={`${styles.bgBlob} ${styles.blob1}`} />
            <div className={`${styles.bgBlob} ${styles.blob2}`} />

            {/* Header Area */}
            <header className={styles.header}>
                <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} className={styles.headerTitle}>
                    <div className={styles.iconWrapper}>
                        <UsersIcon className="w-10 h-10" />
                    </div>
                    <div>
                        <h1 className={styles.titleText}>Identity Hub</h1>
                        <p className={styles.subtitle}>Supervising <span className="text-indigo-400 font-black">{filteredUsers.length}</span> verified entities</p>
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} className={styles.actions}>
                    <Button onClick={loadUsers} variant="ghost" className="h-12 px-6 bg-black rounded-full font-bold text-white shadow-2xl hover:shadow-indigo-500/20 transition-all active:scale-95 hover:scale-105 border border-white/10">
                        <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh Web
                    </Button>
                    <div className="w-2" /> {/* Spacer */}
                    <Button onClick={exportToExcel} variant="ghost" className="h-12 bg-black rounded-full px-6 font-bold text-white shadow-2xl hover:shadow-indigo-500/20 transition-all active:scale-95 hover:scale-105 border border-white/10">
                        <Download className="w-4 h-4 mr-2" />
                        Export Census
                    </Button>
                </motion.div>
            </header>

            {/* Redesigned Filters - Minimalist Floating Bar */}
            <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className={styles.filterBarRedesign}
            >
                <div className={styles.searchSection}>
                    <Search className="w-5 h-5 text-indigo-400" />
                    <input
                        type="text"
                        placeholder="Scan identities..."
                        value={filters.search}
                        onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                        className={styles.searchInput}
                    />
                </div>

                <div className={styles.divider} />

                <div className={styles.filterSelectors}>
                    {/* Tier Filter */}
                    <Select value={filters.plan} onValueChange={(val) => setFilters(p => ({ ...p, plan: val }))}>
                        <SelectTrigger className={styles.compactTrigger}>
                            <div className="flex items-center gap-2">
                                <Package className="w-4 h-4 text-indigo-400" />
                                <SelectValue placeholder="Access" />
                            </div>
                            <ChevronDown className="w-4 h-4 opacity-50" />
                        </SelectTrigger>
                        <SelectContent className="min-w-[200px] bg-black">
                            <SelectItem value="all">Global Access</SelectItem>
                            {availablePlans.map(p => (
                                <SelectItem key={p} value={p}>{String(p).toUpperCase()}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Status Filter */}
                    <Select value={filters.status} onValueChange={(val) => setFilters(p => ({ ...p, status: val }))}>
                        <SelectTrigger className={styles.compactTrigger}>
                            <div className="flex items-center gap-2">
                                <Activity className="w-4 h-4 text-emerald-400" />
                                <SelectValue placeholder="Vitality" />
                            </div>
                            <ChevronDown className="w-4 h-4 opacity-50" />
                        </SelectTrigger>
                        <SelectContent className="min-w-[200px] bg-black">
                            <SelectItem value="all">Standard View</SelectItem>
                            <SelectItem value="active" className="text-emerald-400 hover:text-emerald-300">Active</SelectItem>
                            <SelectItem value="inactive" className="text-rose-400 hover:text-rose-300">Inactive</SelectItem>
                        </SelectContent>
                    </Select>

                    <div className={styles.dividerHidden} />

                    <Button
                        variant="ghost"
                        onClick={() => setFilters({ search: '', plan: 'all', status: 'all' })}
                        className={styles.clearButton}
                    >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Clear
                    </Button>
                </div>
            </motion.div>

            {/* Table Area */}
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className={styles.tableWrapper}>
                {(loading || modalLoading) && (
                    <div className="absolute inset-0 z-[20] bg-slate-900/60 backdrop-blur-md flex items-center justify-center">
                        <div className="flex flex-col items-center gap-6">
                            <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                            <p className="text-sm font-black text-indigo-400 uppercase tracking-[0.3em] animate-pulse">Syncing Citidel...</p>
                        </div>
                    </div>
                )}

                {registeredUsers.length === 0 ? (
                    <div className="py-44 text-center">
                        <h2 className="text-4xl font-black text-white mb-4 opacity-10">NO DATA FOUND</h2>
                    </div>
                ) : (
                    <div className={styles.tableContainer}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th className={styles.th}>Identity</th>
                                    <th className={styles.th}>Tier</th>
                                    <th className={styles.th}>Heartbeat</th>
                                    <th className={styles.th}>Genesis</th>
                                    <th className={styles.th}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                <AnimatePresence mode="popLayout">
                                    {paginatedUsers.map((u, i) => {
                                        const plan = getPlanConfig(u.planId);
                                        const PlanIcon = plan.icon;
                                        return (
                                            <motion.tr
                                                key={u._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: i * 0.01 }} className={styles.tr}
                                            >
                                                <td className={styles.td}>
                                                    <div className={styles.userCell}>
                                                        <div className={styles.avatar} style={{ background: plan.bg }}>
                                                            {(u.username || u.email || 'U')[0].toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className={styles.userName}>{u.username || 'Citizen'}</p>
                                                            <p className={styles.userEmail}>{u.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className={styles.td}>
                                                    <div className={styles.tierPill} style={{ background: plan.bg }}>
                                                        <PlanIcon className="w-3.5 h-3.5" />
                                                        {u.planId || 'Basic'}
                                                    </div>
                                                </td>
                                                <td className={styles.td}>
                                                    <div className={`${styles.statusBadge} ${u.isActive ? styles.statusActive : styles.statusInactive}`}>
                                                        <div className={styles.pulseDot} />
                                                        {u.isActive ? 'ACTIVE' : 'INACTIVE'}
                                                    </div>
                                                </td>
                                                <td className={styles.td}>
                                                    <span className="font-bold text-slate-400 text-xs">{formatDate(u.createdAt)}</span>
                                                </td>
                                                <td className={styles.td}>
                                                    <button onClick={() => loadUserDetails(u._id)} className={styles.detailsBtn}>
                                                        <Eye className="w-4 h-4" />
                                                        Inspect
                                                    </button>
                                                </td>
                                            </motion.tr>
                                        );
                                    })}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className={styles.pagination}>
                        <div className={styles.paginationInfo}>
                            Node <span className="font-black text-white">{(currentPage - 1) * USERS_PER_PAGE + 1} - {Math.min(currentPage * USERS_PER_PAGE, filteredUsers.length)}</span>
                        </div>
                        <div className={styles.paginationControls}>
                            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} className={styles.navBtn} disabled={currentPage === 1}>
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} className={styles.navBtn} disabled={currentPage === totalPages}>
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}
            </motion.div>

            {/* Modal */}
            <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                <DialogContent 
                    className="w-full border border-white/10 p-0 overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] rounded-[3.5rem] text-white"
                    style={{ backgroundColor: '#0f0c29', zIndex: 2147483647, width: '100%', maxWidth: '1024px' }} 
                >
                    {selectedUser && (
                        <div className="relative ">
                            <div className="h-40 bg-black relative">
                                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #6366f1 1px, transparent 0)', backgroundSize: '16px 16px' }} />
                                <button onClick={() => setIsPreviewOpen(false)} className="absolute top-8 right-8 w-12 h-12 bg-black hover:bg-white/20 text-white rounded-2xl flex items-center justify-center backdrop-blur-md transition-all">
                                    <X className="w-6 h-6" />
                                </button>
                                {/* <div className="absolute p-4 -bottom-12 left-12 p-1.5 bg-black rounded-[2.5rem] shadow-2xl border border-white/10">
                                    <div className="w-24 h-24 rounded-[2rem] flex items-center justify-center text-white text-3xl font-black" style={{ background: getPlanConfig(selectedUser.planId).bg }}>
                                        {(selectedUser.username || selectedUser.email || 'U')[0].toUpperCase()}
                                    </div>
                                </div> */}
                            </div>

                            <div className="pt-20 p-4 p-12">
                                <div className="flex justify-between items-start mb-10">
                                    <div>
                                        <h2 className="text-4xl font-black text-white tracking-tight leading-none mb-3 italic">{selectedUser.username || 'IDENTITY_UNSET'}</h2>
                                        <div className="flex items-center gap-3 text-slate-400 font-bold">
                                            <Mail className="w-5 h-5 text-indigo-400" />
                                            {selectedUser.email}
                                        </div>
                                    </div>
                                    <div className={`px-5 py-2.5 rounded-2xl font-black text-[10px] tracking-widest border-2 ${selectedUser.isActive ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
                                        {selectedUser.isActive ? 'OPERATIONAL' : 'OFFLINE'}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-10">
                                    <div className="p-6 bg-white/5 rounded-[2.5rem] border-2 border-white/5 flex items-center gap-4">
                                        <div className="p-3 bg-white/10 rounded-2xl shadow-sm">
                                            <Shield className="w-6 h-6 text-indigo-400" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Privilege</p>
                                            <p className="font-black text-white uppercase">{selectedUser.planId || 'Basic'}</p>
                                        </div>
                                    </div>
                                    <div className="p-6 bg-white/5 rounded-[2.5rem] border-2 border-white/5 flex items-center gap-4">
                                        <div className="p-3 bg-white/10 rounded-2xl shadow-sm">
                                            <Calendar className="w-6 h-6 text-indigo-400" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Genesis</p>
                                            <p className="font-black text-white uppercase">{formatDate(selectedUser.createdAt)}</p>
                                        </div>
                                    </div>
                                </div>

                                <Button className="w-full h-16 rounded-[2rem] bg-black text-white font-black text-lg shadow-xl shadow-indigo-600/20 hover:scale-[1.02] active:scale-95 transition-all">
                                    Manage Permissions
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default UsersPage;