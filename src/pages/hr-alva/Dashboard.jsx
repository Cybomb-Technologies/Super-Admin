import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, Users, MessageSquare, MonitorPlay } from "lucide-react";
import axios from 'axios';

const API_URL = import.meta.env.VITE_HRALVA_API_URL;

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalTenants: 0,
        activeTenants: 0,
        totalDemoRequests: 0,
        pendingQueries: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem("hrms_token");
            // In a real scenario, you might have a dedicated stats endpoint.
            // For now, we'll just mock or fetch lists if endpoints exist, 
            // but to be safe and quick, we will fetch tenants to count them.

            const tenantsRes = await axios.get(`${API_URL}/api/tenants`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const contactsRes = await axios.get(`${API_URL}/api/contact`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const demoRes = await axios.get(`${API_URL}/api/demo-requests`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (tenantsRes.data.success) {
                const tenants = tenantsRes.data.data;
                setStats(prev => ({
                    ...prev,
                    totalTenants: tenants.length,
                    activeTenants: tenants.filter(t => t.status === 'active').length
                }));
            }

            if (contactsRes.data.success) {
                setStats(prev => ({
                    ...prev,
                    pendingQueries: contactsRes.data.count || contactsRes.data.data.length
                }));
            }

            if (demoRes.data.success) {
                setStats(prev => ({
                    ...prev,
                    totalDemoRequests: demoRes.data.count || demoRes.data.data.length
                }));
            }

        } catch (error) {
            console.error("Error fetching dashboard stats:", error);
        } finally {
            setLoading(false);
        }
    };

    const StatCard = ({ title, value, icon: Icon, color }) => (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                    {title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${color}`} />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{loading ? "..." : value}</div>
            </CardContent>
        </Card>
    );

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-[#003C43]">Super Admin Dashboard</h1>
                <p className="text-muted-foreground mt-1">
                    Overview of system performance and tenant management.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Total Organizations"
                    value={stats.totalTenants}
                    icon={Building}
                    color="text-blue-600"
                />
                <StatCard
                    title="Active Organizations"
                    value={stats.activeTenants}
                    icon={Users}
                    color="text-green-600"
                />
                {/* Placeholders for future stats */}
                <StatCard
                    title="Demo Requests"
                    value={stats.totalDemoRequests}
                    icon={MonitorPlay}
                    color="text-orange-600"
                />
                <StatCard
                    title="Contact Queries"
                    value={stats.pendingQueries}
                    icon={MessageSquare}
                    color="text-purple-600"
                />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">System logs and recent events will appear here.</p>
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {/* Links or buttons could go here */}
                            <p className="text-sm text-muted-foreground">Use the sidebar to manage tenants and requests.</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Dashboard;
