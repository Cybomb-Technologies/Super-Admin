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
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">Tax Invoice</h3>
                            <button
                                onClick={() => setIsInvoiceModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Invoice Header */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                            {/* Company Info */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Receipt className="w-5 h-5 text-blue-600" />
                                    <h4 className="font-semibold">{invoiceData.company.name}</h4>
                                </div>
                                <p className="text-sm text-gray-600">{invoiceData.company.address}</p>
                                <p className="text-sm text-gray-600">{invoiceData.company.city}</p>
                                <p className="text-sm text-gray-600">{invoiceData.company.email}</p>
                                <p className="text-sm text-gray-600">{invoiceData.company.website}</p>
                                <p className="text-sm text-gray-500">GSTIN: {invoiceData.company.gstin}</p>
                            </div>

                            {/* Invoice Info */}
                            <div className="text-right space-y-2">
                                <h2 className="text-2xl font-bold">TAX INVOICE</h2>
                                <div className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                                    {invoiceData.status.toUpperCase()}
                                </div>
                                <div className="space-y-1 text-sm">
                                    <p>Invoice #: {invoiceData.invoiceNumber}</p>
                                    <p>Date: {new Date(invoiceData.date).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>

                        {/* Bill To Section */}
                        <div className="mb-8 p-4 bg-gray-50 rounded-lg">
                            <h4 className="font-medium mb-2">Bill To:</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <p className="font-medium">{invoiceData.customer.name}</p>
                                    <p className="text-sm text-gray-600">{invoiceData.customer.email}</p>
                                    <p className="text-sm text-gray-500">Customer ID: {invoiceData.customer.userId}</p>
                                </div>
                            </div>
                        </div>

                        {/* Invoice Items Table */}
                        <div className="mb-8">
                            <h4 className="font-medium mb-4">Invoice Items</h4>
                            <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Description</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Billing Period</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Unit Price (excl. tax)</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Qty</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Amount (excl. tax)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoiceData.items.map((item) => (
                                        <tr key={item.id} className="border-t border-gray-200">
                                            <td className="px-4 py-3">{item.description}</td>
                                            <td className="px-4 py-3">{item.billingPeriod}</td>
                                            <td className="px-4 py-3">{formatCurrency(item.unitPrice, invoiceData.currency)}</td>
                                            <td className="px-4 py-3">{item.quantity}</td>
                                            <td className="px-4 py-3 font-medium">
                                                {formatCurrency(item.amount, invoiceData.currency)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Invoice Summary */}
                        <div className="flex justify-end">
                            <div className="w-80 space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Subtotal (excl. tax):</span>
                                    <span className="font-medium">
                                        {formatCurrency(invoiceData.baseAmount, invoiceData.currency)}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600 flex items-center">
                                        <Percent className="w-3 h-3 mr-1" />
                                        GST ({invoiceData.taxRate}%):
                                    </span>
                                    <span className="font-medium">
                                        {formatCurrency(invoiceData.taxAmount, invoiceData.currency)}
                                    </span>
                                </div>
                                <div className="flex justify-between pt-3 border-t border-gray-300">
                                    <span className="text-lg font-semibold">Total Amount:</span>
                                    <span className="text-xl font-bold">
                                        {formatCurrency(invoiceData.totalAmount, invoiceData.currency)}
                                    </span>
                                </div>

                                {/* Breakdown */}
                                <div className="mt-4 p-3 bg-blue-50 rounded text-xs">
                                    <p className="font-medium mb-2">Amount Breakdown:</p>
                                    <div className="grid grid-cols-2 gap-1">
                                        <span>Base Amount:</span>
                                        <span className="text-right">
                                            {formatCurrency(invoiceData.baseAmount, invoiceData.currency)}
                                        </span>
                                        <span>GST ({invoiceData.taxRate}%):</span>
                                        <span className="text-right">
                                            {formatCurrency(invoiceData.taxAmount, invoiceData.currency)}
                                        </span>
                                        <span className="font-semibold">Total Paid:</span>
                                        <span className="text-right font-semibold">
                                            {formatCurrency(invoiceData.totalAmount, invoiceData.currency)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Payment Information */}
                        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                            <h4 className="font-medium mb-3">Payment Information</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">Payment Method</p>
                                    <p className="font-medium">{invoiceData.paymentMethod}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Plan</p>
                                    <p className="font-medium">{invoiceData.plan}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Billing Cycle</p>
                                    <p className="font-medium capitalize">{invoiceData.billingCycle}</p>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
                            <p>This is a computer-generated invoice and does not require a signature.</p>
                            <p>GST @ {invoiceData.taxRate}% is included in the total amount.</p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 justify-end mt-8 pt-6 border-t">
                            <button
                                onClick={() => setIsInvoiceModalOpen(false)}
                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => {
                                    // Here you can implement PDF download functionality
                                    toast({
                                        title: "Invoice Downloaded",
                                        description: "Invoice PDF has been generated",
                                    });
                                }}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                            >
                                <Receipt className="w-4 h-4" />
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
                <div className="w-16 h-16 border-4 border-sky-500/20 border-t-sky-500 rounded-full animate-spin"></div>
                <div className="font-black text-slate-400 uppercase tracking-[0.2em] text-xs">Synchronizing Ledger...</div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.headerInner}>
                    <div className={styles.headerTitle}>
                        <div className={styles.iconWrapper}>
                            <Receipt className="w-8 h-8" />
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
                            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl h-14 px-8 font-black shadow-xl shadow-emerald-900/20 flex items-center justify-center transition-all disabled:opacity-50"
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
                            <div className={styles.statIcon} style={{ background: '#f0f9ff', color: '#0ea5e9' }}>
                                <DollarSign className="w-5 h-5 font-bold" />
                            </div>
                        </div>
                        <div className={styles.statValue}>{formatCurrency(stats.totalRevenue)}</div>
                        <div className={`${styles.statTrend} text-emerald-600`}>
                            <ArrowUpRight className="w-3 h-3" /> +12% growth
                        </div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statHeader}>
                            <span className={styles.statLabel}>Success Rate</span>
                            <div className={styles.statIcon} style={{ background: '#ecfdf5', color: '#10b981' }}>
                                <TrendingUp className="w-5 h-5 font-bold" />
                            </div>
                        </div>
                        <div className={styles.statValue}>{stats.successRate}%</div>
                        <div className={`${styles.statTrend} text-emerald-600`}>
                            <CheckCircle className="w-3 h-3" /> Healthy status
                        </div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statHeader}>
                            <span className={styles.statLabel}>Active Subs</span>
                            <div className={styles.statIcon} style={{ background: '#f5f3ff', color: '#8b5cf6' }}>
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
                            <div className={styles.statIcon} style={{ background: '#fffbeb', color: '#f59e0b' }}>
                                <Calendar className="w-5 h-5 font-bold" />
                            </div>
                        </div>
                        <div className={styles.statValue}>{stats.upcomingRenewals?.length || 0}</div>
                        <div className={`${styles.statTrend} text-orange-600`}>
                            Upcoming 7 days
                        </div>
                    </div>
                </div>
            )}

            <div className={styles.filterBar}>
                <div className={styles.searchBox}>
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input 
                        className="w-full h-14 pl-14 pr-6 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-sky-500/10 outline-none font-bold transition-all text-slate-900"
                        placeholder="Filter by transaction ref or user email..."
                        value={filters.search}
                        onChange={e => handleFilterChange('search', e.target.value)}
                    />
                </div>
                <div className="flex gap-4">
                    <select
                        className="h-14 px-6 rounded-2xl border border-slate-200 bg-slate-50 font-bold focus:bg-white focus:ring-4 focus:ring-sky-500/10 outline-none transition-all cursor-pointer text-slate-900"
                        value={filters.status}
                        onChange={(e) => handleFilterChange('status', e.target.value)}
                    >
                        <option value="">All Transactions</option>
                        <option value="success">Successful Only</option>
                        <option value="pending">Pending Review</option>
                        <option value="failed">Failed Logs</option>
                    </select>
                </div>
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
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-black text-slate-400 border border-slate-200">
                                {payment.user?.username?.charAt(0) || 'U'}
                            </div>
                            <div>
                                <div className="font-black text-slate-900 leading-none mb-1">{payment.user?.username || 'Guest'}</div>
                                <div className="text-[10px] font-black text-sky-600 uppercase tracking-widest leading-none">{payment.planName}</div>
                            </div>
                        </div>
                        <div className="font-mono text-xs font-bold text-slate-400 truncate pr-4">
                            {payment.transactionId}
                        </div>
                        <div className="text-slate-600 font-bold">
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

            <div className="flex items-center justify-between mt-8 mb-20 px-4">
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                    Ledger Page {pagination.currentPage} / {pagination.totalPages}
                </span>
                <div className="flex gap-2">
                    <button 
                        className="h-12 px-6 rounded-xl border border-slate-200 font-black text-slate-600 hover:bg-slate-50 transition-all disabled:opacity-20 flex items-center gap-2"
                        disabled={pagination.currentPage <= 1}
                        onClick={() => handleFilterChange('page', pagination.currentPage - 1)}
                    >
                        <ChevronLeft className="w-4 h-4" /> Prev
                    </button>
                    <button 
                        className="h-12 px-6 rounded-xl border border-slate-200 font-black text-slate-600 hover:bg-slate-50 transition-all disabled:opacity-20 flex items-center gap-2"
                        disabled={pagination.currentPage >= pagination.totalPages}
                        onClick={() => handleFilterChange('page', pagination.currentPage + 1)}
                    >
                        Next <ChevronRight className="w-4 h-4" />
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
                            <div className="p-10">
                                <div className="flex justify-between items-start mb-12">
                                    <div>
                                        <div className="flex items-center gap-3 text-slate-900 mb-6 font-black tracking-tighter text-3xl">
                                            <div className="bg-slate-900 text-white p-2 rounded-xl">
                                                <Receipt className="w-6 h-6" />
                                            </div>
                                            TAX INVOICE
                                        </div>
                                        <div className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-1">REFERENCE NO.</div>
                                        <div className="font-mono font-black text-slate-900">{selectedPayment.transactionId}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className={`inline-flex items-center gap-2 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 ${
                                            selectedPayment.status === 'success' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                                        }`}>
                                            Digital Receipt {selectedPayment.status}
                                        </div>
                                        <div className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-1">SETTLEMENT DATE</div>
                                        <div className="font-black text-slate-900">{new Date(selectedPayment.createdAt).toLocaleDateString()}</div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-20 mb-12 border-y border-slate-100 py-10">
                                    <div>
                                        <h4 className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-4">BILL TO</h4>
                                        <div className="text-xl font-black text-slate-900 mb-1">{selectedPayment.user?.username}</div>
                                        <div className="font-bold text-slate-500">{selectedPayment.user?.email}</div>
                                        <div className="text-xs text-slate-400 mt-2 font-bold tracking-tight">User UID: {selectedPayment.user?._id || selectedPayment.userId}</div>
                                    </div>
                                    <div>
                                        <h4 className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-4">PRODUCT DETAILS</h4>
                                        <div className="text-xl font-black text-slate-900 mb-1">{selectedPayment.planName}</div>
                                        <div className="font-bold text-slate-500 uppercase text-xs tracking-widest">{selectedPayment.billingCycle} Subscription</div>
                                        <div className="text-xs text-slate-400 mt-2 font-bold tracking-tight">Active Coverage until {new Date(selectedPayment.expiryDate).toLocaleDateString()}</div>
                                    </div>
                                </div>

                                <div className="bg-slate-50 rounded-[2.5rem] p-10 mb-12 border border-slate-200/50">
                                    <div className="flex justify-between items-center mb-6 pb-6 border-b border-slate-200/60">
                                        <span className="font-bold text-slate-500 uppercase text-xs tracking-widest">SUBTOTAL (EXCL. TAX)</span>
                                        <span className="font-black text-slate-900 text-xl">{formatCurrency(calculateAmountBreakdown(selectedPayment.amount).baseAmount)}</span>
                                    </div>
                                    <div className="flex justify-between items-center mb-10">
                                        <span className="font-bold text-slate-500 uppercase text-xs tracking-widest">GOVERNMENT TAX (GST 18%)</span>
                                        <span className="font-black text-slate-900 text-xl">{formatCurrency(calculateAmountBreakdown(selectedPayment.amount).taxAmount)}</span>
                                    </div>
                                    <div className="flex justify-between items-center pt-10 border-t-4 border-white">
                                        <div className="flex flex-col">
                                            <span className="text-2xl font-black text-slate-900 tracking-tighter leading-none mb-1 uppercase">Total Final Paid</span>
                                            <span className="text-[10px] font-black text-sky-600 uppercase tracking-widest">Inclusive of all local taxes</span>
                                        </div>
                                        <div className="text-5xl font-black text-slate-900 tracking-tighter">{formatCurrency(selectedPayment.amount)}</div>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <button className="flex-1 h-16 rounded-[1.25rem] bg-slate-900 hover:bg-black text-white font-black text-lg transition-all active:scale-[0.98] shadow-2xl shadow-slate-900/20 flex items-center justify-center gap-3">
                                        <Download className="w-5 h-5" /> Download Tax Invoice
                                    </button>
                                    <button className="h-16 px-10 rounded-[1.25rem] border-2 border-slate-200 font-black text-slate-600 hover:bg-slate-50 transition-all" onClick={() => setIsInvoiceModalOpen(false)}>
                                        Dismiss
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PaymentManager;
