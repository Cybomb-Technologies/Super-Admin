
import { Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import ProductList from "./pages/products/ProductList";
import ProductAdd from "./pages/products/ProductAdd";
import OrderList from "./pages/orders/OrderList";
import OrderDetail from "./pages/orders/OrderDetail";
import SettingsGeneral from "./pages/settings/SettingsGeneral";
import SettingsSecurity from "./pages/settings/SettingsSecurity";
import Adminheader from "./components/Adminheader";

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

// import AdminDashboardCybomb from "./pages/cybomb/AdminDashboard"
import ApplicationManagerCybomb from "./pages/cybomb/ApplicationManager"
import BlogManagerCybomb from "./pages/cybomb/BlogManager"
import ContactManagerCybomb from "./pages/cybomb/ContactManager"
import EnquiryManagerCybomb from "./pages/cybomb/EnquiryManager"
import JobOpeningManagerCybomb from "./pages/cybomb/JobOpeningManager"
import NewsletterManagerCybomb from "./pages/cybomb/NewsletterManager"
import OverviewCybomb from "./pages/cybomb/Overview"
import AdminPressreleaseCybomb from "./pages/cybomb/Press-Release"
export default function App() {
  return (
    <div className="app">
      <Sidebar />
      <main className="content">
        <Adminheader />
        <div className="dashboard-content-wrapper">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          {/* <Route path="/cybomb/dashboard" element={<AdminDashboardCybomb/>} /> */}
          <Route path="/cybomb/dashboard-overview" element={<OverviewCybomb/>} />
          <Route path="/cybomb/form-submission" element={<ContactManagerCybomb />} />
          <Route path="/cybomb/career-application" element={<JobOpeningManagerCybomb />} />
          <Route path="/cybomb/career-application-manager" element={<ApplicationManagerCybomb />} />
          <Route path="/cybomb/blog-management" element={<BlogManagerCybomb />} />
          <Route path="/cybomb/press-release" element={<AdminPressreleaseCybomb />} />
          <Route path="/cybomb/enquiry-application" element={<EnquiryManagerCybomb />} />
          <Route path="/cybomb/news-letter" element={<NewsletterManagerCybomb />} />
          {/* <Route path="/cybomb/admin-management" element={<AdminManagement />} /> */}


          <Route
            path="/social-media/dashboad"
            element={<SocialMediaDashboard />}
          />
          <Route
            path="/social-media/promotional-request"
            element={<PromotionRequests />}
          />
          <Route path="/social-media/users" element={<Users />} />
          <Route path="/social-media/contact" element={<ContactMessages />} />
          <Route path="/social-media/customers" element={<Customers />} />

          <Route path="/aitals/dashboard" element={<Aitalsdashboard />} />
          <Route path="/aitals/enquiry" element={<EnquiryManager />} />
          <Route path="/aitals/contact-forms" element={<ContactManager />} />
          <Route path="/aitals/application" element={<ApplicationManager />} />
          <Route path="/aitals/job-openings" element={<JobOpeningManager />} />
          <Route path="/aitals/blog" element={<BlogManager />} />
          <Route
            path="/aitals/newsletter-subscribers"
            element={<NewsletterManager />}
            
          />
<Route path="/aitals/admin-register" element={<AdminRegister />} />

          <Route path="/pdf-works/dashboard" element={<PDFdashboard />} />
          <Route path="/pdf-works/user" element={<PDFuser />} />
          <Route path="/pdf-works/contact-details" element={<Pdfcontact/>} />
<Route path="/PDF-Works/admin-details" element={<AdminDetails/>}/>
          <Route path="/rankseo/user" element={<Rankuser/>} />
          
        
          <Route path="/products/list" element={<ProductList />} />
          <Route path="/products/add" element={<ProductAdd />} />
          <Route path="/orders/list" element={<OrderList />} />
          <Route path="/orders/detail" element={<OrderDetail />} />
          <Route path="/settings/general" element={<SettingsGeneral />} />
           <Route path="/live-chat/djitrading" element={<DjitTradingLiveChat/>} />

 
      

          <Route
            path="*"
            element={<div className="card">Page not found</div>}
          />
        </Routes>
        </div>
      </main>
    </div>
  );
}
