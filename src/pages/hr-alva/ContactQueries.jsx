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
import { Loader2, Mail, Trash2, Eye } from "lucide-react";

const API_URL = import.meta.env.VITE_HRALVA_API_URL;

const ContactQueries = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedContact, setSelectedContact] = useState(null);
    const [isViewOpen, setIsViewOpen] = useState(false);

    useEffect(() => {
        fetchContacts();
    }, []);

    const fetchContacts = async () => {
        try {
            const token = localStorage.getItem("hrms_token");
            const response = await fetch(`${API_URL}/api/contact`, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            const data = await response.json();

            if (data.success) {
                setContacts(data.data);
            } else {
                toast({
                    title: "Error",
                    description: "Failed to load contact inquiries",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error("Error fetching contacts:", error);
            toast({
                title: "Error",
                description: "Failed to load contact inquiries",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this inquiry?")) return;

        try {
            const token = localStorage.getItem("hrms_token");
            const response = await fetch(`${API_URL}/api/contact/${id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`,
                }
            });

            const data = await response.json();

            if (response.ok) {
                toast({
                    title: "Success",
                    description: "Inquiry deleted successfully",
                });
                setContacts(contacts.filter(c => c._id !== id));
                if (selectedContact?._id === id) setIsViewOpen(false);
            } else {
                toast({
                    title: "Error",
                    description: data.message || "Failed to delete inquiry",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error("Error deleting contact:", error);
            toast({
                title: "Error",
                description: "Failed to delete inquiry",
                variant: "destructive",
            });
        }
    };

    const handleView = (contact) => {
        setSelectedContact(contact);
        setIsViewOpen(true);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'New': return 'bg-blue-100 text-blue-800';
            case 'In Progress': return 'bg-yellow-100 text-yellow-800';
            case 'Resolved': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-[#003C43]">Contact Inquiries</h1>
                    <p className="text-muted-foreground mt-1">
                        View and manage messages from the contact form.
                    </p>
                </div>
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Subject</TableHead>
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
                        ) : contacts.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                    No inquiries found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            contacts.map((contact) => (
                                <TableRow key={contact._id}>
                                    <TableCell className="whitespace-nowrap">
                                        {new Date(contact.createdAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="font-medium">{contact.name}</TableCell>
                                    <TableCell>{contact.email}</TableCell>
                                    <TableCell>{contact.subject}</TableCell>
                                    <TableCell>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(contact.status)}`}>
                                            {contact.status}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="sm" onClick={() => handleView(contact)}>
                                                <Eye className="w-4 h-4" />
                                            </Button>
                                            <Button variant="ghost" size="sm" onClick={() => handleDelete(contact._id)} className="text-red-600 hover:text-red-700 hover:bg-red-50">
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
                        <DialogTitle>Inquiry Details</DialogTitle>
                    </DialogHeader>
                    {selectedContact && (
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Name</label>
                                    <p className="font-medium">{selectedContact.name}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                                    <p className="font-medium">{selectedContact.email}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Company</label>
                                    <p className="font-medium">{selectedContact.company || '-'}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Phone</label>
                                    <p className="font-medium">{selectedContact.phone || '-'}</p>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Subject</label>
                                <p className="font-medium">{selectedContact.subject}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Message</label>
                                <div className="mt-2 p-4 bg-muted rounded-md text-sm whitespace-pre-wrap">
                                    {selectedContact.message}
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Date</label>
                                <p className="text-sm">{new Date(selectedContact.createdAt).toLocaleString()}</p>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ContactQueries;
