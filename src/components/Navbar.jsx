import { Outlet, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FaUserShield } from "react-icons/fa";
import { useState } from "react";
import { useNotification } from "../context/NotificationContext";
import { FiMenu, FiX } from "react-icons/fi";

export default function Navbar() {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { showNotification } = useNotification();

  const isAdmin = auth?.user?.role === "dealer";

  const handleLogout = () => {
    logout();
    showNotification({
      type: "success",
      message: "Logged out successfully!",
      duration: 3000,
    });
    navigate("/login");
  };

  const goProfile = () => {
    if (isAdmin) navigate(`/profile/${auth?.user?._id}`);
  };

  return (
    <nav className="w-full fixed top-0 left-0 z-50 px-4 py-4 bg-dark border-b border-neon">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link to="/home" className="orbitron text-neon text-xl font-bold">
          The Grand Acme
        </Link>

        {/* Hamburger icon (mobile) */}
        <div className="md:hidden">
          <button onClick={() => setMenuOpen(!menuOpen)} className="text-neon text-2xl">
            {menuOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>

        {/* Desktop menu */}
        <div className="hidden md:flex items-center gap-6">
          {/* Admin Dropdown */}
          {isAdmin && (
            <div className="relative">
              <button onClick={() => setDropdownOpen(!dropdownOpen)}>
                <FaUserShield className="text-neon hover:text-neonLight text-2xl" />
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

          {/* Auth Links */}
          <div className="flex gap-4 items-center text-sm">
            {auth?.token ? (
              <>
                <a onClick={goProfile} className="cursor-pointer">
                  <p className="space-grotesk text-white hover:text-gray-400 truncate">
                    Hi, {auth?.user?.name || "Guest"}!
                  </p>
                </a>
                <button
                  onClick={handleLogout}
                  className="text-white hover:text-neon transition"
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

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden mt-4 space-y-4 bg-darkLight p-4 rounded shadow-lg">
          {isAdmin && (
            <div className="space-y-2">
              <Link
                to="/admin/dashboard"
                className="block text-white hover:text-neon"
              >
                Admin Dashboard
              </Link>
              <Link
                to="/create-trade"
                className="block text-white hover:text-neon"
              >
                Create Trades
              </Link>
            </div>
          )}
          <div className="space-y-2">
            {auth?.token ? (
              <>
                <p
                  onClick={goProfile}
                  className="text-white hover:text-neon cursor-pointer"
                >
                  Hi, {auth?.user?.name || "Guest"}!
                </p>
                <button
                  onClick={handleLogout}
                  className="text-white hover:text-neon"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="block text-white hover:text-neon">
                  Login
                </Link>
                <Link to="/register" className="block text-white hover:text-neon">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
      {/* Outlet for nested routes */}
      <Outlet />
    </nav>
  );
}
