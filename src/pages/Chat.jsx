// 📁 Chat.jsx
import { useEffect, useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { useLocation, useNavigate } from "react-router-dom";
import { Menu } from "lucide-react";
import { io } from "socket.io-client";

const Chat = () => {
  const { auth } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [conversationId, setConversationId] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [clicked, setClicked] = useState(false);
  const chatEndRef = useRef(null);
  const location = useLocation();
  const socket = useRef();
  const { receiver, preMessage } = location.state || {};
  const userId = auth?.user?._id;
  const navigate = useNavigate();

  // Scroll to latest message
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // ✅ Helper: Avoid message duplication
  const appendMessage = (msg) => {
    setMessages((prev) => {
      if (!prev.some((m) => m._id === msg._id)) {
        return [...prev, msg];
      }
      return prev;
    });
  };

  // Socket connection
  useEffect(() => {
    // socket.current = io("http://localhost:5000");
    socket.current = io("https://p2p-api.up.railway.app", {
      transports: ['polling', 'websocket'],
      withCredentials: true
    });

    socket.current.on("connect", () => {
      if (conversationId) {
        socket.current.emit("join_conversation", conversationId);
      }
      if (userId) {
        socket.current.emit("join_user", userId);
      }
    });

    socket.current.on("receive_message", (msg) => {
      if (msg.conversationId === conversationId) {
        appendMessage(msg);
      } else {
        setUnreadCounts((prev) => ({
          ...prev,
          [msg.conversationId]: (prev[msg.conversationId] || 0) + 1,
        }));
      }
    });

    socket.current.on("connect_error", (err) =>
      console.error("❌ Socket.IO connection error:", err.message)
    );

    return () => {
      socket.current.disconnect();
    };
  }, [conversationId, userId]);

  // Fetch/create conversation if receiver provided
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

  // Fetch messages for conversation
  useEffect(() => {
    if (!conversationId) return;
    const fetchMessages = async () => {
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

  // Fetch all user conversations
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

  // Fetch unread count
  useEffect(() => {
    if (!userId) return;
    const fetchUnreadCounts = async () => {
      try {
        const res = await api.get(`/chat/unread-per-conversation/${userId}`);
        setUnreadCounts(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchUnreadCounts();
  }, [userId, conversationId]);

  // ✅ Send preMessage if any
  useEffect(() => {
    const localStorageKey = `preMessageSent:${conversationId}`;
    const alreadySent = localStorage.getItem(localStorageKey);

    const sendPreMessage = async () => {
      if (preMessage && conversationId && messages.length === 0 && !alreadySent) {
        const newMessage = {
          sender: userId,
          text: preMessage,
          conversationId,
          receiver,
          createdAt: new Date().toISOString(),
        };
        socket.current.emit("send_message", newMessage);
        localStorage.setItem(localStorageKey, "true");
        setClicked(true)
      }
    };
    sendPreMessage();
  }, [conversationId, preMessage, messages.length]);

  // Remove preMessageSent from storage on unmount
  useEffect(() => {
    return () => {
      if (conversationId) {
        localStorage.removeItem(`preMessageSent:${conversationId}`);
      }
    };
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || !conversationId) return;

    const receiverId = conversations
      .find((conv) => conv._id === conversationId)
      ?.members.find((m) => m._id !== userId)?._id;

    const newMessage = {
      sender: userId,
      text: input,
      conversationId,
      receiver: receiverId,
      createdAt: new Date().toISOString(),
    };

    socket.current.emit("send_message", newMessage);
    setInput("");
  };

  const handleConversationSelect = async (conv) => {
    setSelectedConversation(conv);
    setConversationId(conv._id);
    setSidebarOpen(false);
    setClicked(true);

    try {
      const res = await api.get(`/chat/messages/${conv._id}`);
      setMessages(res.data);
      await api.post(`/chat/mark-seen`, {
        conversationId: conv._id,
        userId: userId,
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-4rem)] mt-18 bg-dark text-white">
      {/* Sidebar */}
      <button
        className="md:hidden absolute top-15 left-4 bg-darkLight cursor-pointer z-50 text-neon"
        onClick={() => setSidebarOpen((prev) => !prev)}
      >
        <Menu />
      </button>

      <div
        className={`absolute md:static top-0 left-0 h-full z-40 bg-darkLight w-2/3 sm:w-3/4 md:w-1/4 p-2 sm:p-4 overflow-y-auto border-r border-neon transform transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <h2 className="text-neon font-bold text-lg mt-10 mb-4 mt-20">Chats</h2>
        {conversations.map((conv) => {
          const otherUser = conv.members.find((m) => m._id !== userId);
          const unread = unreadCounts[conv._id] || 0;

          return (
            <div
              key={conv._id}
              onClick={() => handleConversationSelect(conv)}
              className={`relative flex items-center space-x-3 p-4 rounded cursor-pointer mb-2 hover:bg-neonLight hover:text-dark ${
                selectedConversation?._id === conv._id ? "bg-neon text-dark" : "bg-gray-800"
              }`}
            >
              <div className="bg-darkLight w-10 h-10 flex items-center justify-center text-neon border border-neonLight rounded-full">
                {otherUser?.name?.[0]}
              </div>
              <span>{otherUser?.name || "Unknown"}</span>
              {unread > 0 && (
                <span className="absolute top-1 right-2 bg-red-500 text-xs px-2 rounded-full">
                  {unread}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Chat content */}
      <div className="flex-1 flex flex-col p-4 bg-dark rounded-lg">
        <div className="mb-4">
          <h2 className="text-neon text-lg font-bold">
            {selectedConversation
              ? conversations
                  .find((c) => c._id === selectedConversation._id)
                  ?.members.find((m) => m._id !== userId)?.name || "Chat"
              : "Select a conversation"}
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto bg-darkLight rounded p-3 no-scrollbar">
          {clicked ? (
            loading ? (
              <p className="text-center">Loading chat...</p>
            ) : (
              messages.map((msg, idx) => (
                <div
                    key={idx}
                    className={`flex ${
                      (msg.sender === userId || msg.sender?._id === userId) ? "justify-end" : "justify-start"
                    }`}
                  >
                  <div
                    className={`mb-2 px-4 py-2 max-w-[85%] rounded-xl text-sm ${
                      (msg.sender === userId || msg.sender?._id === userId) ? "bg-blue-500 text-white" : "bg-gray-700 text-white"
                    }`}
                  >
                    {msg.text}
                    <div className="text-xs text-gray-400 mt-1">
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              ))
            )
          ) : (
            <p className="text-center">Start Messaging</p>
          )}
          <div ref={chatEndRef} />
        </div>

        {clicked && (
          <div className="flex gap-2 mt-4">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 bg-darkLight border border-neon px-3 py-2 rounded outline-none"
            />
            <button onClick={handleSend} className="bg-neon text-dark px-4 py-2 rounded">
              Send
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
