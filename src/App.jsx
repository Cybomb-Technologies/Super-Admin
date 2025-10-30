import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Cybombdashboard from './pages/cybomb/dashboard'
import UserAdd from './pages/cybomb/dashboard'
import ProductList from './pages/products/ProductList'
import ProductAdd from './pages/products/ProductAdd'
import OrderList from './pages/orders/OrderList'
import OrderDetail from './pages/orders/OrderDetail'
import SettingsGeneral from './pages/settings/SettingsGeneral'
import SettingsSecurity from './pages/settings/SettingsSecurity'
import Adminheader from './components/Adminheader'
import Formsubmission from './pages/cybomb/form-submission'
import Careerapplication from './pages/cybomb/career-application'
import Blogmanagment from './pages/cybomb/blog-management'
import Pressrelease from './pages/cybomb/press-release'
import Newsletter from './pages/cybomb/Newsletter'

export default function App(){
  return (
    <div className="app">
      <Sidebar />
      <main className="content">
        <Adminheader/>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard/>} />
          <Route path="/cybomb/dashboard" element={<Cybombdashboard/>} />
          <Route path="/cybomb/form-submission" element={<Formsubmission/>} />
          <Route path="/cybomb/career-application" element={<Careerapplication/>} />
          <Route path="/cybomb/blog-management" element={<Blogmanagment/>} />
          <Route path="/cybomb/press-release" element={<Pressrelease/>} />
          <Route path="/cybomb/news-letter" element={<Newsletter/>} />
          
          
            
          <Route path="/products/list" element={<ProductList/>} />
          <Route path="/products/add" element={<ProductAdd/>} />
          <Route path="/orders/list" element={<OrderList/>} />
          <Route path="/orders/detail" element={<OrderDetail/>} />
          <Route path="/settings/general" element={<SettingsGeneral/>} />
          <Route path="/settings/security" element={<SettingsSecurity/>} />
          <Route path="*" element={<div className="card">Page not found</div>} />
        </Routes>
      </main>
    </div>
  )
}
