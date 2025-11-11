import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";
import Adminheader from "./components/Adminheader";
import ProtectedRoute from "./components/ProtectedRoute";

import Dashboard from "./pages/Dashboard";
import ProductList from "./pages/products/ProductList";
import ProductAdd from "./pages/products/ProductAdd";
import OrderList from "./pages/orders/OrderList";
import OrderDetail from "./pages/orders/OrderDetail";
import SettingsGeneral from "./pages/settings/SettingsGeneral";

import SocialMediaDashboard from "./pages/Social-Media/Dashboard";
import PromotionRequests from "./pages/Social-Media/PromotionRequests";
import ContactMessages from "./pages/Social-Media/ContactMessages";
import Users from "./pages/Social-Media/Users";
import Customers from "./pages/Social-Media/Customers";

import Aitalsdashboard from "./pages/aitals/dashboard/dashboard";
import EnquiryManager from "./pages/aitals/dashboard/EnquiryManager";
import ContactManager from "./pages/aitals/dashboard/ContactManager";
import ApplicationManager from "./pages/aitals/dashboard/ApplicationManager";
import JobOpeningManager from "./pages/aitals/dashboard/JobOpeningManager";
import BlogManager from "./pages/aitals/dashboard/BlogManager";
import NewsletterManager from "./pages/aitals/dashboard/NewsletterManager";
import AdminRegister from "./pages/aitals/dashboard/AdminRegister";

import PDFdashboard from "./pages/pdfworks/dashboard";
import PDFuser from "./pages/pdfworks/user";
import Pdfcontact from "./pages/pdfworks/contact";
import Rankuser from "./pages/rankseo/user";
import AdminDetails from "./pages/pdfworks/AdminDetails";
import DjitTradingLiveChat from "./pages/live-chat/djit-trading/djit-live-chat";

import ApplicationManagerCybomb from "./pages/cybomb/ApplicationManager";
import BlogManagerCybomb from "./pages/cybomb/BlogManager";
import ContactManagerCybomb from "./pages/cybomb/ContactManager";
import EnquiryManagerCybomb from "./pages/cybomb/EnquiryManager";
import JobOpeningManagerCybomb from "./pages/cybomb/JobOpeningManager";
import NewsletterManagerCybomb from "./pages/cybomb/NewsletterManager";
import OverviewCybomb from "./pages/cybomb/Overview";
import AdminPressreleaseCybomb from "./pages/cybomb/Press-Release";

import Login from "./pages/login/login";

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const location = useLocation();

  // ✅ Update token when login/logout event occurs
  useEffect(() => {
    const handleTokenChange = () => {
      const savedToken = localStorage.getItem("token");
      setToken(savedToken);
    };

    window.addEventListener("tokenChanged", handleTokenChange);
    return () => window.removeEventListener("tokenChanged", handleTokenChange);
  }, []);

  // 🔹 Hide layout for login route
  const hideLayout = location.pathname === "/admin/login";

  return (
    <>
      {hideLayout ? (
        // ✅ Show only login page
        <Routes>
          <Route path="/admin/login" element={<Login />} />
        </Routes>
      ) : (
        // ✅ Protected layout (Sidebar + Header + Main content)
        <div className="app-layout">
          {token && <Sidebar />}

          <div className="main-area">
            {token && <Adminheader />}

            <main className="content">
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />

                {/* Dashboard */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Social Media Routes */}
                <Route
                  path="/social-media/dashboard"
                  element={
                    <ProtectedRoute>
                      <SocialMediaDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/social-media/promotional-request"
                  element={
                    <ProtectedRoute>
                      <PromotionRequests />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/social-media/customers"
                  element={
                    <ProtectedRoute>
                      <Customers />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/social-media/users"
                  element={
                    <ProtectedRoute>
                      <Users />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/social-media/contact"
                  element={
                    <ProtectedRoute>
                      <ContactMessages />
                    </ProtectedRoute>
                  }
                />

                {/* Cybomb Routes */}
                <Route
                  path="/cybomb/dashboard-overview"
                  element={
                    <ProtectedRoute>
                      <OverviewCybomb />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/cybomb/form-submission"
                  element={
                    <ProtectedRoute>
                      <ContactManagerCybomb />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/cybomb/career-application"
                  element={
                    <ProtectedRoute>
                      <JobOpeningManagerCybomb />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/cybomb/career-application-manager"
                  element={
                    <ProtectedRoute>
                      <ApplicationManagerCybomb />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/cybomb/blog-management"
                  element={
                    <ProtectedRoute>
                      <BlogManagerCybomb />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/cybomb/press-release"
                  element={
                    <ProtectedRoute>
                      <AdminPressreleaseCybomb />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/cybomb/enquiry-application"
                  element={
                    <ProtectedRoute>
                      <EnquiryManagerCybomb />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/cybomb/news-letter"
                  element={
                    <ProtectedRoute>
                      <NewsletterManagerCybomb />
                    </ProtectedRoute>
                  }
                />

                {/* Aitals Routes */}
                <Route
                  path="/aitals/dashboard"
                  element={
                    <ProtectedRoute>
                      <Aitalsdashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/aitals/enquiry"
                  element={
                    <ProtectedRoute>
                      <EnquiryManager />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/aitals/contact-forms"
                  element={
                    <ProtectedRoute>
                      <ContactManager />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/aitals/application"
                  element={
                    <ProtectedRoute>
                      <ApplicationManager />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/aitals/job-openings"
                  element={
                    <ProtectedRoute>
                      <JobOpeningManager />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/aitals/blog"
                  element={
                    <ProtectedRoute>
                      <BlogManager />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/aitals/newsletter-subscribers"
                  element={
                    <ProtectedRoute>
                      <NewsletterManager />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/aitals/admin-register"
                  element={
                    <ProtectedRoute>
                      <AdminRegister />
                    </ProtectedRoute>
                  }
                />

                {/* PDF Works */}
                <Route
                  path="/pdf-works/dashboard"
                  element={
                    <ProtectedRoute>
                      <PDFdashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/pdf-works/user"
                  element={
                    <ProtectedRoute>
                      <PDFuser />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/pdf-works/contact-details"
                  element={
                    <ProtectedRoute>
                      <Pdfcontact />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/PDF-Works/admin-details"
                  element={
                    <ProtectedRoute>
                      <AdminDetails />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/rankseo/user"
                  element={
                    <ProtectedRoute>
                      <Rankuser />
                    </ProtectedRoute>
                  }
                />

                {/* Orders & Products */}
                <Route
                  path="/products/list"
                  element={
                    <ProtectedRoute>
                      <ProductList />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/products/add"
                  element={
                    <ProtectedRoute>
                      <ProductAdd />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/orders/list"
                  element={
                    <ProtectedRoute>
                      <OrderList />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/orders/detail"
                  element={
                    <ProtectedRoute>
                      <OrderDetail />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/settings/general"
                  element={
                    <ProtectedRoute>
                      <SettingsGeneral />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/live-chat/djitrading"
                  element={
                    <ProtectedRoute>
                      <DjitTradingLiveChat />
                    </ProtectedRoute>
                  }
                />

                {/* 404 */}
                <Route
                  path="*"
                  element={<div className="card">Page not found</div>}
                />
              </Routes>
            </main>
          </div>
        </div>
      )}
    </>
  );
}