// src/context/AuthContext.jsx
import { createContext, useContext, useState } from "react";
import api from "../services/api"; // Adjust the import based on your project structure
import { useEffect } from "react";


const AuthContext = createContext();


export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(() => {
    const token = localStorage.getItem("token");
    return token ? { token } : null;
  });

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await api.get("user/profile"); // backend should return current user
        setAuth({ token, user: res.data });
      } catch (err) {
        console.error("Failed to load user", err);
        localStorage.removeItem("token");
        setAuth(null);
      }
    };

    fetchUser();
  }, []);
  
  const login = (data) => {
    localStorage.setItem("token", data.token);
    setAuth(data);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setAuth(null);
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
