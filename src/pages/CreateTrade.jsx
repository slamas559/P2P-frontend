import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import Select from 'react-select'
import { useNotification } from '../context/NotificationContext';


const CreateTrade = () => {
  const { auth } = useAuth();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  

  const [form, setForm] = useState({
    type: "",
    crypto: "",
    amount: "",
    price: "",
    paymentMethod: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleError = () => {
    showNotification({
      type: 'error',
      message: 'Trade creation failed. Please try again.',
      duration: 3000,
    });
  };
  const handleSuccess = () => {
    showNotification({
      type: 'success',
      message: 'Trade created successfully!',
      duration: 3000,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/trades", form)
      handleSuccess(); // Show success notification
      navigate("/home");
    } catch (err) {
      handleError(); // Show error notification
    }
  };

  // Restrict to only admin (assuming your backend sets role or email for admin)
  if (!auth?.user?.role === 'dealer') {
    return <p className="text-center text-red-400 mt-10">Access Denied. Only admin can create trades.</p>;
  }

  return (
    // <div className="min-h-screen bg-dark text-white flex items-center justify-center font-sans">
    <div className="max-w-sm mx-auto mt-10 p-6 bg-dark border mt-24 border-neon rounded-xl">
      <h2 className="text-neon text-2xl mb-4 font-semibold">Create Trade</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <select
          name="type"
          value={form.type}
          onChange={handleChange}
          className="w-full p-2 rounded bg-dark border border-neon text-white"
          placeholder="Select Trade Type"
        >
          <option value="Select Trade Mode">Select Trade Mode</option>
          <option value="buy">Buy</option>
          <option value="sell">Sell</option>
        </select>

        <select
          type="text"
          name="crypto"
          value={form.crypto}
          onChange={handleChange}
          className="w-full p-2 rounded bg-dark border border-neon text-white"
        >
            <option value="Select Crypto">Select Crypto</option>
            <option value="USDT">USDT</option>
            <option value="BTC">BTC</option>
            <option value="ETH">ETH</option>
            <option value="BUSD">BUSD</option>
            <option value="XRP">XRP</option>
            <option value="ADA">ADA</option>
            <option value="SOL">SOL</option>
            <option value="DOGE">DOGE</option>
            <option value="DOT">DOT</option>
        </select>

        <input
          type="number"
          name="amount"
          value={form.amount}
          onChange={handleChange}
          placeholder="Quantity"
          className="w-full p-2 rounded bg-dark border border-neon text-white"
        />

        <input
          type="number"
          name="price"
          value={form.price}
          onChange={handleChange}
          placeholder="Rate per"
          className="w-full p-2 rounded bg-dark border border-neon text-white"
        />

        <select
          type="text"
          name="paymentMethod"
          placeholder="Select Payment Method"
          value={form.paymentMethod}
          onChange={handleChange}
          className="w-full p-2 rounded bg-dark border border-neon text-white"
        >
          <option value="select payment">Select Payment Method</option>
          <option value="Bank Transfer">Bank Transfer</option>
          <option value="Exchange">Exchange</option>
        </select>

        <button
          type="submit"
          className="w-full py-2 bg-neon text-dark font-semibold rounded hover:opacity-90"
        >
          Create Trade
        </button>
      </form>
    </div>
    // </div>
  );
};

export default CreateTrade;
