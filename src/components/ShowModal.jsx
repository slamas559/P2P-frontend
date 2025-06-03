
const ShowModal = ({onClose, trade, amount, error, handleMax, handleAction, setAmount}) => {
    return(
        <div className="fixed inset-0 bg-transparent bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-dark border border-neonLight p-6 rounded-xl w-full max-w-sm shadow-lg">
            <h3 className="text-xl text-neon orbitron mb-4">
              {trade.type === "buy" ? "Buy" : "Sell"} {trade.crypto}
            </h3>
            <p className="space-grotesk"><span className="text-gray-400 text-sm inter mb-5">Quantity </span>{trade.amount.toLocaleString()}</p>
            <input
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={setAmount}
              className="w-full px-4 py-2 mb-2 rounded bg-darkLight border border-neonLight text-white focus:outline-none"
            />
            {error && <p className="text-red-400 text-sm mb-2">{error}</p>}
            <div className="flex justify-between mb-4">
              <button
                onClick={handleMax}
                className="text-neon text-sm hover:underline"
              >
                Max
              </button>
              <button
                onClick={onClose}
                className="text-gray-400 text-sm hover:underline"
              >
                Cancel
              </button>
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