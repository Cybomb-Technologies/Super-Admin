import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Trash2, Send, Users, Search, Calendar, Filter, Download, FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { getAuthHeaders } from '@/utils/startupBuilderAuth';
import { Input } from '@/components/ui/input';

const API_BASE_URL = import.meta.env.VITE_PAPLIXO_API_URL;

import styles from './Communications.module.css';

const Newsletter = () => {
    const { toast } = useToast();
    const [subscribers, setSubscribers] = useState([]);
    const [filteredSubscribers, setFilteredSubscribers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('newest');

    const getAuthHeadersLocal = () => {
        const headers = getAuthHeaders();
        if (Object.keys(headers).length === 0) return {};
        return headers;
    };

    const loadSubscribers = async () => {
        try {
            setLoading(true);
            const headers = getAuthHeadersLocal();
            if (Object.keys(headers).length === 0) return;

            const response = await fetch(`${API_BASE_URL}/api/newsletter/subscribers`, { headers });
            if (response.ok) {
                const data = await response.json();
                setSubscribers(data.subscribers || []);
            }
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to load subscribers', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSubscribers();
    }, []);

    useEffect(() => {
        let filtered = subscribers.filter(sub =>
            sub.email.toLowerCase().includes(searchTerm.toLowerCase())
        );

        filtered = filtered.sort((a, b) => {
            const dateA = new Date(a.subscribedAt || 0);
            const dateB = new Date(b.subscribedAt || 0);
            return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
        });

        setFilteredSubscribers(filtered);
    }, [subscribers, searchTerm, sortBy]);

    const handleUnsubscribe = async (email) => {
        if (!confirm(`Are you sure you want to remove ${email}?`)) return;
        try {
            const headers = getAuthHeadersLocal();
            const response = await fetch(`${API_BASE_URL}/api/newsletter/unsubscribe`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ email }),
            });

            if (response.ok) {
                setSubscribers(prev => prev.filter(sub => sub.email !== email));
                toast({ title: 'Removed', description: `${email} has been unsubscribed.` });
            }
        } catch (error) {
            toast({ title: 'Error', description: 'Action failed', variant: 'destructive' });
        }
    };

    if (loading && subscribers.length === 0) {
        return (
            <div className="flex flex-col justify-center items-center h-[60vh] gap-4">
                <div className="w-12 h-12 border-4 border-violet-600/20 border-t-violet-600 rounded-full animate-spin" />
                <p className="text-slate-500 font-medium">Loading subscriber base...</p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.headerInner} style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)' }}>
                    <div className={styles.headerTitle}>
                        <div className={styles.iconWrapper}>
                            <Send className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className={styles.titleMain}>Newsletter Hub</h1>
                            <p className={styles.titleSub}>Engaging {subscribers.length} total active subscribers</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-4xl font-black">{subscribers.length}</div>
                        <div className="text-xs uppercase font-black tracking-widest opacity-80">Subscribed</div>
                    </div>
                </div>
            </div>

            <div className={styles.filterCard}>
                <div className={styles.searchWrapper}>
                    <Search className={styles.searchIcon} />
                    <input
                        className={styles.searchInput}
                        placeholder="Search subscribers by email address..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-64 h-14 rounded-2xl bg-slate-50 border-slate-100 font-bold">
                        <SelectValue placeholder="Sort Order" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl">
                        <SelectItem value="newest">Newest First</SelectItem>
                        <SelectItem value="oldest">Oldest First</SelectItem>
                    </SelectContent>
                </Select>
                <Button className="h-14 rounded-2xl bg-violet-600 hover:bg-violet-700 text-white px-8 font-bold shadow-xl shadow-violet-100">
                    <Download className="w-4 h-4 mr-2" />
                    Export All
                </Button>
            </div>

            <div className={styles.tableContainer}>
                <div className={styles.tableHeader}>
                    <div>Subscriber</div>
                    <div>Joined</div>
                    <div>Status</div>
                    <div className="text-right">Manage</div>
                </div>
                {filteredSubscribers.map((sub) => (
                    <div key={sub._id || sub.email} className={styles.tableRow}>
                        <div className={styles.senderCell}>
                            <div className={styles.avatar} style={{ background: '#f5f3ff', color: '#8b5cf6' }}>
                                <Mail className="w-4 h-4" />
                            </div>
                            <div>
                                <span className={styles.senderName}>{sub.email}</span>
                                <span className={styles.senderEmail}>Newsletter Member</span>
                            </div>
                        </div>
                        <div className="text-slate-600 font-semibold">
                            {new Date(sub.subscribedAt).toLocaleDateString()}
                        </div>
                        <div>
                            <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-wider rounded-full">
                                Active
                            </span>
                        </div>
                        <div className="flex justify-end">
                            <Button
                                variant="ghost"
                                className="w-10 h-10 rounded-xl hover:bg-red-50 p-0 group"
                                onClick={() => handleUnsubscribe(sub.email)}
                            >
                                <Trash2 className="w-4 h-4 text-slate-400 group-hover:text-red-500" />
                            </Button>
                        </div>
                    </div>
                ))}
                {filteredSubscribers.length === 0 && (
                    <div className="py-20 text-center">
                        <Users className="w-16 h-16 mx-auto mb-4 text-slate-200" />
                        <p className="text-slate-400 font-bold">No subscribers found matching your search</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Newsletter;
