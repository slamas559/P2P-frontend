// 📁 Chat.jsx
import { useEffect, useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { useLocation, useNavigate } from "react-router-dom";
import { Menu, Upload, Image, Send } from "lucide-react";
import { io } from "socket.io-client";
import axios from "axios";

let typingTimeout;

const Chat = () => {
  const { auth } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sent, setSent] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [clicked, setClicked] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  const chatEndRef = useRef(null);
  const location = useLocation();
  const socket = useRef();
  const { receiver, preMessage } = location.state || {};
  const userId = auth?.user?._id;
  const navigate = useNavigate();

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const appendMessage = (msg) => {
    setMessages((prev) => {
      if (!prev.some((m) => m._id === msg._id)) {
        return [...prev, msg];
      }
      return prev;
    });
  };

  useEffect(() => {
    // socket.current = io("http://localhost:5000");
    socket.current = io("https://p2p-api.up.railway.app", { 
      transports: ["websocket", "polling"],
      withCredentials: true,
    }
    )

    socket.current.on("connect", () => {
      if (conversationId) socket.current.emit("join_conversation", conversationId);
      if (userId) socket.current.emit("join_user", userId);
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

    // Typing events
    socket.current.on("user_typing", ({ conversationId: convId, user }) => {
      if (convId === conversationId && user._id !== userId) {
        setTypingUser(user.name);
        setIsTyping(true);
      }
    });

    socket.current.on("user_stop_typing", ({ conversationId: convId, user }) => {
      if (convId === conversationId && user._id !== userId) {
        setIsTyping(false);
        setTypingUser(null);
      }
    });

    return () => {
      socket.current.disconnect();
    };
  }, [conversationId, userId]);

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
  });

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
        setClicked(true);
      }
    };
    sendPreMessage();
  }, [conversationId, preMessage, messages.length]);

  useEffect(() => {
    return () => {
      if (conversationId) {
        localStorage.removeItem(`preMessageSent:${conversationId}`);
      }
    };
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (e) => {
    e.preventDefault();
    if ((!input.trim() && !image) || !conversationId) return;

    const receiverId = conversations
      .find((conv) => conv._id === conversationId)
      ?.members.find((m) => m._id !== userId)?._id;

    let imageUrl = null;
    if (image) {
      const formData = new FormData();
      formData.append("image", image);

      try {
        const res = await axios.post("https://p2p-api.up.railway.app/api/upload", formData);
        imageUrl = res.data.imageUrl;
      } catch (err) {
        console.error("Image upload failed", err);
      }
    }

    const newMessage = {
      sender: userId,
      text: input,
      image: imageUrl,
      conversationId,
      receiver: receiverId,
      createdAt: new Date().toISOString(),
    };

    socket.current.emit("send_message", newMessage);
    await api.post(`/chat/mark-seen`, {
        conversationId: conversationId,
        userId: userId,
      });

    setInput("");
    setImage(null);
    setImagePreview(null);
    setIsTyping(false);
    setSent(true);
    socket.current.emit("stop_typing", { conversationId, user: auth.user });
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInput(value);
    setSent(false);

    if (socket.current && conversationId) {
      socket.current.emit("typing", { conversationId, user: auth.user });

      clearTimeout(typingTimeout);
      typingTimeout = setTimeout(() => {
        socket.current.emit("stop_typing", { conversationId, user: auth.user });
      }, 1500);
    }
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
    <div className="flex flex-col md:flex-row h-[calc(100vh-4rem)] mt-16 bg-dark text-white">
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
          const lastMessage = conv.lastMessage;
          const isSelected = selectedConversation?._id === conv._id;

          return (
            <div
              key={conv._id}
              onClick={() => handleConversationSelect(conv)}
              className={`relative flex items-center justify-between gap-3 p-3 rounded cursor-pointer mb-2 hover:bg-neonLight hover:text-dark ${
                isSelected ? "bg-darkLight text-dark" : "bg-gray-800"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="bg-darkLight w-10 h-10 flex items-center justify-center text-neon border border-neonLight rounded-full">
                  {otherUser?.name?.[0]}
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-[12px]">{otherUser?.name || "Unknown"}</span>
                  <span className="text-xs text-gray-400 truncate max-w-[160px]">
                    {lastMessage?.image
                      ? "📷"
                      : lastMessage?.text?.slice(0, 25) || "No messages"}
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-end">
                {lastMessage?.createdAt && (
                  <span className="text-xs text-gray-500">
                    {new Date(lastMessage.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                )}
                {unread > 0 && (
                  <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full mt-1">
                    {unread}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Chat content */}
      <div className="flex-1 flex flex-col p-4 bg-dark rounded-lg h-full min-h-0">
        <div className="mb-4 shrink-0">
          <h2 className="text-neon text-lg font-bold">
            {selectedConversation
              ? conversations
                  .find((c) => c._id === selectedConversation._id)
                  ?.members.find((m) => m._id !== userId)?.name || "Chat"
              : "Select a conversation"}
          </h2>
        </div>

        {/* Messages */}
        <div className="flex-1 min-h-0 overflow-y-auto bg-darkLight rounded p-3 no-scrollbar">
          {clicked ? (
            loading ? (
              <p className="text-center">Loading chat...</p>
            ) : (
              <>
                <p className="text-center text-gray-500 mb-5">⚠ messages will disappear every 24 hours.</p>
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${
                      (msg.sender === userId || msg.sender?._id === userId)
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`mb-2 px-4 py-2 max-w-[85%] rounded-xl text-sm ${
                        (msg.sender === userId || msg.sender?._id === userId)
                          ? "bg-neon text-darkLight"
                          : "bg-gray-700 text-white"
                      }`}
                    >
                      {msg.image && (
                        <img
                          src={msg.image}
                          alt="sent media"
                          className="mb-2 rounded max-w-[200px] h-500px object-cover cursor-pointer"
                          onClick={() => window.open(msg.image, "_blank")}
                        />
                      )}
                      {msg.text}
                      <div className="text-xs text-gray-400 mt-1">
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="text-xs italic text-gray-400 mt-1 ml-2">
                    {typingUser || "Someone"} is typing...
                  </div>
                )}
              </>
            )
          ) : (
            <p className="text-center">Start Messaging</p>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        {imagePreview && (
          <div className="preview-container relative mt-2">
            <img
              src={imagePreview}
              alt="Image preview"
              className="w-32 h-32 object-cover rounded border"
            />
            <button
              onClick={() => {
                setImage(null);
                setImagePreview(null);
              }}
              className="absolute top-0 right-0 text-white bg-red-500 rounded-full px-1 text-sm"
            >
              ✕
            </button>
          </div>
        )}
        {clicked && (
          <form encType="multipart/form-data" onSubmit={handleSend}>
            <div className="flex items-center gap-2 mt-4 shrink-0">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  setImage(e.target.files[0]);
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    setImagePreview(reader.result);
                  };
                  reader.readAsDataURL(e.target.files[0]);
                }}
                className="hidden"
                id="fileUpload"
              />
              <label htmlFor="fileUpload" className="cursor-pointer text-neon">
                <Image />
              </label>
              <input
                value={input}
                onChange={handleInputChange}
                placeholder="Type your message..."
                className="flex-1 bg-darkLight border border-neon px-3 py-2 rounded outline-none"
              />
              <button className="bg-neon text-darkLight px-4 py-2 rounded"><Send  /></button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Chat;
