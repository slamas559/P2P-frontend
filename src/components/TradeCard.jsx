import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ShowModal from "../components/ShowModal";

const TradeCard = ({ trade }) => {
  const [showModal, setShowModal] = useState(false);
  const [amount, setAmount] = useState("");
  const numericAmount = parseFloat(amount);
  const total = !isNaN(numericAmount) && numericAmount > 0 ? numericAmount * trade.price : 0;
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
    navigate("/chat", {
      state: {
        preMessage: `I want to ${trade.type} ${numericAmount} ${trade.crypto} at ${trade.price}/NGN`,
        receiver: trade.createdBy._id,
      },
    });
  };

  const convertToCurrency = (amount) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const goProfile = () => {
    navigate(`/profile/${trade.createdBy._id}`);
  };

  return (
    <div className="flex flex-row md:flex-row justify-between items-center md:items-center bg-darkLight  border-neon p-4 rounded-xl m-2 shadow-md space-y-4 md:space-y-0 md:space-x-4">
      {/* Left Section */}
      <div className="flex-1 ">
        <p className="text-neon font-bold text-xl md:text-xl orbitron mb-2">{trade.crypto}</p>

        <a
          onClick={goProfile}
          className="flex items-center space-x-2 text-gray-300 hover:bg-neonLight hover:text-dark p-2 rounded cursor-pointer w-fit mb-2"
        >
          <div className="flex items-center justify-center w-8 h-8 text-neon text-sm border-2 border-neonLight rounded-full bg-darkLight">
            {trade.createdBy.name[0]}
          </div>
          <span className="text-sm">{trade.createdBy.name}</span>
        </a>

        <p className="text-gray-400 text-xs md:text-xs mb-1">ID: {trade._id}</p>
        <p className={`${ trade.type === "buy"?"text-green-500":"text-red-400" } text-lg md:text-ll font-semibold space-grotesk`}>
          {convertToCurrency(trade.price)}
          <span className="text-gray-400 text-sm">/NGN</span>
        </p>

        <p className="text-white text-sm space-grotesk mt-1">
          <span className="text-gray-400">Quantity: </span>
          {trade.amount.toLocaleString()}
        </p>

        <p className="text-gray-400 text-xs mt-1">Payment Method: {trade.paymentMethod}</p>
      </div>

      {/* Right Section */}
      <div className="w-auto flex md:flex-col justify-center md:justify-center">
        <button
          onClick={() => setShowModal(true)}
          className={`w-full md:w-auto ${
            trade.type === "buy" ? "bg-green-700" : "bg-red-500"
          } text-dark px-4 py-2 rounded font-medium space-grotesk hover:bg-neonLight transition-colors`}
        >
          {trade.type === "buy" ? "Buy" : "Sell"}
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <ShowModal
          trade={trade}
          error={error}
          amount={amount}
          total={total}
          handleMax={handleMax}
          handleAction={handleAction}
          setAmount={(e) => setAmount(e.target.value)}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default TradeCard;
