import { useEffect, useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { useLocation } from "react-router-dom";
import { Menu } from "lucide-react"; // optional: any icon library you prefer
import { io } from "socket.io-client";

const Chat = () => {
  const { auth } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [openChat, setOpenChat] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false); // 👈 Toggle state for mobile
  const chatEndRef = useRef(null);
  const location = useLocation();
  const preMessageSent = useRef(false);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [clickedConversation, setClickedConversation] = useState(null);
  const { receiver, preMessage } = location.state || {};

  const userId = auth?.user?._id;

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const socket = useRef();

  useEffect(() => {
    // socket.current = io("http://localhost:5000"); // Change for production
    socket.current = io("https://p2p-api.up.railway.app", {
      transports: ['websocket'],
      withCredentials: true
    });

    if (conversationId) {
      socket.current.emit("join_conversation", conversationId);
    }

    socket.current.on("connect_error", (err) => {
      console.error("❌ Socket.IO connection error:", err.message);
    });


    socket.current.on("receive_message", (msg) => {
      const normalizedMsg = {
          ...msg,
          sender: msg.sender?._id || msg.userId || "unknown", // fallback if sender is missing
          text: msg.text || "",
          receiver: msg.receiver?._id || msg.receiver || "unknown", // fallback if receiver is missing
          conversationId: msg.conversationId || "",
          createdAt: msg.createdAt || new Date().toISOString(),
      };
      setMessages((prev) => [...prev, normalizedMsg]);
    });

    return () => {
      socket.current.disconnect();
    };
  }, [conversationId]);

  useEffect(() => {
    if (!receiver) return;
    const setupConversation = async () => {
      try {
        const res = await api.post("/chat/conversation", { receiver });
        setConversationId(res.data._id);
        setSelectedConversation(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    setupConversation();
  }, [receiver]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!conversationId) return;
      try {
        const res = await api.get(`/chat/messages/${conversationId}`);
        setMessages(res.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchMessages();
  }, [conversationId]);

  useEffect(() => {
    const fetchUnreadCounts = async () => {
      if (!userId) {
        return;
      }
      try {
        const res = await api.get(`/chat/unread-per-conversation/${auth?.user?._id}`);
        setUnreadCounts(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchUnreadCounts();
  }, [auth?.user?._id, conversationId, clickedConversation]);

  useEffect(() => {
  const sendPreMessage = async () => {
    if (preMessage && conversationId && !preMessageSent.current) {
      const newMessage = {
        sender: auth?.user?._id,
        text: preMessage,
        conversationId,
        receiver,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, newMessage]);
      await api.post("/chat/message", newMessage);
      socket.current.emit("send_message", {
        conversationId,
        message: newMessage,
      });
      preMessageSent.current = true;
    }
  };
  sendPreMessage();
}, [conversationId, preMessage, receiver, auth?.user?._id]);


  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await api.get(`/chat/conversations`);
        setConversations(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchConversations();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);


  const handleSend = async () => {
    if (!input.trim() || !conversationId) return;
    const newMessage = {
      sender: auth?.user?._id,
      text: input,
      conversationId,
      receiver:conversations.find(conv => conv._id === conversationId)?.members.find(member => member._id !== auth?.user?._id)?._id || "unknown",
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, { ...newMessage}]);
    setInput("");
    await api.post("/chat/message", newMessage);
    socket.current.emit("send_message", {
    conversationId,
    message: newMessage,
});
  };

  const handleConversationSelect = async (conversation) => {
    setSelectedConversation(conversation);
    setConversationId(conversation._id);
    setSidebarOpen(false); // 👈 Close sidebar on mobile when a chat is selected
    setOpenChat(true);
    try {
      const res = await api.get(`/chat/messages/${conversation._id}`);
      await api.post(`/chat/mark-seen`, {
        conversationId: conversation._id,
        userId: auth?.user?._id,
      });
      setClickedConversation(conversation._id);
      setMessages(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-4rem)] mt-18 bg-dark text-white space-grotesk relative">

      {/* Mobile Toggle Button */}
      <button
        className="md:hidden absolute top-4 left-4 z-50  text-neon p-2 rounded"
        onClick={() => setSidebarOpen((prev) => !prev)}
      >
        <Menu />
      </button>

      {/* Sidebar */}
      <div
        className={`absolute md:static top-0 left-0 h-full z-40 bg-darkLight w-3/4 md:w-1/4 p-4 overflow-y-auto border-r border-neon transform transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <h2 className="text-neon font-bold text-lg mt-10 mb-4">Chats</h2>
        {conversations.map((conv) => {
          const otherUser = conv.members.find(member => member._id !== auth?.user?._id);
          const unreadCount = unreadCounts[conv._id] || 0;

          return (
            <div
              key={conv._id}
              onClick={() => handleConversationSelect(conv)}
              className={`flex align-center items-center space-x-3 p-5 rounded cursor-pointer mb-2 hover:bg-neonLight hover:text-dark ${
                selectedConversation?._id === conv._id ? "bg-neon text-dark" : "bg-gray-800"
              }`}
            >
              <div className="flex items-center justify-center bg-darkLight w-10 h-10 text-neon text-lg border border-neonLight border-2 rounded-full">{otherUser?.name[0]}</div>
              <span>{otherUser?.name || "Unknown"}</span>
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 bg-red-500 text-xs text-white px-2 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Chat Panel */}
      <div className="flex-1 flex max-w-120 h-full flex-col p-4 bg-dark rounded-lg relative">

        <div className="flex-1 h-full overflow-y-auto no-scrollbar bg-darkLight rounded-b-lg px-3 py-2">
          {/* {openChat ? ( */}
           { loading ? (
              <p className="text-white text-center">Loading chat...</p>
            ) : (
              messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.sender === auth?.user?._id ? "justify-end" : "justify-start"}`}>
                  <div className={`mb-3 max-w-[85%] px-4 py-2 rounded-xl text-sm ${
                    msg.sender === auth?.user?._id
                      ? "bg-neon text-dark"
                      : "bg-gray-700 text-white"
                  }`}>
                    <p>{msg.text}</p>
                    <span className="text-xs text-gray-400 block mt-1">
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              ))
            )}
            
          
          <div ref={chatEndRef} />
        </div>

        <div className="flex items-center gap-2 mt-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 bg-darkLight border border-neon px-4 py-2 text-white rounded outline-none focus:border-neonLight"
          />
          <button
            onClick={handleSend}
            className="bg-neon text-dark px-4 py-2 rounded hover:bg-neonLight"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
