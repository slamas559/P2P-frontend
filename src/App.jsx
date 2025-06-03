// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Trades from "./pages/Trades";
import Navbar from "./components/Navbar";
import CreateTrade from "./pages/CreateTrade";
import ProtectedRoute from "./components/ProtectedRoute";
import Chat from "./pages/Chat.jsx"
import AdminDashboard from "./pages/admin/AdminDashboard";
import WelcomePage from "./pages/WelcomePage";
import RequireAdmin from "./components/RequireAdmin"; // Create this component
import AdminProfile from "./pages/AdminProfile"; // Import AdminProfile
import { GoogleOAuthProvider } from "@react-oauth/google";


function App() {
  return (
    <BrowserRouter>
    <Navbar />
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/home" element={<Trades />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/profile/:id" element={<AdminProfile />} />
        <Route path="/create-trade" element={<ProtectedRoute><CreateTrade /></ProtectedRoute>} />
        <Route path="/admin" element={<RequireAdmin />}>
          <Route path="dashboard" element={<AdminDashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
