// src/pages/Trades.jsx
import { useEffect, useState } from "react";
import Tabs from "../components/Tabs";
import TradeCard from "../components/TradeCard";
import ChatBox from "../components/ChatBox";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { AiFillMessage } from "react-icons/ai";
import SkeletonCard from "../components/SkeletonCard";

const Trades = () => {
  const [activeTab, setActiveTab] = useState("Buy");
  const [trades, setTrades] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaginating, setIsPaginating] = useState(false);
  const [cryptoFilter, setCryptoFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(7);
  const [hasMore, setHasMore] = useState(true);
  const [observerTarget, setObserverTarget] = useState(null);
  const [unreadCountMap, setUnreadCountMap] = useState({});

  const { auth } = useAuth();
  const currentUserId = auth?.user?._id;
  const totalUnread = Object.values(unreadCountMap).reduce((sum, val) => sum + val, 0);

  // Fetch unread message count
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

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 10000);
    return () => clearInterval(interval);
  }, [currentUserId]);

  // Paginated fetch
  useEffect(() => {
    const fetchTrades = async () => {
      if (isPaginating || isLoading || !hasMore) return;
      setIsPaginating(true);
      try {
        const res = await api.get(`/trades?page=${page}&limit=${limit}`);
        const newTrades = Array.isArray(res.data.trades) ? res.data.trades : [];

        setTrades(prev => {
          const seen = new Set(prev.map(t => t._id));
          const unique = newTrades.filter(t => !seen.has(t._id));
          return [...prev, ...unique];
        });

        setHasMore((page * limit) < (res.data.total || 0));
      } catch (err) {
        console.error("Failed to fetch trades", err);
      } finally {
        setIsPaginating(false);
        setIsLoading(false);
      }
    };

    fetchTrades();
  }, [page]);

  // Reset and fetch on filter change
  useEffect(() => {
    const fetchFilteredTrades = async () => {
      setIsLoading(true);
      try {
        const res = await api.get(`/trades?page=1&limit=${limit}`);
        const newTrades = Array.isArray(res.data.trades) ? res.data.trades : [];

        setTrades(newTrades);
        setPage(1);
        setHasMore(limit < res.data.total);
      } catch (err) {
        console.error("Failed to fetch filtered trades", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFilteredTrades();
  }, [activeTab, cryptoFilter, paymentFilter, minPrice, maxPrice]);

  // Infinite scroll
  useEffect(() => {
    if (!observerTarget || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading && !isPaginating) {
          setPage(prev => prev + 1);
        }
      },
      { threshold: 1.0 }
    );

    observer.observe(observerTarget);
    return () => observer.disconnect();
  }, [observerTarget, hasMore, isLoading, isPaginating]);

  // Filtering logic
  const filteredTrades = (trades || []).filter((trade) => {
    const isTypeMatch =
      activeTab === "Buy" ? trade.type === "buy" :
      activeTab === "Sell" ? trade.type === "sell" : true;

    const isCryptoMatch = cryptoFilter ? trade.crypto === cryptoFilter : true;
    const isPaymentMatch = paymentFilter ? trade.paymentMethod === paymentFilter : true;
    const isMinPriceMatch = minPrice ? trade.price >= parseFloat(minPrice) : true;
    const isMaxPriceMatch = maxPrice ? trade.price <= parseFloat(maxPrice) : true;

    return isTypeMatch && isCryptoMatch && isPaymentMatch && isMinPriceMatch && isMaxPriceMatch;
  });

  const uniqueCryptos = [...new Set((trades || []).map(t => t.crypto))];
  const uniqueMethods = [...new Set((trades || []).map(t => t.paymentMethod))];

  return (
    <div className="bg-dark min-h-screen pt-17 text-white">
      <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="p-4">
        {/* Filters */}
        <div className="mb-4 flex flex-wrap gap-3 sm:gap-4">
          <select
            value={cryptoFilter}
            onChange={(e) => setCryptoFilter(e.target.value)}
            className="bg-darkLight border border-neon text-white p-2 rounded w-full sm:w-auto"
          >
            <option value="">All Cryptos</option>
            {uniqueCryptos.map((crypto) => (
              <option key={crypto} value={crypto}>{crypto}</option>
            ))}
          </select>

          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="bg-darkLight border border-neon text-white p-2 rounded w-full sm:w-auto"
          >
            <option value="">All Payment Methods</option>
            {uniqueMethods.map((method) => (
              <option key={method} value={method}>{method}</option>
            ))}
          </select>

          <input
            type="number"
            placeholder="Min Price"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="bg-darkLight border border-neon text-white p-2 rounded w-full sm:w-auto"
          />

          <input
            type="number"
            placeholder="Max Price"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="bg-darkLight border border-neon text-white p-2 rounded w-full sm:w-auto"
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

        {/* Trade cards */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {isLoading
            ? Array.from({ length: trades.length || 8 }, (_, i) => <SkeletonCard key={i} />)
            : filteredTrades.map((trade) => <TradeCard key={trade._id} trade={trade} />)}
        </div>

        {!isLoading && filteredTrades.length === 0 && (
          <div className="text-center text-gray-400 py-10">No trades found.</div>
        )}

        <div ref={setObserverTarget} className="h-10 mt-10 flex justify-center items-center">
          {hasMore && !isLoading && (
            <span className="text-neon">Loading more...</span>
          )}
        </div>
      </div>

      {/* Chat Floating Button */}
      <div className="fixed bottom-6 right-5 p-4 z-50">
        <Link to="/chat" className="relative inline-block">
          <AiFillMessage className="text-neon text-4xl" />
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
