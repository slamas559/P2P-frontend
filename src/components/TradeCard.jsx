import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import ShowModal from "../components/ShowModal"

const TradeCard = ({ trade }) => {
  const [showModal, setShowModal] = useState(false);
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleMax = () => {
    setAmount(trade.amount);
    setError("");
  };

  const handleAction = () => {
    const numericAmount = parseFloat(amount);
    if (!numericAmount || numericAmount <= 0) {
      setError("Please enter a valid amount.");
      return;
    }
    if (numericAmount > trade.amount) {
      setError("Amount exceeds available quantity.");
      return;
    }
    setError("");
    setShowModal(false);
    // Redirect to chat page with prefilled message
    navigate("/chat", {
      state: {
        preMessage: `I want to ${trade.type} ${numericAmount} ${trade.crypto} at ${trade.price}/NGN`,
        receiver: trade.createdBy._id,
      }
    });
  };

  const goProfile = () => {
    navigate(`/profile/${trade.createdBy._id}`);
  }

  return (
    <div className="flex justify-between items-center bg-darkLight border-neon p-4 rounded-xl m-2 shadow-md">
      <div>
        <p className="text-neon font-bold text-lg orbitron">{trade.crypto}</p>
        <a onClick={goProfile} className={`flex align-center items-center space-x-3 mb-2 rounded cursor-pointer text-gray-300 hover:bg-neonLight hover:text-dark `}>
          <div className="flex items-center justify-center bg-darkLight w-6 h-6 text-neon text-sm border border-neonLight border-2 rounded-full">{trade.createdBy.name[0]}</div> <span className="hover:text-gray-400">{trade.createdBy.name}</span>
        </a>
        <p className="text-gray-400 text-sm">ID: {trade._id}</p>
        <p className="text-white text-xl space-grotesk">
          {trade.price.toLocaleString()}<span className="text-gray-400 text-sm">/NGN</span>
        </p>
        <p className="space-grotesk"><span className="text-gray-400 text-sm inter">Quantity </span>{trade.amount.toLocaleString()}</p>
        <p className="text-gray-400 text-sm">Payment Method: {trade.paymentMethod}</p>
      </div>
      <div className="flex flex-col justify-between">
        <button
          onClick={() => setShowModal(true)}
          className={`${
            trade.type === "buy" ? "bg-green-700" : "bg-red-500"
          } space-grotesk text-dark px-4 py-2 rounded hover:bg-neonLight transition-colors`}
        >
          {trade.type === "buy" ? "Buy" : "Sell"}
        </button>
      </div>

      {showModal && (
        <ShowModal trade={trade} error={error} amount={amount} handleMax={handleMax} handleAction={handleAction} setAmount={(e) => setAmount(e.target.value)} onClose={() => setShowModal(false)} />
      )}
    </div>
    
  );
};

export default TradeCard;
