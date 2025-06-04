import { useState, useEffect } from "react";
import {
  AiOutlineHome,
  AiOutlineShopping,
  AiOutlineLogin,
  AiOutlineUserAdd,
  AiOutlineShoppingCart,
  AiOutlineSearch
} from "react-icons/ai";
import { FaHeart, FaBars } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import "./Navigation.css";
import { useSelector, useDispatch } from "react-redux";
import { useLogoutMutation } from "../../redux/api/usersApiSlice";
import { logout } from "../../redux/features/auth/authSlice";
import FavoritesCount from "../Products/FavoritesCount";
import { setCurrency } from "../../redux/slices/currencySlice";

const Navigation = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.cart);
  const { currentCurrency } = useSelector((state) => state.currency);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currencyDropdownOpen, setCurrencyDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const toggleCurrencyDropdown = () => {
    setCurrencyDropdownOpen(!currencyDropdownOpen);
  };

  const handleCurrencySelect = (currencyCode) => {
    dispatch(setCurrency(currencyCode));
    setCurrencyDropdownOpen(false);
  };

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [logoutApiCall] = useLogoutMutation();

  const logoutHandler = async () => {
    try {
      await logoutApiCall().unwrap();
      dispatch(logout());
      navigate("/login");
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const handler = setTimeout(() => {
    if (searchTerm.trim()) {
        const currentParams = new URLSearchParams(window.location.search);
        if (!(window.location.pathname === '/shop' && currentParams.get('keyword') === searchTerm.trim())) {
             navigate({ pathname: '/shop', search: `?keyword=${searchTerm.trim()}` });
        }
      } else if (window.location.pathname === '/shop' && window.location.search.includes('keyword')) {
         navigate({ pathname: '/shop', search: '' });
      }
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, navigate]);

  const supportedCurrencies = ["PKR", "USD", "EUR", "GBP", "AUD"];

  return (
    <div>
      <div
        className="fixed top-4 left-4 z-[9999] md:hidden"
      >
        <button onClick={() => setShowSidebar(!showSidebar)} className="text-white">
          <FaBars size={24} />
        </button>
      </div>

      {showSidebar && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-[9998] md:hidden"
          onClick={() => setShowSidebar(false)}
        ></div>
      )}

    <div
      style={{ zIndex: 9999 }}
        className={`fixed top-0 left-0 h-full bg-[#000] text-white transition-transform duration-300 ease-in-out ${
          showSidebar ? "translate-x-0 w-[250px]" : "-translate-x-full w-0"
        } md:translate-x-0 md:w-[4%] md:hover:w-[15%] md:flex flex-col justify-between p-4`}
      id="navigation-container"
    >
      <div>
        <a href="#" className="">
          <img src="../../../src/media/logo.png" className="" alt="Logo" />
        </a>
      </div>
      <div className="flex flex-col justify-center space-y-4">
          <div className="relative mt-[3rem]">
            <input
              type="text"
              placeholder="Search Products..."
              className="w-full p-2 pl-8 rounded-md bg-[#1C1C1C] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <AiOutlineSearch className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          </div>

        <Link
          to="/"
          className="flex items-center transition-transform transform hover:translate-x-2"
        >
          <AiOutlineHome className="mr-2 mt-[3rem]" size={26} />
          <span className="hidden nav-item-name mt-[3rem]">HOME</span>{" "}
        </Link>

        <Link
          to="/shop"
          className="flex items-center transition-transform transform hover:translate-x-2"
        >
          <AiOutlineShopping className="mr-2 mt-[3rem]" size={26} />
          <span className="hidden nav-item-name mt-[3rem]">SHOP</span>{" "}
        </Link>

        <Link
          to="/deals"
          className="flex items-center transition-transform transform hover:translate-x-2"
        >
          <span className="mr-2 mt-[3rem]">🔥</span>
          <span className="hidden nav-item-name mt-[3rem]">DEALS</span>{" "}
        </Link>

        <Link to="/cart" className="flex relative">
          <div className="flex items-center transition-transform transform hover:translate-x-2">
            <AiOutlineShoppingCart className="mt-[3rem] mr-2" size={26} />
            <span className="hidden nav-item-name mt-[3rem]">Cart</span>{" "}
          </div>

          <div className="absolute top-9">
            {cartItems.length > 0 && (
              <span>
                <span className="px-1 py-0 text-sm text-white bg-pink-500 rounded-full">
                  {cartItems.reduce((a, c) => a + c.qty, 0)}
                </span>
              </span>
            )}
          </div>
        </Link>

        <Link to="/favorite" className="flex relative">
          <div className="flex justify-center items-center transition-transform transform hover:translate-x-2">
            <FaHeart className="mt-[3rem] mr-2" size={20} />
            <span className="hidden nav-item-name mt-[3rem]">
              Favorites
            </span>{" "}
            <FavoritesCount />
          </div>
        </Link>
      </div>

      <div className="relative mt-4">
        <button
          onClick={toggleCurrencyDropdown}
          className="flex items-center text-white focus:outline-none"
        >
          <span>{currentCurrency}</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={
              `h-4 w-4 ml-1 ${
                currencyDropdownOpen ? "transform rotate-180" : ""
              }`
            }
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d={currencyDropdownOpen ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"}
            />
          </svg>
        </button>

        {currencyDropdownOpen && (
          <ul className="absolute bottom-full left-0 mb-2 space-y-1 bg-gray-800 text-white rounded-md shadow-lg">
            {supportedCurrencies.map((currencyCode) => (
              <li key={currencyCode}>
                <button
                  onClick={() => handleCurrencySelect(currencyCode)}
                  className="block px-4 py-2 hover:bg-gray-700 w-full text-left"
                >
                  {currencyCode}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="relative">
        <button
          onClick={toggleDropdown}
          className="flex items-center text-gray-800 focus:outline-none"
        >
          {userInfo ? (
            <span className="text-white">{userInfo.username}</span>
          ) : (
            <></>
          )}
          {userInfo && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={
                `h-4 w-4 ml-1 ${
                  dropdownOpen ? "transform rotate-180" : ""
                }`
              }
              fill="none"
              viewBox="0 0 24 24"
              stroke="white"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d={dropdownOpen ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"}
              />
            </svg>
          )}
        </button>

        {dropdownOpen && userInfo && (
          <ul
            className={`absolute right-0 mt-2 mr-14 space-y-2 bg-white text-gray-600 ${
              !userInfo.isAdmin ? "-top-20" : "-top-80"
            } `}
          >
            {userInfo.isAdmin && (
              <>
                <li>
                  <Link
                    to="/admin/dashboard"
                    className="block px-4 py-2 hover:bg-gray-100"
                  >
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link
                    to="/admin/productlist"
                    className="block px-4 py-2 hover:bg-gray-100"
                  >
                    Products
                  </Link>
                </li>
                <li>
                  <Link
                    to="/admin/categorylist"
                    className="block px-4 py-2 hover:bg-gray-100"
                  >
                    Category
                  </Link>
                </li>
                <li>
                  <Link
                    to="/admin/orderlist"
                    className="block px-4 py-2 hover:bg-gray-100"
                  >
                    Orders
                  </Link>
                </li>
                <li>
                  <Link
                    to="/admin/userlist"
                    className="block px-4 py-2 hover:bg-gray-100"
                  >
                    Users
                  </Link>
                </li>
              </>
            )}

            <li>
              <Link
                to="/profile"
                className="block px-4 py-2 hover:bg-gray-100"
              >
                Profile
              </Link>
            </li>
            <li>
              <button
                onClick={logoutHandler}
                className="block px-4 py-2 hover:bg-gray-100 text-left w-full"
              >
                Logout
              </button>
            </li>
          </ul>
        )}

        {!userInfo && (
          <ul>
            <li>
              <Link
                to="/login"
                className="flex items-center transition-transform transform hover:translate-x-2"
              >
                <AiOutlineLogin className="mr-2 mt-[3rem]" size={26} />
                <span className="hidden nav-item-name mt-[3rem]">LOGIN</span>{" "}
              </Link>
            </li>
            <li>
              <Link
                to="/register"
                className="flex items-center transition-transform transform hover:translate-x-2"
              >
                <AiOutlineUserAdd className="mr-2 mt-[3rem]" size={26} />
                <span className="hidden nav-item-name mt-[3rem]">
                  REGISTER
                </span>{" "}
              </Link>
            </li>
          </ul>
        )}
        </div>
      </div>
    </div>
  );
};

export default Navigation;
