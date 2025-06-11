import React from 'react';
import AdminMenu from '../../pages/Admin/AdminMenu';

const AdminLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      {/* Desktop Sidebar */}
      <div className="hidden md:block fixed top-0 left-0 w-24 h-full z-40 sidebar">
        <AdminMenu />
      </div>
      {/* Main Content */}
      <main className="flex-1 ml-24 pr-6 pt-6 pb-6 p-4 transition-all duration-300 main-content">
        {children}
      </main>
      {/* Mobile Sidebar (overlay) */}
      <div className="block md:hidden">
        <AdminMenu />
      </div>
    </div>
  );
};

export default AdminLayout; 