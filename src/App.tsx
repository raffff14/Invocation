import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate, Link } from "react-router-dom";
import axios from "axios";
import { Coins, ShoppingCart, PlusCircle } from "lucide-react";
import Login from "./components/user/Login";
import Register from "./components/user/Register";
import ChangePassword from "./components/user/ChangePassword";
import Gacha from "./components/Gacha";
import Collection from "./components/Collection";
import About from "./components/About";
import LoginLogTable from './components/LoginLogTable';
import "./App.css";

// For Vite, use import.meta.env instead of process.env
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userBalance, setUserBalance] = useState<number>(0);
  const [account, setAccount] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setIsAuthenticated(true);
      fetchUserBalance();
    }
    setIsLoading(false);
  }, [isAuthenticated]);

  const fetchUserBalance = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/user/balance`);
      console.log(response.data)
      setUserBalance(response.data.balance);
    } catch (error) {
      console.error("Error fetching user balance:", error);
    }
  };

  const login = (token: string) => {
    localStorage.setItem("token", token);
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];
    setIsAuthenticated(false);
    setUserBalance(0);
  };

  useEffect(() => {
    // Simulate fetching account data
    const fetchAccount = async () => {
      // Example: Fetch account from local storage or API
      const accountFromStorage = localStorage.getItem("account");
      if (accountFromStorage) {
        setAccount(accountFromStorage);
      }
    };

    fetchAccount();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-900">
        {!isAuthenticated ? (
          <Routes>
            <Route path="/login" element={<Login onLogin={login} />} />
            <Route path="/register" element={<Register onRegister={login} />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        ) : (
          <>
            <header className="sticky top-0 z-50 flex justify-between items-center bg-black bg-opacity-50 p-3 rounded-lg">
              <img
                src="/images/dinoCoinLogo.png" // Make sure this path is correct
                alt="Dino Coin Logo"
                className="w-16 h-16 rounded-full border-2 border-yellow-400"
              />
              <h1 className="text-yellow-400 text-3xl font-extrabold tracking-wider">
                DinoNFT Gacha
              </h1>
              <div className="flex items-center space-x-4">
                <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-bold px-4 py-2 rounded-full flex items-center">
                  <Coins className="w-5 h-5 mr-2" />
                  <span>{userBalance.toFixed(3)}</span>
                </div>
                
                <Link
                  to="/"
                  className="bg-gradient-to-r from-blue-400 to-indigo-500 text-white px-4 py-2 rounded-full hover:from-blue-500 hover:to-indigo-600 transition duration-300"
                >
                  Gacha
                </Link>
                <Link
                  to="/collections"
                  className="bg-gradient-to-r from-green-400 to-blue-500 text-white px-4 py-2 rounded-full hover:from-green-500 hover:to-blue-600 transition duration-300"
                >
                  Collection
                </Link>
                <Link
                  to="/about"
                  className="bg-gradient-to-r from-orange-400 to-red-500 text-white px-4 py-2 rounded-full hover:from-orange-500 hover:to-red-600 transition duration-300"
                >
                  <ShoppingCart className="w-5 h-5 mr-2 inline" />
                  About
                </Link>
                
                <button
                  onClick={logout}
                  className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-full hover:from-pink-600 hover:to-purple-700 transition duration-300"
                >
                  Logout
                </button>
              </div>
            </header>

            <Routes>
              <Route path="/" element={<Gacha />} />
              <Route path="/collections" element={<Collection account={account} />} />
              <Route path="/about" element={<About />} />
              <Route path="/change-password" element={<ChangePassword />} />
              <Route path="/login-logs" element={<LoginLogTable />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </>
        )}
      </div>
    </Router>
  );
}



export default App;
