import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  DollarSign, 
  TrendingUp, 
  RefreshCw, 
  Search, 
  Filter, 
  Download,
  Eye,
  Calendar,
  CreditCard,
  IndianRupee,
  X,
  User,
  Mail,
  Clock,
  Shield,
  Receipt,
  Package,
  BatteryCharging,
  BarChart,
  Battery,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowUpRight,
  Loader2,
  FileDown
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_PDF_API_URL;

const PaymentManagement = () => {
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    monthlyRevenue: 0,
    revenueGrowth: 0,
    totalTransactions: 0,
    successfulTransactions: 0,
    failedTransactions: 0,
    successRate: 0,
    revenueByPlan: [],
    recentPayments: [],
    totalCreditsSold: 0,
    avgCreditsPerPurchase: 0,
    topupRevenue: 0,
    subscriptionRevenue: 0
  });
  const [loading, setLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    status: 'all',
    plan: 'all',
    startDate: '',
    endDate: '',
    search: '',
    paymentType: 'all'
  });
  const [currency, setCurrency] = useState('USD');
  const [availablePlans, setAvailablePlans] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [refreshLoading, setRefreshLoading] = useState(false);
  const navigate = useNavigate();

  const exchangeRates = {
    USD: 1,
    INR: 83.5
  };

  const showToast = (title, description, type = "default") => {
    console.log(`Toast (${type}): ${title} - ${description}`);
    if (type === "destructive") {
      alert(`❌ ${title}: ${description}`);
    } else {
      alert(`✅ ${title}: ${description}`);
    }
  };

  const fetchAvailablePlans = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/dashboard/plans`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAvailablePlans(data.plans);
        } else {
          setAvailablePlans(['Free', 'Pro', 'Business', 'Enterprise']);
        }
      } else {
        setAvailablePlans(['Free', 'Pro', 'Business', 'Enterprise']);
      }
    } catch (error) {
      console.error("Error fetching plans:", error);
      setAvailablePlans(['Free', 'Pro', 'Business', 'Enterprise']);
    }
  };

  const fetchPaymentStats = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/dashboard/payment-stats`);
      if (!response.ok) {
        throw new Error("Failed to fetch payment statistics");
      }

      const data = await response.json();
      
      if (data.success) {
        const paymentStats = data.stats || {};
        
        setStats({
          totalRevenue: paymentStats.totalRevenue || 0,
          monthlyRevenue: paymentStats.monthlyRevenue || 0,
          subscriptionRevenue: paymentStats.subscriptionRevenue || 0,
          topupRevenue: paymentStats.topupRevenue || 0,
          totalTransactions: paymentStats.totalTransactions || 0,
          successfulTransactions: paymentStats.successfulTransactions || 0,
          successRate: paymentStats.successRate || 0,
          totalCreditsSold: paymentStats.totalCreditsSold || 0,
          avgCreditsPerPurchase: paymentStats.avgCreditsPerPurchase || 0,
          revenueByPlan: paymentStats.subscriptionRevenueByPlan || [],
          recentPayments: [],
          revenueGrowth: 0,
          failedTransactions: 0
        });
      } else {
        throw new Error(data.error || "Failed to fetch payment statistics");
      }
    } catch (error) {
      console.error("Error fetching payment stats:", error);
      showToast("Error", error.message || "Failed to load payment statistics", "destructive");
    }
  };

  const fetchPayments = async (page = 1) => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...filters
      });

      const response = await fetch(
        `${API_URL}/api/admin/dashboard/payments?${queryParams}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch payments");
      }

      const data = await response.json();
      
      if (data.success) {
        setPayments(data.payments || []);
        setTotalPages(data.stats?.totalPages || 1);
        setCurrentPage(data.stats?.currentPage || 1);
        
        setStats(prev => ({
          ...prev,
          totalRevenue: data.stats?.totalRevenue || prev.totalRevenue,
          monthlyRevenue: data.stats?.monthlyRevenue || prev.monthlyRevenue,
          totalTransactions: data.stats?.totalPayments || prev.totalTransactions
        }));
      } else {
        throw new Error(data.error || "Failed to fetch payments");
      }
    } catch (error) {
      console.error("Error fetching payments:", error);
      showToast("Error", error.message || "Failed to load payments", "destructive");
    } finally {
      setLoading(false);
      setRefreshLoading(false);
    }
  };

  const fetchPaymentDetails = async (paymentId) => {
    try {
      setDetailsLoading(true);
      const response = await fetch(
        `${API_URL}/api/admin/dashboard/payments/${paymentId}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch payment details");
      }

      const data = await response.json();
      
      if (data.success) {
        setPaymentDetails(data.payment);
      } else {
        throw new Error(data.error || "Failed to fetch payment details");
      }
    } catch (error) {
      console.error("Error fetching payment details:", error);
      showToast("Error", error.message || "Failed to load payment details", "destructive");
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleViewDetails = async (payment) => {
    setSelectedPayment(payment);
    setIsModalOpen(true);
    await fetchPaymentDetails(payment._id);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPayment(null);
    setPaymentDetails(null);
  };

  useEffect(() => {
    fetchPaymentStats();
    fetchPayments(1);
    fetchAvailablePlans();
  }, []);

  const refreshData = () => {
    setRefreshLoading(true);
    fetchPaymentStats();
    fetchPayments(currentPage);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    setCurrentPage(1);
    fetchPayments(1);
  };

  const clearFilters = () => {
    setFilters({
      status: 'all',
      plan: 'all',
      startDate: '',
      endDate: '',
      search: '',
      paymentType: 'all'
    });
    setCurrentPage(1);
    fetchPayments(1);
  };

  const toggleCurrency = () => {
    setCurrency(prev => prev === 'USD' ? 'INR' : 'USD');
  };

  const formatCurrency = (amount, originalCurrency = 'INR') => {
    if (!amount) return currency === 'INR' ? '₹0.00' : '$0.00';
    
    let finalAmount = amount;
    
    if (originalCurrency === 'INR' && currency === 'USD') {
      finalAmount = amount / exchangeRates.INR;
    } else if (originalCurrency === 'USD' && currency === 'INR') {
      finalAmount = amount * exchangeRates.INR;
    }

    return new Intl.NumberFormat(currency === 'INR' ? 'en-IN' : 'en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(finalAmount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return '#dcfce7';
      case 'failed': return '#fee2e2';
      case 'pending': return '#fef3c7';
      case 'refunded': return '#dbeafe';
      default: return '#f1f5f9';
    }
  };

  const getStatusTextColor = (status) => {
    switch (status) {
      case 'success': return '#166534';
      case 'failed': return '#991b1b';
      case 'pending': return '#92400e';
      case 'refunded': return '#1e40af';
      default: return '#475569';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4" style={{ color: '#166534' }} />;
      case 'failed': return <XCircle className="h-4 w-4" style={{ color: '#991b1b' }} />;
      case 'pending': return <AlertCircle className="h-4 w-4" style={{ color: '#92400e' }} />;
      case 'refunded': return <RefreshCw className="h-4 w-4" style={{ color: '#1e40af' }} />;
      default: return <Clock className="h-4 w-4" style={{ color: '#475569' }} />;
    }
  };

  const exportToCSV = async () => {
    try {
      setExportLoading(true);
      const queryParams = new URLSearchParams({
        page: '1',
        limit: '10000',
        ...filters
      });

      const response = await fetch(
        `${API_URL}/api/admin/dashboard/payments?${queryParams}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch payments for export");
      }

      const data = await response.json();
      
      if (!data.success || !data.payments || data.payments.length === 0) {
        showToast("No Data", "No payments data to export for the selected filters", "destructive");
        return;
      }

      const exportPayments = data.payments;
      const headers = [
        'Transaction ID',
        'Payment Type',
        'User Name',
        'User Email',
        'Plan/Package',
        'Credits',
        'Amount',
        'Currency',
        'Billing Cycle',
        'Status',
        'Payment Date',
        'User Plan',
        'Auto Renewal',
        'Created Date'
      ];

      const rows = exportPayments.map(payment => [
        payment.transactionId || payment._id || '',
        payment.paymentType || 'subscription',
        payment.user?.name || payment.userId?.name || '',
        payment.user?.email || payment.userId?.email || payment.userSnapshot?.email || '',
        payment.paymentType === 'topup' 
          ? payment.topupPackage?.name || payment.package?.name || 'Topup Credits'
          : payment.planName || payment.displayPlan || '',
        payment.paymentType === 'topup' ? (payment.credits || payment.creditsAllocated?.total || 0) : '',
        payment.amount || 0,
        payment.currency || 'INR',
        payment.billingCycle || (payment.paymentType === 'topup' ? 'one-time' : 'monthly'),
        payment.status || '',
        formatDate(payment.createdAt),
        payment.user?.plan || payment.userId?.planName || '',
        payment.autoRenewal ? 'Yes' : 'No',
        new Date(payment.createdAt).toISOString()
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => 
          row.map(cell => {
            const cellStr = String(cell);
            if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n') || cellStr.includes('\r')) {
              return `"${cellStr.replace(/"/g, '""')}"`;
            }
            return cellStr;
          }).join(',')
        )
      ].join('\n');

      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      
      let filename = `payments_${new Date().toISOString().split('T')[0]}`;
      if (filters.startDate && filters.endDate) {
        filename = `payments_${filters.startDate}_to_${filters.endDate}`;
      } else if (filters.startDate) {
        filename = `payments_from_${filters.startDate}`;
      } else if (filters.endDate) {
        filename = `payments_until_${filters.endDate}`;
      }
      
      link.setAttribute('download', `${filename}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast("Export Successful", `Exported ${exportPayments.length} payments to CSV`, "default");

    } catch (error) {
      console.error("Error exporting to CSV:", error);
      showToast("Export Failed", error.message || "Failed to export payments data", "destructive");
    } finally {
      setExportLoading(false);
    }
  };

  const PaymentDetailsModal = () => {
    if (!isModalOpen) return null;

    const payment = paymentDetails || selectedPayment;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
        >
          <div className="flex justify-between items-center p-6 border-b border-gray-200" style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white"
          }}>
            <div className="flex items-center gap-3">
              {payment?.paymentType === 'topup' ? (
                <BatteryCharging className="h-6 w-6 text-white" />
              ) : (
                <CreditCard className="h-6 w-6 text-white" />
              )}
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {payment?.paymentType === 'topup' ? 'Topup ' : ''}Payment Details
                </h2>
                <p className="text-white opacity-80">Complete transaction information</p>
              </div>
            </div>
            <button
              onClick={closeModal}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>

          {detailsLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : payment ? (
            <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Receipt className="h-5 w-5 text-blue-600" />
                    Transaction Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Transaction ID:</span>
                      <code className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                        {payment.transactionId || payment._id}
                      </code>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Amount:</span>
                      <span className="font-bold text-lg text-green-600">
                        {formatCurrency(payment.amount, payment.currency || 'INR')}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Status:</span>
                      <span style={{
                        padding: "4px 12px",
                        borderRadius: "20px",
                        fontSize: "12px",
                        fontWeight: "600",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        backgroundColor: getStatusColor(payment.status),
                        color: getStatusTextColor(payment.status)
                      }}>
                        {getStatusIcon(payment.status)}
                        {payment.status}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Payment Type:</span>
                      <span className="font-medium text-gray-900 capitalize">
                        {payment.paymentType}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Payment Date:</span>
                      <span className="text-gray-900">
                        {formatDate(payment.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Package className="h-5 w-5 text-purple-600" />
                    {payment.paymentType === 'topup' ? 'Package Details' : 'Plan Details'}
                  </h3>
                  <div className="space-y-3">
                    {payment.paymentType === 'topup' ? (
                      <>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Package:</span>
                          <span className="font-medium text-gray-900">
                            {payment.topupPackage?.name || payment.package?.name || 'Topup Credits'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Credits:</span>
                          <div className="flex items-center gap-2">
                            <Battery className="h-4 w-4 text-emerald-600" />
                            <span className="font-bold text-emerald-700">
                              {payment.credits || payment.creditsAllocated?.total || 0}
                            </span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Billing Cycle:</span>
                          <span className="font-medium text-gray-900 capitalize">
                            {payment.billingCycle || 'one-time'}
                          </span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Plan Name:</span>
                          <span className="font-medium text-gray-900">
                            {payment.planName || payment.displayPlan || 'Unknown'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Billing Cycle:</span>
                          <span className="font-medium text-gray-900 capitalize">
                            {payment.billingCycle || 'monthly'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Auto Renewal:</span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            payment.autoRenewal ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {payment.autoRenewal ? 'Enabled' : 'Disabled'}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <User className="h-5 w-5 text-indigo-600" />
                  User Information
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="font-medium text-gray-700">Name:</span>
                      </div>
                      <p className="text-gray-900 ml-6">
                        {payment.user?.name || payment.userId?.name || 'Unknown User'}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <span className="font-medium text-gray-700">Email:</span>
                      </div>
                      <p className="text-gray-900 ml-6">
                        {payment.user?.email || payment.userId?.email || payment.userSnapshot?.email || 'No email'}
                      </p>
                    </div>
                    {payment.user?.plan && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-gray-500" />
                          <span className="font-medium text-gray-700">Current Plan:</span>
                        </div>
                        <p className="text-gray-900 ml-6 capitalize">
                          {payment.user.plan}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={closeModal}
                  style={{
                    border: "none",
                    padding: "10px 20px",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: "pointer",
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    color: "white",
                    transition: "all 0.3s ease"
                  }}
                  onMouseEnter={(e) => e.target.style.transform = "scale(1.05)"}
                  onMouseLeave={(e) => e.target.style.transform = "scale(1)"}
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <CreditCard className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">Payment Not Found</h3>
              <p className="text-gray-500">Unable to load payment details</p>
            </div>
          )}
        </motion.div>
      </div>
    );
  };

  if (loading && payments.length === 0) {
    return (
      <div style={{
        padding: "30px",
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
      }}>
        <div style={{ textAlign: "center" }}>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p style={{ marginTop: "20px", color: "#64748b" }}>Loading payment data...</p>
        </div>
      </div>
    );
  }

  const styles = {
    container: {
      padding: "30px",
      background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
      minHeight: "100vh",
    },
    card: {
      background: "white",
      borderRadius: "20px",
      padding: "30px",
      boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "30px",
      flexWrap: "wrap",
      gap: "20px",
    },
    title: {
      fontSize: "32px",
      fontWeight: "700",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      margin: 0,
    },
    searchBox: {
      position: "relative",
      display: "flex",
      alignItems: "center",
    },
    searchIcon: {
      position: "absolute",
      left: "15px",
      width: "20px",
      height: "20px",
      color: "#667eea",
    },
    searchInput: {
      padding: "12px 20px 12px 45px",
      border: "2px solid #e2e8f0",
      borderRadius: "15px",
      fontSize: "16px",
      width: "300px",
      outline: "none",
    },
    actionButtons: {
      display: "flex",
      gap: "10px",
      flexWrap: "wrap",
    },
    button: {
      border: "none",
      padding: "12px 25px",
      borderRadius: "15px",
      fontSize: "16px",
      fontWeight: "600",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      transition: "all 0.3s ease",
    },
    exportButton: {
      background: "linear-gradient(135deg, #4CAF50 0%, #45a049 100%)",
      color: "white",
    },
    currencyButton: {
      background: "linear-gradient(135deg, #FF9800 0%, #F57C00 100%)",
      color: "white",
    },
    refreshButton: {
      background: "linear-gradient(135deg, #2196F3 0%, #1976D2 100%)",
      color: "white",
    },
    viewButton: {
      background: "linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)",
      color: "white",
    },
    disabledButton: {
      opacity: 0.7,
      cursor: "not-allowed",
    },
    tableContainer: {
      overflow: "hidden",
      borderRadius: "15px",
      background: "white",
      boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
    },
    tableHeader: {
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      color: "white",
    },
    tableHeaderCell: {
      padding: "18px 20px",
      textAlign: "left",
      fontWeight: "600",
    },
    tableCell: {
      padding: "16px 20px",
      color: "#475569",
    },
  };

  const statCards = [
    {
      label: "Total Revenue",
      value: formatCurrency(stats.totalRevenue, 'USD'),
      icon: DollarSign,
      gradient: "linear-gradient(135deg, #4CAF50 0%, #45a049 100%)",
      description: "All time revenue"
    },
    {
      label: "Monthly Revenue",
      value: formatCurrency(stats.monthlyRevenue, 'USD'),
      icon: TrendingUp,
      gradient: "linear-gradient(135deg, #2196F3 0%, #1976D2 100%)",
      description: "Last 30 days"
    },
    {
      label: "Total Transactions",
      value: stats.totalTransactions.toLocaleString(),
      icon: CreditCard,
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      description: "All transactions"
    },
    {
      label: "Success Rate",
      value: `${Math.round(stats.successRate)}%`,
      icon: BarChart,
      gradient: "linear-gradient(135deg, #FF9800 0%, #F57C00 100%)",
      description: `${stats.successfulTransactions} successful`
    },
    {
      label: "Credits Sold",
      value: stats.totalCreditsSold.toLocaleString(),
      icon: BatteryCharging,
      gradient: "linear-gradient(135deg, #009688 0%, #00796B 100%)",
      description: "Total topup credits"
    }
  ];

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>Payment Management</h1>
          
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <div style={styles.searchBox}>
              <Search style={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search transactions, users..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                style={styles.searchInput}
              />
            </div>
            
            <div style={styles.actionButtons}>
              <button
                onClick={toggleCurrency}
                style={{ ...styles.button, ...styles.currencyButton }}
              >
                {currency === 'INR' ? (
                  <>
                    <IndianRupee className="h-4 w-4" />
                    <span>INR</span>
                  </>
                ) : (
                  <>
                    <DollarSign className="h-4 w-4" />
                    <span>USD</span>
                  </>
                )}
              </button>

              <button
                onClick={exportToCSV}
                disabled={payments.length === 0 || exportLoading}
                style={{
                  ...styles.button,
                  ...styles.exportButton,
                  ...(exportLoading && styles.disabledButton)
                }}
              >
                {exportLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <FileDown className="h-4 w-4" />
                )}
                {exportLoading ? 'Exporting...' : 'Export CSV'}
              </button>
              
              <button
                onClick={refreshData}
                disabled={refreshLoading}
                style={{
                  ...styles.button,
                  ...styles.refreshButton,
                  ...(refreshLoading && styles.disabledButton)
                }}
              >
                {refreshLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                {refreshLoading ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px", marginBottom: "30px" }}>
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                style={{
                  background: stat.gradient,
                  color: "white",
                  borderRadius: "15px",
                  padding: "20px",
                  boxShadow: "0 10px 20px rgba(0, 0, 0, 0.1)",
                  transition: "all 0.3s ease"
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-5px)"}
                onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <p style={{ fontSize: "14px", opacity: 0.9, marginBottom: "8px", fontWeight: "500" }}>{stat.label}</p>
                    <h3 style={{ fontSize: "24px", fontWeight: "700", marginBottom: "4px" }}>{stat.value}</h3>
                    <p style={{ fontSize: "12px", opacity: 0.8, fontWeight: "500" }}>{stat.description}</p>
                  </div>
                  <div style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "10px",
                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Filters */}
        <div style={{
          background: "white",
          borderRadius: "15px",
          padding: "20px",
          boxShadow: "0 10px 20px rgba(0, 0, 0, 0.1)",
          marginBottom: "25px"
        }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            <div style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, minWidth: "200px" }}>
                <Filter className="h-4 w-4 text-gray-500" />
                <select
                  value={filters.paymentType}
                  onChange={(e) => handleFilterChange('paymentType', e.target.value)}
                  style={{
                    border: "2px solid #e2e8f0",
                    borderRadius: "10px",
                    padding: "10px",
                    fontSize: "14px",
                    width: "100%",
                    outline: "none",
                    cursor: "pointer"
                  }}
                >
                  <option value="all">All Types</option>
                  <option value="subscription">Subscription</option>
                  <option value="topup">Topup</option>
                </select>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, minWidth: "200px" }}>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  style={{
                    border: "2px solid #e2e8f0",
                    borderRadius: "10px",
                    padding: "10px",
                    fontSize: "14px",
                    width: "100%",
                    outline: "none",
                    cursor: "pointer"
                  }}
                >
                  <option value="all">All Status</option>
                  <option value="success">Success</option>
                  <option value="failed">Failed</option>
                  <option value="pending">Pending</option>
                </select>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, minWidth: "200px" }}>
                <select
                  value={filters.plan}
                  onChange={(e) => handleFilterChange('plan', e.target.value)}
                  style={{
                    border: "2px solid #e2e8f0",
                    borderRadius: "10px",
                    padding: "10px",
                    fontSize: "14px",
                    width: "100%",
                    outline: "none",
                    cursor: "pointer"
                  }}
                >
                  <option value="all">All Plans</option>
                  {availablePlans.map(plan => (
                    <option key={plan} value={plan}>
                      {plan}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, minWidth: "200px" }}>
                <Calendar className="h-4 w-4 text-gray-500" />
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  style={{
                    border: "2px solid #e2e8f0",
                    borderRadius: "10px",
                    padding: "10px",
                    fontSize: "14px",
                    width: "100%",
                    outline: "none",
                    cursor: "pointer"
                  }}
                />
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, minWidth: "200px" }}>
                <span style={{ color: "#64748b" }}>to</span>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  style={{
                    border: "2px solid #e2e8f0",
                    borderRadius: "10px",
                    padding: "10px",
                    fontSize: "14px",
                    width: "100%",
                    outline: "none",
                    cursor: "pointer"
                  }}
                />
              </div>

              <div style={{ display: "flex", gap: "10px", flex: 2 }}>
                <button
                  onClick={applyFilters}
                  style={{
                    border: "none",
                    padding: "12px 25px",
                    borderRadius: "10px",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: "pointer",
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    color: "white",
                    transition: "all 0.3s ease",
                    flex: 1
                  }}
                  onMouseEnter={(e) => e.target.style.transform = "scale(1.05)"}
                  onMouseLeave={(e) => e.target.style.transform = "scale(1)"}
                >
                  Apply Filters
                </button>
                <button
                  onClick={clearFilters}
                  style={{
                    border: "2px solid #667eea",
                    padding: "12px 25px",
                    borderRadius: "10px",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: "pointer",
                    background: "transparent",
                    color: "#667eea",
                    transition: "all 0.3s ease",
                    flex: 1
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = "rgba(102, 126, 234, 0.1)"}
                  onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Payments Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={styles.tableContainer}
        >
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "20px",
            borderBottom: "1px solid #e2e8f0"
          }}>
            <h2 style={{ fontSize: "20px", fontWeight: "600", color: "#374151" }}>
              All Payments ({payments.length})
            </h2>
            <div style={{ fontSize: "14px", color: "#64748b", fontWeight: "500" }}>
              Page {currentPage} of {totalPages}
            </div>
          </div>

          {payments.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px" }}>
              <CreditCard className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 style={{ fontSize: "18px", fontWeight: "600", color: "#374151", marginBottom: "8px" }}>
                No Payments Found
              </h3>
              <p style={{ color: "#64748b" }}>
                {Object.values(filters).some(filter => filter && filter !== 'all') 
                  ? "Try adjusting your filter criteria."
                  : "No payments have been processed yet."
                }
              </p>
            </div>
          ) : (
            <>
              <div style={{ overflowX: "auto" }}>
                <table style={styles.table}>
                  <thead style={styles.tableHeader}>
                    <tr>
                      <th style={styles.tableHeaderCell}>Transaction ID</th>
                      <th style={styles.tableHeaderCell}>User</th>
                      <th style={styles.tableHeaderCell}>Plan/Package</th>
                      <th style={styles.tableHeaderCell}>Amount</th>
                      <th style={styles.tableHeaderCell}>Status</th>
                      <th style={styles.tableHeaderCell}>Date</th>
                      <th style={styles.tableHeaderCell}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment, index) => (
                      <tr key={payment._id} style={{
                        borderBottom: "1px solid #f1f5f9",
                        backgroundColor: index % 2 === 0 ? "#f8fafc" : "white"
                      }}>
                        <td style={{ ...styles.tableCell, padding: "14px 20px" }}>
                          <div style={{ maxWidth: "150px" }}>
                            <code style={{
                              fontSize: "12px",
                              fontFamily: "monospace",
                              color: "#475569",
                              backgroundColor: "#f1f5f9",
                              padding: "4px 8px",
                              borderRadius: "6px",
                              display: "block",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap"
                            }}>
                              {payment.transactionId?.slice(0, 10)}...
                            </code>
                          </div>
                        </td>
                        <td style={{ ...styles.tableCell, padding: "14px 20px" }}>
                          <div style={{ maxWidth: "180px" }}>
                            <p style={{ fontWeight: "500", color: "#1e293b", fontSize: "14px", marginBottom: "4px", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {payment.user?.name || payment.userId?.name || 'Unknown'}
                            </p>
                            <p style={{ fontSize: "12px", color: "#64748b", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {payment.user?.email || payment.userId?.email || 'No email'}
                            </p>
                          </div>
                        </td>
                        <td style={{ ...styles.tableCell, padding: "14px 20px" }}>
                          <div style={{ maxWidth: "150px" }}>
                            {payment.paymentType === 'topup' ? (
                              <>
                                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                                  <BatteryCharging className="h-3 w-3 text-emerald-600 flex-shrink-0" />
                                  <p style={{ fontWeight: "500", color: "#1e293b", fontSize: "14px", overflow: "hidden", textOverflow: "ellipsis" }}>
                                    {payment.topupPackage?.name || payment.package?.name || 'Topup'}
                                  </p>
                                </div>
                                {payment.credits > 0 && (
                                  <p style={{ fontSize: "12px", color: "#059669", fontWeight: "500" }}>
                                    {payment.credits} credits
                                  </p>
                                )}
                              </>
                            ) : (
                              <>
                                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                                  <CreditCard className="h-3 w-3 text-blue-600 flex-shrink-0" />
                                  <p style={{ fontWeight: "500", color: "#1e293b", fontSize: "14px", overflow: "hidden", textOverflow: "ellipsis" }}>
                                    {payment.planName || payment.displayPlan || 'Plan'}
                                  </p>
                                </div>
                                <p style={{ fontSize: "12px", color: "#2563eb", textTransform: "capitalize" }}>
                                  {payment.billingCycle || 'monthly'}
                                </p>
                              </>
                            )}
                          </div>
                        </td>
                        <td style={{ ...styles.tableCell, padding: "14px 20px" }}>
                          <span style={{ fontWeight: "600", color: "#1e293b", fontSize: "14px" }}>
                            {formatCurrency(payment.amount, payment.currency || 'INR')}
                          </span>
                        </td>
                        <td style={{ ...styles.tableCell, padding: "14px 20px" }}>
                          <span style={{
                            padding: "4px 12px",
                            borderRadius: "20px",
                            fontSize: "12px",
                            fontWeight: "600",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            backgroundColor: getStatusColor(payment.status),
                            color: getStatusTextColor(payment.status)
                          }}>
                            {getStatusIcon(payment.status)}
                            {payment.status}
                          </span>
                        </td>
                        <td style={{ ...styles.tableCell, padding: "14px 20px" }}>
                          <span style={{ fontSize: "12px", color: "#64748b", whiteSpace: "nowrap" }}>
                            {new Date(payment.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                        </td>
                        <td style={{ ...styles.tableCell, padding: "14px 20px" }}>
                          <button 
                            onClick={() => handleViewDetails(payment)}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                              padding: "6px 12px",
                              backgroundColor: "#dbeafe",
                              color: "#1d4ed8",
                              borderRadius: "8px",
                              fontSize: "12px",
                              fontWeight: "500",
                              border: "none",
                              cursor: "pointer",
                              transition: "all 0.2s ease"
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = "#bfdbfe";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = "#dbeafe";
                            }}
                          >
                            <Eye className="h-3 w-3" />
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "8px",
                  padding: "20px",
                  borderTop: "1px solid #e2e8f0"
                }}>
                  <button
                    onClick={() => {
                      const newPage = currentPage - 1;
                      setCurrentPage(newPage);
                      fetchPayments(newPage);
                    }}
                    disabled={currentPage === 1}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "8px 16px",
                      border: "1px solid #cbd5e1",
                      borderRadius: "8px",
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "#475569",
                      background: "white",
                      cursor: currentPage === 1 ? "not-allowed" : "pointer",
                      opacity: currentPage === 1 ? 0.5 : 1,
                      transition: "all 0.2s ease"
                    }}
                    onMouseEnter={(e) => {
                      if (currentPage !== 1) {
                        e.currentTarget.style.backgroundColor = "#f1f5f9";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (currentPage !== 1) {
                        e.currentTarget.style.backgroundColor = "white";
                      }
                    }}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </button>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => {
                          setCurrentPage(page);
                          fetchPayments(page);
                        }}
                        style={{
                          padding: "8px 12px",
                          minWidth: "40px",
                          border: "1px solid",
                          borderRadius: "8px",
                          fontSize: "14px",
                          fontWeight: "500",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                          ...(currentPage === page
                            ? {
                                backgroundColor: "#3b82f6",
                                color: "white",
                                borderColor: "#3b82f6"
                              }
                            : {
                                backgroundColor: "white",
                                color: "#475569",
                                borderColor: "#cbd5e1"
                              })
                        }}
                        onMouseEnter={(e) => {
                          if (currentPage !== page) {
                            e.currentTarget.style.backgroundColor = "#f1f5f9";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (currentPage !== page) {
                            e.currentTarget.style.backgroundColor = "white";
                          }
                        }}
                      >
                        {page}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => {
                      const newPage = currentPage + 1;
                      setCurrentPage(newPage);
                      fetchPayments(newPage);
                    }}
                    disabled={currentPage === totalPages}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "8px 16px",
                      border: "1px solid #cbd5e1",
                      borderRadius: "8px",
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "#475569",
                      background: "white",
                      cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                      opacity: currentPage === totalPages ? 0.5 : 1,
                      transition: "all 0.2s ease"
                    }}
                    onMouseEnter={(e) => {
                      if (currentPage !== totalPages) {
                        e.currentTarget.style.backgroundColor = "#f1f5f9";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (currentPage !== totalPages) {
                        e.currentTarget.style.backgroundColor = "white";
                      }
                    }}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </motion.div>
      </div>
      <PaymentDetailsModal />
    </div>
  );
};

export default PaymentManagement;