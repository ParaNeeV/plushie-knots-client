import { Heart, MessageCircle, Menu, X, Sparkles, Star, ChevronUp, ChevronDown, Palette, Package, Clock, Brush, Instagram, User, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "wouter";
import { supabase } from "../lib/supabase";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { useRef } from "react";
import WaveDivider from "@/components/WaveDivider";

const WHATSAPP_NUMBER = "917387042421";
const PROFILE_KEY = "pk_customer_profile";

function getProfile(): { name: string; phone: string } | null {
  try { const r = localStorage.getItem(PROFILE_KEY); return r ? JSON.parse(r) : null; } catch { return null; }
}
function saveProfile(name: string, phone: string) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify({ name, phone }));
}
function clearProfile() {
  localStorage.removeItem(PROFILE_KEY);
}
function extractProduct(msg: string): string {
  return msg
    .replace("Hi! I'd love to order the ", "")
    .replace(" keychain", "")
    .replace("Hi Jiya & Kiyoshi! I'm interested in placing an order", "General Enquiry")
    .split("🌸")[0]
    .trim() || "Custom Order";
}
const makeWhatsappLink = (msg: string) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
const generalWhatsapp = makeWhatsappLink("Hi Jiya & Kiyoshi! I'm interested in your crochet products 🌸 Could you tell me more?");


// ── Sign In Popup ──
function SignInPopup({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [err, setErr] = useState("");

  const handleSave = () => {
    if (!name.trim()) { setErr("Please enter your name"); return; }
    if (!phone.trim() || phone.trim().length < 10) { setErr("Please enter a valid phone number"); return; }
    saveProfile(name.trim(), phone.trim());
    onClose();
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ opacity: 0, scale: 0.93, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.93, y: 20 }} transition={{ type: "spring", stiffness: 300, damping: 24 }}
        className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-pink-100 overflow-hidden">
        <div className="px-6 pt-6 pb-4 text-center border-b border-pink-50">
          <div className="text-3xl mb-2">🧶</div>
          <h2 className="font-bold text-amber-900 text-lg">Save your details</h2>
          <p className="text-sm text-amber-500 mt-1">So you don't have to fill this every time you order 🌸</p>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-amber-800 uppercase tracking-wider mb-1.5">Your Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)}
              placeholder="What should we call you?" autoFocus
              className="w-full px-4 py-3 rounded-2xl border-2 border-pink-100 focus:border-pink-300 focus:outline-none text-sm text-amber-900 placeholder:text-amber-300 transition-colors" />
          </div>
          <div>
            <label className="block text-xs font-bold text-amber-800 uppercase tracking-wider mb-1.5">Phone Number</label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
              placeholder="+91 98765 43210"
              className="w-full px-4 py-3 rounded-2xl border-2 border-pink-100 focus:border-pink-300 focus:outline-none text-sm text-amber-900 placeholder:text-amber-300 transition-colors" />
          </div>
          {err && <p className="text-xs text-red-500">{err}</p>}
        </div>
        <div className="flex gap-3 px-6 pb-6">
          <button onClick={onClose}
            className="flex-1 py-3 rounded-2xl border-2 border-pink-100 text-amber-700 text-sm font-medium hover:bg-pink-50 transition-colors">
            Cancel
          </button>
          <motion.button onClick={handleSave} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            className="flex-1 py-3 rounded-2xl bg-pink-400 hover:bg-pink-500 text-white text-sm font-semibold shadow-sm transition-colors flex items-center justify-center gap-2">
            <User className="h-4 w-4" /> Save & Continue
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Order Popup ──
function OrderPopup({ productMsg, imgUrl, onClose }: { productMsg: string; imgUrl?: string; onClose: () => void }) {
  const profile = getProfile();
  const [name, setName] = useState(profile?.name || "");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const isReturning = !!profile;
  const productName = extractProduct(productMsg);

  const handleOrder = async () => {
    if (!name.trim()) { setErr("Please enter your name"); return; }
    if (!phone.trim() || phone.trim().length < 10) { setErr("Please enter a valid phone number"); return; }
    setLoading(true);
    saveProfile(name.trim(), phone.trim());
    await supabase.from("orders").insert({
      name: name.trim(),
      phone: phone.trim(),
      product: productName,
      description: productMsg,
      status: "new",
      notes: "",
      source: "customer",
    });
    const fullMsg = `Hi Jiya & Kiyoshi! 🌸\n\n👤 Name: ${name.trim()}\n📱 Phone: ${phone.trim()}\n\n${productMsg}${imgUrl ? `\n\n🖼️ Product ref: https://plushie-knots-client.vercel.app${imgUrl}` : ""}`;
    window.open(makeWhatsappLink(fullMsg), "_blank");
    setLoading(false);
    onClose();
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ opacity: 0, scale: 0.93, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.93, y: 20 }} transition={{ type: "spring", stiffness: 300, damping: 24 }}
        className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-pink-100 overflow-hidden">

        <div className="px-6 pt-6 pb-4 text-center border-b border-pink-50">
          <div className="text-3xl mb-2">{isReturning ? "👋" : "🌸"}</div>
          <h2 className="font-bold text-amber-900 text-lg">
            {isReturning ? `Welcome back, ${profile.name.split(" ")[0]}!` : "Almost there!"}
          </h2>
          <p className="text-sm text-amber-500 mt-1">
            {isReturning ? `Ordering: ${productName}` : "Just 2 quick details so Jiya & Kiyoshi know who you are"}
          </p>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-amber-800 uppercase tracking-wider mb-1.5">Your Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)}
              placeholder="What should we call you?"
              autoFocus={!isReturning}
              className="w-full px-4 py-3 rounded-2xl border-2 border-pink-100 focus:border-pink-300 focus:outline-none text-sm text-amber-900 placeholder:text-amber-300 transition-colors" />
          </div>
          <div>
            <label className="block text-xs font-bold text-amber-800 uppercase tracking-wider mb-1.5">Phone Number</label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleOrder()}
              placeholder="+91 98765 43210"
              className="w-full px-4 py-3 rounded-2xl border-2 border-pink-100 focus:border-pink-300 focus:outline-none text-sm text-amber-900 placeholder:text-amber-300 transition-colors" />
          </div>
          {err && <p className="text-xs text-red-500">{err}</p>}
          {isReturning && (
            <button onClick={() => { clearProfile(); onClose(); }}
              className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-red-500 transition-colors">
              <LogOut className="h-3 w-3" /> Not {profile.name.split(" ")[0]}? Switch account
            </button>
          )}
        </div>

        <div className="flex flex-col items-center gap-3 px-6 pb-6">
          <motion.button onClick={handleOrder} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white text-sm font-semibold shadow-sm transition-colors flex items-center justify-center gap-2">
            {loading ? (
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
            ) : (<><MessageCircle className="h-4 w-4" /> Order on WhatsApp</>)}
          </motion.button>
          <button onClick={onClose}
            className="text-sm text-amber-500 hover:text-amber-700 transition-colors underline-offset-2 hover:underline">
            Cancel
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Reusable animation variants ──
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};
const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.5 } },
};
const popIn = {
  hidden: { opacity: 0, scale: 0.7 },
  show: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 300, damping: 18 } },
};
const staggerContainer = (stagger = 0.12) => ({
  hidden: {},
  show: { transition: { staggerChildren: stagger } },
});

// ── ScrollReveal wrapper ──
function Reveal({ children, variants = fadeUp, className = "" }: {
  children: React.ReactNode;
  variants?: typeof fadeUp;
  className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div ref={ref} variants={variants} initial="hidden" animate={inView ? "show" : "hidden"} className={className}>
      {children}
    </motion.div>
  );
}

// ── Data ──
const bestsellers = [
  {
    id: 1, name: "Sunflower Bouquet",
    desc: "Crochet sunflowers wrapped in kraft paper with a hand-tied twine bow. A forever gift that never wilts.",
    img: "/sunflower-bouquet.jpg", tag: "Most Loved 🌻", tagColor: "bg-amber-100 text-amber-800", price: "₹119",
  },
  {
    id: 2, name: "Crochet Keychains",
    desc: "Tiny handmade charms — flowers, hearts, strawberries, stars, bows & more. Perfect little gifts.",
    img: "/keychain-bestseller.jpg", tag: "Fan Favourite 🔑", tagColor: "bg-pink-100 text-pink-700", price: "Starting ₹59",
  },
];

const keychains = [
  { name: "Flower Bouquet Keychain", img: "/kc-bouquet.jpg", price: "₹99 each" },
  { name: "Flower Keychains", img: "/kc-flowers.jpg", price: "₹99 each" },
  { name: "Cherry Keychain", img: "/kc-cherry.jpg", price: "₹99 each" },
  { name: "Bow Keychain", img: "/kc-bow.jpg", price: "₹119 each" },
  { name: "Chick Keychain", img: "/kc-chick.jpg", price: "₹100" },
  { name: "Bee Plushie", img: "/plushie-bee.jpg", price: "₹130" },
  { name: "Car Hanging Duck", img: "/car-duck.jpg", price: "₹180" },
];

const bouquets = [
  { name: "Single Sunflower", img: "/bouquet-sunflower-single.jpg", price: "₹119" },
  { name: "Single Tulip", img: "/bouquet-tulip-single.jpg", price: "₹119" },
  { name: "Blue Tulip + Daisy", img: "/bouquet-blue-tulip.jpg", price: "₹249" },
  { name: "Purple Lily", img: "/bouquet-purple-lily.jpg", price: "₹299" },
  { name: "Pink Tulip + Lily", img: "/bouquet-pink-tulip-lily.jpg", price: "₹349" },
  { name: "Mixed Tulip Bouquet", img: "/bouquet-mixed-tulip.jpg", price: "₹599" },
  { name: "Daisy Bouquet", img: "/bouquet-daisy.jpg", price: "₹399" },
  { name: "Yellow Tulip Bouquet", img: "/bouquet-yellow-tulip.jpg", price: "₹449" },
  { name: "Sunflower + Daisy", img: "/bouquet-sunflower-daisy.jpg", price: "₹599" },
  { name: "Pink Lily Bouquet", img: "/bouquet-pink-lily.jpg", price: "₹399" },
  { name: "Red & White Rose Bouquet", img: "/bouquet-rose-luxury.jpg", price: "₹699" },
  { name: "Orange Tulip Bouquet", img: "/bouquet-orange-tulip.jpg", price: "₹650" },
  { name: "Orange Flower", img: "/bouquet-orange-flower.jpg", price: "₹350" },
];

const mirrorFlowers = [
  { name: "Tulip Mirror Flower", img: "/mirror-tulip.jpg", price: "₹119" },
  { name: "Daisy Mirror Flower", img: "/mirror-daisy.jpg", price: "₹119" },
];

const flowerProducts = bouquets;

const reviews = [
  { name: "Param", location: "Pune", avatar: "🌻", review: "The sunflower bouquet is genuinely the prettiest thing on my desk. Everyone who visits asks where I got it. So glad I found Plushie Knots — worth every rupee! 💛", product: "Sunflower Bouquet" },
  { name: "Fardin", location: "Mumbai", avatar: "🧸", review: "Ordered a custom AirPods cover and it came out exactly how I imagined. Super smooth on WhatsApp, delivery was quick. Absolute quality — 10/10!", product: "AirPods Cover" },
  { name: "Smita", location: "Nagpur", avatar: "🌷", review: "Got the tulip keychain as a gift for my sister and she hasn't stopped showing it off 😭 The packaging was so cute. Plushie Knots never misses 🌸", product: "Tulip Keychain" },
];



// ── Corner Bear ──
function CornerBear() {
  const [waving, setWaving] = useState(false);
  const [happy, setHappy] = useState(false);
  const [confetti, setConfetti] = useState<{ id: number; x: number; y: number; emoji: string; angle: number }[]>([]);
  const confettiEmojis = ["🌸", "🌺", "💕", "✨", "🎀", "🌷", "💫", "🧶", "🍓", "🌻"];

  useEffect(() => {
    const interval = setInterval(() => {
      setWaving(true);
      setTimeout(() => setWaving(false), 800);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const throwConfetti = () => {
    setHappy(true);
    setTimeout(() => setHappy(false), 700);
    const pieces = Array.from({ length: 16 }, (_, i) => ({
      id: Date.now() + i,
      x: 60,
      y: window.innerHeight - 120,
      emoji: confettiEmojis[Math.floor(Math.random() * confettiEmojis.length)],
      angle: (i / 16) * 360,
    }));
    setConfetti(pieces);
    setTimeout(() => setConfetti([]), 1500);
  };

  return (
    <>
      {/* Confetti burst */}
      <div className="fixed inset-0 pointer-events-none z-50">
        <AnimatePresence>
          {confetti.map(p => (
            <motion.div key={p.id}
              initial={{ opacity: 1, scale: 1, x: p.x, y: p.y }}
              animate={{
                opacity: 0,
                scale: 0.4,
                x: p.x + Math.cos(p.angle * Math.PI / 180) * (80 + Math.random() * 80),
                y: p.y + Math.sin(p.angle * Math.PI / 180) * (80 + Math.random() * 80) - 60,
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              style={{ position: "fixed", left: 0, top: 0, fontSize: 20, pointerEvents: "none" }}>
              {p.emoji}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <motion.div
        className="fixed bottom-4 left-4 z-40 cursor-pointer select-none"
        animate={{ y: [0, -7, 0] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        whileHover={{ scale: 1.2 }}
        whileTap={{ scale: 0.85 }}
        onClick={throwConfetti}
        title="Click me! 🧸"
      >
        <motion.div
          animate={waving ? { rotate: [0, -12, 12, -8, 0] } : happy ? { scale: [1, 1.25, 1], rotate: [0, 10, -10, 0] } : {}}
          transition={{ duration: 0.5 }}>
          <img
            src="/knotsy-bear.png"
            alt="Knotsy the bear"
            style={{ width: 72, height: 86, imageRendering: "pixelated", filter: "drop-shadow(0px 4px 8px rgba(139,94,60,0.4))" }}
          />
        </motion.div>
        <motion.div className="text-center mt-1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
          <span className="text-xs font-bold text-amber-800 bg-white/80 px-2 py-0.5 rounded-full shadow-sm border border-pink-100">
            Knotsy 🎀
          </span>
        </motion.div>
      </motion.div>
    </>
  );
}

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [formData, setFormData] = useState({ name: "", phone: "", product: "", message: "" });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [customerProfile, setCustomerProfile] = useState(getProfile());
  const [showSignIn, setShowSignIn] = useState(false);
  const [ordersPaused, setOrdersPaused] = useState(false);
  const [waitlistName, setWaitlistName] = useState("");
  const [waitlistPhone, setWaitlistPhone] = useState("");
  const [waitlistDone, setWaitlistDone] = useState(false);

  const submitWaitlist = async () => {
    if (!waitlistName.trim() || !waitlistPhone.trim()) return;
    await supabase.from("waitlist").insert({ name: waitlistName.trim(), phone: waitlistPhone.trim() });
    setWaitlistDone(true);
    setWaitlistName("");
    setWaitlistPhone("");
  };

  useEffect(() => {
    supabase.from("settings").select("value").eq("key", "orders_paused").single().then(({ data }) => {
      if (data) setOrdersPaused(data.value === "true");
    });
  }, []);

  const handleOrder = async (productMsg: string, imgUrl?: string) => {
    if (ordersPaused) return;
    const profile = getProfile();
    if (profile) {
      // Already signed in — go straight to WhatsApp
      supabase.from("orders").insert({
        name: profile.name,
        phone: profile.phone,
        product: extractProduct(productMsg),
        description: productMsg,
        status: "new",
        notes: "",
        source: "customer",
      });
      const fullMsg = `Hi Jiya & Kiyoshi! 🌸\n\n👤 Name: ${profile.name}\n📱 Phone: ${profile.phone}\n\n${productMsg}${imgUrl ? `\n\n🖼️ Product ref: https://plushie-knots-client.vercel.app${imgUrl}` : ""}`;
      window.open(makeWhatsappLink(fullMsg), "_blank");
    } else {
      // Not signed in — show popup
      setPopupImg(imgUrl);
      setPopupMsg(productMsg);
    }
  };

  const handleLogout = () => {
    clearProfile();
    setCustomerProfile(null);
  };
  const [popupMsg, setPopupMsg] = useState<string | null>(null);
  const [popupImg, setPopupImg] = useState<string | undefined>(undefined);
  const [dbPrices, setDbPrices] = useState<Record<string, string>>({});

  useEffect(() => {
    supabase.from("products").select("name, price").then(({ data }) => {
      if (data) {
        const map: Record<string, string> = {};
        data.forEach((p: { name: string; price: string }) => { map[p.name] = p.price; });
        setDbPrices(map);
      }
    });
  }, []);

  const getPrice = (name: string, fallback: string) => dbPrices[name] || fallback;

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const msg = `Hi Jiya & Kiyoshi! 🌸 I'd like to place a custom order.\n\n👤 Name: ${formData.name}\n📱 Phone: ${formData.phone}\n🛍️ Product: ${formData.product}\n💬 Idea: ${formData.message}`;
    window.open(makeWhatsappLink(msg), "_blank");
    await supabase.from("orders").insert({
      name: formData.name,
      phone: formData.phone,
      product: formData.product,
      description: formData.message,
      status: "new",
      notes: "",
    });
    setFormSubmitted(true);
    setTimeout(() => {
      setFormData({ name: "", phone: "", product: "", message: "" });
      setFormSubmitted(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-amber-50 overflow-x-hidden">

      {/* ── Fully Booked Banner + Waitlist ── */}
      {ordersPaused && (
        <div className="bg-amber-50 border-b-2 border-amber-200 py-5 px-4 text-center z-[60] relative">
          <p className="text-amber-700 font-bold text-base mb-1">🎀 We're fully booked right now!</p>
          <p className="text-amber-500 text-sm mb-4">Working hard on current orders. Leave your details and we'll WhatsApp you when we reopen 🧶</p>
          {waitlistDone ? (
            <p className="text-emerald-600 font-semibold text-sm">✅ You're on the list! We'll let you know when we're back 🌸</p>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 max-w-md mx-auto">
              <input value={waitlistName} onChange={e => setWaitlistName(e.target.value)} placeholder="Your name"
                className="w-full sm:w-auto flex-1 px-4 py-2 rounded-2xl border-2 border-amber-200 focus:border-amber-400 focus:outline-none text-sm text-amber-900 placeholder:text-amber-300 bg-white" />
              <input value={waitlistPhone} onChange={e => setWaitlistPhone(e.target.value)} placeholder="WhatsApp number"
                className="w-full sm:w-auto flex-1 px-4 py-2 rounded-2xl border-2 border-amber-200 focus:border-amber-400 focus:outline-none text-sm text-amber-900 placeholder:text-amber-300 bg-white" />
              <button onClick={submitWaitlist}
                className="w-full sm:w-auto px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-2xl text-sm transition-colors">
                Notify Me 🔔
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Announcement Bar ── */}
      <motion.div initial={{ y: -40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}
        className="bg-pink-400 text-white text-xs font-medium py-2 text-center tracking-wide">
        🚚 Delivering across India &nbsp;·&nbsp; 100% Handmade &nbsp;·&nbsp; Custom colours available 🎨
      </motion.div>

      {/* ── Navigation ── */}
      <motion.nav initial={{ y: -60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, delay: 0.1 }}
        className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-pink-100 shadow-sm">
        <div className="container flex items-center justify-between py-3">
          <motion.div className="flex items-center gap-3" whileHover={{ scale: 1.03 }} transition={{ type: "spring", stiffness: 400 }}>
            <img src="/logo.jpg" alt="Plushie Knots"
              className="h-12 w-12 rounded-full object-cover shadow-md border-2 border-pink-200" />
            <div>
              <h1 className="text-lg font-bold text-amber-900 leading-tight">Plushie Knots</h1>
              <p className="text-xs text-pink-400 italic">handmade with love 🎀</p>
            </div>
          </motion.div>
          <div className="hidden md:flex gap-8 items-center">
            {["bestsellers", "products", "about", "contact"].map((s, i) => (
              <motion.a key={s} href={`#${s}`}
                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.07 }}
                whileHover={{ y: -2, color: "#f472b6" }}
                className="text-amber-800 text-sm font-medium capitalize transition-colors">
                {s}
              </motion.a>
            ))}
            <Link href="/blog">
              <motion.a
                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.48 }}
                whileHover={{ y: -2, color: "#f472b6" }}
                className="text-amber-800 text-sm font-medium capitalize transition-colors cursor-pointer">
                Blog
              </motion.a>
            </Link>
            {customerProfile ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 bg-pink-50 border border-pink-200 rounded-full px-3 py-1.5">
                  <User className="h-3.5 w-3.5 text-pink-400" />
                  <span className="text-xs font-semibold text-pink-600">{customerProfile.name.split(" ")[0]}</span>
                </div>
                <button onClick={handleLogout} className="p-1.5 rounded-full hover:bg-red-50 text-amber-400 hover:text-red-500 transition-colors" title="Sign out">
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <motion.button onClick={() => setShowSignIn(true)}
                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 }}
                whileHover={{ y: -2 }}
                className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 border border-pink-200 hover:border-pink-400 px-3 py-1.5 rounded-full transition-colors">
                <User className="h-3.5 w-3.5" /> Sign in
              </motion.button>
            )}

          </div>
          <motion.button onClick={() => handleOrder("Hi Jiya & Kiyoshi! I'm interested in placing an order 🌸")}
            whileHover={{ scale: ordersPaused ? 1 : 1.06 }} whileTap={{ scale: ordersPaused ? 1 : 0.95 }}
            disabled={ordersPaused}
            className={`hidden md:flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-full shadow-sm ${ordersPaused ? "bg-amber-300 text-white cursor-not-allowed" : "bg-green-500 hover:bg-green-600 text-white"}`}>
            <MessageCircle className="h-4 w-4" /> {ordersPaused ? "Fully Booked 🎀" : "Order Now"}
          </motion.button>
          <motion.button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            whileTap={{ scale: 0.9 }}
            className="md:hidden p-2 hover:bg-pink-50 rounded-full transition-colors">
            <AnimatePresence mode="wait">
              {mobileMenuOpen
                ? <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}><X className="h-5 w-5 text-amber-900" /></motion.div>
                : <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}><Menu className="h-5 w-5 text-amber-900" /></motion.div>
              }
            </AnimatePresence>
          </motion.button>
        </div>
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="md:hidden overflow-hidden bg-white border-t border-pink-100 px-5 py-5 flex flex-col gap-4">
              {["bestsellers", "products", "about", "contact"].map((s, i) => (
                <motion.a key={s} href={`#${s}`} onClick={() => setMobileMenuOpen(false)}
                  initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.06 }}
                  className="text-amber-800 text-sm font-medium capitalize border-b border-pink-50 pb-3 last:border-0">
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </motion.a>
              ))}
              <Link href="/blog">
                <motion.a onClick={() => setMobileMenuOpen(false)}
                  initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.25 }}
                  className="text-amber-800 text-sm font-medium capitalize border-b border-pink-50 pb-3 cursor-pointer">
                  Blog
                </motion.a>
              </Link>
              <motion.button onClick={() => { setMobileMenuOpen(false); handleOrder("Hi Jiya & Kiyoshi! I'm interested in placing an order 🌸"); }}
                initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.28 }}
                className="flex items-center justify-center gap-2 bg-green-500 text-white text-sm font-semibold px-4 py-3 rounded-2xl">
                <MessageCircle className="h-4 w-4" /> Order on WhatsApp
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* ── Hero ── */}
      <section className="relative py-20 md:py-32 bg-gradient-to-b from-amber-50 via-rose-50 to-amber-50 overflow-hidden">
        {/* floating blobs */}
        <motion.div animate={{ y: [0, -18, 0], x: [0, 10, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-10 left-10 w-40 h-40 bg-pink-200 rounded-full opacity-20 blur-3xl pointer-events-none" />
        <motion.div animate={{ y: [0, 14, 0], x: [0, -8, 0] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-10 right-10 w-48 h-48 bg-amber-200 rounded-full opacity-25 blur-3xl pointer-events-none" />
        <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-1/2 left-1/4 w-24 h-24 bg-rose-200 rounded-full opacity-15 blur-2xl pointer-events-none" />

        {/* Floating product images */}
        <motion.div
          animate={{ y: [0, -12, 0], rotate: [-3, 0, -3] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute left-4 md:left-16 top-1/2 -translate-y-1/2 hidden md:block z-10 pointer-events-none">
          <img src="/bouquet-orange-tulip.jpg" alt="Handmade orange tulip crochet bouquet" className="w-36 h-36 object-cover rounded-3xl shadow-xl border-4 border-white/80 rotate-[-6deg]" />
        </motion.div>
        <motion.div
          animate={{ y: [0, 12, 0], rotate: [3, 0, 3] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute right-4 md:right-16 top-1/2 -translate-y-1/2 hidden md:block z-10 pointer-events-none">
          <img src="/bouquet-pink-lily.jpg" alt="Handmade pink lily crochet bouquet" className="w-36 h-36 object-cover rounded-3xl shadow-xl border-4 border-white/80 rotate-[6deg]" />
        </motion.div>
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute right-8 md:right-32 top-8 hidden md:block z-10 pointer-events-none">
          <img src="/kc-cherry.jpg" alt="Handmade cherry crochet keychain" className="w-20 h-20 object-cover rounded-2xl shadow-lg border-4 border-white/80 rotate-[10deg]" />
        </motion.div>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          className="absolute left-8 md:left-32 bottom-8 hidden md:block z-10 pointer-events-none">
          <img src="/mirror-daisy.jpg" alt="Handmade daisy mirror flower" className="w-20 h-20 object-cover rounded-2xl shadow-lg border-4 border-white/80 rotate-[-10deg]" />
        </motion.div>

        <div className="container text-center max-w-3xl mx-auto px-4 relative">
          <motion.span initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 14, delay: 0.2 }}
            className="inline-flex items-center gap-1.5 bg-pink-100 text-pink-600 text-xs font-semibold px-4 py-1.5 rounded-full mb-8 border border-pink-200">
            <Sparkles className="h-3 w-3" /> 100% Handmade in India
          </motion.span>

          <motion.h2 initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="text-5xl md:text-7xl font-bold text-amber-900 mb-5 leading-[1.1]">
            Handmade<br />
            with{" "}
            <motion.span className="relative inline-block text-pink-500"
              animate={{ rotate: [-1, 1, -1] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
              Love
              <span className="absolute -bottom-1 left-0 right-0 h-3 bg-pink-200 rounded-full -z-10 opacity-50" />
            </motion.span>
          </motion.h2>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-xl md:text-2xl text-pink-400 italic font-light mb-6 mt-4">
            one stitch at a time{" "}
            <motion.span animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="inline-block">
              <Heart className="inline h-5 w-5 text-pink-400 fill-pink-400" />
            </motion.span>
          </motion.p>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-amber-700 text-base md:text-lg leading-relaxed mb-12 max-w-lg mx-auto">
            Cozy crochet bouquets, squishy plushies, tiny keychains & more —
            crafted with yarn, hugs, and a whole lot of giggles by two best friends. 🧶
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.75 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <motion.a href="#bestsellers" whileHover={{ scale: 1.06, y: -2 }} whileTap={{ scale: 0.95 }}
              className="inline-flex items-center justify-center gap-2 bg-amber-800 hover:bg-amber-900 text-white font-semibold rounded-full px-8 py-4 text-sm shadow-md cursor-pointer">
              Shop Bestsellers ✨
            </motion.a>
            <motion.button onClick={() => handleOrder("Hi Jiya & Kiyoshi! I'm interested in placing an order 🌸")}
              whileHover={{ scale: 1.06, y: -2 }} whileTap={{ scale: 0.95 }}
              className="inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-full px-8 py-4 text-sm shadow-md">
              <MessageCircle className="h-4 w-4" /> Order on WhatsApp
            </motion.button>
          </motion.div>

          {/* Stats */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="grid grid-cols-3 gap-4 bg-white/70 backdrop-blur-sm rounded-3xl p-6 md:p-8 shadow-sm border border-pink-100 max-w-md mx-auto">
            {[["500+", "happy hearts"], ["100%", "handmade"], ["7 day", "delivery"]].map(([val, label], i) => (
              <motion.div key={label} initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 15, delay: 1 + i * 0.1 }}>
                <p className="text-2xl md:text-3xl font-bold text-amber-900">{val}</p>
                <p className="text-amber-600 text-xs mt-1">{label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Marquee Strip ── */}
      <div className="bg-pink-400 py-3 overflow-hidden">
        <div className="marquee-track">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex items-center gap-0">
              {["🌸 Handmade in Pune", "🎁 Perfect for gifting", "🌈 Custom colours available", "🚚 Delivered across India", "🧶 Made with love", "✨ 100% Handcrafted", "💝 Custom orders welcome", "🌺 Crochet bouquets", "🐝 Cute plushies"].map((item) => (
                <span key={item} className="text-white font-semibold text-sm whitespace-nowrap px-8">
                  {item}
                  <span className="mx-4 opacity-50">·</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <WaveDivider fromColor="#fdf6ee" toColor="#fff7ed" />

      {/* ── Bestsellers ── */}
      <section id="bestsellers" className="py-20 md:py-28 bg-gradient-to-b from-orange-50 to-rose-50">
        <div className="container max-w-5xl mx-auto">
          <Reveal className="text-center mb-14">
            <span className="inline-flex items-center gap-1.5 text-pink-400 text-xs font-semibold uppercase tracking-widest mb-3">
              <Star className="h-3.5 w-3.5 fill-pink-400" /> our top picks
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-amber-900 mb-3">Bestsellers</h2>
            <p className="text-amber-600 text-sm">The ones people keep coming back for 🥹</p>
          </Reveal>

          <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-8"
            variants={staggerContainer(0.15)} initial="hidden"
            whileInView="show" viewport={{ once: true, margin: "-60px" }}>
            {bestsellers.map((product) => (
              <motion.div key={product.id} variants={fadeUp}
                whileHover={{ y: -8, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="group bg-white rounded-3xl overflow-hidden shadow-md border border-pink-100">
                <div className="relative overflow-hidden h-72">
                  <motion.img src={product.img} alt={`${product.name} - handmade crochet bouquet India`}
                    whileHover={{ scale: 1.07 }} transition={{ duration: 0.4 }}
                    className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
                  <motion.span initial={{ x: -20, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }}
                    viewport={{ once: true }} transition={{ delay: 0.3, type: "spring" }}
                    className={`absolute top-4 left-4 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm ${product.tagColor}`}>
                    {product.tag}
                  </motion.span>
                </div>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-bold text-amber-900">{product.name}</h3>
                    <motion.span whileHover={{ scale: 1.1 }}
                      className="text-pink-600 font-bold text-sm bg-pink-50 px-3 py-1.5 rounded-full border border-pink-100 whitespace-nowrap ml-2">
                      {getPrice(product.name, product.price)}
                    </motion.span>
                  </div>
                  <p className="text-amber-600 text-sm mb-4 leading-relaxed">{product.desc}</p>
                  <div className="flex items-center gap-2 text-xs text-pink-500 font-medium bg-pink-50 px-3 py-2 rounded-xl border border-pink-100 mb-5">
                    <Palette className="h-3.5 w-3.5 flex-shrink-0" />
                    Available in custom colours — just ask!
                  </div>
                  <motion.button onClick={() => handleOrder(`Hi! I'd love to order the ${product.name} 🌸`, product.img)}
                    whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    className="flex items-center justify-center gap-2 w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3.5 rounded-2xl text-sm shadow-sm">
                    <MessageCircle className="h-4 w-4" /> Order on WhatsApp
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <WaveDivider fromColor="#fff1f2" toColor="#fffbeb" flip />

      {/* ── Products ── */}
      <section id="products" className="py-20 md:py-28 bg-gradient-to-b from-amber-50 to-rose-50">
        <div className="container max-w-5xl mx-auto">
          <Reveal className="text-center mb-14">
            <span className="inline-block text-pink-400 text-xs font-semibold uppercase tracking-widest mb-3">everything we make 🧵</span>
            <h2 className="text-4xl md:text-5xl font-bold text-amber-900 mb-3">Our Products</h2>
            <p className="text-amber-600 text-sm">All handcrafted, all made with love — pick your favourite!</p>
          </Reveal>

          {/* Helper component for section headers */}
          {/* Crochet Bouquets Grid */}
          <div className="mb-14">
            <Reveal>
              <div className="flex items-center gap-4 mb-3">
                <div className="h-px flex-1 bg-pink-100" />
                <h3 className="text-base font-bold text-amber-900 whitespace-nowrap">💐 Crochet Bouquets</h3>
                <div className="h-px flex-1 bg-pink-100" />
              </div>
              <p className="text-center text-amber-500 text-xs mb-8">Real handcrafted bouquets — forever fresh 🌸</p>
            </Reveal>
            <motion.div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
              variants={staggerContainer(0.06)} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-40px" }}>
              {bouquets.map((item) => (
                <motion.div key={item.name} variants={popIn}
                  onClick={() => handleOrder(`Hi! I'd love to order the ${item.name} 🌸`, item.img)}
                  whileHover={{ y: -6, scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-pink-100 cursor-pointer">
                  <div className="h-48 overflow-hidden">
                    <motion.img src={item.img} alt={`${item.name} - handmade crochet gift India`}
                      whileHover={{ scale: 1.12 }} transition={{ duration: 0.35 }}
                      className="w-full h-full object-cover" />
                  </div>
                  <div className="p-3 text-center">
                    <p className="text-xs font-semibold text-amber-900 leading-snug">{item.name}</p>
                    <p className="text-pink-500 text-xs font-bold mt-1">{getPrice(item.name, item.price)}</p>
                    <p className="text-amber-400 text-xs mt-0.5">🎨 custom colours</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Keychains Grid */}
          <div className="mb-14">
            <Reveal>
              <div className="flex items-center gap-4 mb-3">
                <div className="h-px flex-1 bg-pink-100" />
                <h3 className="text-base font-bold text-amber-900 whitespace-nowrap">🔑 Crochet Keychains</h3>
                <div className="h-px flex-1 bg-pink-100" />
              </div>
              <p className="text-center text-amber-500 text-xs mb-8">Tiny & adorable — perfect for gifts 🌸</p>
            </Reveal>
            <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-4"
              variants={staggerContainer(0.08)} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-40px" }}>
              {keychains.map((item) => (
                <motion.div key={item.name} variants={popIn}
                  onClick={() => handleOrder(`Hi! I'd love to order the ${item.name} keychain 🌸`, item.img)}
                  whileHover={{ y: -6, scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-pink-100 cursor-pointer">
                  <div className="h-48 overflow-hidden">
                    <motion.img src={item.img} alt={`${item.name} - handmade crochet keychain India`}
                      whileHover={{ scale: 1.12 }} transition={{ duration: 0.35 }}
                      className="w-full h-full object-cover" />
                  </div>
                  <div className="p-3 text-center">
                    <p className="text-xs font-semibold text-amber-900 leading-snug">{item.name}</p>
                    <p className="text-pink-500 text-xs font-bold mt-1">{getPrice(item.name, item.price)}</p>
                    <p className="text-amber-400 text-xs mt-0.5">🎨 custom colours</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Mirror Flowers Grid */}
          <div className="mb-14">
            <Reveal>
              <div className="flex items-center gap-4 mb-3">
                <div className="h-px flex-1 bg-pink-100" />
                <h3 className="text-base font-bold text-amber-900 whitespace-nowrap">🛵 Mirror Flowers</h3>
                <div className="h-px flex-1 bg-pink-100" />
              </div>
              <p className="text-center text-amber-500 text-xs mb-8">Cute crochet flowers for your scooter mirror 🌸</p>
            </Reveal>
            <motion.div className="grid grid-cols-2 md:grid-cols-2 gap-4 max-w-sm mx-auto"
              variants={staggerContainer(0.1)} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-40px" }}>
              {mirrorFlowers.map((item) => (
                <motion.div key={item.name} variants={popIn}
                  onClick={() => handleOrder(`Hi! I'd love to order the ${item.name} 🌸`, item.img)}
                  whileHover={{ y: -6, scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-pink-100 cursor-pointer">
                  <div className="h-48 overflow-hidden">
                    <motion.img src={item.img} alt={`${item.name} - handmade crochet gift India`}
                      whileHover={{ scale: 1.12 }} transition={{ duration: 0.35 }}
                      className="w-full h-full object-cover" />
                  </div>
                  <div className="p-3 text-center">
                    <p className="text-xs font-semibold text-amber-900 leading-snug">{item.name}</p>
                    <p className="text-pink-500 text-xs font-bold mt-1">{getPrice(item.name, item.price)}</p>
                    <p className="text-amber-400 text-xs mt-0.5">🎨 custom colours</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Catalog images */}
          {[
            { title: "🌺 Pipe Cleaner Flowers Catalog", img: "/catalog-pipe-flowers.jpg", alt: "Pipe cleaner flowers" },
            { title: "🎀 Clutcher Holders Catalog", img: "/catalog-clutcher.jpg", alt: "Clutcher holders" },
            { title: "🧸 Keychains, AirPods & Coin Purses", img: "/catalog-all.jpg", alt: "Full accessories catalog" },
          ].map(({ title, img, alt }) => (
            <div key={title} className="mb-10">
              <Reveal>
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-px flex-1 bg-pink-100" />
                  <h3 className="text-base font-bold text-amber-900 whitespace-nowrap">{title}</h3>
                  <div className="h-px flex-1 bg-pink-100" />
                </div>
              </Reveal>
              <Reveal variants={{ hidden: { opacity: 0, scale: 0.97 }, show: { opacity: 1, scale: 1, transition: { duration: 0.6 } } }}>
                <div className="bg-white rounded-3xl overflow-hidden shadow-md border border-pink-100">
                  <img src={img} alt={alt} className="w-full object-contain" />
                </div>
              </Reveal>
            </div>
          ))}

          {/* Custom CTA */}
          <Reveal>
            <div className="text-center mt-12 bg-gradient-to-br from-pink-50 via-white to-amber-50 rounded-3xl p-10 border border-pink-100 shadow-sm">
              <motion.div animate={{ rotate: [0, 10, -10, 10, 0] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                className="text-3xl mb-3 inline-block">🎀</motion.div>
              <h3 className="text-2xl font-bold text-amber-900 mb-2">Want something specific?</h3>
              <p className="text-amber-600 text-sm mb-7 max-w-sm mx-auto">
                Customisation is available — pick your design, your colours, add a personal note. Made just for you.
              </p>
              <motion.button onClick={() => handleOrder("Hi! I'd like to place a custom order 🌸 Can you help?")}
                whileHover={{ scale: 1.06, y: -2 }} whileTap={{ scale: 0.95 }}
                className="inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-full px-8 py-4 text-sm shadow-md">
                <MessageCircle className="h-4 w-4" /> Chat & Order on WhatsApp
              </motion.button>
            </div>
          </Reveal>
        </div>
      </section>

      <WaveDivider fromColor="#fff1f2" toColor="#fff7ed" />

      {/* ── How it Works ── */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-amber-50 to-rose-50">
        <div className="container max-w-4xl mx-auto">
          <Reveal className="text-center mb-14">
            <span className="inline-block text-pink-400 text-xs font-semibold uppercase tracking-widest mb-3">simple as that 🎀</span>
            <h2 className="text-4xl md:text-5xl font-bold text-amber-900 mb-3">How it Works</h2>
            <p className="text-amber-600 text-sm">From browse to doorstep — three cozy little steps</p>
          </Reveal>
          <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-6"
            variants={staggerContainer(0.15)} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }}>
            {[
              { step: "01", Icon: Brush, title: "Browse & Pick", desc: "Explore our flowers, keychains, AirPods covers and more. Find what makes your heart go warm.", color: "bg-pink-50 border-pink-100" },
              { step: "02", Icon: MessageCircle, title: "Order on WhatsApp", desc: "Tap any Order button and chat with Jiya & Kiyoshi. Tell them your colours, size, or any custom touches.", color: "bg-amber-50 border-amber-100" },
              { step: "03", Icon: Package, title: "Receive with Love", desc: "Your handmade piece gets crafted fresh and delivered to you — wrapped with care, made with heart.", color: "bg-rose-50 border-rose-100" },
            ].map(({ step, Icon, title, desc, color }) => (
              <motion.div key={step} variants={fadeUp}
                whileHover={{ y: -8, scale: 1.02 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className={`relative rounded-3xl p-7 border ${color} text-center`}>
                <motion.span initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }}
                  transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.2 }}
                  className="absolute -top-3 left-6 bg-pink-400 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                  {step}
                </motion.span>
                <motion.div whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }} transition={{ duration: 0.4 }}
                  className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 mt-2 shadow-sm border border-pink-100">
                  <Icon className="h-5 w-5 text-pink-400" />
                </motion.div>
                <h3 className="text-base font-bold text-amber-900 mb-2">{title}</h3>
                <p className="text-amber-600 text-sm leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <WaveDivider fromColor="#fff1f2" toColor="#fdf6ee" flip />

      {/* ── Reviews ── */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-orange-50 to-rose-50">
        <div className="container max-w-5xl mx-auto">
          <Reveal className="text-center mb-14">
            <span className="inline-block text-pink-400 text-xs font-semibold uppercase tracking-widest mb-3">straight from the heart 💕</span>
            <h2 className="text-4xl md:text-5xl font-bold text-amber-900 mb-3">What People Say</h2>
            <p className="text-amber-600 text-sm">Real love from real customers 🥹</p>
          </Reveal>
          <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-6"
            variants={staggerContainer(0.12)} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }}>
            {reviews.map(({ name, location, avatar, review, product }) => (
              <motion.div key={name} variants={fadeUp}
                whileHover={{ y: -6, boxShadow: "0 12px 30px rgba(0,0,0,0.08)" }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="bg-white rounded-3xl p-7 border border-pink-100 shadow-sm flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <motion.div whileHover={{ scale: 1.2, rotate: 10 }} transition={{ type: "spring", stiffness: 400 }}
                    className="w-11 h-11 rounded-full bg-gradient-to-br from-pink-100 to-amber-100 flex items-center justify-center text-xl flex-shrink-0">
                    {avatar}
                  </motion.div>
                  <div>
                    <p className="font-bold text-amber-900 text-sm">{name}</p>
                    <p className="text-amber-400 text-xs">{location}</p>
                  </div>
                  <motion.div className="ml-auto flex gap-0.5"
                    initial="hidden" whileInView="show" viewport={{ once: true }}
                    variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}>
                    {[...Array(5)].map((_, i) => (
                      <motion.div key={i} variants={{ hidden: { scale: 0, opacity: 0 }, show: { scale: 1, opacity: 1, transition: { type: "spring", stiffness: 400 } } }}>
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      </motion.div>
                    ))}
                  </motion.div>
                </div>
                <p className="text-amber-700 text-sm leading-relaxed mb-5 flex-1">"{review}"</p>
                <motion.span whileHover={{ scale: 1.05 }}
                  className="inline-block self-start text-xs bg-pink-50 text-pink-500 font-semibold px-3 py-1.5 rounded-full border border-pink-100">
                  {product}
                </motion.span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>


      <WaveDivider fromColor="#fdf6ee" toColor="#fff7ed" />

      {/* ── FAQ ── */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-amber-50 to-rose-50">
        <div className="container max-w-2xl mx-auto">
          <Reveal className="text-center mb-12">
            <span className="inline-block text-pink-400 text-xs font-semibold uppercase tracking-widest mb-3">got questions? 💭</span>
            <h2 className="text-4xl md:text-5xl font-bold text-amber-900 mb-3">FAQ</h2>
            <p className="text-amber-600 text-sm">Everything you need to know before ordering 🌸</p>
          </Reveal>
          <motion.div className="space-y-3"
            variants={staggerContainer(0.1)} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-40px" }}>
            {[
              {
                q: "📍 Where do you deliver?",
                a: "We deliver all across India! 🇮🇳 Local pickup in Pune is also available — just mention it when you order on WhatsApp 🌸"
              },
              {
                q: "💳 How can I pay?",
                a: "We accept both UPI (Google Pay, PhonePe, Paytm) and Cash on Delivery. Payment details will be shared once your order is confirmed on WhatsApp."
              },
              {
                q: "🎨 Can I customise colours?",
                a: "Yes! Every product is available in custom colours. Just tell us your preference when you order and we'll make it exactly how you want it 💕"
              },
              {
                q: "✏️ Can I place a custom order?",
                a: "Absolutely! We love custom orders. You can choose your design, colours, and even add a personal note. Just reach out on WhatsApp or fill the Custom Order form below 🌸"
              },
              {
                q: "⏱️ How long does delivery take?",
                a: "Orders are usually delivered within 2-7 days depending on your location within Pune and the complexity of the design. We'll keep you posted on WhatsApp every step of the way!"
              },
            ].map(({ q, a }, i) => {
              const [open, setOpen] = useState(false);
              return (
                <motion.div key={i} variants={fadeUp}
                  className="bg-white rounded-2xl border border-pink-100 shadow-sm overflow-hidden">
                  <button onClick={() => setOpen(!open)}
                    className="w-full flex items-center justify-between px-6 py-4 text-left">
                    <span className="font-semibold text-amber-900 text-sm">{q}</span>
                    <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
                      <ChevronDown className="h-4 w-4 text-pink-400 flex-shrink-0" />
                    </motion.div>
                  </button>
                  <AnimatePresence>
                    {open && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}
                        className="overflow-hidden">
                        <p className="px-6 pb-4 text-amber-700 text-sm leading-relaxed">{a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      <WaveDivider fromColor="#fdf6ee" toColor="#fff7ed" />

      {/* ── About ── */}
      <section id="about" className="py-20 md:py-28 bg-gradient-to-b from-amber-50 to-rose-50">
        <div className="container max-w-xl mx-auto">
          <Reveal variants={{ hidden: { opacity: 0, scale: 0.95 }, show: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } } }}>
            <div className="text-center bg-white/80 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-sm border border-pink-100">
              <motion.div animate={{ rotate: [0, -5, 5, -5, 0] }} transition={{ duration: 4, repeat: Infinity, repeatDelay: 2 }}
                className="text-5xl mb-5 inline-block">🧶</motion.div>
              <h2 className="text-4xl md:text-5xl font-bold text-amber-900 mb-6">Made by Best Friends</h2>
              <p className="text-amber-700 text-sm leading-relaxed mb-4">
                Plushie Knots was born from the creative friendship of Jiya and Kiyoshi. What started as a fun hobby has blossomed into a passion for creating adorable, handmade crochet pieces that bring joy to people's lives.
              </p>
              <p className="text-amber-700 text-sm leading-relaxed">
                Every product is crafted with love, using premium acrylic and pipe yarn. Whether it's a flower bouquet, a plushie, or a tiny keychain — each piece carries a story of care and creativity. 💕
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <WaveDivider fromColor="#fff1f2" toColor="#fffbeb" flip />

      {/* ── Contact ── */}
      <section id="contact" className="py-20 md:py-28 bg-gradient-to-b from-amber-50 to-rose-50">
        <div className="container max-w-lg mx-auto">
          <Reveal className="text-center mb-10">
            <span className="inline-block text-pink-400 text-xs font-semibold uppercase tracking-widest mb-3">have a specific idea? 💭</span>
            <h2 className="text-4xl md:text-5xl font-bold text-amber-900 mb-3">Custom Order</h2>
            <p className="text-amber-600 text-sm">We'd love to create something special just for you!</p>
          </Reveal>
          <Reveal variants={{ hidden: { opacity: 0, y: 50 }, show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } } }}>
            <div className="bg-white rounded-3xl p-7 md:p-10 border border-pink-100 shadow-md">
              <AnimatePresence mode="wait">
                {formSubmitted ? (
                  <motion.div key="success" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }} transition={{ type: "spring", stiffness: 260, damping: 18 }}
                    className="text-center py-12">
                    <motion.div animate={{ rotate: [0, 15, -15, 10, 0], scale: [1, 1.3, 1] }}
                      transition={{ duration: 0.6 }} className="text-5xl mb-4">✨</motion.div>
                    <h3 className="text-2xl font-bold text-amber-900 mb-2">Thank you!</h3>
                    <p className="text-amber-600 text-sm">We'll reach out on WhatsApp soon 🌸</p>
                  </motion.div>
                ) : (
                  <motion.form key="form" onSubmit={handleFormSubmit}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="space-y-5">
                    {[
                      { label: "Your Name", name: "name", type: "text", placeholder: "Tell us your name" },
                      { label: "Phone Number", name: "phone", type: "tel", placeholder: "+91 98765 43210" },
                    ].map(({ label, name, type, placeholder }, i) => (
                      <motion.div key={name} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.07 }}>
                        <label className="block text-xs font-bold text-amber-900 mb-2 uppercase tracking-wider">{label}</label>
                        <input type={type} name={name} value={formData[name as keyof typeof formData]}
                          onChange={handleFormChange} required placeholder={placeholder}
                          className="w-full px-4 py-3 rounded-2xl border-2 border-pink-100 focus:border-pink-300 focus:outline-none transition-colors bg-amber-50/30 text-sm text-amber-900 placeholder:text-amber-300" />
                      </motion.div>
                    ))}
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.14 }}>
                      <label className="block text-xs font-bold text-amber-900 mb-2 uppercase tracking-wider">Product Type</label>
                      <select name="product" value={formData.product} onChange={handleFormChange} required
                        className="w-full px-4 py-3 rounded-2xl border-2 border-pink-100 focus:border-pink-300 focus:outline-none transition-colors bg-amber-50/30 text-sm text-amber-900">
                        <option value="">Select a product type</option>
                        <option value="flower-bouquet">Flower Bouquet</option>
                        <option value="plushie">Plushie</option>
                        <option value="keychain">Keychain</option>
                        <option value="airpods-cover">AirPods Cover</option>
                        <option value="coin-purse">Coin Purse</option>
                        <option value="custom">Custom Creation</option>
                      </select>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.21 }}>
                      <label className="block text-xs font-bold text-amber-900 mb-2 uppercase tracking-wider">Your Idea</label>
                      <textarea name="message" value={formData.message} onChange={handleFormChange} required rows={4}
                        placeholder="Describe your order — colours, style, occasion, anything..."
                        className="w-full px-4 py-3 rounded-2xl border-2 border-pink-100 focus:border-pink-300 focus:outline-none transition-colors resize-none bg-amber-50/30 text-sm text-amber-900 placeholder:text-amber-300" />
                    </motion.div>
                    <motion.button type="submit"
                      whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.97 }}
                      className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-2xl py-4 text-sm shadow-md">
                      <MessageCircle className="h-4 w-4" /> Send to Jiya & Kiyoshi 💌
                    </motion.button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </Reveal>
        </div>
      </section>

      <WaveDivider fromColor="#fff1f2" toColor="#fdf6ee" flip />

      {/* ── Footer ── */}
      <footer className="py-14 bg-amber-50 border-t border-pink-100">
        <div className="container text-center">
          <motion.img src="/logo.jpg" alt="Plushie Knots" whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="h-14 w-14 rounded-full object-cover border-2 border-pink-200 shadow-md mx-auto mb-3" />
          <h3 className="text-lg font-bold text-amber-900 mb-1">Plushie Knots</h3>
          <p className="text-amber-500 text-xs italic mb-6">handmade with love, one stitch at a time 🌸</p>
          <div className="flex items-center justify-center gap-5 flex-wrap mb-8">
            {["bestsellers", "products", "about", "contact"].map(s => (
              <motion.a key={s} href={`#${s}`} whileHover={{ y: -2, color: "#f472b6" }}
                className="text-amber-600 text-xs capitalize transition-colors">
                {s}
              </motion.a>
            ))}
          </div>
          <motion.button onClick={() => handleOrder("Hi Jiya & Kiyoshi! I'm interested in placing an order 🌸")}
            whileHover={{ scale: 1.06, y: -2 }} whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-full px-7 py-3 text-sm shadow-md mb-8">
            <MessageCircle className="h-4 w-4" /> Chat on WhatsApp
          </motion.button>
          <a href="https://www.instagram.com/plushie_knots_" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-amber-600 hover:text-pink-500 text-xs transition-colors mb-4">
            <Instagram className="h-4 w-4" /> @plushie_knots_
          </a>
          <br />
          <p className="text-xs text-amber-400">© 2026 Plushie Knots · Made with 💕 by Jiya & Kiyoshi</p>
        </div>
      </footer>

      {/* ── Corner Bear ── */}
      <CornerBear />

      {/* Sign In Popup */}
      <AnimatePresence>
        {showSignIn && (
          <SignInPopup onClose={() => { setShowSignIn(false); setCustomerProfile(getProfile()); }} />
        )}
      </AnimatePresence>

      {/* Order Popup */}
      <AnimatePresence>
        {popupMsg && <OrderPopup productMsg={popupMsg} imgUrl={popupImg} onClose={() => { setPopupMsg(null); setPopupImg(undefined); setCustomerProfile(getProfile()); }} />}
      </AnimatePresence>

      {/* ── Floating WhatsApp ── */}
      <motion.button onClick={() => handleOrder("Hi Jiya & Kiyoshi! I'm interested in placing an order 🌸")}
        initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 18, delay: 1.2 }}
        whileHover={{ scale: ordersPaused ? 1 : 1.1 }} whileTap={{ scale: ordersPaused ? 1 : 0.9 }}
        disabled={ordersPaused}
        className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 font-semibold px-4 py-3.5 rounded-full shadow-xl ${ordersPaused ? "bg-amber-400 text-white cursor-not-allowed" : "bg-green-500 text-white"}`}
        style={{ boxShadow: ordersPaused ? "0 6px 24px rgba(251,191,36,0.45)" : "0 6px 24px rgba(34,197,94,0.45)" }}>
        <motion.div animate={ordersPaused ? {} : { rotate: [0, -15, 15, -10, 0] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 4 }}>
          <MessageCircle className="h-5 w-5" />
        </motion.div>
        <span className="text-sm hidden sm:inline">{ordersPaused ? "Fully Booked 🎀" : "Order Now"}</span>
      </motion.button>

      {/* ── Back to Top ── */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button onClick={scrollToTop}
            initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }} transition={{ type: "spring", stiffness: 300, damping: 18 }}
            whileHover={{ scale: 1.15, y: -2 }} whileTap={{ scale: 0.9 }}
            className="fixed bottom-20 right-6 z-50 w-11 h-11 bg-white hover:bg-pink-50 border-2 border-pink-200 text-pink-400 rounded-full shadow-lg flex items-center justify-center">
            <ChevronUp className="h-5 w-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
