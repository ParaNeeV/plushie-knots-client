import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Circle } from "lucide-react";
import { supabase } from "../lib/supabase";

interface Message {
  id: number;
  user_name: string;
  text: string;
  created_at: string;
}

const USER_COLORS: Record<string, string> = {
  Param: "bg-blue-100 text-blue-700 border-blue-200",
  Jiya: "bg-pink-100 text-pink-700 border-pink-200",
  Kiyoshi: "bg-amber-100 text-amber-700 border-amber-200",
};

const ONLINE_KEY = "pk_staff_online";

function timeAgo(dateStr: string) {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function StaffChat({ currentUser }: { currentUser: string }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [unread, setUnread] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Mark online
  useEffect(() => {
    const key = `${ONLINE_KEY}_${currentUser}`;
    localStorage.setItem(key, Date.now().toString());
    const interval = setInterval(() => localStorage.setItem(key, Date.now().toString()), 10000);

    // Check who's online (active in last 30s)
    const checkOnline = () => {
      const users = ["Param", "Jiya", "Kiyoshi"];
      const online = users.filter(u => {
        const ts = localStorage.getItem(`${ONLINE_KEY}_${u}`);
        return ts && Date.now() - parseInt(ts) < 30000;
      });
      setOnlineUsers(online);
    };
    checkOnline();
    const onlineInterval = setInterval(checkOnline, 5000);

    return () => {
      clearInterval(interval);
      clearInterval(onlineInterval);
      localStorage.removeItem(key);
    };
  }, [currentUser]);

  // Fetch messages
  const fetchMessages = async () => {
    const { data } = await supabase
      .from("messages")
      .select("*")
      .order("created_at", { ascending: true })
      .limit(50);
    if (data) setMessages(data as Message[]);
  };

  useEffect(() => { fetchMessages(); }, []);
  useEffect(() => { if (open) fetchMessages(); }, [open]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel("messages")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
        const newMsg = payload.new as Message;
        setMessages(prev => [...prev, newMsg]);
        if (!open && newMsg.user_name !== currentUser) {
          setUnread(u => u + 1);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [open, currentUser]);

  // Scroll to bottom
  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      setUnread(0);
    }
  }, [open, messages]);

  const sendMessage = async () => {
    if (!text.trim()) return;
    const msg = text.trim();
    setText("");
    await supabase.from("messages").insert({ user_name: currentUser, text: msg });
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <>
      {/* Chat bubble button */}
      <motion.button
        onClick={() => { setOpen(!open); setUnread(0); }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-pink-400 hover:bg-pink-500 text-white rounded-full shadow-xl flex items-center justify-center transition-colors"
      >
        <AnimatePresence mode="wait">
          {open
            ? <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
                <X className="h-5 w-5" />
              </motion.div>
            : <motion.div key="chat" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} className="relative">
                <MessageCircle className="h-5 w-5" />
                {unread > 0 && (
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {unread}
                  </motion.span>
                )}
              </motion.div>
          }
        </AnimatePresence>
      </motion.button>

      {/* Chat window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-24 right-6 z-50 w-80 bg-white rounded-3xl shadow-2xl border border-pink-100 overflow-hidden flex flex-col"
            style={{ height: "420px" }}
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-pink-100 bg-pink-50">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-amber-900 text-sm">Team Chat 🧶</span>
                <div className="flex items-center gap-1">
                  {onlineUsers.map(u => (
                    <div key={u} className="flex items-center gap-1">
                      <Circle className="h-2 w-2 fill-emerald-500 text-emerald-500" />
                      <span className="text-xs text-emerald-600 font-medium">{u}</span>
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-xs text-amber-400">Only visible to staff</p>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
              {messages.length === 0 && (
                <div className="text-center text-amber-300 text-xs mt-8">
                  No messages yet — say hi! 👋
                </div>
              )}
              {messages.map((msg) => {
                const isMe = msg.user_name === currentUser;
                const color = USER_COLORS[msg.user_name] || "bg-gray-100 text-gray-700 border-gray-200";
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                  >
                    {!isMe && (
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full border mb-1 ${color}`}>
                        {msg.user_name}
                      </span>
                    )}
                    <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                      isMe
                        ? "bg-pink-400 text-white rounded-br-sm"
                        : "bg-amber-50 text-amber-800 border border-amber-100 rounded-bl-sm"
                    }`}>
                      {msg.text}
                    </div>
                    <span className="text-xs text-amber-300 mt-0.5 px-1">{timeAgo(msg.created_at)}</span>
                  </motion.div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="px-3 py-3 border-t border-pink-100 flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Type a message…"
                className="flex-1 px-3 py-2 rounded-2xl border-2 border-pink-100 focus:border-pink-300 focus:outline-none text-sm text-amber-900 placeholder:text-amber-300"
              />
              <motion.button
                onClick={sendMessage}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                disabled={!text.trim()}
                className="w-9 h-9 bg-pink-400 hover:bg-pink-500 disabled:bg-pink-200 text-white rounded-full flex items-center justify-center transition-colors flex-shrink-0"
              >
                <Send className="h-4 w-4" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
