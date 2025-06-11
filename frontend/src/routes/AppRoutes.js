import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Cart from '../pages/Cart';
import AdminDashboard from '../pages/Admin/AdminDashboard.jsx';
import ProductList from '../pages/Admin/ProductList.jsx';
import OrderList from '../pages/Admin/OrderList.jsx';
import UserList from '../pages/Admin/UserList.jsx';
import UserEdit from '../pages/UserEdit';
import ProductEdit from '../pages/ProductEdit';
import AIFeatures from '../pages/AI/AIFeatures.jsx';
import AdminLayout from '../components/layout/AdminLayout';

const AppRoutes = () => {
  const { userInfo } = useSelector((state) => state.auth);

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/cart" element={<Cart />} />
      
      {/* Protected Routes */}
      <Route
        path="/admin/*"
        element={
          userInfo && userInfo.isAdmin ? (
            <AdminLayout>
              <Routes>
                <Route path="/" element={<AdminDashboard />} />
                <Route path="/productlist" element={<ProductList />} />
                <Route path="/orderlist" element={<OrderList />} />
                <Route path="/userlist" element={<UserList />} />
                <Route path="/user/:id/edit" element={<UserEdit />} />
                <Route path="/product/:id/edit" element={<ProductEdit />} />
                <Route path="ai-features" element={<AIFeatures />} />
              </Routes>
            </AdminLayout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  );
};

export default AppRoutes; 