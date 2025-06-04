// src/components/Navbar.jsx
import { Outlet, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FaUserShield } from "react-icons/fa";
import { useEffect } from "react";
import { useState } from "react";
import { useNotification } from '../context/NotificationContext';

export default function Navbar() {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { showNotification } = useNotification();
  
  const handleClick = () => {
    showNotification({
      type: 'success',
      message: 'Logged out successfully!',
      duration: 3000,
    });
  }
  

  const isAdmin = auth?.user?.role === "dealer";

  const goProfile = () => {
    isAdmin && navigate(`/profile/${auth?.user?._id}`);
  }

  const handleLogout = () => {
    logout();
    handleClick(); // Show success notification
    navigate("/login");
  };

  return (
    <nav className="w-full fixed top-0 left-0 z-50 px-4 py-4 bg-dark border-b border-neon">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/home" className="orbitron text-neon text-xl font-bold">
          The Grand Acme
        </Link>


        <div className="flex items-center gap-6">
        <div className="flex items-center gap-4">
            {/* Conditionally render admin dropdown */}
            {isAdmin && (
              <div className="relative">
                <button onClick={() => setDropdownOpen(!dropdownOpen)}>
                  <FaUserShield className="text-neon hover:neonLight text-2xl" />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-darkLight border border-neon rounded-lg shadow-lg z-50">
                    <Link
                      to="/admin/dashboard"
                      className="block px-4 py-2 text-white hover:bg-neon hover:text-dark rounded-t"
                    >
                      Admin Dashboard
                    </Link>
                    <Link
                      to="/create-trade"
                      className="block px-4 py-2 text-white hover:bg-neon hover:text-dark rounded-b"
                    >
                      Create Trades
                    </Link>
                  </div>
                )}
              </div>
            )}
        </div>
        <div className="flex gap-4 items-center text-sm">
          {auth?.token ? (
            <>
              <a onClick={goProfile} className="cursor-pointer transition">
                <p className="space-grotesk hover:text-gray-400 text-gray-200 truncate sm:block">
                  Hi, {auth?.user?.name || "Guest"}!
                </p>
              </a>
              <button
                onClick={handleLogout}
                className="text-white hover:text-neon cursor-pointer transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-white hover:text-neon">
                Login
              </Link>
              <Link to="/register" className="text-white hover:text-neon">
                Register
              </Link>
            </>
          )}
        </div>
        </div>
      </div>
    </nav>
  );
}
