import { useState } from "react";
import { NavLink } from "react-router-dom";
import { FaTimes } from "react-icons/fa";
import { AiOutlineMenu } from "react-icons/ai";

const AdminMenu = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <>
      <button
        className={`md:hidden bg-[#151515] p-2 fixed z-50 rounded-lg transition-all duration-300 ${
          isMenuOpen ? "top-2 left-2" : "top-5 left-7"
        }`}
        onClick={toggleMenu}
      >
        {isMenuOpen ? (
          <FaTimes color="white" />
        ) : (
          <AiOutlineMenu color="white" />
        )}
      </button>

      {/* Sidebar with opacity effect */}
      <div
        className={`
          group
          fixed top-0 left-0 w-24 h-full z-40
          bg-black/30 hover:bg-black/90
          transition-all duration-300
          flex flex-col items-center
          ${isMenuOpen ? 'block' : 'md:block'}
        `}
        style={{ pointerEvents: isMenuOpen ? 'auto' : undefined }}
      >
        {/* Mobile close button */}
        <div className="md:hidden text-right mb-4 w-full pr-2 pt-2">
          <button onClick={toggleMenu} className="text-white">
            <FaTimes size={20} />
          </button>
        </div>
        {/* Sidebar content with fade effect */}
        <div className="opacity-60 group-hover:opacity-100 transition-all duration-300 w-full flex-1 flex flex-col items-center justify-center">
          <ul className="list-none mt-2 space-y-2 md:mt-0 md:space-y-0 md:flex md:flex-col w-full items-center">
            <li>
              <NavLink
                className="block py-2 px-3 hover:bg-[#2E2D2D] rounded-sm text-white transition-colors duration-200 text-center"
                to="/admin/dashboard"
                style={({ isActive }) => ({
                  color: isActive ? "#ec4899" : "white",
                })}
                onClick={() => setIsMenuOpen(false)}
              >
                Admin Dashboard
              </NavLink>
            </li>
            <li>
              <NavLink
                className="block py-2 px-3 hover:bg-[#2E2D2D] rounded-sm text-white transition-colors duration-200 text-center"
                to="/admin/categorylist"
                style={({ isActive }) => ({
                  color: isActive ? "#ec4899" : "white",
                })}
                onClick={() => setIsMenuOpen(false)}
              >
                Create Category
              </NavLink>
            </li>
            <li>
              <NavLink
                className="block py-2 px-3 hover:bg-[#2E2D2D] rounded-sm text-white transition-colors duration-200 text-center"
                to="/admin/productlist"
                style={({ isActive }) => ({
                  color: isActive ? "#ec4899" : "white",
                })}
                onClick={() => setIsMenuOpen(false)}
              >
                Create Product
              </NavLink>
            </li>
            <li>
              <NavLink
                className="block py-2 px-3 hover:bg-[#2E2D2D] rounded-sm text-white transition-colors duration-200 text-center"
                to="/admin/allproductslist"
                style={({ isActive }) => ({
                  color: isActive ? "#ec4899" : "white",
                })}
                onClick={() => setIsMenuOpen(false)}
              >
                All Products
              </NavLink>
            </li>
            <li>
              <NavLink
                className="block py-2 px-3 hover:bg-[#2E2D2D] rounded-sm text-white transition-colors duration-200 text-center"
                to="/admin/userlist"
                style={({ isActive }) => ({
                  color: isActive ? "#ec4899" : "white",
                })}
                onClick={() => setIsMenuOpen(false)}
              >
                Manage Users
              </NavLink>
            </li>
            <li>
              <NavLink
                className="block py-2 px-3 hover:bg-[#2E2D2D] rounded-sm text-white transition-colors duration-200 text-center"
                to="/admin/orderlist"
                style={({ isActive }) => ({
                  color: isActive ? "#ec4899" : "white",
                })}
                onClick={() => setIsMenuOpen(false)}
              >
                Manage Orders
              </NavLink>
            </li>
          </ul>
        </div>
      </div>

      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-30 md:hidden"
          onClick={toggleMenu}
        ></div>
      )}
    </>
  );
};

export default AdminMenu;
