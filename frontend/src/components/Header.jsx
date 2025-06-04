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
    <header className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex items-center justify-between">
        {/* Logo or Site Title */}
        <Link to="/" className="text-2xl font-bold">
          ATS
        </Link>

        {/* Mobile Menu Toggle Button (Visible on small screens) */}
        <div className="md:hidden">
          <Button type="text" onClick={toggleMobileMenu}>
            <MenuOutlined className="text-white text-2xl" />
          </Button>
        </div>

        {/* Desktop Menu (Hidden on small screens) */}
        <nav className="hidden md:block">
          <Menu mode="horizontal" theme="dark" style={{ backgroundColor: 'transparent' }}>
            <Menu.Item key="home">
              <Link to="/">Home</Link>
            </Menu.Item>
            <Menu.Item key="shop">
              <Link to="/shop">Shop</Link>
            </Menu.Item>
            <Menu.Item key="cart">
              <Link to="/cart">Cart</Link>
            </Menu.Item>
            {/* Deals Link */}
            <Menu.Item key="deals">
              <Link to="/deals">Deals</Link>
            </Menu.Item>

            {userInfo ? (
              <Dropdown overlay={userInfo.isAdmin ? adminMenu : userMenu} placement="bottomRight">
                <Button>
                  {userInfo.name} <DownOutlined />
                </Button>
              </Dropdown>
            ) : (
              <Menu.Item key="login">
                <Link to="/login">Login</Link>
              </Menu.Item>
            )}
          </Menu>
        </nav>

        {/* Mobile Menu (Visible when toggled on small screens) */}
        {isMobileMenuOpen && (
          <nav className="md:hidden absolute top-16 left-0 w-full bg-gray-800 z-10">
            <Menu mode="vertical" theme="dark" style={{ backgroundColor: 'transparent' }}>
               <Menu.Item key="home" onClick={toggleMobileMenu}> {/* Close menu on click */}
                <Link to="/">Home</Link>
              </Menu.Item>
              <Menu.Item key="shop" onClick={toggleMobileMenu}> {/* Close menu on click */}
                <Link to="/shop">Shop</Link>
              </Menu.Item>
              <Menu.Item key="cart" onClick={toggleMobileMenu}> {/* Close menu on click */}
                <Link to="/cart">Cart</Link>
              </Menu.Item>
               {/* Deals Link */}
              <Menu.Item key="deals" onClick={toggleMobileMenu}> {/* Close menu on click */}
                <Link to="/deals">Deals</Link>
              </Menu.Item>

              {userInfo ? (
                 // Display user/admin links directly in vertical menu
                 <>
                  {userInfo.isAdmin ? (
                     <>
                      <Menu.Item key="dashboard" onClick={toggleMobileMenu}><Link to="/admin/dashboard">Dashboard</Link></Menu.Item>
                       <Menu.Item key="ai-features" icon={<RobotOutlined />} onClick={toggleMobileMenu}><Link to="/admin/ai-features">AI Features</Link></Menu.Item>
                       <Menu.Item key="productlist" icon={<ShoppingOutlined />} onClick={toggleMobileMenu}><Link to="/admin/productlist">Product List</Link></Menu.Item>
                       <Menu.Item key="orderlist" icon={<ContainerOutlined />} onClick={toggleMobileMenu}><Link to="/admin/orderlist">Order List</Link></Menu.Item>
                       <Menu.Item key="userlist" icon={<TeamOutlined />} onClick={toggleMobileMenu}><Link to="/admin/userlist">User List</Link></Menu.Item>
                     </>
                   ) : (
                     <>
                       <Menu.Item key="profile" onClick={toggleMobileMenu}><Link to="/profile">Profile</Link></Menu.Item>
                       <Menu.Item key="orders" onClick={toggleMobileMenu}><Link to="/orders">My Orders</Link></Menu.Item>
                     </>
                   )}
                   <Menu.Item key="logout" onClick={() => { logoutHandler(); toggleMobileMenu(); }}><LogoutOutlined /> Logout</Menu.Item>
                 </>
              ) : (
                <Menu.Item key="login" onClick={toggleMobileMenu}>
                  <Link to="/login">Login</Link>
                </Menu.Item>
              )}
            </Menu>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header; 