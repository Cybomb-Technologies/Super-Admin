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
    const [analyticsData, setAnalyticsData] = useState({
        stats: {
            totalUsers: 0,
            totalTemplates: 0,
            growthRate: 0,
            activeNow: 0
        },
        chartData: [],
        recentEvents: []
    });

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const headers = getAuthHeaders();
            // Fallback to empty object if auth fails, simple fetch attempt
            const response = await fetch(`${API_BASE_URL}/api/admin/analytics`, { 
                headers: headers 
            });
            
            if (response.ok) {
                const data = await response.json();
                setAnalyticsData(data);
            } else {
                // If API fails or doesn't exist, we just show empty state/functional UI without mock data
                console.warn("Analytics API unavailable");
            }
        } catch (error) {
            console.error("Failed to fetch analytics", error);
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        {
            label: "Total Registered Users",
            value: analyticsData.stats?.totalUsers || 0,
            trend: analyticsData.stats?.growthRate ? `+${analyticsData.stats.growthRate}%` : "0%",
            trendUp: true,
            icon: <Users className="w-8 h-8 text-white" />,
            bgColor: "bg-indigo-500/20",
            glowColor: "rgba(99, 102, 241, 0.4)"
        },
        {
            label: "Template Usage",
            value: analyticsData.stats?.totalTemplates || 0,
            trend: "+0%",
            trendUp: true,
            icon: <Layers className="w-8 h-8 text-white" />,
            bgColor: "bg-purple-500/20",
            glowColor: "rgba(168, 85, 247, 0.4)"
        },
        {
            label: "Avg. Conversion Rate",
            value: "0%",
            trend: "+0%",
            trendUp: true,
            icon: <TrendingUp className="w-8 h-8 text-white" />,
            bgColor: "bg-teal-500/20",
            glowColor: "rgba(45, 212, 191, 0.4)"
        },
        {
            label: "Live Active Users",
            value: analyticsData.stats?.activeNow || 0,
            trend: "0%",
            trendUp: false,
            icon: <Zap className="w-8 h-8 text-white" />,
            bgColor: "bg-amber-500/20",
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
                <p className="text-slate-400 font-black tracking-widest uppercase text-xs animate-pulse">Analyzing platform data...</p>
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
                <div className={styles.headerActions}>
                    <Button variant="outline" className={styles.dateButton}>
                        <Calendar className="w-4 h-4 mr-2" />
                        Last 30 Days
                    </Button>
                    <Button className={styles.exportButton}>
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
                        <div className={`${styles.statIcon} ${stat.bgColor} shadow-lg border border-white/10`}>
                            {stat.icon}
                        </div>
                        <div className={styles.statValue}>{stat.value}</div>
                        <div className={styles.statLabel}>{stat.label}</div>
                        <div className={`${styles.statTrend} ${stat.trendUp ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-rose-400 bg-rose-500/10 border-rose-500/20'}`}>
                            {stat.trendUp ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                            {stat.trend}
                            <span className="text-slate-500 font-bold ml-1">vs last month</span>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className={styles.mainGrid}>
                <div className={styles.chartCard}>
                    <div className={styles.cardHeader}>
                        <h3 className={styles.cardTitle}>User Activity Overview</h3>
                        <div className="flex gap-3">
                            <div className="flex items-center gap-2 px-4 py-1.5 bg-blue-500/10 backdrop-blur-sm text-blue-400 text-[10px] font-black uppercase tracking-tighter rounded-full border border-blue-500/20 shadow-sm">
                                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                                New Users
                            </div>
                            <div className="flex items-center gap-2 px-4 py-1.5 bg-slate-500/10 backdrop-blur-sm text-slate-400 text-[10px] font-black uppercase tracking-tighter rounded-full border border-slate-500/20 shadow-sm">
                                <span className="w-2 h-2 rounded-full bg-slate-500" />
                                Returning
                            </div>
                        </div>
                    </div>
                    {/* Placeholder for Chart - Data removed */}
                    <div className={styles.chartContainer}>
                         <div className="w-full h-full flex flex-col items-center justify-center text-slate-500">
                             <BarChart3 className="w-12 h-12 opacity-20 mb-2" />
                             <p className="text-xs font-bold uppercase tracking-widest opacity-40">No Activity Data Available</p>
                         </div>
                    </div>
                </div>

                <div className={styles.activityCard}>
                    <h3 className={styles.cardTitle + " mb-8"}>Recent Events</h3>
                    <div className={styles.activityList}>
                        {analyticsData.recentEvents && analyticsData.recentEvents.length > 0 ? (
                            analyticsData.recentEvents.map((event, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.5 + (i * 0.1) }}
                                    className={styles.activityItem}
                                >
                                    <div className={styles.activityIcon}>
                                        <Zap className="w-5 h-5 text-amber-400" />
                                    </div>
                                    <div className={styles.activityContent}>
                                        <p className={styles.activityTitle}>{event.title}</p>
                                        <div className="flex items-center gap-2">
                                            <span className={styles.activityTime}>{event.time || "Just now"}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                             <div className="text-center py-12">
                                <p className="text-slate-500 text-sm font-bold">No recent events</p>
                            </div>
                        )}
                    </div>
                    <Button variant="ghost" className={styles.auditButton}>
                        View Audit Logs
                    </Button>
                </div>
            </div>
        </motion.div>
    );
};

export default Analytics;
