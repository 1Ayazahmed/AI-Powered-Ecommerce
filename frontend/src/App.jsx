import { Outlet } from "react-router-dom";
import Navigation from "./pages/Auth/Navigation";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Chatbot from "./components/AI/Chatbot";
import Footer from "./components/Footer";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { fetchExchangeRates } from "./redux/slices/currencySlice";

const App = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchExchangeRates());
  }, [dispatch]);

  return (
    <>
      <ToastContainer />
      <Navigation />
      <main className="py-3">
        <Outlet />
      </main>
      <Chatbot />
      <Footer />
    </>
  );
};

export default App;
