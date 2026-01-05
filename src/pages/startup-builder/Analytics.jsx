import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    BarChart3,
    TrendingUp,
    Users,
    Layers,
    ArrowUpRight,
    ArrowDownRight,
    Calendar,
    MousePointer2,
    Eye,
    Zap,
    Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getAuthHeaders } from '@/utils/startupBuilderAuth';
import styles from './Analytics.module.css';

const API_BASE_URL = import.meta.env.VITE_PAPLIXO_API_URL;

const Analytics = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalUsers: 1284,
        totalTemplates: 45,
        growthRate: 15.4,
        activeNow: 12
    });

    useEffect(() => {
        // Simulate data fetching
        const timer = setTimeout(() => {
            setLoading(false);
        }, 1000);
        return () => clearTimeout(timer);
    }, []);

    const statCards = [
        {
            label: "Total Registered Users",
            value: stats.totalUsers,
            trend: "+12.5%",
            trendUp: true,
            icon: <Users className="w-8 h-8 text-white" />,
            bgColor: "bg-[#6366f1]",
            glowColor: "rgba(99, 102, 241, 0.4)"
        },
        {
            label: "Template Usage",
            value: 842,
            trend: "+8.2%",
            trendUp: true,
            icon: <Layers className="w-8 h-8 text-white" />,
            bgColor: "bg-[#a855f7]",
            glowColor: "rgba(168, 85, 247, 0.4)"
        },
        {
            label: "Avg. Conversion Rate",
            value: "24.8%",
            trend: "+2.1%",
            trendUp: true,
            icon: <TrendingUp className="w-8 h-8 text-white" />,
            bgColor: "bg-[#2dd4bf]",
            glowColor: "rgba(45, 212, 191, 0.4)"
        },
        {
            label: "Live Active Users",
            value: stats.activeNow,
            trend: "-5.4%",
            trendUp: false,
            icon: <Zap className="w-8 h-8 text-white" />,
            bgColor: "bg-[#f59e0b]",
            glowColor: "rgba(245, 158, 11, 0.4)"
        }
    ];

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center h-[60vh] gap-4">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-purple-600/20 border-t-purple-600 rounded-full animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <BarChart3 className="w-6 h-6 text-purple-600 animate-pulse" />
                    </div>
                </div>
                <p className="text-slate-500 font-black tracking-widest uppercase text-xs animate-pulse">Analyzing platform data...</p>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={styles.container}
        >
            <div className={styles.header}>
                <div className={styles.headerTitle}>
                    <div className={styles.iconWrapper}>
                        <BarChart3 className="w-7 h-7 text-white" />
                    </div>
                    <div>
                        <h2 className={styles.titleText}>Platform Analytics</h2>
                        <p className={styles.subtitle}>Real-time performance insights and user metrics</p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <Button variant="outline" className="rounded-2xl border-white/50 bg-white/50 backdrop-blur-md font-black px-6 hover:bg-white shadow-sm border-2">
                        <Calendar className="w-4 h-4 mr-2" />
                        Last 30 Days
                    </Button>
                    <Button className="bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black px-8 shadow-xl hover:scale-105 transition-all">
                        <Download className="w-4 h-4 mr-2" />
                        Export
                    </Button>
                </div>
            </div>

            <div className={styles.statsGrid}>
                {statCards.map((stat, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1, duration: 0.5, ease: "easeOut" }}
                        className={styles.statCard}
                        style={{ '--glow-color': stat.glowColor }}
                    >
                        <div className={`${styles.statIcon} ${stat.bgColor} shadow-lg`}>
                            {stat.icon}
                        </div>
                        <div className={styles.statValue}>{stat.value}</div>
                        <div className={styles.statLabel}>{stat.label}</div>
                        <div className={`${styles.statTrend} ${stat.trendUp ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {stat.trendUp ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                            {stat.trend}
                            <span className="text-slate-400 font-bold ml-1">vs last month</span>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className={styles.mainGrid}>
                <div className={styles.chartCard}>
                    <div className={styles.cardHeader}>
                        <h3 className={styles.cardTitle}>User Activity Overview</h3>
                        <div className="flex gap-3">
                            <div className="flex items-center gap-2 px-4 py-1.5 bg-blue-50/50 backdrop-blur-sm text-blue-700 text-[10px] font-black uppercase tracking-tighter rounded-full border border-blue-100 shadow-sm">
                                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                                New Users
                            </div>
                            <div className="flex items-center gap-2 px-4 py-1.5 bg-slate-50/50 backdrop-blur-sm text-slate-700 text-[10px] font-black uppercase tracking-tighter rounded-full border border-slate-100 shadow-sm">
                                <span className="w-2 h-2 rounded-full bg-slate-400" />
                                Returning
                            </div>
                        </div>
                    </div>
                    <div className={styles.chartContainer}>
                        {[40, 70, 45, 90, 65, 80, 55, 100, 75, 40].map((h, i) => (
                            <motion.div
                                key={i}
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: `${h}%`, opacity: 1 }}
                                transition={{ delay: 0.3 + (i * 0.05), duration: 0.8, ease: "backOut" }}
                                className={styles.bar}
                                style={{
                                    opacity: 0.6 + (h / 250),
                                    background: `linear-gradient(to top, #6366f1 0%, #a855f7 ${h}%)`
                                }}
                            />
                        ))}
                    </div>
                    <div className="flex justify-between mt-6 px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                        {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'].map(m => <span key={m}>{m}</span>)}
                    </div>
                </div>

                <div className={styles.activityCard}>
                    <h3 className={styles.cardTitle + " mb-8"}>Recent Events</h3>
                    <div className={styles.activityList}>
                        {[
                            { title: "New high-frequency user join", time: "2 mins ago", icon: <Users className="w-5 h-5 text-indigo-600" />, sub: "Security Audit passing" },
                            { title: "SaaS Template 'Nexus' deployed", time: "15 mins ago", icon: <Layers className="w-5 h-5 text-purple-600" />, sub: "Ver: 2.0.4" },
                            { title: "System audit completed", time: "1 hour ago", icon: <Eye className="w-5 h-5 text-emerald-600" />, sub: "No issues found" },
                            { title: "API Quota limit warning", time: "3 hours ago", icon: <Zap className="w-5 h-5 text-amber-600" />, sub: "Limit approaching (85%)" },
                            { title: "New subscription: Enterprise", time: "5 hours ago", icon: <TrendingUp className="w-5 h-5 text-rose-600" />, sub: "ID: SUB-9902" }
                        ].map((event, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5 + (i * 0.1) }}
                                className={styles.activityItem}
                            >
                                <div className={styles.activityIcon}>
                                    {event.icon}
                                </div>
                                <div className={styles.activityContent}>
                                    <p className={styles.activityTitle}>{event.title}</p>
                                    <div className="flex items-center gap-2">
                                        <span className={styles.activityTime}>{event.time}</span>
                                        <span className="w-1 h-1 rounded-full bg-slate-300" />
                                        <span className="text-[10px] font-bold text-slate-400 uppercase">{event.sub}</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                    <Button variant="ghost" className="w-full mt-8 text-indigo-600 font-black hover:bg-indigo-50/50 rounded-2xl py-6 border-2 border-dashed border-indigo-100 hover:border-indigo-200 transition-all">
                        View Audit Logs
                    </Button>
                </div>
            </div>
        </motion.div>
    );
};

export default Analytics;
