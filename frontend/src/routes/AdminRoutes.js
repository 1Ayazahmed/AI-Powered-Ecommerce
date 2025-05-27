import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminDashboard from '../pages/admin/AdminDashboard';
import ProductList from '../pages/admin/ProductList';
import OrderList from '../pages/admin/OrderList';
import UserList from '../pages/admin/UserList';
import AIFeatures from '../pages/admin/AIFeatures';
import AdminLayout from '../components/layout/AdminLayout';

const AdminRoutes = () => {
  return (
    <AdminLayout>
      <Routes>
        <Route path="/" element={<AdminDashboard />} />
        <Route path="/products" element={<ProductList />} />
        <Route path="/orders" element={<OrderList />} />
        <Route path="/users" element={<UserList />} />
        <Route path="/ai-features" element={<AIFeatures />} />
      </Routes>
    </AdminLayout>
  );
};

export default AdminRoutes; 