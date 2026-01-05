import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Plus, Building, Database, ExternalLink, Pencil, Eye } from "lucide-react";
import axios from "axios";
import styles from './hralva.module.css';

const API_URL = import.meta.env.VITE_HRALVA_API_URL;

const TenantList = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [tenants, setTenants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [creating, setCreating] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        slug: "",
        email: "",
        password: "",
        maxEmployees: 10,
        location: "",
    });

    useEffect(() => {
        fetchTenants();
    }, []);

    const fetchTenants = async () => {
        try {
            const token = localStorage.getItem("hrms_token");
            const res = await axios.get(`${API_URL}/api/tenants`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.data.success) {
                setTenants(res.data.data);
            }
        } catch (error) {
            console.error("Error fetching tenants:", error);
            toast({
                title: "Error",
                description: "Failed to load tenants",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        // Auto-generate slug from name if slug is empty or matches previous slugified name
        if (name === "name") {
            const slug = value.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");
            setFormData(prev => ({ ...prev, name: value, slug }));
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSlugChange = (e) => {
        const { value } = e.target;
        setFormData(prev => ({ ...prev, slug: value }));
    }

    const handleCreateTenant = async (e) => {
        e.preventDefault();
        setCreating(true);

        try {
            const token = localStorage.getItem("hrms_token");
            const res = await axios.post(`${API_URL}/api/tenants`, formData, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.data.success) {
                toast({
                    title: "Success",
                    description: "Tenant created successfully and DB provisioned.",
                });
                setTenants([res.data.tenant, ...tenants]);
                setIsCreateOpen(false);
                setFormData({ name: "", slug: "", email: "", password: "", maxEmployees: 10, location: "" });
            }
        } catch (error) {
            console.error("Error creating tenant:", error);
            const msg = error.response?.data?.message || "Failed to create tenant";
            toast({
                title: "Error",
                description: msg,
                variant: "destructive",
            });
        } finally {
            setCreating(false);
        }
    };

    const [isViewOpen, setIsViewOpen] = useState(false);
    const [viewingTenant, setViewingTenant] = useState(null);

    const handleViewClick = (tenant) => {
        setViewingTenant(tenant);
        setIsViewOpen(true);
    };

    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingTenant, setEditingTenant] = useState(null);
    const [updating, setUpdating] = useState(false);

    const handleEditClick = (tenant) => {
        setEditingTenant(tenant);
        setFormData({
            name: tenant.name,
            slug: tenant.slug,
            email: tenant.adminEmail,
            password: "", // Password update not supported directly here
            maxEmployees: tenant.maxEmployees,
            location: tenant.location || "",
        });
        setIsEditOpen(true);
    };

    const handleUpdateTenant = async (e) => {
        e.preventDefault();
        setUpdating(true);

        try {
            const token = localStorage.getItem("hrms_token");
            const res = await axios.put(`${API_URL}/api/tenants/${editingTenant._id}`, {
                name: formData.name,
                maxEmployees: formData.maxEmployees,
                location: formData.location,
                adminEmail: formData.email
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.data.success) {
                toast({
                    title: "Success",
                    description: "Tenant updated successfully.",
                });
                setTenants(tenants.map(t => t._id === editingTenant._id ? res.data.data : t));
                setIsEditOpen(false);
            }
        } catch (error) {
            console.error("Error updating tenant:", error);
            toast({
                title: "Error",
                description: "Failed to update tenant",
                variant: "destructive",
            });
        } finally {
            setUpdating(false);
        }
    };

    const handleStatusToggle = async (tenantId, currentStatus) => {
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
        try {
            const token = localStorage.getItem("hrms_token");
            const res = await axios.patch(`${API_URL}/api/tenants/${tenantId}/status`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (res.data.success) {
                toast({
                    title: "Status Updated",
                    description: `Tenant marked as ${newStatus}`,
                });
                // Update local state
                setTenants(tenants.map(t =>
                    t._id === tenantId ? { ...t, status: newStatus } : t
                ));
            }
        } catch (error) {
            console.error("Error updating status:", error);
            toast({
                title: "Error",
                description: "Failed to update tenant status",
                variant: "destructive",
            });
        }
    };

    return (
        <div className={styles.container}>
            <div className={`flex justify-between items-center ${styles.header}`}>
                <div>
                    <h1 className={styles.title}>Tenant Management</h1>
                    <p className={styles.subtitle}>
                        Manage organizations and their isolated databases.
                    </p>
                </div>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <button className={styles.actionButton}>
                            <Plus className="w-4 h-4" />
                            Create Tenant
                        </button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Create New Organization</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleCreateTenant} className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Organization Name</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    placeholder="e.g. Acme Corp"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="slug">URL Slug (DB Name)</Label>
                                <div className="flex items-center">
                                    <span className="text-sm text-muted-foreground mr-2">hrms-</span>
                                    <Input
                                        id="slug"
                                        name="slug"
                                        placeholder="acme"
                                        value={formData.slug}
                                        onChange={handleSlugChange}
                                        required
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground">This will generate a database named hrms_tenant_&lt;slug&gt;</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Admin Email</Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="admin@acme.com"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password">Admin Password</Label>
                                    <Input
                                        id="password"
                                        name="password"
                                        type="password"
                                        placeholder="******"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="maxEmployees">Max Employees</Label>
                                    <Input
                                        id="maxEmployees"
                                        name="maxEmployees"
                                        type="number"
                                        placeholder="10"
                                        value={formData.maxEmployees}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="location">Location</Label>
                                    <Input
                                        id="location"
                                        name="location"
                                        placeholder="e.g. London"
                                        value={formData.location}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                            </div>

                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={creating} className="bg-[#6666cc]">
                                    {creating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                    Provision Tenant
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className={styles.tableCard}>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Slug</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Employees</TableHead>
                            <TableHead>Database URI</TableHead>
                            <TableHead>Admin Email</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#6666cc]" />
                                </TableCell>
                            </TableRow>
                        ) : tenants.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                    No tenants found. Create one to get started.
                                </TableCell>
                            </TableRow>
                        ) : (
                            tenants.map((tenant) => (
                                <TableRow key={tenant._id}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center">
                                            <Building className="w-4 h-4 mr-2 text-muted-foreground" />
                                            {tenant.name}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            {tenant.slug}
                                        </span>
                                    </TableCell>
                                    <TableCell>{tenant.location || 'N/A'}</TableCell>
                                    <TableCell>{tenant.maxEmployees || 'N/A'}</TableCell>
                                    <TableCell className="text-xs text-muted-foreground font-mono truncate max-w-[200px]" title={tenant.dbURI}>
                                        <div className="flex items-center">
                                            <Database className="w-3 h-3 mr-1" />
                                            {tenant.dbURI}
                                        </div>
                                    </TableCell>
                                    <TableCell>{tenant.adminEmail}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center space-x-2">
                                            <Switch
                                                checked={tenant.status === 'active'}
                                                onCheckedChange={() => handleStatusToggle(tenant._id, tenant.status)}
                                            />
                                            <span className={`text-xs font-medium ${tenant.status === 'active' ? 'text-green-600' : 'text-gray-500'
                                                }`}>
                                                {tenant.status === 'active' ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center space-x-2">
                                            <Button variant="ghost" size="sm" onClick={() => handleViewClick(tenant)} title="View Details">
                                                <Eye className="w-4 h-4 text-gray-500 hover:text-[#6666cc]" />
                                            </Button>
                                            <Button variant="ghost" size="sm" onClick={() => handleEditClick(tenant)} title="Edit Tenant">
                                                <Pencil className="w-4 h-4 text-gray-500 hover:text-[#6666cc]" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Edit Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Edit Organization</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleUpdateTenant} className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-name">Organization Name</Label>
                            <Input
                                id="edit-name"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-slug">URL Slug (Cannot be changed)</Label>
                            <Input
                                id="edit-slug"
                                name="slug"
                                value={formData.slug}
                                disabled
                                className="bg-gray-100"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-email">Admin Email</Label>
                                <Input
                                    id="edit-email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-maxEmployees">Max Employees</Label>
                                <Input
                                    id="edit-maxEmployees"
                                    name="maxEmployees"
                                    type="number"
                                    value={formData.maxEmployees}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-location">Location</Label>
                            <Input
                                id="edit-location"
                                name="location"
                                value={formData.location}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={updating} className="bg-[#003C43]">
                                {updating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                Save Changes
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
            {/* View Dialog */}
            <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Organization Details</DialogTitle>
                    </DialogHeader>
                    {viewingTenant && (
                        <div className="grid grid-cols-2 gap-4 py-4">
                            <div className="space-y-1">
                                <Label className="text-muted-foreground">Organization Name</Label>
                                <div className="font-medium p-2 bg-gray-50 rounded-md">{viewingTenant.name}</div>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-muted-foreground">Slug (DB Name)</Label>
                                <div className="font-medium p-2 bg-gray-50 rounded-md font-mono">{viewingTenant.slug}</div>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-muted-foreground">Admin Email</Label>
                                <div className="font-medium p-2 bg-gray-50 rounded-md">{viewingTenant.adminEmail}</div>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-muted-foreground">Max Employees</Label>
                                <div className="font-medium p-2 bg-gray-50 rounded-md">{viewingTenant.maxEmployees}</div>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-muted-foreground">Location</Label>
                                <div className="font-medium p-2 bg-gray-50 rounded-md">{viewingTenant.location || 'N/A'}</div>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-muted-foreground">Status</Label>
                                <div className="p-2">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${viewingTenant.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                        }`}>
                                        {viewingTenant.status.toUpperCase()}
                                    </span>
                                </div>
                            </div>
                            <div className="col-span-2 space-y-1">
                                <Label className="text-muted-foreground">Database URI</Label>
                                <div className="font-medium p-2 bg-gray-50 rounded-md font-mono text-sm break-all">
                                    {viewingTenant.dbURI}
                                </div>
                            </div>
                            <div className="col-span-2 space-y-1">
                                <Label className="text-muted-foreground">Created At</Label>
                                <div className="font-medium p-2 bg-gray-50 rounded-md">
                                    {new Date(viewingTenant.createdAt).toLocaleString()}
                                </div>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button onClick={() => setIsViewOpen(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default TenantList;
