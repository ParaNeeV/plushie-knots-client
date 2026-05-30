import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LogOut, Plus, Search, Trash2, Pencil, X, Check,
  Package, Clock, CheckCircle2, LayoutDashboard, StickyNote, KeyRound,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────
type Status = "new" | "in-progress" | "done";

interface Order {
  id: number;
  name: string;
  email: string;
  product: string;
  description: string;
  date: string;
  status: Status;
  notes: string;
}

// ── Constants ──────────────────────────────────────────────────────────
const STORAGE_KEY = "pk_staff_orders";
const SESSION_KEY = "pk_staff_session";
const CREDS_KEY = "pk_staff_creds";

const DEFAULT_CREDS: Record<string, string> = {
  Param: "1409",
  Jiya: "plushieJ",
  Kiyoshi: "plushieK",
};

function loadCreds(): Record<string, string> {
  try {
    const raw = localStorage.getItem(CREDS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  localStorage.setItem(CREDS_KEY, JSON.stringify(DEFAULT_CREDS));
  return DEFAULT_CREDS;
}

function saveCreds(creds: Record<string, string>) {
  localStorage.setItem(CREDS_KEY, JSON.stringify(creds));
}

const PRODUCT_OPTIONS = [
  "Flower Bouquet",
  "Keychain",
  "AirPods Cover",
  "Coin Purse",
  "Mirror Flower",
  "Pipe Cleaner",
  "Custom",
];

const SEED_ORDERS: Order[] = [
  {
    id: 1,
    name: "Aditi Sharma",
    email: "aditi@gmail.com",
    product: "Flower Bouquet",
    description: "Pink & white tulip bouquet wrapped in kraft paper. For anniversary.",
    date: "2025-05-20",
    status: "done",
    notes: "Delivered on time.",
  },
  {
    id: 2,
    name: "Riya Mehta",
    email: "riya.m@yahoo.com",
    product: "Keychain",
    description: "Cherry keychain x2, one in red and one in yellow.",
    date: "2025-05-24",
    status: "in-progress",
    notes: "",
  },
  {
    id: 3,
    name: "Shreya Patil",
    email: "shreya.p@hotmail.com",
    product: "AirPods Cover",
    description: "Pastel lavender AirPods Gen 2 cover with a tiny bow.",
    date: "2025-05-26",
    status: "new",
    notes: "",
  },
  {
    id: 4,
    name: "Naina Joshi",
    email: "nainaj@gmail.com",
    product: "Custom",
    description: "Sunflower bouquet with name tag 'Happy Birthday Priya' in yellow & white.",
    date: "2025-05-27",
    status: "new",
    notes: "Rush order — needed by 30th.",
  },
  {
    id: 5,
    name: "Farhan Khan",
    email: "farhan.k@gmail.com",
    product: "Coin Purse",
    description: "Strawberry coin purse in red with green top. Small size.",
    date: "2025-05-28",
    status: "in-progress",
    notes: "",
  },
];

// ── Helpers ────────────────────────────────────────────────────────────
function loadOrders(): Order[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Order[];
  } catch {}
  localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_ORDERS));
  return SEED_ORDERS;
}

function saveOrders(orders: Order[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

const statusMeta: Record<Status, { label: string; color: string; icon: React.ReactNode }> = {
  new: { label: "New", color: "bg-pink-100 text-pink-700 border-pink-200", icon: <Package className="h-3 w-3" /> },
  "in-progress": { label: "In Progress", color: "bg-amber-100 text-amber-700 border-amber-200", icon: <Clock className="h-3 w-3" /> },
  done: { label: "Done", color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: <CheckCircle2 className="h-3 w-3" /> },
};

const emptyForm = { name: "", email: "", product: "", description: "", notes: "" };

// ══════════════════════════════════════════════════════════════════════
// CHANGE PASSWORD MODAL
// ══════════════════════════════════════════════════════════════════════
function ChangePasswordModal({ user, onClose }: { user: string; onClose: () => void }) {
  const [current, setCurrent] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSave = () => {
    setErr("");
    const creds = loadCreds();
    if (creds[user] !== current) { setErr("Current password is incorrect."); return; }
    if (newPass.length < 4) { setErr("New password must be at least 4 characters."); return; }
    if (newPass !== confirm) { setErr("Passwords do not match."); return; }
    creds[user] = newPass;
    saveCreds(creds);
    setSuccess(true);
    setTimeout(onClose, 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.93, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.93, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 24 }}
        className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-pink-100 overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-pink-100">
          <div className="flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-pink-400" />
            <h2 className="font-bold text-amber-900 text-base">Change Password</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-pink-50 text-amber-400 hover:text-pink-500 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-xs text-amber-500">Changing password for <span className="font-bold text-amber-800">{user}</span></p>

          {[
            { label: "Current Password", val: current, set: setCurrent },
            { label: "New Password", val: newPass, set: setNewPass },
            { label: "Confirm New Password", val: confirm, set: setConfirm },
          ].map(({ label, val, set }) => (
            <div key={label}>
              <label className="block text-xs font-bold text-amber-800 uppercase tracking-wider mb-1.5">{label}</label>
              <input
                type="password"
                value={val}
                onChange={(e) => set(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl border-2 border-pink-100 focus:border-pink-300 focus:outline-none text-sm text-amber-900 transition-colors"
              />
            </div>
          ))}

          <AnimatePresence>
            {err && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-xs text-red-500">
                {err}
              </motion.p>
            )}
            {success && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-emerald-600 font-semibold">
                ✓ Password changed successfully!
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <div className="flex gap-3 px-6 py-4 border-t border-pink-100">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-2xl border-2 border-pink-100 text-amber-700 text-sm font-medium hover:bg-pink-50 transition-colors">
            Cancel
          </button>
          <motion.button
            onClick={handleSave}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="flex-1 py-2.5 rounded-2xl bg-pink-400 hover:bg-pink-500 text-white text-sm font-semibold shadow-sm transition-colors flex items-center justify-center gap-1.5"
          >
            <Check className="h-4 w-4" /> Save
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// LOGIN SCREEN
// ══════════════════════════════════════════════════════════════════════
function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setError("");
    setLoading(true);
    setTimeout(() => {
      const creds = loadCreds();
      if (creds[username] && creds[username] === password) {
        sessionStorage.setItem(SESSION_KEY, username);
        onLogin();
      } else {
        setError("Incorrect username or password.");
        setLoading(false);
      }
    }, 600);
  };

  return (
    <div className="min-h-screen bg-amber-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ y: [0, -20, 0], x: [0, 12, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-20 -left-20 w-72 h-72 bg-pink-200 rounded-full opacity-20 blur-3xl"
        />
        <motion.div
          animate={{ y: [0, 16, 0], x: [0, -10, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute -bottom-20 -right-20 w-96 h-96 bg-amber-200 rounded-full opacity-20 blur-3xl"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
        className="relative w-full max-w-sm bg-white rounded-3xl shadow-xl border border-pink-100 p-8"
      >
        <div className="text-center mb-8">
          <motion.div
            animate={{ rotate: [0, -8, 8, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, repeatDelay: 3 }}
            className="text-4xl mb-3"
          >
            🧶
          </motion.div>
          <h1 className="text-xl font-bold text-amber-900">Plushie Knots</h1>
          <p className="text-xs text-pink-400 italic mt-0.5">Staff Portal</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-amber-800 uppercase tracking-wider mb-1.5">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              autoComplete="off"
              className="w-full px-4 py-3 rounded-2xl border-2 border-pink-100 focus:border-pink-300 focus:outline-none text-sm text-amber-900 bg-amber-50/40 placeholder:text-amber-300 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-amber-800 uppercase tracking-wider mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              placeholder="Enter password"
              className="w-full px-4 py-3 rounded-2xl border-2 border-pink-100 focus:border-pink-300 focus:outline-none text-sm text-amber-900 bg-amber-50/40 placeholder:text-amber-300 transition-colors"
            />
          </div>
        </div>

        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-xs text-red-500 text-center mt-3"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        <motion.button
          onClick={handleLogin}
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.97 }}
          disabled={loading}
          className="w-full mt-6 py-3.5 bg-pink-400 hover:bg-pink-500 disabled:bg-pink-300 text-white font-semibold rounded-2xl text-sm shadow-md transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
              className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
            />
          ) : "Sign In"}
        </motion.button>
      </motion.div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// ORDER FORM MODAL
// ══════════════════════════════════════════════════════════════════════
interface OrderFormProps {
  initial?: Partial<Order>;
  onSave: (data: typeof emptyForm) => void;
  onClose: () => void;
}

function OrderFormModal({ initial, onSave, onClose }: OrderFormProps) {
  const [form, setForm] = useState({ ...emptyForm, ...initial });
  const [err, setErr] = useState("");

  const set = (k: keyof typeof emptyForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSave = () => {
    if (!form.name.trim() || !form.product || !form.description.trim()) {
      setErr("Name, product and description are required.");
      return;
    }
    onSave(form);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.93, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.93, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 24 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-pink-100 overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-pink-100">
          <h2 className="font-bold text-amber-900 text-base">
            {initial?.id ? "Edit Order" : "Add New Order"}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-pink-50 text-amber-400 hover:text-pink-500 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {([
            { label: "Customer Name", key: "name", type: "text", placeholder: "Full name" },
            { label: "Email", key: "email", type: "email", placeholder: "customer@email.com" },
          ] as const).map(({ label, key, type, placeholder }) => (
            <div key={key}>
              <label className="block text-xs font-bold text-amber-800 uppercase tracking-wider mb-1.5">{label}</label>
              <input
                type={type}
                value={form[key]}
                onChange={set(key)}
                placeholder={placeholder}
                className="w-full px-4 py-2.5 rounded-2xl border-2 border-pink-100 focus:border-pink-300 focus:outline-none text-sm text-amber-900 placeholder:text-amber-300 transition-colors"
              />
            </div>
          ))}

          <div>
            <label className="block text-xs font-bold text-amber-800 uppercase tracking-wider mb-1.5">Product</label>
            <select
              value={form.product}
              onChange={set("product")}
              className="w-full px-4 py-2.5 rounded-2xl border-2 border-pink-100 focus:border-pink-300 focus:outline-none text-sm text-amber-900 transition-colors"
            >
              <option value="">Select product</option>
              {PRODUCT_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-amber-800 uppercase tracking-wider mb-1.5">Order Description</label>
            <textarea
              value={form.description}
              onChange={set("description")}
              rows={3}
              placeholder="Colours, size, occasion, custom touches…"
              className="w-full px-4 py-2.5 rounded-2xl border-2 border-pink-100 focus:border-pink-300 focus:outline-none text-sm text-amber-900 placeholder:text-amber-300 resize-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-amber-800 uppercase tracking-wider mb-1.5">Internal Notes</label>
            <textarea
              value={form.notes}
              onChange={set("notes")}
              rows={2}
              placeholder="Staff-only notes…"
              className="w-full px-4 py-2.5 rounded-2xl border-2 border-pink-100 focus:border-pink-300 focus:outline-none text-sm text-amber-900 placeholder:text-amber-300 resize-none transition-colors"
            />
          </div>

          <AnimatePresence>
            {err && (
              <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-xs text-red-500">
                {err}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <div className="flex gap-3 px-6 py-4 border-t border-pink-100">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-2xl border-2 border-pink-100 text-amber-700 text-sm font-medium hover:bg-pink-50 transition-colors">
            Cancel
          </button>
          <motion.button
            onClick={handleSave}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="flex-1 py-2.5 rounded-2xl bg-pink-400 hover:bg-pink-500 text-white text-sm font-semibold shadow-sm transition-colors flex items-center justify-center gap-1.5"
          >
            <Check className="h-4 w-4" /> Save Order
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// DASHBOARD
// ══════════════════════════════════════════════════════════════════════
function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [orders, setOrders] = useState<Order[]>(loadOrders);
  const [nextId, setNextId] = useState(() => Math.max(...loadOrders().map((o) => o.id), 0) + 1);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<Status | "">("");
  const [filterProduct, setFilterProduct] = useState("");
  const [modal, setModal] = useState<{ open: boolean; editing?: Order }>({ open: false });
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [noteTemp, setNoteTemp] = useState("");
  const [showChangePass, setShowChangePass] = useState(false);

  const user = sessionStorage.getItem(SESSION_KEY) || "Staff";

  useEffect(() => { saveOrders(orders); }, [orders]);

  const stats = {
    total: orders.length,
    new: orders.filter((o) => o.status === "new").length,
    inProgress: orders.filter((o) => o.status === "in-progress").length,
    done: orders.filter((o) => o.status === "done").length,
  };

  const filtered = orders.filter((o) => {
    const q = search.toLowerCase();
    const matchQ = !q || [o.name, o.email, o.product, o.description].join(" ").toLowerCase().includes(q);
    const matchS = !filterStatus || o.status === filterStatus;
    const matchP = !filterProduct || o.product === filterProduct;
    return matchQ && matchS && matchP;
  });

  const addOrder = (data: typeof emptyForm) => {
    const order: Order = { id: nextId, ...data, date: todayStr(), status: "new" };
    setOrders((prev) => [order, ...prev]);
    setNextId((n) => n + 1);
    setModal({ open: false });
  };

  const editOrder = (data: typeof emptyForm) => {
    setOrders((prev) => prev.map((o) => (o.id === modal.editing!.id ? { ...o, ...data } : o)));
    setModal({ open: false });
  };

  const deleteOrder = (id: number) => {
    setOrders((prev) => prev.filter((o) => o.id !== id));
    setDeletingId(null);
  };

  const changeStatus = (id: number, status: Status) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
  };

  const saveNote = (id: number) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, notes: noteTemp } : o)));
    setEditingNoteId(null);
  };

  return (
    <div className="min-h-screen bg-amber-50">
      {/* Top bar */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-pink-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-pink-100 flex items-center justify-center">
              <LayoutDashboard className="h-4 w-4 text-pink-500" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-amber-900 leading-none">Plushie Knots</h1>
              <p className="text-xs text-pink-400 italic leading-none mt-0.5">Staff Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:block text-xs text-amber-500">
              Signed in as <span className="font-semibold text-amber-700">{user}</span>
            </span>
            <button
              onClick={() => setShowChangePass(true)}
              className="flex items-center gap-1.5 text-xs text-amber-600 hover:text-pink-500 border border-pink-100 hover:border-pink-300 rounded-xl px-3 py-2 transition-colors"
            >
              <KeyRound className="h-3.5 w-3.5" /> Change Password
            </button>
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 text-xs text-amber-600 hover:text-red-500 border border-pink-100 hover:border-red-200 rounded-xl px-3 py-2 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" /> Sign Out
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        {/* Stats */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6"
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
        >
          {[
            { label: "Total Orders", value: stats.total, color: "bg-white border-pink-100", val_color: "text-amber-900" },
            { label: "New", value: stats.new, color: "bg-pink-50 border-pink-200", val_color: "text-pink-600" },
            { label: "In Progress", value: stats.inProgress, color: "bg-amber-50 border-amber-200", val_color: "text-amber-600" },
            { label: "Done", value: stats.done, color: "bg-emerald-50 border-emerald-200", val_color: "text-emerald-600" },
          ].map(({ label, value, color, val_color }) => (
            <motion.div
              key={label}
              variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
              className={`rounded-2xl border p-4 ${color}`}
            >
              <p className="text-xs text-amber-500 mb-1">{label}</p>
              <p className={`text-3xl font-bold ${val_color}`}>{value}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Toolbar */}
        <div className="flex flex-wrap gap-3 items-center mb-4">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-300" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, email, product…"
              className="w-full pl-9 pr-4 py-2.5 rounded-2xl border-2 border-pink-100 focus:border-pink-300 focus:outline-none text-sm text-amber-900 placeholder:text-amber-300 transition-colors"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as Status | "")}
            className="px-3 py-2.5 rounded-2xl border-2 border-pink-100 focus:border-pink-300 focus:outline-none text-sm text-amber-800 bg-white transition-colors"
          >
            <option value="">All statuses</option>
            <option value="new">New</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
          </select>
          <select
            value={filterProduct}
            onChange={(e) => setFilterProduct(e.target.value)}
            className="px-3 py-2.5 rounded-2xl border-2 border-pink-100 focus:border-pink-300 focus:outline-none text-sm text-amber-800 bg-white transition-colors"
          >
            <option value="">All products</option>
            {PRODUCT_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          <motion.button
            onClick={() => setModal({ open: true })}
            whileHover={{ scale: 1.04, y: -1 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 bg-pink-400 hover:bg-pink-500 text-white font-semibold rounded-2xl px-5 py-2.5 text-sm shadow-sm transition-colors"
          >
            <Plus className="h-4 w-4" /> Add Order
          </motion.button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-3xl border border-pink-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-pink-100">
                  {["Name", "Email", "Product", "Description", "Date", "Status", "Notes", ""].map((h) => (
                    <th key={h} className="text-left text-xs font-bold text-amber-400 uppercase tracking-wider px-4 py-3 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-14 text-amber-400 text-sm">
                        No orders match your filters 🌸
                      </td>
                    </tr>
                  ) : (
                    filtered.map((order) => {
                      const sm = statusMeta[order.status];
                      return (
                        <motion.tr
                          key={order.id}
                          layout
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.2 }}
                          className="border-b border-pink-50 last:border-0 hover:bg-amber-50/40 transition-colors"
                        >
                          <td className="px-4 py-3 font-medium text-amber-900 whitespace-nowrap">{order.name}</td>
                          <td className="px-4 py-3 text-amber-500 text-xs whitespace-nowrap">{order.email || "—"}</td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="inline-block text-xs bg-pink-50 text-pink-600 border border-pink-200 font-medium px-2.5 py-1 rounded-full">
                              {order.product}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-amber-600 text-xs max-w-xs">
                            <span className="line-clamp-2">{order.description}</span>
                          </td>
                          <td className="px-4 py-3 text-amber-400 text-xs whitespace-nowrap">{order.date}</td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <select
                              value={order.status}
                              onChange={(e) => changeStatus(order.id, e.target.value as Status)}
                              className={`text-xs font-semibold px-2.5 py-1 rounded-full border cursor-pointer focus:outline-none ${sm.color}`}
                            >
                              <option value="new">New</option>
                              <option value="in-progress">In Progress</option>
                              <option value="done">Done</option>
                            </select>
                          </td>
                          <td className="px-4 py-3 min-w-[140px]">
                            {editingNoteId === order.id ? (
                              <div className="flex items-center gap-1">
                                <input
                                  autoFocus
                                  type="text"
                                  value={noteTemp}
                                  onChange={(e) => setNoteTemp(e.target.value)}
                                  onKeyDown={(e) => { if (e.key === "Enter") saveNote(order.id); if (e.key === "Escape") setEditingNoteId(null); }}
                                  className="w-full text-xs px-2 py-1.5 border border-pink-200 rounded-xl focus:outline-none focus:border-pink-400"
                                />
                                <button onClick={() => saveNote(order.id)} className="p-1 text-emerald-500 hover:text-emerald-700">
                                  <Check className="h-3.5 w-3.5" />
                                </button>
                                <button onClick={() => setEditingNoteId(null)} className="p-1 text-amber-400 hover:text-amber-600">
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => { setEditingNoteId(order.id); setNoteTemp(order.notes); }}
                                className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-700 transition-colors w-full text-left group"
                              >
                                <StickyNote className="h-3 w-3 flex-shrink-0 group-hover:text-pink-400" />
                                <span className="line-clamp-1">{order.notes || <em className="not-italic text-amber-300">Add note…</em>}</span>
                              </button>
                            )}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => setModal({ open: true, editing: order })}
                                className="p-1.5 rounded-xl hover:bg-pink-50 text-amber-300 hover:text-pink-500 transition-colors"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                              {deletingId === order.id ? (
                                <div className="flex items-center gap-1">
                                  <button onClick={() => deleteOrder(order.id)} className="p-1.5 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors">
                                    <Check className="h-3.5 w-3.5" />
                                  </button>
                                  <button onClick={() => setDeletingId(null)} className="p-1.5 rounded-xl bg-amber-50 text-amber-400 hover:bg-amber-100 transition-colors">
                                    <X className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setDeletingId(order.id)}
                                  className="p-1.5 rounded-xl hover:bg-red-50 text-amber-300 hover:text-red-500 transition-colors"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-pink-50 text-xs text-amber-400">
            Showing {filtered.length} of {orders.length} order{orders.length !== 1 ? "s" : ""}
          </div>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {modal.open && (
          <OrderFormModal
            initial={modal.editing
              ? { name: modal.editing.name, email: modal.editing.email, product: modal.editing.product, description: modal.editing.description, notes: modal.editing.notes, id: modal.editing.id }
              : undefined
            }
            onSave={modal.editing ? editOrder : addOrder}
            onClose={() => setModal({ open: false })}
          />
        )}
        {showChangePass && (
          <ChangePasswordModal user={user} onClose={() => setShowChangePass(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// ROOT
// ══════════════════════════════════════════════════════════════════════
export default function Staff() {
  const [loggedIn, setLoggedIn] = useState(() => !!sessionStorage.getItem(SESSION_KEY));

  const handleLogout = () => {
    sessionStorage.removeItem(SESSION_KEY);
    setLoggedIn(false);
  };

  return loggedIn
    ? <Dashboard onLogout={handleLogout} />
    : <LoginScreen onLogin={() => setLoggedIn(true)} />;
}
