import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Menu, Dropdown, Button } from 'antd';
import { DownOutlined, UserOutlined, LogoutOutlined, ShoppingOutlined, ContainerOutlined, TeamOutlined } from '@ant-design/icons';
import { RobotOutlined } from '@ant-design/icons';

const Header = () => {
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);
  const { userInfo } = auth;

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
    <header style={{ display: 'flex', justifyContent: 'center' }}>
      {/* Your header JSX structure, likely containing a <Menu> component */}
      {/* This is a simplified example, adjust according to your actual header structure */}
      <Menu mode="horizontal" style={{ width: '100%', justifyContent: 'center' }}>
        <Menu.Item key="home">
          <Link to="/">Home</Link>
        </Menu.Item>
        <Menu.Item key="shop">
          <Link to="/shop">Shop</Link>
        </Menu.Item>
         <Menu.Item key="cart">
          <Link to="/cart">Cart</Link>
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
    </header>
  );
};

export default Header; 