
const ShowModal = ({onClose, trade, amount, total, error, handleMax, handleAction, setAmount}) => {
  const formattedTotal = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  }).format(total);

    return(
        <div className="fixed inset-0 bg-transparent bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-dark border border-neonLight p-6 rounded-xl w-full max-w-sm shadow-lg">
            <div className="flex justify-between mb-4">
              <h3 className="text-xl text-neon orbitron mb-4">
                {trade.type === "buy" ? "Buy" : "Sell"} {trade.crypto}
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 text-sm hover:underline"
              >
                Cancel
              </button>
            </div>
            <p className="space-grotesk mb-3"><span className="text-gray-400 text-sm inter">Quantity </span>{trade.amount.toLocaleString()}</p>
            <div className="flex w-full py-2 border rounded align-center justify-center border-neonLight bg-darkLight items-center mb-4">
              <input
                type="number"
                placeholder={`Enter ${trade.crypto} amount`}
                value={amount}
                onChange={setAmount}
                className="w-full px-4 rounded text-white focus:outline-none"
              />
              <button
                  onClick={handleMax}
                  className="px-4 border-l border-gray-600 text-neon hover:underline"
                >
                  All
                </button>
            </div>
            {error && <p className="text-red-400 text-sm mb-2">{error}</p>}
            <div className="flex justify-between mb-4">
              <p
                className="text-neon text-sm hover:underline"
              >
                { trade.type === "buy" ? "I will pay": "I will receive" }
              </p>
              <p className="space-grotesk">{formattedTotal}</p>
              
            </div>
            <button
              onClick={handleAction}
              className="w-full bg-neon text-dark font-bold py-2 rounded hover:bg-neonLight transition"
            >
              {trade.type === "buy" ? "Buy Now" : "Sell Now"}
            </button>
          </div>
        </div>    

    )}
    
    


export default ShowModal