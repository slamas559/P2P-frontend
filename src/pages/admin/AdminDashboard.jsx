import { useEffect, useState } from "react";
import { FaUsers, FaExchangeAlt, FaUserShield } from "react-icons/fa";
import api from "../../services/api";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTrades: 0,
    totalAdmins: 0,
  });
  const [users, setUsers] = useState([]);
  const [trades, setTrades] = useState([]);
  const [totalTrades, setTotalTrades] = useState(0);

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const [userSearch, setUserSearch] = useState("");
  const [tradeSearch, setTradeSearch] = useState("");

  const [filteredUsers, setFilteredUsers] = useState([]);
  const [filteredTrades, setFilteredTrades] = useState([]);

  const [tradePage, setTradePage] = useState(1);
  const tradeLimit = 12;

  // Fetch trades with pagination
  const fetchTrades = async (page = 1) => {
    try {
      const res = await api.get(`/trades?page=${page}&limit=${tradeLimit}`);
      const data = res.data || {};
      const tradeArray = Array.isArray(data.trades) ? data.trades : [];
      setTrades(tradeArray);
      setTotalTrades(data.total || 0);
    } catch (err) {
      console.error("Error fetching trades", err);
      setTrades([]);
      setTotalTrades(0);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get("/admin/users");
      const data = Array.isArray(res.data) ? res.data : [];
      setUsers(data);
    } catch (err) {
      console.error("Error fetching users:", err);
      setUsers([]);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await api.get("/admin/stats");
      setStats(res.data);
    } catch (err) {
      console.error("Error fetching admin stats:", err);
    }
  };

  useEffect(() => {
    fetchTrades(tradePage);
    fetchUsers();
    fetchStats();
  }, [tradePage]);

  // Filter users on search change or users update
  useEffect(() => {
    const lower = userSearch.toLowerCase();
    const filtered = Array.isArray(users)
      ? users.filter(
          (user) =>
            (user.name && user.name.toLowerCase().includes(lower)) ||
            (user.email && user.email.toLowerCase().includes(lower)) ||
            (user.role && user.role.toLowerCase().includes(lower))
        )
      : [];
    setFilteredUsers(filtered);
  }, [userSearch, users]);

  // Filter trades on search or trades update
  useEffect(() => {
    const lower = tradeSearch.toLowerCase();
    const filtered = Array.isArray(trades)
      ? trades.filter(
          (trade) =>
            (trade._id && trade._id.toLowerCase().includes(lower)) ||
            (trade.crypto && trade.crypto.toLowerCase().includes(lower)) ||
            (trade.type && trade.type.toLowerCase().includes(lower)) ||
            (trade.paymentMethod && trade.paymentMethod.toLowerCase().includes(lower))
        )
      : [];
    setFilteredTrades(filtered);
  }, [tradeSearch, trades]);

  const handleEdit = (trade) => {
    setEditingId(trade._id);
    setEditForm(trade);
  };

  const handleUpdate = async () => {
    try {
      await api.put(`/trades/update/${editingId}`, editForm);
      setEditingId(null);
      fetchTrades(tradePage);
    } catch (err) {
      console.error("Update failed", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/trades/delete/${id}`);
      fetchTrades(tradePage);
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const toggleAdmin = async (userId, currentRole) => {
    try {
      const endpoint =
        currentRole === "dealer"
          ? `/admin/remove-admin/${userId}`
          : `/admin/make-admin/${userId}`;

      await api.put(endpoint);
      fetchUsers();
    } catch (err) {
      console.error("Error changing role:", err);
    }
  };

  // Pagination buttons for trades
  const totalPages = Math.ceil(totalTrades / tradeLimit);

  return (
    <div className="p-6 text-white min-h-screen mt-20 bg-dark">
      <h1 className="text-3xl font-bold text-neon mb-6 orbitron">Admin Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard icon={<FaUsers size={28} />} title="Total Users" value={stats.totalUsers} color="text-blue-400" />
        <StatCard icon={<FaExchangeAlt size={28} />} title="Total Trades" value={stats.totalTrades} color="text-green-400" />
        <StatCard icon={<FaUserShield size={28} />} title="Total Admins" value={stats.totalAdmins} color="text-yellow-400" />
      </div>

      {/* User Management */}
      <div className="md:p-6 bg-darkLight space-grotesk rounded-xl text-white">
        <h2 className="text-2xl font-bold mb-4 orbitron text-neon">User Management</h2>
        <input
          type="text"
          placeholder="Search by name, email, or role..."
          value={userSearch}
          onChange={(e) => setUserSearch(e.target.value)}
          className="mb-4 w-full p-2 rounded bg-dark text-white border border-neon placeholder-gray-400 focus:outline-none"
        />
        <div className="overflow-auto max-h-[500px] border-neon rounded-lg no-scrollbar">
          <table className="w-full table-auto text-sm">
            <thead className="bg-dark">
              <tr>
                <th className="p-2">Name</th>
                <th className="p-2">Email</th>
                <th className="p-2">Role</th>
                <th className="p-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user._id} className="border-t border-gray-600">
                    <td className="p-2">{user.name}</td>
                    <td className="p-2">{user.email}</td>
                    <td className="p-2">{user.role}</td>
                    <td className="p-2">
                      <button
                        onClick={() => toggleAdmin(user._id, user.role)}
                        className={`px-3 py-1 rounded ${
                          user.role === "dealer" ? "text-red-500" : "text-green-500"
                        }`}
                      >
                        {user.role === "dealer" ? "Remove Admin" : "Make Admin"}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center p-4 text-gray-400">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Trade Management */}
      <div className="md:p-6 mt-4 bg-darkLight space-grotesk rounded-xl text-white">
        <h2 className="text-2xl font-bold mb-4 orbitron text-neon">Manage Trades</h2>
        <input
          type="text"
          placeholder="Search by Trade ID, Crypto, Type, or Payment Method..."
          value={tradeSearch}
          onChange={(e) => setTradeSearch(e.target.value)}
          className="mb-4 w-full p-2 rounded bg-dark text-white border border-neon placeholder-gray-400 focus:outline-none"
        />

        <div className="overflow-auto max-h-[500px] border-neon rounded-lg no-scrollbar">
          <table className="w-full table-auto text-sm">
            <thead className="bg-dark">
              <tr>
                <th className="p-3 text-left">Trade ID</th>
                <th className="p-3">Crypto</th>
                <th className="p-3">Type</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Price</th>
                <th className="p-3">Payment</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTrades.length > 0 ? (
                filteredTrades.map((trade) => (
                  <tr key={trade._id} className="border-t border-gray-600">
                    <td className="p-2">{trade._id}</td>
                    <td className="p-3">
                      {editingId === trade._id ? (
                        <input
                          value={editForm.crypto}
                          onChange={(e) => setEditForm({ ...editForm, crypto: e.target.value })}
                          className="bg-dark border px-2 py-1 rounded text-white w-full"
                        />
                      ) : (
                        trade.crypto
                      )}
                    </td>
                    <td className="p-3">{trade.type}</td>
                    <td className="p-3">
                      {editingId === trade._id ? (
                        <input
                          type="number"
                          value={editForm.amount}
                          onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                          className="bg-dark border px-2 py-1 rounded text-white w-full"
                        />
                      ) : (
                        trade.amount
                      )}
                    </td>
                    <td className="p-3">
                      {editingId === trade._id ? (
                        <input
                          type="number"
                          value={editForm.price}
                          onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                          className="bg-dark border px-2 py-1 rounded text-white w-full"
                        />
                      ) : (
                        trade.price
                      )}
                    </td>
                    <td className="p-3">
                      {editingId === trade._id ? (
                        <input
                          value={editForm.paymentMethod}
                          onChange={(e) => setEditForm({ ...editForm, paymentMethod: e.target.value })}
                          className="bg-dark border px-2 py-1 rounded text-white w-full"
                        />
                      ) : (
                        trade.paymentMethod
                      )}
                    </td>
                    <td className="p-3 space-x-2">
                      {editingId === trade._id ? (
                        <>
                          <button onClick={handleUpdate} className="bg-neon text-dark px-3 py-1 rounded">
                            Save
                          </button>
                          <button onClick={() => setEditingId(null)} className="text-gray-400 hover:underline text-sm">
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => handleEdit(trade)} className="text-blue-400 hover:underline text-sm">
                            Edit
                          </button>
                          <button onClick={() => handleDelete(trade._id)} className="text-red-400 hover:underline text-sm">
                            Delete
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center p-4 text-gray-500">
                    No trades found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="mt-4 flex justify-center gap-2">
            <button
              onClick={() => setTradePage((p) => Math.max(p - 1, 1))}
              disabled={tradePage === 1}
              className="px-3 py-1 rounded bg-neonLight text-dark disabled:opacity-50"
            >
              Prev
            </button>
            <span className="px-3 py-1 rounded bg-darkLight">{tradePage}</span>
            <button
              onClick={() => setTradePage((p) => Math.min(p + 1, totalPages))}
              disabled={tradePage === totalPages}
              className="px-3 py-1 rounded bg-neonLight text-dark disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ icon, title, value, color }) => (
  <div className="bg-darkLight p-5 border border-neonLight rounded-xl shadow-md flex items-center gap-4">
    <div className={`text-3xl ${color}`}>{icon}</div>
    <div>
      <p className="text-lg font-semibold space-grotesk">{title}</p>
      <p className="text-2xl font-bold orbitron">{value}</p>
    </div>
  </div>
);

export default AdminDashboard;
