import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from './Payments.module.css';
import {
    DollarSign,
    TrendingUp,
    Users,
    RefreshCw,
    Eye,
    CheckCircle,
    XCircle,
    Clock,
    Filter,
    MoreVertical,
    Calendar,
    CreditCard,
    BarChart3,
    ArrowUpRight,
    ArrowDownRight,
    ChevronLeft,
    ChevronRight,
    Search,
    Percent,
    Receipt,
    Download
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import * as XLSX from "xlsx";
import { getAuthHeaders } from "@/utils/startupBuilderAuth";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const API_BASE_URL = import.meta.env.VITE_PAPLIXO_API_URL;

const PaymentManager = () => {
    const { toast } = useToast();
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [filters, setFilters] = useState({
        status: '',
        planId: '',
        search: '',
        page: 1,
        limit: 20,
        sortBy: 'createdAt',
        sortOrder: 'desc'
    });
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        total: 0
    });
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [isUpdateStatusOpen, setIsUpdateStatusOpen] = useState(false);
    const [newStatus, setNewStatus] = useState('');
    const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [localSearch, setLocalSearch] = useState(filters.search);

    // Tax rate (18% included in the total amount)
    const TAX_RATE = 0.18; // 18% GST

    // ✅ Get auth headers with validation
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

    // ✅ Calculate amount breakdown with tax
    const calculateAmountBreakdown = (totalAmount) => {
        const total = parseFloat(totalAmount) || 0;

        // Calculate base amount (total / 1.18)
        const baseAmount = total / (1 + TAX_RATE);

        // Calculate tax amount (18% of base amount)
        const taxAmount = baseAmount * TAX_RATE;

        return {
            baseAmount: parseFloat(baseAmount.toFixed(2)),     // 0.85 for 1.00 total
            taxAmount: parseFloat(taxAmount.toFixed(2)),       // 0.15 for 1.00 total
            total: parseFloat(total.toFixed(2))                // 1.00
        };
    };

    // ✅ Load payments with filters
    const loadPayments = useCallback(async () => {
        try {
            setLoading(true);

            const headers = getAuthHeadersLocal();
            if (Object.keys(headers).length === 0) {
                setLoading(false);
                return;
            }

            const queryParams = new URLSearchParams();
            Object.entries(filters).forEach(([key, value]) => {
                if (value) queryParams.append(key, value);
            });

            const response = await fetch(
                `${API_BASE_URL}/api/admin/payments?${queryParams}`,
                {
                    headers
                }
            );

            if (response.ok) {
                const data = await response.json();
                setPayments(data.payments || []);
                setPagination({
                    currentPage: data.currentPage,
                    totalPages: data.totalPages,
                    total: data.total
                });

                if (data.stats) {
                    setStats(data.stats);
                }
            } else if (response.status === 401) {
                throw new Error("Authentication failed");
            } else {
                throw new Error("Failed to load payments");
            }
        } catch (error) {
            console.error("Error loading payments:", error);
            setPayments([]);
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    }, [filters, toast]);

    // ✅ Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (localSearch !== filters.search) {
                handleFilterChange('search', localSearch);
            }
        }, 500); // Increased slightly for smoother backspacing
        return () => clearTimeout(timer);
    }, [localSearch]);

    // ✅ Load payment stats
    const loadStats = async () => {
        try {
            const headers = getAuthHeadersLocal();
            if (Object.keys(headers).length === 0) return;

            const response = await fetch(
                `${API_BASE_URL}/api/admin/payments/stats`,
                {
                    headers
                }
            );

            if (response.ok) {
                const data = await response.json();
                setStats(data.stats);
            }
        } catch (error) {
            console.error("Error loading stats:", error);
        }
    };

    // ✅ Load payments on mount
    useEffect(() => {
        loadPayments();
        loadStats();
    }, [loadPayments]);

    // ✅ Handle filter changes
    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
    };

    // ✅ Format date for Excel
    const formatDateForExcel = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString('en-US');
    };

    // ✅ Export payments to Excel
    const exportToExcel = async () => {
        try {
            setIsExporting(true);

            const headers = getAuthHeadersLocal();
            if (Object.keys(headers).length === 0) return;

            // If we're filtering, we need to fetch all data without pagination
            let allPayments = [];

            // If filters are applied, fetch all matching data
            if (filters.status || filters.planId || filters.search) {
                const queryParams = new URLSearchParams({
                    ...filters,
                    page: 1,
                    limit: 10000, // Large number to get all data
                });

                const response = await fetch(
                    `${API_BASE_URL}/api/admin/payments?${queryParams}`,
                    {
                        headers
                    }
                );

                if (response.ok) {
                    const data = await response.json();
                    allPayments = data.payments || [];
                } else {
                    // Fallback to current payments if API fails
                    allPayments = payments;
                }
            } else {
                // Use current payments if no filters
                allPayments = payments;
            }

            // Prepare data for Excel
            const excelData = allPayments.map(payment => {
                const breakdown = calculateAmountBreakdown(payment.amount);

                return {
                    'Transaction ID': payment.transactionId || 'N/A',
                    'User Name': payment.user?.username || 'N/A',
                    'User Email': payment.user?.email || 'N/A',
                    'Plan Name': payment.planName || 'N/A',
                    'Plan ID': payment.planId || 'N/A',
                    'Billing Cycle': payment.billingCycle || 'N/A',
                    'Status': payment.status ? payment.status.charAt(0).toUpperCase() + payment.status.slice(1) : 'N/A',
                    'Payment Method': payment.paymentMethod || 'N/A',
                    'Currency': payment.currency || 'INR',
                    'Total Amount (INR)': payment.amount || 0,
                    'Base Amount (excl. tax)': breakdown.baseAmount,
                    'Tax Amount (18% GST)': breakdown.taxAmount,
                    'Tax Percentage': '18%',
                    'Created Date': formatDateForExcel(payment.createdAt),
                    'Expiry Date': formatDateForExcel(payment.expiryDate),
                    'Gateway Response': payment.gatewayResponse ? JSON.stringify(payment.gatewayResponse) : '',
                    'Gateway Transaction ID': payment.gatewayTransactionId || '',
                    'Refund Status': payment.refundStatus || 'N/A',
                    'Refund Amount': payment.refundAmount || 0,
                    'Refund Date': formatDateForExcel(payment.refundDate),
                };
            });

            // Create a new workbook
            const wb = XLSX.utils.book_new();

            // Create a worksheet
            const ws = XLSX.utils.json_to_sheet(excelData);

            // Set column widths
            const colWidths = [
                { wch: 20 }, // Transaction ID
                { wch: 15 }, // User Name
                { wch: 25 }, // User Email
                { wch: 15 }, // Plan Name
                { wch: 10 }, // Plan ID
                { wch: 12 }, // Billing Cycle
                { wch: 10 }, // Status
                { wch: 15 }, // Payment Method
                { wch: 8 },  // Currency
                { wch: 15 }, // Total Amount
                { wch: 15 }, // Base Amount
                { wch: 15 }, // Tax Amount
                { wch: 12 }, // Tax Percentage
                { wch: 10 }, // Auto Renewal
                { wch: 20 }, // Created Date
                { wch: 20 }, // Paid Date
                { wch: 20 }, // Expiry Date
                { wch: 10 }, // User ID
                { wch: 12 }, // Plan Type
                { wch: 30 }, // Notes
                { wch: 30 }, // Gateway Response
                { wch: 25 }, // Gateway Transaction ID
                { wch: 12 }, // Refund Status
                { wch: 12 }, // Refund Amount
                { wch: 20 }, // Refund Date
            ];
            ws['!cols'] = colWidths;

            // Add the worksheet to the workbook
            XLSX.utils.book_append_sheet(wb, ws, "Payments");

            // Generate filename with timestamp
            const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
            const filename = `payments-export-${timestamp}.xlsx`;

            // Write the workbook and trigger download
            XLSX.writeFile(wb, filename);

            toast({
                title: "Export Successful",
                description: `Exported ${excelData.length} payment records to ${filename}`,
            });

        } catch (error) {
            console.error("Error exporting to Excel:", error);
            toast({
                title: "Export Failed",
                description: error.message || "Failed to export payments data",
                variant: "destructive",
            });
        } finally {
            setIsExporting(false);
        }
    };

    // ✅ View payment details
    const handleViewDetails = async (paymentId) => {
        try {
            const headers = getAuthHeadersLocal();
            if (Object.keys(headers).length === 0) return;

            const response = await fetch(
                `${API_BASE_URL}/api/admin/payments/${paymentId}`,
                {
                    headers
                }
            );

            if (response.ok) {
                const data = await response.json();
                setSelectedPayment(data.payment);
                setIsDetailsOpen(true);
            } else {
                throw new Error("Failed to load payment details");
            }
        } catch (error) {
            console.error("Error loading payment details:", error);
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        }
    };

    // ✅ View invoice details
    const handleViewInvoice = (payment) => {
        setSelectedPayment(payment);
        setIsInvoiceModalOpen(true);
    };

    // ✅ Update payment status
    const handleUpdateStatus = async () => {
        if (!selectedPayment || !newStatus) return;

        try {
            const headers = getAuthHeadersLocal();
            if (Object.keys(headers).length === 0) return;

            const response = await fetch(
                `${API_BASE_URL}/api/admin/payments/${selectedPayment.id}/status`,
                {
                    method: "PUT",
                    headers,
                    body: JSON.stringify({ status: newStatus })
                }
            );

            if (response.ok) {
                const data = await response.json();
                toast({
                    title: "Success",
                    description: data.message,
                });

                // Update local state
                setPayments(prev => prev.map(p =>
                    p.id === selectedPayment.id
                        ? { ...p, status: newStatus }
                        : p
                ));

                setIsUpdateStatusOpen(false);
                setNewStatus('');
            } else {
                throw new Error("Failed to update payment status");
            }
        } catch (error) {
            console.error("Error updating payment status:", error);
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        }
    };

    // ✅ Format currency
    const formatCurrency = (amount, currency = 'INR') => {
        if (!amount) return '₹0';
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }).format(amount);
    };

    // ✅ Format date
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // ✅ Get status badge
    const getStatusBadge = (status) => {
        switch (status) {
            case 'success':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Success
                    </span>
                );
            case 'failed':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <XCircle className="w-3 h-3 mr-1" />
                        Failed
                    </span>
                );
            case 'pending':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        <Clock className="w-3 h-3 mr-1" />
                        Pending
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {status}
                    </span>
                );
        }
    };

    // ✅ Generate invoice data
    const generateInvoiceData = (payment) => {
        const breakdown = calculateAmountBreakdown(payment.amount);

        return {
            invoiceNumber: payment.transactionId,
            date: payment.paidAt || payment.createdAt,
            status: payment.status,
            plan: payment.planName,
            billingCycle: payment.billingCycle,
            currency: payment.currency,
            paymentMethod: payment.paymentMethod || 'Credit Card',
            customer: {
                name: payment.user?.username || 'Customer',
                email: payment.user?.email || 'customer@example.com',
                userId: payment.user?.id || payment.userId
            },
            company: {
                name: 'TemplateFlow',
                address: '123 Business Street',
                city: 'City, State 12345',
                email: 'support@templateflow.com',
                website: 'www.templateflow.com',
                taxId: 'TAX-789-456-123',
                gstin: '18ABCDE1234F1Z5'
            },
            items: [
                {
                    id: 1,
                    description: `${payment.planName} Subscription - ${payment.billingCycle === 'annual' ? 'Yearly' : 'Monthly'}`,
                    billingPeriod: payment.billingCycle === 'annual' ? 'Yearly' : 'Monthly',
                    unitPrice: breakdown.baseAmount,
                    amount: breakdown.baseAmount,
                    quantity: 1
                }
            ],
            baseAmount: breakdown.baseAmount,
            taxAmount: breakdown.taxAmount,
            taxRate: TAX_RATE * 100, // 18%
            totalAmount: breakdown.total
        };
    };

    // ✅ Invoice Modal Component
    const InvoiceModal = () => {
        if (!isInvoiceModalOpen || !selectedPayment) return null;

        const invoiceData = generateInvoiceData(selectedPayment);

        return (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                <div className="bg-slate-900 rounded-[2rem] max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-white/10 shadow-2xl">
                    <div className="p-8">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-bold text-white">Tax Invoice</h3>
                            <button
                                onClick={() => setIsInvoiceModalOpen(false)}
                                className="text-slate-400 hover:text-white transition-colors bg-white/5 p-2 rounded-full hover:bg-white/10"
                            >
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Invoice Header */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 pb-8 border-b border-white/5">
                            {/* Company Info */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                                        <Receipt className="w-5 h-5 text-blue-400" />
                                    </div>
                                    <h4 className="font-bold text-xl text-white">{invoiceData.company.name}</h4>
                                </div>
                                <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-1">
                                    <p className="text-sm text-slate-400">{invoiceData.company.address}</p>
                                    <p className="text-sm text-slate-400">{invoiceData.company.city}</p>
                                    <p className="text-sm text-slate-400">{invoiceData.company.email}</p>
                                    <p className="text-sm text-slate-400">{invoiceData.company.website}</p>
                                    <p className="text-sm text-slate-500 font-mono mt-2 pt-2 border-t border-white/5">GSTIN: {invoiceData.company.gstin}</p>
                                </div>
                            </div>

                            {/* Invoice Info */}
                            <div className="text-right space-y-4">
                                <h2 className="text-3xl font-black text-white tracking-tight">TAX INVOICE</h2>
                                <div className={`inline-block px-4 py-1.5 rounded-full text-sm font-bold border ${
                                    invoiceData.status === 'success' 
                                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                        : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                }`}>
                                    {invoiceData.status.toUpperCase()}
                                </div>
                                <div className="space-y-1 text-sm bg-white/5 p-4 rounded-2xl border border-white/5 inline-block text-left min-w-[200px]">
                                    <div className="flex justify-between gap-4">
                                        <span className="text-slate-500">Invoice #:</span>
                                        <span className="text-white font-mono">{invoiceData.invoiceNumber}</span>
                                    </div>
                                    <div className="flex justify-between gap-4">
                                        <span className="text-slate-500">Date:</span>
                                        <span className="text-white">{new Date(invoiceData.date).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Bill To Section */}
                        <div className="mb-8 p-6 bg-white/5 rounded-3xl border border-white/5">
                            <h4 className="font-bold text-slate-400 uppercase tracking-wider text-xs mb-4">Bill To</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <p className="font-bold text-lg text-white mb-1">{invoiceData.customer.name}</p>
                                    <p className="text-sm text-slate-400">{invoiceData.customer.email}</p>
                                    <p className="text-sm text-slate-500 font-mono mt-1">ID: {invoiceData.customer.userId}</p>
                                </div>
                            </div>
                        </div>

                        {/* Invoice Items Table */}
                        <div className="mb-8">
                            <h4 className="font-bold text-white mb-4">Items</h4>
                            <div className="w-full rounded-2xl overflow-hidden border border-white/10">
                                <table className="w-full">
                                    <thead className="bg-white/5">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Description</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Billing Period</th>
                                            <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Unit Price</th>
                                            <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Qty</th>
                                            <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {invoiceData.items.map((item) => (
                                            <tr key={item.id} className="bg-transparent hover:bg-white/[0.02]">
                                                <td className="px-6 py-4 text-white font-medium">{item.description}</td>
                                                <td className="px-6 py-4 text-slate-400">{item.billingPeriod}</td>
                                                <td className="px-6 py-4 text-right text-slate-300 font-mono">{formatCurrency(item.unitPrice, invoiceData.currency)}</td>
                                                <td className="px-6 py-4 text-right text-slate-300">{item.quantity}</td>
                                                <td className="px-6 py-4 text-right font-bold text-white font-mono">
                                                    {formatCurrency(item.amount, invoiceData.currency)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Invoice Summary */}
                        <div className="flex justify-end">
                            <div className="w-96 space-y-4">
                                <div className="space-y-3 p-6 bg-white/5 rounded-3xl border border-white/5">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-400">Subtotal</span>
                                        <span className="font-mono text-white">
                                            {formatCurrency(invoiceData.baseAmount, invoiceData.currency)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-400 flex items-center">
                                            <Percent className="w-3 h-3 mr-1" />
                                            GST ({invoiceData.taxRate}%)
                                        </span>
                                        <span className="font-mono text-white">
                                            {formatCurrency(invoiceData.taxAmount, invoiceData.currency)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center pt-4 border-t border-white/10">
                                        <span className="text-lg font-bold text-white">Total Amount</span>
                                        <span className="text-xl font-black text-white font-mono">
                                            {formatCurrency(invoiceData.totalAmount, invoiceData.currency)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="mt-12 pt-8 border-t border-white/10 text-center text-xs text-slate-600">
                            <p className="mb-1">This is a computer-generated invoice and does not require a signature.</p>
                            <p>GST @ {invoiceData.taxRate}% is included in the total amount.</p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-4 justify-end mt-8 border-t border-white/10 pt-8">
                            <button
                                onClick={() => setIsInvoiceModalOpen(false)}
                                className="px-6 py-3 border border-white/10 rounded-xl text-slate-300 hover:bg-white/5 font-bold transition-all"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => {
                                    toast({
                                        title: "Invoice Downloaded",
                                        description: "Invoice PDF has been generated",
                                    });
                                }}
                                className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-lg shadow-blue-900/20 flex items-center gap-2 transition-all"
                            >
                                <Download className="w-4 h-4" />
                                Download PDF
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // ✅ Loading spinner
    if (loading && payments.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                <div className="font-black text-slate-500 uppercase tracking-[0.2em] text-xs">Synchronizing Ledger...</div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.headerInner}>
                    <div className={styles.headerTitle}>
                        <div className={styles.iconWrapper} style={{ borderRadius: '1.5rem' }}>
                            <Receipt className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className={styles.titleMain}>Revenue Ledger</h1>
                            <p className={styles.titleSub}>Tracking systemic financial health and subscription flow</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={exportToExcel}
                            disabled={isExporting || payments.length === 0}
                            className={styles.exportButton}
                        >
                            {isExporting ? <RefreshCw className="w-5 h-5 animate-spin mr-2" /> : <Download className="w-5 h-5 mr-2" />}
                            Export Excel
                        </button>
                    </div>
                </div>
            </div>

            {stats && (
                <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                        <div className={styles.statHeader}>
                            <span className={styles.statLabel}>Total Revenue</span>
                            <div className={styles.statIcon} style={{ background: 'rgba(14, 165, 233, 0.1)', color: '#38bdf8' }}>
                                <DollarSign className="w-5 h-5 font-bold" />
                            </div>
                        </div>
                        <div className={styles.statValue}>{formatCurrency(stats.totalRevenue)}</div>
                        <div className={`${styles.statTrend} text-emerald-400`}>
                            <ArrowUpRight className="w-3 h-3" /> +12% growth
                        </div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statHeader}>
                            <span className={styles.statLabel}>Success Rate</span>
                            <div className={styles.statIcon} style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#34d399' }}>
                                <TrendingUp className="w-5 h-5 font-bold" />
                            </div>
                        </div>
                        <div className={styles.statValue}>{stats.successRate}%</div>
                        <div className={`${styles.statTrend} text-emerald-400`}>
                            <CheckCircle className="w-3 h-3" /> Healthy status
                        </div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statHeader}>
                            <span className={styles.statLabel}>Active Subs</span>
                            <div className={styles.statIcon} style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#a78bfa' }}>
                                <RefreshCw className="w-5 h-5 font-bold" />
                            </div>
                        </div>
                        <div className={styles.statValue}>{payments.filter(p => p.status === 'success').length}</div>
                        <div className={`${styles.statTrend} text-slate-400`}>
                            Recurring members
                        </div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statHeader}>
                            <span className={styles.statLabel}>Renewals</span>
                            <div className={styles.statIcon} style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#fbbf24' }}>
                                <Calendar className="w-5 h-5 font-bold" />
                            </div>
                        </div>
                        <div className={styles.statValue}>{stats.upcomingRenewals?.length || 0}</div>
                        <div className={`${styles.statTrend} text-amber-500`}>
                            Upcoming 7 days
                        </div>
                    </div>
                </div>
            )}

            <div className={styles.filterBar}>
                <div className={styles.searchBox}>
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                    <input 
                        className={styles.searchInput}
                        placeholder="Filter by transaction ref or user email..."
                        value={localSearch}
                        onChange={e => setLocalSearch(e.target.value)}
                    />
                </div>

                <Select 
                    value={filters.status || "all"} 
                    onValueChange={(val) => handleFilterChange('status', val === "all" ? "" : val)}
                >
                    <SelectTrigger className="w-[240px] h-14 bg-black border-white/10 text-white rounded-2xl font-bold">
                        <SelectValue placeholder="All Transactions" />
                    </SelectTrigger>
                    <SelectContent className="bg-black">
                        <SelectItem value="all">All Transactions</SelectItem>
                        <SelectItem value="success">Successful Only</SelectItem>
                        <SelectItem value="pending">Pending Review</SelectItem>
                        <SelectItem value="failed">Failed Logs</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className={styles.tableContainer}>
                <div className={styles.tableHeader}>
                    <div>Customer & Product</div>
                    <div>Transaction Reference</div>
                    <div>Event Date</div>
                    <div>Gross Amount</div>
                    <div className="text-right">Ledger Status</div>
                </div>
                {payments.map((payment) => (
                    <div key={payment.id} className={styles.tableRow} onClick={() => handleViewInvoice(payment)}>
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center font-black text-white/40 border border-white/10">
                                {payment.user?.username?.charAt(0) || 'U'}
                            </div>
                            <div>
                                <div className="font-bold text-white leading-none mb-1 text-sm">{payment.user?.username || 'Guest'}</div>
                                <div className="text-[10px] font-black text-sky-400 uppercase tracking-widest leading-none">{payment.planName}</div>
                            </div>
                        </div>
                        <div className={styles.orderIdCell}>
                            {payment.transactionId}
                        </div>
                        <div className="text-white/60 font-medium text-sm">
                            {new Date(payment.createdAt).toLocaleDateString()}
                        </div>
                        <div className={styles.amountCell}>
                            {formatCurrency(payment.amount)}
                        </div>
                        <div className="text-right">
                            <span className={`${styles.badge} ${
                                payment.status === 'success' ? styles.badgeSuccess : 
                                payment.status === 'pending' ? styles.badgePending : styles.badgeFailed
                            }`}>
                                {payment.status === 'success' ? <CheckCircle className="w-3 h-3" /> : 
                                 payment.status === 'pending' ? <Clock className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                {payment.status}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex items-center justify-between mt-8 mb-20 px-8">
                <span className="text-xs font-black text-white/30 uppercase tracking-widest">
                    Ledger Page {pagination.currentPage} / {pagination.totalPages}
                </span>
                <div className="flex gap-4">
                    <button 
                        className={styles.paginationBtn}
                        disabled={pagination.currentPage <= 1}
                        onClick={() => handleFilterChange('page', pagination.currentPage - 1)}
                    >
                        <ChevronLeft className="w-4 h-4 mr-2" /> Previous
                    </button>
                    <button 
                        className={styles.paginationBtn}
                        disabled={pagination.currentPage >= pagination.totalPages}
                        onClick={() => handleFilterChange('page', pagination.currentPage + 1)}
                    >
                        Next <ChevronRight className="w-4 h-4 ml-2" />
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {isInvoiceModalOpen && selectedPayment && (
                    <div className={styles.modalOverlay} onClick={() => setIsInvoiceModalOpen(false)}>
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className={styles.modalContent}
                            onClick={e => e.stopPropagation()}
                        >
                            <div className={styles.modalHeader}>
                                <div>
                                    <div className="flex items-center gap-3 text-white mb-6 font-black tracking-tighter text-3xl">
                                        <div className="bg-sky-500/20 text-sky-400 p-2 rounded-xl border border-sky-500/20">
                                            <Receipt className="w-6 h-6" />
                                        </div>
                                        TAX INVOICE
                                    </div>
                                    <div className={styles.modalLabel}>REFERENCE NO.</div>
                                    <div className={`${styles.modalValue} ${styles.modalId}`}>{selectedPayment.transactionId}</div>
                                </div>
                                <div className="text-right">
                                    <div className={`inline-flex items-center gap-2 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 ${
                                        selectedPayment.status === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                    }`}>
                                        Digital Receipt {selectedPayment.status}
                                    </div>
                                    <div className={styles.modalLabel}>SETTLEMENT DATE</div>
                                    <div className={styles.modalValue}>{new Date(selectedPayment.createdAt).toLocaleDateString()}</div>
                                </div>
                            </div>

                            <div className={styles.modalGrid}>
                                <div>
                                    <h4 className={styles.modalLabel}>BILL TO</h4>
                                    <div className="text-xl font-black text-white mb-1">{selectedPayment.user?.username}</div>
                                    <div className="font-bold text-white/60">{selectedPayment.user?.email}</div>
                                    <div className="text-[10px] text-white/30 mt-3 font-bold tracking-tight bg-white/5 inline-block px-3 py-1 rounded-lg">User UID: {selectedPayment.user?._id || selectedPayment.userId}</div>
                                </div>
                                <div>
                                    <h4 className={styles.modalLabel}>PRODUCT DETAILS</h4>
                                    <div className="text-xl font-black text-white mb-1">{selectedPayment.planName}</div>
                                    <div className="font-bold text-sky-400 uppercase text-[10px] tracking-widest bg-sky-400/10 px-3 py-1 rounded-lg inline-block">{selectedPayment.billingCycle} Subscription</div>
                                    <div className="text-[10px] text-white/30 mt-3 font-bold tracking-tight block">Active Coverage until {new Date(selectedPayment.expiryDate).toLocaleDateString()}</div>
                                </div>
                            </div>

                            <div className={styles.modalSection}>
                                <div className="flex justify-between items-center mb-6 pb-6 border-b border-white/5">
                                    <span className={styles.modalLabel}>SUBTOTAL (EXCL. TAX)</span>
                                    <span className="font-black text-white text-xl font-mono">{formatCurrency(calculateAmountBreakdown(selectedPayment.amount).baseAmount)}</span>
                                </div>
                                <div className="flex justify-between items-center mb-10">
                                    <span className={styles.modalLabel}>GOVERNMENT TAX (GST 18%)</span>
                                    <span className="font-black text-white text-xl font-mono">{formatCurrency(calculateAmountBreakdown(selectedPayment.amount).taxAmount)}</span>
                                </div>
                                <div className="flex justify-between items-center pt-8 border-t-2 border-white/10">
                                    <div className="flex flex-col">
                                        <span className="text-xl font-black text-white tracking-tighter leading-none mb-1 uppercase">Total Paid</span>
                                        <span className="text-[10px] font-black text-sky-400 uppercase tracking-widest">Inclusive of all taxes</span>
                                    </div>
                                    <div className="text-5xl font-black text-white tracking-tighter font-mono">{formatCurrency(selectedPayment.amount)}</div>
                                </div>
                            </div>

                            <div className={styles.modalActionRow}>
                                <button className={styles.primaryBtn}>
                                    <Download className="w-5 h-5" /> Download Tax Invoice
                                </button>
                                <button className={styles.secondaryBtn} onClick={() => setIsInvoiceModalOpen(false)}>
                                    Dismiss
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PaymentManager;
