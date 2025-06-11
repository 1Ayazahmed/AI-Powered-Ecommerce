import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Menu, Dropdown, Button } from 'antd';
import { DownOutlined, UserOutlined, LogoutOutlined, ShoppingOutlined, ContainerOutlined, TeamOutlined, MenuOutlined } from '@ant-design/icons';
import { RobotOutlined } from '@ant-design/icons';

const Header = () => {
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);
  const { userInfo } = auth;

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const logoutHandler = () => {
    // dispatch(logout()); // Assuming you have a logout action
  };

  // Admin dropdown menu
  const adminMenu = (
    <Menu>
      <Menu.Item key="dashboard">
        <Link to="/admin/dashboard">Dashboard</Link>
      </Menu.Item>
      {/* AI Features link */}
      {userInfo && userInfo.isAdmin && (
        <Menu.Item key="ai-features" icon={<RobotOutlined />}>
          <Link to="/admin/ai-features">AI Features</Link>
        </Menu.Item>
      )}
      {/* Other admin menu items */}
      <Menu.Item key="productlist" icon={<ShoppingOutlined />}>
        <Link to="/admin/productlist">Product List</Link>
      </Menu.Item>
      <Menu.Item key="orderlist" icon={<ContainerOutlined />}>
        <Link to="/admin/orderlist">Order List</Link>
      </Menu.Item>
      <Menu.Item key="userlist" icon={<TeamOutlined />}>
        <Link to="/admin/userlist">User List</Link>
      </Menu.Item>
      {/* Add other admin links here as needed */}
    </Menu>
  );

  // Assuming you have a userMenu defined similarly for non-admin users
  const userMenu = (
    <Menu>
       <Menu.Item key="profile">
        <Link to="/profile">Profile</Link>
      </Menu.Item>
       <Menu.Item key="orders">
        <Link to="/orders">My Orders</Link>
      </Menu.Item>
      <Menu.Item key="logout" onClick={logoutHandler}>
        <LogoutOutlined /> Logout
      </Menu.Item>
    </Menu>
  );

  return (
    <header className="bg-[#181818] border-b border-[#292929] text-white px-4 py-2">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo or Site Title */}
        <Link to="/" className="flex items-center space-x-2">
          <img src="/logo.png" alt="Logo" className="h-8 w-8 object-contain" />
          <span className="text-2xl font-bold tracking-wide">ATS</span>
        </Link>

        {/* Mobile Menu Toggle Button (Visible on small screens) */}
        <div className="md:hidden">
          <Button type="text" onClick={toggleMobileMenu} className="text-pink-500 hover:text-pink-400">
            <MenuOutlined className="text-2xl" />
          </Button>
        </div>

        {/* Desktop Menu (Hidden on small screens) */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/" className="text-white hover:text-pink-500 transition-colors font-medium">Home</Link>
          <Link to="/shop" className="text-white hover:text-pink-500 transition-colors font-medium">Shop</Link>
          <Link to="/cart" className="text-white hover:text-pink-500 transition-colors font-medium">Cart</Link>
          <Link to="/deals" className="text-white hover:text-pink-500 transition-colors font-medium">Deals</Link>

          {userInfo ? (
            <Dropdown overlay={userInfo.isAdmin ? adminMenu : userMenu} placement="bottomRight">
              <Button className="bg-pink-500 text-white border-none hover:bg-pink-600 transition-colors font-medium flex items-center">
                {userInfo.name} <DownOutlined className="ml-1" />
              </Button>
            </Dropdown>
          ) : (
            <Link to="/login" className="text-white hover:text-pink-500 transition-colors font-medium">Login</Link>
          )}
        </nav>

        {/* Mobile Menu (Visible when toggled on small screens) */}
        {isMobileMenuOpen && (
          <nav className="md:hidden absolute top-14 left-0 w-full bg-[#181818] border-b border-[#292929] z-20 shadow-lg animate-fade-in">
            <div className="flex flex-col space-y-2 p-4">
              <Link to="/" onClick={toggleMobileMenu} className="text-white hover:text-pink-500 transition-colors font-medium">Home</Link>
              <Link to="/shop" onClick={toggleMobileMenu} className="text-white hover:text-pink-500 transition-colors font-medium">Shop</Link>
              <Link to="/cart" onClick={toggleMobileMenu} className="text-white hover:text-pink-500 transition-colors font-medium">Cart</Link>
              <Link to="/deals" onClick={toggleMobileMenu} className="text-white hover:text-pink-500 transition-colors font-medium">Deals</Link>

              {userInfo ? (
                <>
                  {userInfo.isAdmin ? (
                    <>
                      <Link to="/admin/dashboard" onClick={toggleMobileMenu} className="text-white hover:text-pink-500 transition-colors font-medium">Dashboard</Link>
                      <Link to="/admin/ai-features" onClick={toggleMobileMenu} className="text-white hover:text-pink-500 transition-colors font-medium">AI Features</Link>
                      <Link to="/admin/productlist" onClick={toggleMobileMenu} className="text-white hover:text-pink-500 transition-colors font-medium">Product List</Link>
                      <Link to="/admin/orderlist" onClick={toggleMobileMenu} className="text-white hover:text-pink-500 transition-colors font-medium">Order List</Link>
                      <Link to="/admin/userlist" onClick={toggleMobileMenu} className="text-white hover:text-pink-500 transition-colors font-medium">User List</Link>
                    </>
                  ) : (
                    <>
                      <Link to="/profile" onClick={toggleMobileMenu} className="text-white hover:text-pink-500 transition-colors font-medium">Profile</Link>
                      <Link to="/orders" onClick={toggleMobileMenu} className="text-white hover:text-pink-500 transition-colors font-medium">My Orders</Link>
                    </>
                  )}
                  <button onClick={() => { logoutHandler(); toggleMobileMenu(); }} className="text-white hover:text-pink-500 transition-colors font-medium text-left">Logout</button>
                </>
              ) : (
                <Link to="/login" onClick={toggleMobileMenu} className="text-white hover:text-pink-500 transition-colors font-medium">Login</Link>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header; 