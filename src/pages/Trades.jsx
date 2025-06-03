// src/pages/Trades.jsx
import { useEffect, useState } from "react";
import Tabs from "../components/Tabs";
import TradeCard from "../components/TradeCard";
import ChatBox from "../components/ChatBox";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { Outlet, Link, useNavigate } from "react-router-dom";
import { AiFillMessage } from "react-icons/ai";
import SkeletonCard from "../components/SkeletonCard";


const Trades = () => {
  const [activeTab, setActiveTab] = useState("Buy");
  const [trades, setTrades] = useState([]);
  const { auth } = useAuth();
  const [cryptoFilter, setCryptoFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const currentUserId = auth?.user?._id;
  const [unreadCountMap, setUnreadCountMap] = useState({});
  const totalUnread = Object.values(unreadCountMap).reduce((sum, val) => sum + val, 0);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        if (!currentUserId) return;
        const res = await api.get(`/chat/unread-per-conversation/${currentUserId}`);
        setUnreadCountMap(res.data || {});
      } catch (err) {
        console.error("Failed to fetch unread count", err);
      }
    };

    const interval = setInterval(fetchUnreadCount, 10000);
    return () => clearInterval(interval);
  }, [currentUserId]);

  useEffect(() => {

    const fetchTrades = async () => {
      try {
        const res = await api.get("/trades");
        setTrades(res.data);
        setIsLoading(false);
      } catch (err) {
        console.error("Failed to fetch trades", err);
      }
    };
    fetchTrades();
  }, []);

  const filteredTrades = trades.filter((trade) => {
  const isTypeMatch =
    activeTab === "Buy"
      ? trade.type === "buy"
      : activeTab === "Sell"
      ? trade.type === "sell"
      : true;

  const isCryptoMatch = cryptoFilter ? trade.crypto === cryptoFilter : true;
  const isPaymentMatch = paymentFilter ? trade.paymentMethod === paymentFilter : true;
  const isMinPriceMatch = minPrice ? trade.price >= parseFloat(minPrice) : true;
  const isMaxPriceMatch = maxPrice ? trade.price <= parseFloat(maxPrice) : true;

  return (
    isTypeMatch &&
    isCryptoMatch &&
    isPaymentMatch &&
    isMinPriceMatch &&
    isMaxPriceMatch
      );
    });


  return (
    <div className="bg-dark min-h-screen pt-17 text-white">
        <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="p-4">
        <div className="mb-4 flex flex-wrap gap-4">
          <select
            value={cryptoFilter}
            onChange={(e) => setCryptoFilter(e.target.value)}
            className="bg-darkLight border border-neon text-white p-2 rounded"
          >
            <option value="">All Cryptos</option>
            {[...new Set(trades.map(t => t.crypto))].map(crypto => (
              <option key={crypto} value={crypto}>{crypto}</option>
            ))}
          </select>

          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="bg-darkLight border border-neon text-white p-2 rounded"
          >
            <option value="">All Payment Methods</option>
            {[...new Set(trades.map(t => t.paymentMethod))].map(method => (
              <option key={method} value={method}>{method}</option>
            ))}
          </select>

          <input
            type="number"
            placeholder="Min Price"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="bg-darkLight border border-neon text-white p-2 rounded"
          />

          <input
            type="number"
            placeholder="Max Price"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="bg-darkLight border border-neon text-white p-2 rounded"
          />

          <button
            onClick={() => {
              setCryptoFilter("");
              setPaymentFilter("");
              setMinPrice("");
              setMaxPrice("");
            }}
            className="text-neon underline text-sm"
          >
            Clear Filters
          </button>

        </div>
 
        <div className="grid pt-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {isLoading
          ? Array.from({ length: trades.length || 8 }, (_, i) => <SkeletonCard key={i} />)
          : filteredTrades.map((trade) => <TradeCard key={trade._id} trade={trade} />)}

        </div>
      </div>
        <div className="fixed bottom-25 right-5 p-4 border-neon">
          <Link to="/chat">
            <AiFillMessage className="size-18 color-neon"/>
            {totalUnread > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-xs text-white px-2 py-0.5 rounded-full">
              {totalUnread}
            </span>
          )}
          </Link>
        </div>
    </div>
  );
};

export default Trades;
