import { useEffect, useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { useLocation } from "react-router-dom";
import { Menu } from "lucide-react";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";

const Chat = () => {
  const { auth } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [openChat, setOpenChat] = useState(false);
  const [clicked, setClicked] = useState(false)
  const [conversationId, setConversationId] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const chatEndRef = useRef(null);
  const location = useLocation();
  const preMessageSent = useRef(false);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [clickedConversation, setClickedConversation] = useState(null);
  const { receiver, preMessage } = location.state || {};
  const navigate = useNavigate();

  const userId = auth?.user?._id;

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const socket = useRef();

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
    });

    socket.current.on("connect_error", (err) => {
      console.error("❌ Socket.IO connection error:", err.message);
    });

    socket.current.on("receive_message", (msg) => {
      const normalizedMsg = {
        ...msg,
        sender: msg.sender?._id || msg.userId || "unknown",
        text: msg.text || "",
        receiver: msg.receiver?._id || msg.receiver || "unknown",
        conversationId: msg.conversationId || "",
        createdAt: msg.createdAt || new Date().toISOString(),
      };
      if (normalizedMsg.conversationId === conversationId) {
        setMessages((prev) => [...prev, normalizedMsg]);
      } else {
        setUnreadCounts((prev) => ({
          ...prev,
          [normalizedMsg.conversationId]: (prev[normalizedMsg.conversationId] || 0) + 1,
        }));
      }
    });

    return () => {
      socket.current.disconnect();
    };
  }, [conversationId]);

  useEffect(() => {
    if (socket.current && auth?.user?._id) {
      socket.current.emit("join_user", auth.user._id);
    }
  }, [auth?.user?._id]);

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
    if (conversationId) {
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
    }
  }, [conversationId, receiver]);

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
    const fetchUnreadCounts = async () => {
      if (!userId) return;
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
      if (preMessage && conversationId && messages.length === 0) {
        const localStorageKey = `preMessageSent:${conversationId}`;
        const alreadySent = localStorage.getItem(localStorageKey);

        if (!alreadySent) {
          try {
            const newMessage = {
              sender: auth?.user?._id,
              text: preMessage,
              conversationId,
              receiver,
              createdAt: new Date().toISOString(),
            };

            socket.current.emit("send_message", newMessage);
            setMessages((prev) => [...prev, newMessage]);

            setClicked(true);
            localStorage.setItem(localStorageKey, "true");

          } catch (err) {
            console.error("Failed to send preMessage:", err);
          }
        }
      }
    };
    sendPreMessage();
  }, [conversationId, preMessage, receiver, auth?.user?._id, messages.length]);



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

  const handleSend = async () => {
    if (!input.trim() || !conversationId) return;
    const newMessage = {
      sender: auth?.user?._id,
      text: input,
      conversationId,
      receiver:
        conversations
          .find((conv) => conv._id === conversationId)
          ?.members.find((member) => member._id !== auth?.user?._id)?._id || "unknown",
      createdAt: new Date().toISOString(),
    };
    setInput("");
    socket.current.emit("send_message", newMessage);
  };

  const handleConversationSelect = async (conversation) => {
    setSelectedConversation(conversation);
    setConversationId(conversation._id);
    setSidebarOpen(false);
    setOpenChat(true);
    try {
      const res = await api.get(`/chat/messages/${conversation._id}`);
      await api.post(`/chat/mark-seen`, {
        conversationId: conversation._id,
        userId: auth?.user?._id,
      });
      setClickedConversation(conversation._id);
      setMessages(res.data);
      setClicked(true)
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-4rem)] mt-18 bg-dark text-white space-grotesk relative">
      <button
        className="md:hidden absolute top-4 left-4 z-50 text-neon p-2 rounded"
        onClick={() => setSidebarOpen((prev) => !prev)}
      >
        <Menu />
      </button>

      <div
        className={`absolute md:static top-0 left-0 h-full z-40 bg-darkLight w-2/3 sm:w-3/4 md:w-1/4 p-2 sm:p-4 overflow-y-auto border-r border-neon transform transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <h2 className="text-neon font-bold text-lg mt-10 mb-4">Chats</h2>
        {conversations.map((conv) => {
          const otherUser = conv.members.find((member) => member._id !== auth?.user?._id);
          const unreadCount = unreadCounts[conv._id] || 0;

          return (
            <div
              key={conv._id}
              onClick={() => handleConversationSelect(conv)}
              className={`relative flex items-center space-x-3 p-4 rounded cursor-pointer mb-2 hover:bg-neonLight hover:text-dark ${
                selectedConversation?._id === conv._id ? "bg-neon text-dark" : "bg-gray-800"
              }`}
            >
              <div className="flex items-center justify-center bg-darkLight w-10 h-10 text-neon text-lg border border-neonLight rounded-full">
                {otherUser?.name[0]}
              </div>
              <span className="truncate">{otherUser?.name || "Unknown"}</span>
              {unreadCount > 0 && (
                <span className="absolute top-1 right-2 bg-red-500 text-xs text-white px-2 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex-1 flex w-full h-full flex-col p-3 sm:p-4 bg-dark rounded-lg relative">
        <div className="flex items-center justify-between ml-15 mb-4">
          <a
            onClick={() => {
              navigate(
                `/profile/${conversations
                  .find((conv) => conv._id === selectedConversation._id)
                  ?.members.find((member) => member._id !== auth?.user?._id)?._id}`
              );
            }}
            className="md:hidden text-neon hover:text-neonLight"
          >
            <h2 className="text-neon font-bold text-lg">
              {selectedConversation
                ? conversations
                    .find((conv) => conv._id === selectedConversation._id)
                    ?.members.find((member) => member._id !== auth?.user?._id)?.name || "Chat"
                : "Select a chat"}
            </h2>
          </a>
        </div>

        <div className="flex-1 h-full overflow-y-auto no-scrollbar bg-darkLight rounded-b-lg px-3 py-2">
          {clicked ? 
          (<>
            {loading ? (
            <p className="text-white text-center">Loading chat...</p>
          ) : (
            messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.sender === auth?.user?._id ? "justify-end" : "justify-start"}`}>
                <div
                  className={`mb-2 max-w-[90%] sm:max-w-[85%] px-4 py-2 rounded-xl text-sm ${
                    msg.sender === auth?.user?._id ? "bg-blue-500 text-white" : "bg-gray-700 text-white"
                  }`}
                >
                  <p>{msg.text}</p>
                  <span className="text-xs text-gray-300 block mt-1">
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            ))
          )}
          </>)
          :
          (<div>
            <p className="text-white text-center">Start Messaging</p>
          </div>)}
          
          <div ref={chatEndRef} />
        </div>

        {clicked ? 
        (<>
          <div className="flex items-center gap-2 mt-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 bg-darkLight border border-neon px-3 py-2 sm:px-4 text-white rounded outline-none focus:border-neonLight"
          />
          <button
            onClick={handleSend}
            className="bg-neon text-dark px-3 py-2 rounded hover:bg-neonLight"
          >
            Send
          </button>
        </div>
        </>)
        :
        (<></>)}
        
      </div>
    </div>
  );
};

export default Chat;
