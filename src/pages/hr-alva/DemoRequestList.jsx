import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
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
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Video, Phone, Eye, Trash2 } from "lucide-react";

const API_URL = import.meta.env.VITE_HRALVA_API_URL;

const DemoRequestList = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [isViewOpen, setIsViewOpen] = useState(false);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const token = localStorage.getItem("hrms_token");
            const response = await fetch(`${API_URL}/api/demo-requests`, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            const data = await response.json();

            if (data.success) {
                setRequests(data.data);
            } else {
                toast({
                    title: "Error",
                    description: "Failed to load demo requests",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error("Error fetching demo requests:", error);
            toast({
                title: "Error",
                description: "Failed to load demo requests",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this request?")) return;

        try {
            const token = localStorage.getItem("hrms_token");
            const response = await fetch(`${API_URL}/api/demo-requests/${id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`,
                }
            });

            const data = await response.json();

            if (response.ok) {
                toast({
                    title: "Success",
                    description: "Request deleted successfully",
                });
                setRequests(requests.filter(r => r._id !== id));
                if (selectedRequest?._id === id) setIsViewOpen(false);
            } else {
                toast({
                    title: "Error",
                    description: data.message || "Failed to delete request",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error("Error deleting request:", error);
            toast({
                title: "Error",
                description: "Failed to delete request",
                variant: "destructive",
            });
        }
    };

    const handleView = (request) => {
        setSelectedRequest(request);
        setIsViewOpen(true);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'New': return 'bg-blue-100 text-blue-800';
            case 'Scheduled': return 'bg-yellow-100 text-yellow-800';
            case 'Completed': return 'bg-green-100 text-green-800';
            case 'Cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-[#003C43]">Demo Requests</h1>
                    <p className="text-muted-foreground mt-1">
                        View and manage scheduled product demonstrations.
                    </p>
                </div>
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Requested Date</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Company</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#003C43]" />
                                </TableCell>
                            </TableRow>
                        ) : requests.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                    No demo requests found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            requests.map((request) => (
                                <TableRow key={request._id}>
                                    <TableCell className="whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <span className="font-medium">{new Date(request.preferredDate).toLocaleDateString()}</span>
                                            <span className="text-xs text-muted-foreground">{request.preferredTime}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium">{request.firstName} {request.lastName}</span>
                                            <span className="text-xs text-muted-foreground">{request.email}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{request.company}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {request.demoType === 'video' ? <Video className="w-4 h-4" /> : <Phone className="w-4 h-4" />}
                                            <span className="capitalize">{request.demoType}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                                            {request.status}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="sm" onClick={() => handleView(request)}>
                                                <Eye className="w-4 h-4" />
                                            </Button>
                                            <Button variant="ghost" size="sm" onClick={() => handleDelete(request._id)} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Demo Request Details</DialogTitle>
                    </DialogHeader>
                    {selectedRequest && (
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Date & Time</label>
                                    <p className="font-medium">
                                        {new Date(selectedRequest.preferredDate).toLocaleDateString()} at {selectedRequest.preferredTime}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Type</label>
                                    <p className="font-medium capitalize">{selectedRequest.demoType}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Name</label>
                                    <p className="font-medium">{selectedRequest.firstName} {selectedRequest.lastName}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                                    <p className="font-medium">{selectedRequest.email}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Company</label>
                                    <p className="font-medium">{selectedRequest.company}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Employees</label>
                                    <p className="font-medium">{selectedRequest.employees}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Attendees</label>
                                    <p className="font-medium">{selectedRequest.attendees}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Status</label>
                                    <p className="font-medium">{selectedRequest.status}</p>
                                </div>
                            </div>

                            {selectedRequest.notes && (
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Notes</label>
                                    <div className="mt-2 p-4 bg-muted rounded-md text-sm whitespace-pre-wrap">
                                        {selectedRequest.notes}
                                    </div>
                                </div>
                            )}

                            <div className="text-xs text-muted-foreground pt-4 border-t">
                                Submitted on {new Date(selectedRequest.createdAt).toLocaleString()}
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default DemoRequestList;
