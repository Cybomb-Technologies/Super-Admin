import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";
import Adminheader from "./components/Adminheader";
import ProtectedRoute from "./components/ProtectedRoute";

import Dashboard from "./pages/Dashboard";
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
import AitalsAdmin from "./pages/admin/aitals/aitalsadmin";

import PDFdashboard from "./pages/pdfworks/dashboard";
import PDFuser from "./pages/pdfworks/user";
import Pdfcontact from "./pages/pdfworks/contact";
import AdminDetails from "./pages/pdfworks/AdminDetails";
import PricingManagement from "./pages/pdfworks/PricingManagement";
import BlogManagerPDF from "./pages/pdfworks/BlogManager";
import PaymentManagement from "./pages/pdfworks/PaymentManagement";
import TopupManagement from "./pages/pdfworks/TopupManagement";

// Rank SEO Imports
import  AdminDashboard from "./pages/rankseo/dashboard";
import UsersTab from "./pages/rankseo/UsersTab";
import AuditTab from "./pages/rankseo/AuditTab";
import PricingTab from "./pages/rankseo/PricingTab";
import PaymentTab from "./pages/rankseo/PaymentTab";
import NewsletterTab from "./pages/rankseo/NewsletterTab";
import SupportTab from "./pages/rankseo/SupportTab";
import RankSeoAdmin from "./pages/admin/rankseo/rankseoadmin";


import DjitTradingLiveChat from "./pages/live-chat/djit-trading/djit-live-chat";

import ApplicationManagerCybomb from "./pages/cybomb/ApplicationManager";
import BlogManagerCybomb from "./pages/cybomb/BlogManager";
import ContactManagerCybomb from "./pages/cybomb/ContactManager";
import EnquiryManagerCybomb from "./pages/cybomb/EnquiryManager";
import JobOpeningManagerCybomb from "./pages/cybomb/JobOpeningManager";
import NewsletterManagerCybomb from "./pages/cybomb/NewsletterManager";
import OverviewCybomb from "./pages/cybomb/Overview";
import AdminPressreleaseCybomb from "./pages/cybomb/Press-Release";
import CybombAdmin from "./pages/admin/cybomb/cybombadmin";

import Login from "./pages/login/login";
import AddAdmin from "./pages/admin/AddAdmin";
import OtpVerification from "./pages/login/OtpVerification";
import DjittradingDashboard from "./pages/djittrading/dashboard";
import Courses from "./pages/djittrading/CourseManagement";
import DjittradingUsers from "./pages/djittrading/users";
import EnrollmentManagement from "./pages/djittrading/EnrollmentManagement";
import CouponGenerator from "./pages/djittrading/CouponGenerator";
import NewsletterManagement from "./pages/djittrading/NewsletterManagement";
import DJIAdminManager from "./pages/admin/djittrading/djiadmin";

import PFDAdminManager from "./pages/admin/pdfworks/PFDAdminManager";
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
  const hideLayout =
    location.pathname === "/admin/login" ||
    location.pathname === "/admin/verify-otp";

  return (
    <>
      {hideLayout ? (
        // ✅ Show only login page
        <Routes>
          <Route path="/admin/login" element={<Login />} />
          <Route path="/admin/verify-otp" element={<OtpVerification />} />
        </Routes>
      ) : (
        // ✅ Protected layout (Sidebar + Header + Main content)
        <div className="app-layout">
          {token && <Sidebar />}

          <div className="main-area">
            {token && <Adminheader />}

            <main className="content">
              <Routes>
                <Route
                  path="/"
                  element={<Navigate to="/dashboard" replace />}
                />
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
                  path="/PDF-Works/pricing-management"
                  element={
                    <ProtectedRoute>
                      <PricingManagement/>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/PDF-Works/blog-manager"
                  element={
                    <ProtectedRoute>
                      <BlogManagerPDF/>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/PDF-Works/payment-manager"
                  element={
                    <ProtectedRoute>
                      <PaymentManagement/>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/PDF-Works/topup-manager"
                  element={
                    <ProtectedRoute>
                      <TopupManagement/>
                    </ProtectedRoute>
                  }
                />                
                {/* Rank SEO Routes */}
                <Route
                  path="/rankseo/dashboard"
                  element={
                    <ProtectedRoute>
                       <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/rankseo/users"
                  element={
                    <ProtectedRoute>
                      <UsersTab />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/rankseo/audit"
                  element={
                    <ProtectedRoute>
                      <AuditTab />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/rankseo/pricing"
                  element={
                    <ProtectedRoute>
                      <PricingTab />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/rankseo/payments"
                  element={
                    <ProtectedRoute>
                      <PaymentTab />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/rankseo/newsletter"
                  element={
                    <ProtectedRoute>
                      <NewsletterTab />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/rankseo/support"
                  element={
                    <ProtectedRoute>
                      <SupportTab />
                    </ProtectedRoute>
                  }
                />
                

                 <Route
                  path="/djittrading/dashboard"
                  element={
                    <ProtectedRoute>
                     <DjittradingDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/djittrading/course"
                  element={
                    <ProtectedRoute>
                      <Courses/>
                    </ProtectedRoute>
                  }
                />

                 <Route
                  path="/djittrading/users"
                  element={
                    <ProtectedRoute>
                     <DjittradingUsers/>
                    </ProtectedRoute>
                  }
                />
                 <Route
                  path="/djittrading/Enrollment"
                  element={
                    <ProtectedRoute>
                      <EnrollmentManagement/>
                    </ProtectedRoute>
                  }
                />
                 <Route
                  path="/djittrading/Coupon-Generator"
                  element={
                    <ProtectedRoute>
                      <CouponGenerator/>
                    </ProtectedRoute>
                  }
                />
                 <Route
                  path="/djittrading/Newsletter"
                  element={
                    <ProtectedRoute>
                     <NewsletterManagement/>
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
                  path="/djittrading/live-chat"
                  element={
                    <ProtectedRoute>
                      <DjitTradingLiveChat />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/add-admin"
                  element={
                    <ProtectedRoute>
                      <AddAdmin />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/cybomb-admin"
                  element={
                    <ProtectedRoute>
                      <CybombAdmin />
                    </ProtectedRoute>
                  }
                />
                  <Route
                  path="/admin/aitals-admin"
                  element={
                    <ProtectedRoute>
                      <AitalsAdmin />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/rankseo-admin"
                  element={
                    <ProtectedRoute>
                      <RankSeoAdmin />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/djittrading-admin"
                  element={
                    <ProtectedRoute>
                      <DJIAdminManager />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/pdfworks-admin"
                  element={
                    <ProtectedRoute>
                      <PFDAdminManager />
                    </ProtectedRoute>
                  }
                />
                <Route path="/admin/verify-otp" element={<OtpVerification />} />
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