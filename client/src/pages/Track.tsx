import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Package, Clock, CheckCircle2, Truck, ArrowLeft, Phone } from "lucide-react";
import { supabase } from "../lib/supabase";
import { Link } from "wouter";

interface Order {
  id: number;
  name: string;
  phone: string;
  product: string;
  description: string;
  date: string;
  status: string;
  notes: string;
}

const statusSteps = [
  { key: "new", label: "Order Received", icon: Package, desc: "We've got your order and will start soon!" },
  { key: "in-progress", label: "Being Made", icon: Clock, desc: "Jiya & Kiyoshi are handcrafting your order 🧶" },
  { key: "done", label: "Ready", icon: CheckCircle2, desc: "Your order is ready! Delivery being arranged 🌸" },
];

const statusIndex: Record<string, number> = {
  "new": 0,
  "in-progress": 1,
  "done": 2,
};

export default function Track() {
  const [query, setQuery] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError("");
    setSearched(false);

    const { data } = await supabase
      .from("orders")
      .select("id, name, phone, product, description, date, status, notes")
      .or(`name.ilike.%${query.trim()}%,phone.ilike.%${query.trim()}%`);

    setOrders(data as Order[] || []);
    setSearched(true);
    setLoading(false);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div className="min-h-screen bg-amber-50 font-['Poppins',sans-serif]">
      {/* Header */}
      <div className="bg-gradient-to-b from-pink-100 to-amber-50 pt-8 pb-12 px-4">
        <div className="max-w-lg mx-auto">
          <Link href="/">
            <a className="inline-flex items-center gap-2 text-sm text-pink-400 hover:text-pink-600 mb-6 transition-colors">
              <ArrowLeft className="h-4 w-4" /> Back to Plushie Knots
            </a>
          </Link>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="text-center mb-8">
              <motion.div
                animate={{ rotate: [0, -8, 8, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity, repeatDelay: 3 }}
                className="text-4xl mb-3"
              >
                📦
              </motion.div>
              <h1 className="text-2xl font-bold text-amber-900 mb-2">Track Your Order</h1>
              <p className="text-sm text-amber-500">Enter your name or phone number to see your order status</p>
            </div>

            {/* Search */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-300" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder="Your name or phone number…"
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl border-2 border-pink-100 focus:border-pink-300 focus:outline-none text-sm text-amber-900 placeholder:text-amber-300 bg-white transition-colors"
                />
              </div>
              <motion.button
                onClick={handleSearch}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                disabled={loading}
                className="px-5 py-3.5 bg-pink-400 hover:bg-pink-500 disabled:bg-pink-300 text-white font-semibold rounded-2xl text-sm shadow-sm transition-colors"
              >
                {loading ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                ) : "Search"}
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-lg mx-auto px-4 pb-16 -mt-4">
        <AnimatePresence>
          {searched && orders.length === 0 && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="bg-white rounded-3xl border border-pink-100 shadow-sm p-8 text-center">
              <div className="text-4xl mb-3">🔍</div>
              <p className="font-semibold text-amber-900 mb-1">No orders found</p>
              <p className="text-sm text-amber-400">Try your full name or the phone number you used when ordering</p>
              <div className="mt-4 pt-4 border-t border-pink-50">
                <p className="text-xs text-amber-400 mb-2">Need help? Message us directly</p>
                <a href="https://wa.me/918446140900" target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-green-600 font-medium hover:text-green-700">
                  <Phone className="h-4 w-4" /> WhatsApp Jiya & Kiyoshi
                </a>
              </div>
            </motion.div>
          )}

          {orders.map((order, i) => {
            const step = statusIndex[order.status] ?? 0;
            return (
              <motion.div key={order.id}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                transition={{ delay: i * 0.08 }}
                className="bg-white rounded-3xl border border-pink-100 shadow-sm overflow-hidden mb-4">

                {/* Order header */}
                <div className="px-5 py-4 border-b border-pink-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-amber-900 text-sm">{order.name}</p>
                      <p className="text-xs text-amber-400 mt-0.5">{order.product} · {order.date}</p>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                      order.status === "done" ? "bg-emerald-100 text-emerald-700" :
                      order.status === "in-progress" ? "bg-amber-100 text-amber-700" :
                      "bg-pink-100 text-pink-700"
                    }`}>
                      {order.status === "done" ? "Ready ✓" : order.status === "in-progress" ? "In Progress" : "Received"}
                    </span>
                  </div>
                  {order.description && (
                    <p className="text-xs text-amber-500 mt-2 line-clamp-2">{order.description}</p>
                  )}
                </div>

                {/* Progress steps */}
                <div className="px-5 py-5">
                  <div className="relative">
                    {/* Line */}
                    <div className="absolute top-5 left-5 right-5 h-0.5 bg-pink-100" />
                    <div className="absolute top-5 left-5 h-0.5 bg-pink-400 transition-all duration-500"
                      style={{ width: `${step === 0 ? 0 : step === 1 ? 50 : 100}%` }} />

                    <div className="relative flex justify-between">
                      {statusSteps.map((s, idx) => {
                        const Icon = s.icon;
                        const done = idx <= step;
                        const active = idx === step;
                        return (
                          <div key={s.key} className="flex flex-col items-center gap-2" style={{ width: "33%" }}>
                            <motion.div
                              animate={active ? { scale: [1, 1.1, 1] } : {}}
                              transition={{ duration: 1.5, repeat: Infinity }}
                              className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                                done ? "bg-pink-400 border-pink-400 text-white" : "bg-white border-pink-200 text-amber-300"
                              }`}
                            >
                              <Icon className="h-4 w-4" />
                            </motion.div>
                            <p className={`text-xs font-semibold text-center leading-tight ${done ? "text-pink-500" : "text-amber-300"}`}>
                              {s.label}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Current status message */}
                  <motion.div
                    key={order.status}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-5 bg-pink-50 rounded-2xl px-4 py-3 text-center"
                  >
                    <p className="text-sm text-pink-600 font-medium">{statusSteps[step]?.desc}</p>
                  </motion.div>
                </div>

                {/* WhatsApp */}
                <div className="px-5 pb-4">
                  <a href="https://wa.me/918446140900" target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-2.5 bg-green-50 hover:bg-green-100 text-green-600 text-sm font-medium rounded-2xl transition-colors border border-green-100">
                    <Phone className="h-4 w-4" />
                    Questions? Message Jiya & Kiyoshi
                  </a>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
