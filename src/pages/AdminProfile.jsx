import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useParams } from "react-router-dom";
import api from "../services/api";
import { Copy } from "lucide-react";
import SkeletonProfile from "../components/SkeletonProfile"; // Import your skeleton loader component

const AdminProfile = () => {
  const { id } = useParams(); // profile owner ID from route
  const { auth } = useAuth();
  const [admin, setAdmin] = useState(null);
  const [wallets, setWallets] = useState([]);
  const [newWallet, setNewWallet] = useState({ exchange: "", name: "", address: "" });
  const [copied, setCopied] = useState("");
  const [edit, setEdit] = useState(false);
  const [loading, setLoading] = useState(true);

  const isOwner = auth?.user?._id === id;

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const res = await api.get(`/user/${id}`);
        setAdmin(res.data);
        setWallets(res.data.wallets || []);
        setLoading(false)
      } catch (err) {
        console.error(err);
      }
    };
    fetchAdmin();
  }, [id]);

  const handleAddWallet = async () => {
    if (!newWallet.exchange || !newWallet.name || !newWallet.address) return;
    try {
      const res = await api.post(`/user/${id}/wallets`, newWallet);
      setWallets((prev) => [...prev, res.data]);
      setNewWallet({ exchange: "", name: "", address: "" });
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopy = (address) => {
    navigator.clipboard.writeText(address);
    setCopied(address);
    setTimeout(() => setCopied(""), 1500);
  };

  if (!admin) return <p className="text-white text-center mt-10">Loading...</p>;

  return (
    loading ? (
      <SkeletonProfile />
    ) : (
      <div className="max-w-4xl mx-auto p-6 bg-dark text-white mt-20 rounded-xl shadow-xl mt-10 space-grotesk">
        {/* Profile Header */}
        <div className="flex flex-col items-center mb-6">
            <div className="flex items-center text-[60px]  bg-neonLight justify-center w-24 h-24 rounded-full border-4 border-neon mb-4">
                {admin.name[0].toUpperCase()}
            </div>
            
            {isOwner ? (
            <>
                { edit ? (
                <div className="flex flex-col items-center max-w-xl">
                        <input
                        type="text"
                        value={admin.name}
                        onChange={(e) => setAdmin({ ...admin, name: e.target.value })}
                        className="text-center text-xl orbitron text-neon bg-dark border border-neonLight mb-2"
                        />
                        <p className="text-gray-400 text-sm">{admin.email}</p>

                        <textarea
                        value={admin.bio || ""}
                        onChange={(e) => setAdmin({ ...admin, bio: e.target.value })}
                        className="w-full bg-dark text-white border border-neonLight rounded p-2 text-center"
                        rows={3}
                        placeholder="Enter your bio"
                        />
                        <button
                        onClick={async () => {
                            try {
                            const res = await api.put(`/user/${id}`, {
                                name: admin.name,
                                bio: admin.bio,
                                
                            });
                            setAdmin(res.data);
                            setEdit(false)
                            } catch (err) {
                            console.error(err);
                            }
                        }}
                        className="mt-2 bg-neon text-dark px-3 py-1 rounded hover:bg-neonLight transition"
                        >
                        Save Changes
                        </button>
                    </div>
            ):(
                <>
                    <h2 className="text-neon text-2xl orbitron">{admin.name}</h2>
                    <p className="text-gray-400 text-sm">{admin.email}</p>
                    <p className="mt-2 text-white text-center max-w-xl">{admin.bio || "No bio available."}</p>
                    <button
                        onClick={async () => {
                            setEdit(true);
                        }}
                        className="mt-2 bg-neon text-dark px-3 py-1 rounded hover:bg-neonLight transition"
                        >
                        Edit Profile
                    </button>
                </>
            )}
            </>   
            ):
            (
                <>
                    <h2 className="text-neon text-2xl orbitron">{admin.name}</h2>
                    <p className="text-gray-400 text-sm">{admin.email}</p>
                    <p className="mt-2 text-white text-center max-w-xl">{admin.bio || "No bio available."}</p>
                </>
            )}

        </div>

        {/* Wallet Addresses */}
        <div className="bg-darkLight rounded-xl p-5 mt-8 shadow-md border border-neonLight">
            <h3 className="text-xl text-neon orbitron mb-4">Crypto Wallets</h3>
            {wallets.length === 0 && <p className="text-gray-400">No wallets added.</p>}
            {wallets.map((wallet, idx) => (
            <div
                key={idx}
                className="bg-gray-800 p-4 rounded-lg mb-3 flex flex-col md:flex-row md:items-center md:justify-between"
            >
                <div>
                <p className="text-neon text-sm uppercase">{wallet.exchange}</p>
                <p className="text-white">{wallet.name}</p>
                <p className="text-gray-400 text-sm break-all">{wallet.address}</p>
                </div>
                <div className="flex gap-2 mt-2 md:mt-0">
            <button 
                onClick={() => handleCopy(wallet.address)}
                className="text-sm bg-neon text-dark px-3 py-1 rounded hover:bg-neonLight transition"
            >
                {copied === wallet.address ? "Copied!" : "Copy"}
            </button>
            {isOwner && (
                <button
                onClick={async () => {
                    try {
                    await api.delete(`/user/${id}/wallets/${wallet._id}`);
                    setWallets(wallets.filter(w => w._id !== wallet._id));
                    } catch (err) {
                    console.error(err);
                    }
                }}
                className="text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition"
                >
                Delete
                </button>
    )}
    </div>

            </div>
            ))}
        </div>

        {/* Add Wallet - only if owner */}
        {isOwner && (
            <div className="bg-darkLight rounded-xl p-5 mt-8 shadow-md border border-neonLight">
            <h3 className="text-xl text-neon orbitron mb-4">Add New Wallet</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                <input
                type="text"
                placeholder="Exchange (e.g., Binance)"
                value={newWallet.exchange}
                onChange={(e) => setNewWallet({ ...newWallet, exchange: e.target.value })}
                className="px-3 py-2 bg-dark border border-neonLight rounded text-white"
                />
                <input
                type="text"
                placeholder="Wallet Name (e.g., USDT Wallet)"
                value={newWallet.name}
                onChange={(e) => setNewWallet({ ...newWallet, name: e.target.value })}
                className="px-3 py-2 bg-dark border border-neonLight rounded text-white"
                />
                <input
                type="text"
                placeholder="Wallet Address"
                value={newWallet.address}
                onChange={(e) => setNewWallet({ ...newWallet, address: e.target.value })}
                className="px-3 py-2 bg-dark border border-neonLight rounded text-white"
                />
            </div>
            <button
                onClick={handleAddWallet}
                className="bg-neon text-dark px-4 py-2 rounded hover:bg-neonLight transition"
            >
                Add Wallet
            </button>
            </div>
        )}
        </div>
    )
  );
};

export default AdminProfile;
