import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Mail,
    User,
    Clock,
    Eye,
    EyeOff,
    MessageSquare,
    Download,
    Filter,
    Search,
    Flag,
    Calendar,
    Phone,
    FileText,
    X,
    ChevronDown,
    Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { getAuthHeaders } from '@/utils/startupBuilderAuth';

const API_BASE_URL = import.meta.env.VITE_PAPLIXO_API_URL;

import styles from './Communications.module.css';

const ContactSubmissions = () => {
    const { toast } = useToast();
    const [submissions, setSubmissions] = useState([]);
    const [filteredSubmissions, setFilteredSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const getAuthHeadersLocal = () => {
        const headers = getAuthHeaders();
        if (Object.keys(headers).length === 0) return {};
        return headers;
    };

    const loadSubmissions = async () => {
        try {
            setLoading(true);
            const headers = getAuthHeadersLocal();
            if (Object.keys(headers).length === 0) return;

            const response = await fetch(`${API_BASE_URL}/api/contact/submissions`, { headers });
            if (response.ok) {
                const data = await response.json();
                setSubmissions(data.submissions || []);
            }
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to load messages', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSubmissions();
    }, []);

    useEffect(() => {
        let filtered = submissions.filter(sub =>
            sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            sub.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            sub.subject.toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (statusFilter === 'unread') filtered = filtered.filter(sub => !sub.read);
        if (statusFilter === 'read') filtered = filtered.filter(sub => sub.read);
        if (statusFilter === 'flagged') filtered = filtered.filter(sub => sub.flag);

        setFilteredSubmissions(filtered);
    }, [submissions, searchTerm, statusFilter]);

    const handleMarkAsRead = async (id, status) => {
        try {
            const headers = getAuthHeadersLocal();
            const response = await fetch(`${API_BASE_URL}/api/contact/${id}/read`, {
                method: 'PATCH',
                headers,
                body: JSON.stringify({ read: !status }),
            });

            if (response.ok) {
                setSubmissions(prev => prev.map(sub => sub._id === id ? { ...sub, read: !status } : sub));
                toast({ title: 'Updated', description: `Message marked as ${!status ? 'read' : 'unread'}` });
            }
        } catch (error) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        }
    };

    if (loading && submissions.length === 0) {
        return (
            <div className="flex flex-col justify-center items-center h-[60vh] gap-4">
                <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                <p className="text-slate-500 font-medium">Fetching correspondence...</p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.headerInner}>
                    <div className={styles.headerTitle}>
                        <div className={styles.iconWrapper}>
                            <Mail className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className={styles.titleMain}>Inbound Messages</h1>
                            <p className={styles.titleSub}>Reviewing {submissions.length} total contact form entries</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-4xl font-black text-white">{submissions.filter(s => !s.read).length}</div>
                        <div className="text-xs uppercase font-black tracking-widest opacity-80 text-slate-400">Unread</div>
                    </div>
                </div>
            </div>

            <div className={styles.filterCard}>
                <div className={styles.searchWrapper}>
                    <Search className={styles.searchIcon} />
                    <input
                        className={`${styles.searchInput} bg-white/5 border-none text-white placeholder:text-slate-500 focus:ring-0`}
                        placeholder="Search by sender, email or subject..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-64 h-14 rounded-full bg-black border-white/10 font-bold text-white">
                        <SelectValue placeholder="All Messages" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl bg-black border-white/10 text-white">
                        <SelectItem value="all" className="focus:bg-white/10 focus:text-white cursor-pointer p-3 rounded-xl font-bold">All Submissions</SelectItem>
                        <SelectItem value="unread" className="focus:bg-white/10 focus:text-white cursor-pointer p-3 rounded-xl font-bold">Unread Only</SelectItem>
                        <SelectItem value="read" className="focus:bg-white/10 focus:text-white cursor-pointer p-3 rounded-xl font-bold">Read Only</SelectItem>
                        <SelectItem value="flagged" className="focus:bg-white/10 focus:text-white cursor-pointer p-3 rounded-xl font-bold">Flagged Only</SelectItem>
                    </SelectContent>
                </Select>
                <Button className="h-14 rounded-full bg-black hover:bg-slate-900 text-white px-8 font-bold shadow-xl active:scale-95 transition-all hover:scale-105">
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                </Button>
            </div>

            <div className={styles.tableContainer}>
                <div className={styles.tableHeader}>
                    <div>Sender</div>
                    <div>Subject</div>
                    <div>Received</div>
                    <div className="text-right">Actions</div>
                </div>
                {filteredSubmissions.map((sub) => (
                    <div
                        key={sub._id}
                        className={`${styles.tableRow} ${!sub.read ? styles.unreadRow : ''}`}
                        onClick={() => { setSelectedSubmission(sub); setIsModalOpen(true); if (!sub.read) handleMarkAsRead(sub._id, false); }}
                    >
                        <div className={styles.senderCell}>
                            <div className={styles.avatar}>{sub.name.charAt(0)}</div>
                            <div>
                                <span className={styles.senderName}>{sub.name}</span>
                                <span className={styles.senderEmail}>{sub.email}</span>
                            </div>
                        </div>
                        <div className={styles.subjectCell}>{sub.subject}</div>
                        <div className="text-slate-500 font-medium">
                            {new Date(sub.createdAt).toLocaleDateString()}
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button variant="ghost" className="w-10 h-10 rounded-xl hover:bg-white/10 p-0 text-slate-400">
                                <Eye className="w-4 h-4 text-blue-400" />
                            </Button>
                            <Button
                                variant="ghost"
                                className="w-10 h-10 rounded-xl hover:bg-white/10 p-0"
                                onClick={(e) => { e.stopPropagation(); handleMarkAsRead(sub._id, sub.read); }}
                            >
                                {sub.read ? <EyeOff className="w-4 h-4 text-slate-400" /> : <Mail className="w-4 h-4 text-amber-500" />}
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            <AnimatePresence>
                {isModalOpen && selectedSubmission && (
                    <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className={styles.modalContent}
                            onClick={e => e.stopPropagation()}
                        >
                            <div className={styles.modalHeader}>
                                <div>
                                    <div className="flex items-center gap-4 mb-2">
                                        <div className={styles.avatar}>{selectedSubmission.name.charAt(0)}</div>
                                        <div>
                                            <h2 className="text-2xl font-black text-white">{selectedSubmission.name}</h2>
                                            <p className="text-slate-400 font-bold">{selectedSubmission.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4 text-xs font-black uppercase tracking-widest text-slate-500">
                                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(selectedSubmission.createdAt).toLocaleString()}</span>
                                        {selectedSubmission.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {selectedSubmission.phone}</span>}
                                    </div>
                                </div>
                                <Button variant="ghost" onClick={() => setIsModalOpen(false)} className="rounded-full w-12 h-12 p-0 text-slate-400 hover:text-white hover:bg-white/10">
                                    <X className="w-6 h-6" />
                                </Button>
                            </div>
                            <div className={styles.modalBody}>
                                <div className="mb-6">
                                    <h4 className="text-xs font-black uppercase text-slate-500 mb-2">Subject</h4>
                                    <p className="text-xl font-black text-white">{selectedSubmission.subject}</p>
                                </div>
                                <h4 className="text-xs font-black uppercase text-slate-500 mb-2">Message Body</h4>
                                <div className={styles.messageBox}>
                                    {selectedSubmission.message}
                                </div>
                            </div>
                            <div className="p-8 border-t border-white/10 flex justify-between items-center bg-slate-900/50">
                                <div className="flex gap-3">
                                    <Button variant="outline" className="rounded-2xl font-bold h-12 px-6 bg-transparent border-white/10 text-slate-300 hover:bg-white/5 hover:text-white">
                                        <Flag className="w-4 h-4 mr-2" /> Mark Flagged
                                    </Button>
                                    <Button variant="outline" className="rounded-2xl font-bold h-12 px-6 bg-transparent border-white/10 text-slate-300 hover:bg-white/5 hover:text-white">
                                        <Trash2 className="w-4 h-4 mr-2" /> Trash
                                    </Button>
                                </div>
                                <Button onClick={() => setIsModalOpen(false)} className="bg-white text-slate-900 hover:bg-slate-200 rounded-2xl font-black h-12 px-10 shadow-xl">
                                    Done
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ContactSubmissions;
