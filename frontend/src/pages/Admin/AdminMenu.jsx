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
          isMenuOpen ? "top-2 right-2" : "top-5 right-7"
        }`}
        onClick={toggleMenu}
      >
        {isMenuOpen ? (
          <FaTimes color="white" />
        ) : (
          <AiOutlineMenu color="white" />
        )}
      </button>

      <section
        className={`
          ${isMenuOpen ? "translate-x-0" : "translate-x-full"} 
          md:translate-x-0 
          fixed top-0 right-0 w-64 h-full bg-[#151515] z-40 p-4 
          md:relative md:w-64 md:h-auto md:block md:right-auto md:top-auto 
          transition-transform duration-300 ease-in-out
        `}
      >
        <div className="md:hidden text-right mb-4">
           <button onClick={toggleMenu} className="text-white">
              <FaTimes size={20} />
           </button>
        </div>

        <ul className="list-none mt-2 space-y-2">
          <li>
            <NavLink
              className="block py-2 px-3 hover:bg-[#2E2D2D] rounded-sm text-white transition-colors duration-200"
              to="/admin/dashboard"
              style={({ isActive }) => ({
                color: isActive ? "greenyellow" : "white",
              })}
              onClick={() => setIsMenuOpen(false)}
            >
              Admin Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink
              className="block py-2 px-3 hover:bg-[#2E2D2D] rounded-sm text-white transition-colors duration-200"
              to="/admin/categorylist"
              style={({ isActive }) => ({
                color: isActive ? "greenyellow" : "white",
              })}
              onClick={() => setIsMenuOpen(false)}
            >
              Create Category
            </NavLink>
          </li>
          <li>
            <NavLink
              className="block py-2 px-3 hover:bg-[#2E2D2D] rounded-sm text-white transition-colors duration-200"
              to="/admin/productlist"
              style={({ isActive }) => ({
                color: isActive ? "greenyellow" : "white",
              })}
              onClick={() => setIsMenuOpen(false)}
            >
              Create Product
            </NavLink>
          </li>
          <li>
            <NavLink
              className="block py-2 px-3 hover:bg-[#2E2D2D] rounded-sm text-white transition-colors duration-200"
              to="/admin/allproductslist"
              style={({ isActive }) => ({
                color: isActive ? "greenyellow" : "white",
              })}
              onClick={() => setIsMenuOpen(false)}
            >
              All Products
            </NavLink>
          </li>
          <li>
            <NavLink
              className="block py-2 px-3 hover:bg-[#2E2D2D] rounded-sm text-white transition-colors duration-200"
              to="/admin/userlist"
              style={({ isActive }) => ({
                color: isActive ? "greenyellow" : "white",
              })}
              onClick={() => setIsMenuOpen(false)}
            >
              Manage Users
            </NavLink>
          </li>
          <li>
            <NavLink
              className="block py-2 px-3 hover:bg-[#2E2D2D] rounded-sm text-white transition-colors duration-200"
              to="/admin/orderlist"
              style={({ isActive }) => ({
                color: isActive ? "greenyellow" : "white",
              })}
              onClick={() => setIsMenuOpen(false)}
            >
              Manage Orders
            </NavLink>
          </li>
        </ul>
      </section>

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
