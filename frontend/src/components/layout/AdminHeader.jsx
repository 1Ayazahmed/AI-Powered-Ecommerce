import { NavLink } from 'react-router-dom';

const navLinks = [
  { to: '/admin/dashboard', label: 'Admin Dashboard' },
  { to: '/admin/categorylist', label: 'Create Category' },
  { to: '/admin/productlist', label: 'Create Product' },
  { to: '/admin/allproductslist', label: 'All Products' },
  { to: '/admin/userlist', label: 'Manage Users' },
  { to: '/admin/orderlist', label: 'Manage Orders' },
];

const AdminHeader = () => (
  <nav className="w-full bg-[#181818] border-b border-[#292929] px-6 py-3 flex justify-center items-center ml-24 hidden md:flex">
    <div className="flex space-x-6">
      {navLinks.map(link => (
        <NavLink
          key={link.to}
          to={link.to}
          className="text-white text-sm font-medium hover:text-pink-400 transition-colors duration-200"
          style={({ isActive }) => ({
            color: isActive ? '#ec4899' : 'white',
          })}
        >
          {link.label}
        </NavLink>
      ))}
    </div>
  </nav>
);

export default AdminHeader; 